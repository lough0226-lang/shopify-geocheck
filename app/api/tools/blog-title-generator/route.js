import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const { topic, keywords, count } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Blog topic is required' }, { status: 400 });
    }

    const numTitles = count || 10;

    const prompt = `You are an expert SEO content strategist and blog title specialist. Generate ${numTitles} catchy, SEO-friendly blog title ideas for the following topic.

Blog Topic: ${topic}
Target Keyword: ${keywords || 'N/A'}

Requirements:
- Each title should be unique and compelling
- Include the target keyword naturally where possible
- Mix different title formats: how-to, listicle, question, guide, comparison, etc.
- Keep titles between 50-70 characters for optimal SEO
- Make them click-worthy without being clickbait
- Use power words that drive engagement

Output format: Return ONLY a numbered list (1. 2. 3. etc.) with one title per line. No extra text, no labels, no headers.`;

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
      console.error('[BlogTitle] API error:', response.status);
      return NextResponse.json({ error: 'AI service unavailable. Please try again later.' }, { status: 502 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return NextResponse.json({ error: 'Failed to generate titles' }, { status: 500 });
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error('[BlogTitle] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
