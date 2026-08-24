// 测试端点 - 验证 API 基础设施是否正常
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openaiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 8) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}
