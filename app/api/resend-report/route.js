// POST /api/resend-report
// Customer self-service: resend report email
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limit: max 3 resends per report_id per hour
const resendCounts = new Map();

function checkRateLimit(reportId) {
  const now = Date.now();
  const key = reportId;
  const entry = resendCounts.get(key) || [];
  const recent = entry.filter(t => now - t < 3600000); // last hour
  resendCounts.set(key, recent);
  return recent.length < 3;
}

function recordResend(reportId) {
  const entry = resendCounts.get(reportId) || [];
  entry.push(Date.now());
  resendCounts.set(reportId, entry);
}

export async function POST(request) {
  try {
    const { report_id, email } = await request.json();

    if (!report_id || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid report_id or email' }, { status: 400 });
    }

    if (!checkRateLimit(report_id)) {
      return NextResponse.json({ error: 'Too many resend attempts. Please try again later or contact hello@mygeocheck.com' }, { status: 429 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'My GEO Check', email: 'hello@mygeocheck.com' },
        to: [{ email }],
        subject: `Your GEO Visibility Report #${report_id}`,
        htmlContent: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
  <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color:#1e3a5f;margin-top:0;">Your GEO Visibility Report</h1>
    <p style="color:#4b5563;font-size:16px;line-height:1.6;">
      Here is your report. Click below to view it:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://mygeocheck.com/report/${report_id}" style="display:inline-block;background:#10b981;color:#fff;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:16px;">
        View Your Full Report
      </a>
    </div>
    <p style="color:#6b7280;font-size:13px;text-align:center;">
      Direct link: https://mygeocheck.com/report/${report_id}
    </p>
    <div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="color:#047857;font-size:14px;margin:0;">
        <strong>What's in your report:</strong><br/>
        &bull; 22+ GEO optimization checks<br/>
        &bull; AI search visibility score<br/>
        &bull; Quick wins &amp; priority fixes<br/>
        &bull; Strategic recommendations
      </p>
    </div>
    <p style="color:#6b7280;font-size:13px;text-align:center;">
      Questions? Reply to this email or contact hello@mygeocheck.com
    </p>
  </div>
</body></html>`,
      }),
    });

    if (!res.ok) {
      console.error('Resend email failed:', res.status);
      return NextResponse.json({ error: 'Failed to send email. Please try again or contact hello@mygeocheck.com' }, { status: 500 });
    }

    recordResend(report_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
