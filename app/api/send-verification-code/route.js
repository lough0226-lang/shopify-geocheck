// POST /api/send-verification-code
import { NextResponse } from 'next/server';
import { saveVerificationCode } from '../../../lib/db';
import { recordEvent } from '../../../lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 内存频率限制（同一实例内生效）
const rateLimits = new Map();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 频率限制：同一邮箱每60秒只能发一次
    const now = Date.now();
    const lastSent = rateLimits.get(normalizedEmail) || 0;
    if (now - lastSent < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - lastSent)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSeconds} seconds before requesting another code` },
        { status: 429 }
      );
    }

    // 生成6位验证码，10分钟过期
    const code = generateCode();
    const expiresAt = new Date(now + 10 * 60 * 1000).toISOString();

    // 存入数据库
    await saveVerificationCode(normalizedEmail, code, expiresAt);
    rateLimits.set(normalizedEmail, now);

    // 发送邮件
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mygeocheck.com';
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'My GEO Check', email: 'hello@mygeocheck.com' },
        to: [{ email: normalizedEmail }],
        subject: 'Your Verification Code - My GEO Check',
        htmlContent: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#f9fafb;">
  <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 4px rgba(0,0,0,0.1);text-align:center;">
    <h1 style="color:#1e3a5f;margin-top:0;font-size:22px;">Verification Code</h1>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;">
      Use the code below to view your GEO analysis reports:
    </p>
    <div style="background:#f0fdf4;border:2px solid #a7f3d0;border-radius:8px;padding:20px;margin:24px 0;">
      <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#047857;font-family:monospace;">${code}</div>
    </div>
    <p style="color:#6b7280;font-size:13px;">
      This code expires in 10 minutes.<br/>
      If you didn't request this, please ignore this email.
    </p>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
      <a href="${siteUrl}" style="color:#6b7280;text-decoration:none;">mygeocheck.com</a>
    </p>
  </div>
</body></html>`,
      }),
    });

    if (!res.ok) {
      console.error('Verification email send failed:', res.status);
      return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 });
    }

    recordEvent('verification_code_sent', { email: normalizedEmail });

    return NextResponse.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Send verification code error:', error);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
