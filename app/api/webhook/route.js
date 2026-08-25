// Creem.io Webhook Handler - Payment Confirmation & Report Delivery
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhook
 * Receives Creem payment completion events
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
      // Acknowledge other events without processing
      return NextResponse.json({ received: true, event: eventType });
    }

    // Extract payment data
    const payload = event.data || event;
    const orderId = payload.order_id || payload.id || '';
    const checkoutId = payload.checkout_id || payload.id || '';
    const customerEmail = payload.customer?.email || payload.email || '';
    const metadata = payload.metadata || {};
    const reportId = metadata.report_id || '';

    console.log('Payment received:', {
      orderId,
      checkoutId,
      customerEmail,
      reportId,
    });

    // If we have a report_id and email, trigger report generation and delivery
    if (reportId && customerEmail) {
      try {
        await deliverReport(reportId, customerEmail);
        console.log('Report delivered:', { reportId, email: customerEmail });
      } catch (deliveryError) {
        console.error('Report delivery failed:', deliveryError);
        // Still acknowledge the webhook to prevent retries
        // The report can be delivered via the success URL redirect as fallback
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
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Deliver the full GEO report via email
 */
async function deliverReport(reportId, email) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('BREVO_API_KEY not configured for report delivery');
    return;
  }

  // Send report delivery email
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
    <p style="color:#6b7280;font-size:13px;text-align:center;margin-top:24px;">
      Having trouble viewing your report? Copy this link:<br/>
      <span style="color:#6366f1;">https://mygeocheck.com/report/${reportId}</span>
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
    const emailErr = await emailRes.json();
    console.error('Brevo email delivery error:', emailErr);
    throw new Error('Email delivery failed');
  }
}
