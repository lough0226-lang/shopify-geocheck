import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (BREVO_API_KEY) {
      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
          email: email,
          listIds: [1],
          updateEnabled: true,
          attributes: { SOURCE: source || 'website' },
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        if (errData.code !== 'duplicate_parameter') {
          return NextResponse.json({ success: false, error: errData.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Subscribed' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
