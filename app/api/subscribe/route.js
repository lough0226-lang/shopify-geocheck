import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    // TODO: Connect to Brevo API when API key is configured
    // const BREVO_API_KEY = process.env.BREVO_API_KEY;
    // if (BREVO_API_KEY) {
    //   const res = await fetch('https://api.brevo.com/v3/contacts', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'api-key': BREVO_API_KEY,
    //     },
    //     body: JSON.stringify({
    //       email: email,
    //       listIds: [2], // Brevo list ID for GEO subscribers
    //       attributes: { SOURCE: source || 'website' },
    //     }),
    //   });
    //   if (!res.ok) {
    //     const errData = await res.json();
    //     return NextResponse.json({ success: false, error: errData.message }, { status: 500 });
    //   }
    // }

    // For now, just acknowledge the subscription
    return NextResponse.json({ success: true, message: 'Subscribed' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
