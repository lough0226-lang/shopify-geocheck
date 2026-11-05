// POST /api/store-scan/recheck
// 复测：用同一次扫描记录里的 handle 列表重新跑规则层，和上次逐商品对比。
//
// 为什么按 handle 而不是重新扫最新目录：
//   只有"同一批商品"的分数才可比。目录一变（上新、下架），店级分数波动就掺了噪音，
//   店主会以为是自己改坏了。这里固定旧 handle 集合，只算这批商品的新分数。
import { NextResponse } from 'next/server';
import { initDatabase, getStoreScan } from '../../../../lib/db';
import { fetchCatalog, ruleScanProduct, scoreProduct } from '../../../../lib/storeScan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { body = {}; }
  const scanId = typeof body.scan_id === 'string' ? body.scan_id : '';
  if (!scanId) return NextResponse.json({ error: 'scan_id is required' }, { status: 400 });

  try { await initDatabase(); } catch { /* ignore */ }

  const scan = await getStoreScan(scanId);
  if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });

  const oldHandles = Array.isArray(scan.handles) ? scan.handles : [];
  const oldProducts = Array.isArray(scan.summary?.products) ? scan.summary.products : [];
  if (!oldHandles.length || !oldProducts.length) {
    return NextResponse.json({ error: 'This scan has no stored product list to compare against' }, { status: 422 });
  }
  const oldScoreByHandle = new Map(oldProducts.map((p) => [p.handle, p.score]));
  const oldStoreScore = scan.catalog_score ?? scan.summary?.score ?? 0;

  // 重新取当前目录（1-2 个请求），按 handle 对齐
  const { products } = await fetchCatalog(scan.store_domain, 250);
  const nowByHandle = new Map(products.map((p) => [p.handle, p]));

  const improved = [];
  const regressed = [];
  const unchanged = [];
  const gone = [];

  for (const h of oldHandles) {
    const p = nowByHandle.get(h);
    if (!p) { gone.push(h); continue; }
    const issues = ruleScanProduct(p);
    const next = scoreProduct(issues);
    const prev = oldScoreByHandle.get(h);
    if (!Number.isFinite(prev)) continue;
    const delta = next - prev;
    const row = { handle: h, title: p.title, before: prev, after: next, delta, issues: issues.map((i) => i.code) };
    if (delta >= 5) improved.push(row);
    else if (delta <= -5) regressed.push(row);
    else unchanged.push(row);
  }

  const compared = improved.length + regressed.length + unchanged.length;
  const newScores = [...improved, ...regressed, ...unchanged].map((r) => r.after);
  const newStoreScore = median(newScores);

  const byDelta = (a, b) => b.delta - a.delta;

  return NextResponse.json({
    success: true,
    scan_id: scanId,
    domain: scan.store_domain,
    compared,
    gone: gone.length,
    store: {
      before: oldStoreScore,
      after: newStoreScore,
      delta: newStoreScore - oldStoreScore,
    },
    counts: { improved: improved.length, regressed: regressed.length, unchanged: unchanged.length },
    improved: improved.sort(byDelta).slice(0, 10),
    regressed: regressed.sort(byDelta).slice(0, 10),
  });
}
