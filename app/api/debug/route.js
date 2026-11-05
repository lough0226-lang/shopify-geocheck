// 已下线（2026-11-05）：原本是无鉴权的调试口，会输出抓取失败细节与环境信息。
// 保留文件是为了让旧链接返回 410 而不是 404。
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}
