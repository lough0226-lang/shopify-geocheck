// 已下线（2026-11-05）：原本是无鉴权的测试口。
// 保留文件是为了让旧链接返回 410 而不是 404，便于识别是否还有调用方。
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}
