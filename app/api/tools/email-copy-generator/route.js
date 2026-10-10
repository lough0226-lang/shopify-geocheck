import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const { emailType, productContext, tone } = await request.json();

    if (!emailType || typeof emailType !== 'string') {
      return NextResponse.json({ error: 'Email type is required' }, { status: 400 });
    }

    const prompt = `You are an expert email marketing copywriter. Generate a complete, conversion-optimized email for the following campaign.

Email Type: ${emailType}
Product/Brand Context: ${productContext || 'N/A'}
Tone: ${tone || 'Professional'}

Requirements:
- Write a compelling subject line (under 50 characters)
- Write a complete email body with:
  - Engaging opening line
  - Clear value proposition
  - Relevant product/brand details
  - Strong call-to-action
  - Professional sign-off
- Keep the email concise (150-250 words for the body)
- Match the tone consistently throughout
- Use short paragraphs for readability

Output format:
Subject: [your subject line]
---BODY---
[your email body]`;

    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('[EmailCopy] API error:', response.status);
      return NextResponse.json({ error: 'AI service unavailable. Please try again later.' }, { status: 502 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
    }

    // Split subject and body
    const subjectMatch = result.match(/Subject:\s*(.+)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : '';
    const bodyParts = result.split('---BODY---');
    const body = (bodyParts[1] || bodyParts[0] || '').trim();

    return NextResponse.json({ result, subject, body });
  } catch (err) {
    console.error('[EmailCopy] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
