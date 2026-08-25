// Creem.io Webhook Handler - Payment Confirmation & Report Delivery
// Features: immediate retry, persistent queue, automated fallback, real-time alerts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordWebhookFailure } from '../../admin/health/route.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- In-memory delivery queue (persists during function instance lifetime) ---
const deliveryQueue = [];
const MAX_QUEUE_SIZE = 100;
const QUEUE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Track orders already processed (prevent duplicate delivery from Creem retries)
const processedOrders = new Set();
const MAX_PROCESSED = 500;

/**
 * POST /api/webhook
 */
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('creem-signature');
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    // Verify webhook signature
    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(rawBody);
      if (signature !== hmac.digest('hex')) {
        console.error('Webhook signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else if (webhookSecret && !signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event || event.type || '';

    if (eventType !== 'checkout.completed') {
      return NextResponse.json({ received: true, event: eventType });
    }

    const payload = event.data || event;
    const orderId = payload.order_id || payload.id || '';
    const customerEmail = payload.customer?.email || payload.email || '';
    const metadata = payload.metadata || {};
    const reportId = metadata.report_id || '';

    console.log('Payment received:', { orderId, customerEmail, reportId });

    // Prevent duplicate processing from Creem retries
    if (orderId && processedOrders.has(orderId)) {
      console.log('Order already processed, skipping:', orderId);
      return NextResponse.json({ received: true, duplicate: true, order_id: orderId });
    }
    if (orderId) {
      processedOrders.add(orderId);
      if (processedOrders.size > MAX_PROCESSED) {
        // Remove oldest (sets don't have order, so just clear and rebuild)
        const arr = Array.from(processedOrders);
        processedOrders.clear();
        arr.slice(-MAX_PROCESSED / 2).forEach(id => processedOrders.add(id));
      }
    }

    // Deliver report with full retry pipeline
    if (reportId && customerEmail) {
      // Fire-and-forget the delivery pipeline so webhook responds quickly
      deliverWithFullPipeline(reportId, customerEmail, orderId).catch(err => {
        console.error('Delivery pipeline error:', err.message);
      });
    }

    return NextResponse.json({ received: true, event: eventType, order_id: orderId });
  } catch (error) {
    console.error('Webhook error:', error);
    recordWebhookFailure('webhook_processing_error', { error: error.message });
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

/**
 * Full delivery pipeline:
 * Phase 1: Immediate retries (3 attempts, 5s/15s/30s apart)
 * Phase 2: Queue for background retry (checked every 10 min via /api/admin/queue)
 * Phase 3: After 24h, send simplified fallback email
 */
async function deliverWithFullPipeline(reportId, email, orderId) {
  // Phase 1: Immediate retries
  const delays = [0, 5000, 15000, 30000]; // first try immediate, then 5s, 15s, 30s
  let lastError = null;

  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) {
      await sleep(delays[i]);
    }
    try {
      await sendReportEmail(reportId, email);
      console.log('Report email delivered:', { reportId, email, attempt: i + 1 });
      return; // Success!
    } catch (err) {
      lastError = err.message;
      console.warn(`Email delivery attempt ${i + 1}/${delays.length} failed: ${err.message}`);
    }
  }

  // Phase 1 failed - record failure
  console.error('All immediate retry attempts failed:', { reportId, email, orderId, lastError });
  recordWebhookFailure('email_delivery_failed', {
    order_id: orderId, report_id: reportId, customer_email: email, error: lastError, attempts: delays.length,
  });

  // Phase 2: Add to queue for background retry
  addToQueue({ reportId, email, orderId, firstFailedAt: Date.now(), attempts: delays.length, lastError });

  // Phase 3: Immediately notify owner via alert email
  await sendOwnerAlert({
    type: 'DELIVERY_FAILED',
    orderId, reportId, customerEmail: email, error: lastError,
    message: 'Immediate retries exhausted. Background retry active. Will auto-send fallback in 24h if still failing.',
  });
}

/**
 * Queue management
 */
function addToQueue(item) {
  // Clean old items
  const now = Date.now();
  while (deliveryQueue.length > 0 && now - deliveryQueue[0].firstFailedAt > QUEUE_MAX_AGE_MS) {
    deliveryQueue.shift();
  }
  if (deliveryQueue.length >= MAX_QUEUE_SIZE) {
    deliveryQueue.shift();
  }
  deliveryQueue.push(item);
  console.log('Added to delivery queue. Queue size:', deliveryQueue.length);
}

/**
 * Process queue - called by /api/admin/queue endpoint
 * Retries failed deliveries every 10 min for up to 24h
 */
