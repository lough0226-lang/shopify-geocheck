import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const { productName, keywords, tone } = await request.json();

    if (!productName || typeof productName !== 'string') {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const prompt = `You are an expert e-commerce copywriter and SEO specialist. Generate a single, compelling, SEO-optimized product description for the following product.

Product Name: ${productName}
Target Keywords: ${keywords || 'N/A'}
Tone: ${tone || 'Professional'}

Requirements:
- Length: 300-500 words
- Naturally incorporate the target keywords (2-3 times) without keyword stuffing
- Highlight key selling points and unique features
- Include usage scenarios or ideal use cases
- Use persuasive, benefit-driven language
- Structure with short paragraphs for readability
- End with a subtle call-to-action

Output ONLY the product description text, no labels or headers.`;

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
      console.error('[ProductDescription] API error:', response.status);
      return NextResponse.json({ error: 'AI service unavailable. Please try again later.' }, { status: 502 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error('[ProductDescription] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
