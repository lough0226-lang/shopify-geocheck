// AI API 诊断端点 - 测试 Moonshot API 是否正常
// 访问: GET /api/aitest
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const results = {};

  // 1. 检查 API Key 是否存在
  results.apiKeyCheck = {
    exists: !!apiKey,
    prefix: apiKey ? apiKey.slice(0, 8) + '...' : 'MISSING',
    length: apiKey ? apiKey.length : 0,
  };

  if (!apiKey) {
    return NextResponse.json({
      error: 'OPENAI_API_KEY not set in Vercel Environment Variables',
      results,
    });
  }

  // 2. 测试1: 最简 prompt（验证 API Key 和模型是否可用）
  try {
    const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2.6',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Reply in JSON only.' },
          { role: 'user', content: 'Reply with exactly: {"test": "ok"}' },
        ],
        max_tokens: 100,
        temperature: 1,
      }),
    });

    const data = await res.json();
    results.simpleTest = {
      httpStatus: res.status,
      httpOk: res.ok,
      fullResponse: data,
      model: data.model,
      choicesCount: data.choices?.length,
      finishReason: data.choices?.[0]?.finish_reason,
      contentLength: data.choices?.[0]?.message?.content?.length || 0,
      content: data.choices?.[0]?.message?.content,
      reasoningContent: data.choices?.[0]?.message?.reasoning_content,
      allMessageKeys: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : [],
      usage: data.usage,
    };
  } catch (e) {
    results.simpleTest = { error: e.message };
  }

  // 3. 测试2: 中等长度 prompt（模拟分析场景）
  try {
    const res2 = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2.6',
        messages: [
          { role: 'system', content: 'You are a GEO expert. Analyze product pages for AI search visibility. Reply ONLY with valid JSON.' },
          { role: 'user', content: `Analyze this product for AI search visibility:
URL: https://allbirds.com/products/mens-strider-blizzard
Title: Men's Strider - Medium Grey (Blizzard Sole)
Price: $135
Description: A versatile running shoe with natural materials.

Return JSON with: score (0-100), product_name, 3 issues (category, severity, issue).
Keep it short - no more than 500 characters total.` },
        ],
        max_tokens: 2000,
        temperature: 1,
      }),
    });

    const data2 = await res2.json();
    results.mediumTest = {
      httpStatus: res2.status,
      httpOk: res2.ok,
      model: data2.model,
      choicesCount: data2.choices?.length,
      finishReason: data2.choices?.[0]?.finish_reason,
      contentLength: data2.choices?.[0]?.message?.content?.length || 0,
      content: data2.choices?.[0]?.message?.content?.slice(0, 1000),
      reasoningContent: data2.choices?.[0]?.message?.reasoning_content?.slice(0, 200),
      allMessageKeys: data2.choices?.[0]?.message ? Object.keys(data2.choices[0].message) : [],
      usage: data2.usage,
      fullResponse: data2,
    };
  } catch (e) {
    results.mediumTest = { error: e.message };
  }

  // 4. 测试3: 尝试不同参数 (temperature=0.5)
  try {
    const res3 = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2.6',
        messages: [
          { role: 'user', content: 'Return exactly this JSON: {"score": 50, "name": "test"}' },
        ],
        max_tokens: 200,
        temperature: 0.5,
      }),
    });

    const data3 = await res3.json();
    results.tempTest = {
      httpStatus: res3.status,
      httpOk: res3.ok,
      model: data3.model,
      finishReason: data3.choices?.[0]?.finish_reason,
      content: data3.choices?.[0]?.message?.content,
      reasoningContent: data3.choices?.[0]?.message?.reasoning_content,
      allMessageKeys: data3.choices?.[0]?.message ? Object.keys(data3.choices[0].message) : [],
      usage: data3.usage,
      fullResponse: data3,
    };
  } catch (e) {
    results.tempTest = { error: e.message };
  }

  // 5. 服务器信息
  results.serverInfo = {
    nodeVersion: process.version,
    runtime: process.env.NEXT_RUNTIME || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
  };

  return NextResponse.json({ timestamp: new Date().toISOString(), ...results });
}