export function processDeliveryQueue() {
  const now = Date.now();
  const toProcess = [];
  const toKeep = [];

  for (const item of deliveryQueue) {
    const age = now - item.firstFailedAt;
    if (age > QUEUE_MAX_AGE_MS) {
      // Expired - send fallback email
      toProcess.push({ ...item, action: 'fallback' });
    } else {
      toKeep.push(item);
    }
  }

  // Clear and rebuild queue
  deliveryQueue.length = 0;
  deliveryQueue.push(...toKeep);

  return toProcess;
}

export function getQueueStats() {
  const now = Date.now();
  return {
    pending: deliveryQueue.length,
    items: deliveryQueue.map(item => ({
      report_id: item.reportId,
      customer_email: item.email,
      order_id: item.orderId,
      failed_at: new Date(item.firstFailedAt).toISOString(),
      age_minutes: Math.round((now - item.firstFailedAt) / 60000),
      attempts: item.attempts,
    })),
  };
}

/**
 * Send the full report email via Brevo
 */
async function sendReportEmail(reportId, email) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not configured');

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { name: 'My GEO Check', email: 'hello@mygeocheck.com' },
      to: [{ email }],
      subject: 'Your GEO Visibility Report is Ready',
      htmlContent: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
  <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color:#1e3a5f;margin-top:0;">Your GEO Visibility Report</h1>
    <p style="color:#4b5563;font-size:16px;line-height:1.6;">
      Thank you for your purchase! Your GEO Visibility Report for <strong>Report #${reportId}</strong> is ready.
    </p>
    <div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:8px;padding:20px;margin:20px 0;">
      <h2 style="color:#047857;margin-top:0;font-size:18px;">What's Inside:</h2>
      <ul style="color:#374151;line-height:1.8;padding-left:20px;margin:0;">
        <li>22+ detailed GEO optimization checks</li>
        <li>AI search visibility score breakdown</li>
        <li>Quick wins to improve visibility</li>
        <li>Priority-ranked fix recommendations</li>
        <li>Strategic recommendations for AI search</li>
      </ul>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://mygeocheck.com/report/${reportId}" style="display:inline-block;background:#10b981;color:#fff;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:16px;">View Your Full Report</a>
    </div>
    <p style="color:#6b7280;font-size:13px;text-align:center;">
      Need help? Contact us at hello@mygeocheck.com
    </p>
  </div>
</body></html>`,
    }),
  });

  if (!res.ok) {
    let errInfo;
    try { errInfo = await res.json(); } catch { errInfo = { status: res.status }; }
    throw new Error(`Brevo error ${res.status}: ${JSON.stringify(errInfo)}`);
  }
}

/**
 * Send simplified fallback email (used after 24h of failures)
 * Simpler content = more likely to succeed
 */
export async function sendFallbackEmail(reportId, email) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'My GEO Check', email: 'hello@mygeocheck.com' },
        to: [{ email }],
        subject: `Your Report #${reportId} - View Link Inside`,
        htmlContent: `<html><body style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Your GEO Visibility Report is Ready</h2>
          <p>Click below to view your full report:</p>
          <p><a href="https://mygeocheck.com/report/${reportId}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Open Report #${reportId}</a></p>
          <p style="color:#666;font-size:13px;">Or copy this link: https://mygeocheck.com/report/${reportId}</p>
          <p style="color:#666;font-size:13px;">Questions? Reply to this email.</p>
        </body></html>`,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('Fallback email also failed:', err.message);
    return false;
  }
}

/**
 * Retry a queued delivery
 */
export async function retryQueuedDelivery(item) {
  try {
    await sendReportEmail(item.reportId, item.email);
    console.log('Queue retry succeeded:', item.reportId, item.email);
    return true;
  } catch (err) {
    console.warn('Queue retry failed:', item.reportId, err.message);
    return false;
  }
}

/**
 * Send alert to site owner
 */
async function sendOwnerAlert({ type, orderId, reportId, customerEmail, error, message }) {
  const apiKey = process.env.BREVO_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL || 'mygeocheck@coze.email';
  if (!apiKey) return;

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'My GEO Check Monitor', email: 'hello@mygeocheck.com' },
        to: [{ email: ownerEmail }],
        subject: `⚠️ ${type}: Order ${orderId || 'N/A'}`,
        htmlContent: `<html><body style="font-family:Arial,sans-serif;padding:20px;">
          <div style="background:#fff3cd;border:2px solid #ffc107;border-radius:8px;padding:20px;">
            <h2 style="color:#856404;">⚠️ ${type}</h2>
            <p><strong>Order:</strong> ${orderId}</p>
            <p><strong>Report:</strong> ${reportId}</p>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            <p><strong>Error:</strong> ${error}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p style="color:#666;">${message || ''}</p>
            <p>Report link: <a href="https://mygeocheck.com/report/${reportId}">View</a></p>
          </div>
        </body></html>`,
      }),
    });
    console.log('Owner alert sent:', type);
  } catch (e) {
    console.error('Owner alert failed:', e.message);
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
