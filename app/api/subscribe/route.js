import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return NextResponse.json({ success: false, error: 'Email service not configured' }, { status: 500 });
    }

    // 1. 添加联系人到列表（list ID = 2）
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        listIds: [2],
        updateEnabled: true,
        attributes: { SOURCE: source || 'website' },
      }),
    });

    if (!contactRes.ok) {
      const errData = await contactRes.json();
      if (errData.code !== 'duplicate_parameter') {
        console.error('Brevo contact error:', errData);
        return NextResponse.json({ success: false, error: errData.message }, { status: 500 });
      }
    }

    // 2. 发送欢迎邮件
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'My GEO Check', email: 'lough0226@gmail.com' },
        to: [{ email: email }],
        subject: 'Welcome to My GEO Check! 🎉',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1;">Welcome to My GEO Check! 🎉</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thank you for subscribing! You're now on the list to receive the latest GEO/AEO insights, tips, and updates.
            </p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #6366f1; margin-top: 0;">What is GEO?</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #555;">
                <strong>Generative Engine Optimization (GEO)</strong> is the new SEO. As AI-powered search engines like ChatGPT, Perplexity, and Google AI Overviews become the primary way people discover products, optimizing your store's content for AI citations is no longer optional — it's essential.
              </p>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
              © 2026 My GEO Check. All rights reserved.<br/>
              <a href="https://mygeocheck.com" style="color: #6366f1;">mygeocheck.com</a>
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const emailErr = await emailRes.json();
      console.error('Brevo email error:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
