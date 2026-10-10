// POST /api/my-reports
import { NextResponse } from 'next/server';
import { getReportsByEmail, verifyEmailCode } from '../../../lib/db';
import { recordEvent } from '../../../lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Please enter the 6-digit verification code' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 验证码校验
    const isValid = await verifyEmailCode(normalizedEmail, code);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired verification code. Please request a new one.' }, { status: 401 });
    }

    // 查询报告
    const reports = await getReportsByEmail(normalizedEmail);

    recordEvent('my_reports_viewed', { email: normalizedEmail, count: reports.length });

    return NextResponse.json({
      success: true,
      reports: reports.map(r => ({
        report_id: r.report_id,
        url: r.url,
        domain: r.domain,
        product_name: r.product_name,
        score: r.score,
        lang: r.lang,
        unlocked: r.unlocked,
        created_at: r.created_at,
      })),
      total: reports.length,
    });
  } catch (error) {
    console.error('My reports API error:', error);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
