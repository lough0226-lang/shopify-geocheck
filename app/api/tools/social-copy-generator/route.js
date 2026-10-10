import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const { productDesc, platform, tone } = await request.json();

    if (!productDesc || typeof productDesc !== 'string') {
      return NextResponse.json({ error: 'Product description is required' }, { status: 400 });
    }

    const platformGuide = {
      Instagram: 'optimized for Instagram with visual storytelling, emoji usage, and 15-25 relevant hashtags',
      Facebook: 'optimized for Facebook with engaging storytelling, conversational tone, and 3-5 hashtags',
      Twitter: 'optimized for Twitter/X: concise (under 280 chars), punchy, with 2-3 hashtags',
      Pinterest: 'optimized for Pinterest with descriptive, keyword-rich text and 5-10 hashtags',
      TikTok: 'optimized for TikTok: trendy, fun, short-form with 5-10 trending-style hashtags',
    };

    const platformTips = platformGuide[platform] || platformGuide.Instagram;

    const prompt = `You are a social media marketing expert. Generate an engaging social media post for the following product.

Product Description: ${productDesc}
Platform: ${platform || 'Instagram'}
Tone: ${tone || 'Professional'}

Platform-specific requirements: ${platformTips}

Requirements:
- Write a captivating caption that drives engagement
- Include relevant emojis appropriate for the platform
- Add a clear call-to-action
- Generate a list of relevant, trending hashtags
- Keep the content authentic and on-brand

Output format:
Caption: [your post caption]
---HASHTAGS---
[#hashtag1 #hashtag2 #hashtag3 ...]`;

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
      console.error('[SocialCopy] API error:', response.status);
      return NextResponse.json({ error: 'AI service unavailable. Please try again later.' }, { status: 502 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return NextResponse.json({ error: 'Failed to generate social copy' }, { status: 500 });
    }

    // Split caption and hashtags
    const captionMatch = result.match(/Caption:\s*([\s\S]*?)(?=---HASHTAGS---|$)/i);
    const caption = captionMatch ? captionMatch[1].trim() : result;
    const hashtagMatch = result.match(/---HASHTAGS---\s*([\s\S]*?)$/i);
    const hashtags = hashtagMatch ? hashtagMatch[1].trim() : '';

    return NextResponse.json({ result, caption, hashtags });
  } catch (err) {
    console.error('[SocialCopy] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
