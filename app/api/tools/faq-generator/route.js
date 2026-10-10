import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const { productInfo, keywords } = await request.json();

    if (!productInfo || typeof productInfo !== 'string') {
      return NextResponse.json({ error: 'Product information is required' }, { status: 400 });
    }

    const prompt = `You are an SEO expert specializing in structured data and FAQ content. Generate 5-8 relevant, helpful FAQs with detailed answers for the following product.

Product Information: ${productInfo}
Target Keyword: ${keywords || 'N/A'}

Requirements:
- Questions should reflect what real customers would ask
- Answers should be 2-4 sentences, informative and concise
- Naturally incorporate the target keyword where relevant
- Cover different aspects: features, usage, compatibility, care, shipping, etc.
- Answers should be helpful for both humans and search engines

Output format:
First, output the FAQs in this format:
Q1: [question]
A1: [answer]

Q2: [question]
A2: [answer]

...and so on.

Then, after a line "---SCHEMA---", output ONLY the valid JSON-LD FAQ schema code block. No markdown formatting, just raw JSON.`;

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
      console.error('[FAQGen] API error:', response.status);
      return NextResponse.json({ error: 'AI service unavailable. Please try again later.' }, { status: 502 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return NextResponse.json({ error: 'Failed to generate FAQs' }, { status: 500 });
    }

    // Split FAQs and schema
    const parts = result.split('---SCHEMA---');
    const faqText = (parts[0] || '').trim();
    const schemaCode = (parts[1] || '').trim();

    return NextResponse.json({ result: faqText, schema: schemaCode });
  } catch (err) {
    console.error('[FAQGen] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
