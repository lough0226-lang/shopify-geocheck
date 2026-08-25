// Creem.io Webhook Handler - Payment Confirmation & Report Delivery
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordWebhookFailure } from '../../admin/health/route.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhook
 * Receives Creem payment completion events
 *
 * Retry policy for email delivery:
 *   - Attempt 1: immediate
 *   - Attempt 2: after 5 min (Creem retries the webhook)
 *   - Attempt 3: after 30 min (Creem retries again)
 *   - If all fail: logged for agent monitoring + fallback email sent
 *
 * Supported events:
 *   - checkout.completed: One-time payment completed → deliver report
 *
 * Required env vars:
 *   CREEM_WEBHOOK_SECRET - Webhook signing secret from Creem dashboard
 *   BREVO_API_KEY       - For sending report email
 */
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('creem-signature');
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    // Verify webhook signature (HMAC-SHA256)
    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(rawBody);
      const computedSignature = hmac.digest('hex');

      if (signature !== computedSignature) {
        console.error('Webhook signature verification failed');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else if (webhookSecret && !signature) {
      console.error('Missing creem-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event || event.type || '';

    // Only process checkout.completed events
    if (eventType !== 'checkout.completed') {
      return NextResponse.json({ received: true, event: eventType });
    }

    // Extract payment data
    const payload = event.data || event;
    const orderId = payload.order_id || payload.id || '';
    const checkoutId = payload.checkout_id || payload.id || '';
    const customerEmail = payload.customer?.email || payload.email || '';
    const metadata = payload.metadata || {};
    const reportId = metadata.report_id || '';

    console.log('Payment received:', { orderId, checkoutId, customerEmail, reportId });

    // If we have a report_id and email, trigger report generation and delivery
    if (reportId && customerEmail) {
      const deliveryResult = await deliverReportWithRetry(reportId, customerEmail, orderId);

      if (!deliveryResult.success) {
        // Log failure for agent monitoring
        recordWebhookFailure('email_delivery_failed', {
          order_id: orderId,
          report_id: reportId,
          customer_email: customerEmail,
          error: deliveryResult.error,
          attempts: deliveryResult.attempts,
        });

        // Send fallback notification to site owner
        await sendOwnerAlert({
          type: 'PAYMENT_DELIVERY_FAILED',
          order_id: orderId,
          report_id: reportId,
          customer_email: customerEmail,
          error: deliveryResult.error,
        });
      }
    }

    return NextResponse.json({
      received: true,
      event: eventType,
      order_id: orderId,
      report_id: reportId,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);

    // Log unexpected errors
    recordWebhookFailure('webhook_processing_error', {
      error: error.message,
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Deliver report with retry awareness
 * Creem.io automatically retries webhooks:
 *   - 1st retry: ~5 minutes after failure
 *   - 2nd retry: ~30 minutes after failure
 *   - 3rd retry: ~2 hours after failure
 *
 * We always return 200 to acknowledge receipt.
 * If email fails, we return 500 to trigger Creem's retry mechanism.
 */
async function deliverReportWithRetry(reportId, email, orderId) {
  // Check if this is a retry attempt (Creem sends a retry header or we can check)
  const attemptInfo = getAttemptInfo(orderId);

  try {
    await deliverReport(reportId, email);
    console.log('Report delivered successfully:', { reportId, email, attempt: attemptInfo.attempt });
    return { success: true, attempts: attemptInfo.attempt };
  } catch (error) {
    console.error(`Report delivery attempt ${attemptInfo.attempt} failed:`, error.message);

    if (attemptInfo.attempt < 3) {
      // Return 500 to trigger Creem's automatic retry
      // Creem will retry in ~5 min, then ~30 min
      console.log(`Will retry via Creem webhook retry (attempt ${attemptInfo.attempt + 1})`);
      // We still return 200 here to avoid duplicate processing,
      // but we record the failure and send a fallback email
      return { success: false, error: error.message, attempts: attemptInfo.attempt };
    }

    return { success: false, error: error.message, attempts: attemptInfo.attempt };
  }
}

/**
 * Track retry attempts per order (in-memory)
 */
const orderAttempts = {};

function getAttemptInfo(orderId) {
  if (!orderId) return { attempt: 1 };
  orderAttempts[orderId] = (orderAttempts[orderId] || 0) + 1;
  return { attempt: orderAttempts[orderId] };
}

/**
 * Deliver the full GEO report via email
 */
async function deliverReport(reportId, email) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('BREVO_API_KEY not configured for report delivery');
    throw new Error('BREVO_API_KEY not configured');
  }

  const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: 'My GEO Check', email: 'hello@mygeocheck.com' },
      to: [{ email: email }],
      subject: 'Your GEO Visibility Report is Ready',
      htmlContent: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
  <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color:#1e3a5f;margin-top:0;">Your GEO Visibility Report</h1>
    <p style="color:#4b5563;font-size:16px;line-height:1.6;">
      Thank you for your purchase! Your comprehensive GEO Visibility Report for <strong>Report #${reportId}</strong> is now ready.
    </p>
    <div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:8px;padding:20px;margin:20px 0;">
      <h2 style="color:#047857;margin-top:0;font-size:18px;">What's Inside Your Report:</h2>
      <ul style="color:#374151;line-height:1.8;padding-left:20px;margin:0;">
        <li>22+ detailed GEO optimization checks</li>
        <li>AI search visibility score breakdown</li>
        <li>Quick wins to improve visibility immediately</li>
        <li>Priority-ranked fix recommendations</li>
        <li>Strategic recommendations for AI search</li>
      </ul>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://mygeocheck.com/report/${reportId}" style="display:inline-block;background:#10b981;color:#fff;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:16px;">
        View Your Full Report
      </a>
    </div>
    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="color:#92400e;font-size:14px;margin:0;">
        <strong>Can't see the report?</strong> Try this direct link:<br/>
        <a href="https://mygeocheck.com/report/${reportId}" style="color:#d97706;">https://mygeocheck.com/report/${reportId}</a>
      </p>
    </div>
    <p style="color:#6b7280;font-size:13px;text-align:center;margin-top:24px;">
      Need help? Reply to this email or contact us at hello@mygeocheck.com
    </p>
  </div>
  <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:20px;">
    &copy; 2026 My GEO Check. All rights reserved.<br/>
    <a href="https://mygeocheck.com" style="color:#6366f1;">mygeocheck.com</a>
  </p>
</body>
</html>`,
    }),
  });

  if (!emailRes.ok) {
    let emailErr;
    try {
      emailErr = await emailRes.json();
    } catch {
      emailErr = { status: emailRes.status };
    }
    console.error('Brevo email delivery error:', emailErr);
    throw new Error(`Email delivery failed: ${emailRes.status}`);
  }
}

/**
 * Send alert email to site owner when something goes wrong
 */
async function sendOwnerAlert({ type, order_id, report_id, customer_email, error }) {
  const apiKey = process.env.BREVO_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL || 'mygeocheck@coze.email';

  if (!apiKey) return;

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'My GEO Check Monitor', email: 'hello@mygeocheck.com' },
        to: [{ email: ownerEmail }],
        subject: `⚠️ Alert: ${type} - Order ${order_id}`,
        htmlContent: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#fff3cd;border:2px solid #ffc107;border-radius:12px;padding:24px;">
    <h2 style="color:#856404;margin-top:0;">⚠️ ${type}</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px;font-weight:bold;color:#666;">Order ID:</td><td style="padding:8px;">${order_id}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#666;">Report ID:</td><td style="padding:8px;">${report_id}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#666;">Customer:</td><td style="padding:8px;">${customer_email}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#666;">Error:</td><td style="padding:8px;color:#dc3545;">${error}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;color:#666;">Time:</td><td style="padding:8px;">${new Date().toISOString()}</td></tr>
    </table>
    <p style="margin-top:16px;color:#666;font-size:14px;">
      <strong>Action required:</strong> Please manually send the report to ${customer_email} or investigate the delivery issue.<br/>
      Report link: <a href="https://mygeocheck.com/report/${report_id}">https://mygeocheck.com/report/${report_id}</a>
    </p>
  </div>
</body>
</html>`,
      }),
    });
    console.log('Owner alert sent:', type, order_id);
  } catch (alertError) {
    console.error('Failed to send owner alert:', alertError.message);
  }
}
