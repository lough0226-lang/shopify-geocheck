// 已下线（2026-11-05）：原本是无鉴权的模型诊断口，会暴露 key 前缀与调用结果。
// 仓库是公开的，等于给所有人一个免费调用通道。
// 保留文件是为了让旧链接返回 410 而不是 404。
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}
