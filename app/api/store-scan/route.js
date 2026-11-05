// POST /api/store-scan
// 整店扫描（规则层）：输入店铺域名 → 抓目录 → 跑九类确定性检查 → 存库 → 返回汇总
//
// 这一层不调用任何模型，所以成本≈0，可以一次扫 200 个商品。
// 深挖（模型分析）不在这里做，这里只负责挑出"值得深挖的那 N 个"。
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { normalizeDomain, fetchCatalog, summarize, DEEP_QUOTA } from '../../../lib/storeScan';
import { saveStoreScan, getStoreScan, initDatabase } from '../../../lib/db';
import { recordEvent } from '../../../lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// 各档位的深挖额度在 lib/storeScan.js 里统一定义，避免定价页与代码各写一套。

function planFromParam(v) {
  return Object.prototype.hasOwnProperty.call(DEEP_QUOTA, v) ? v : 'free';
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { body = {}; }

  const domain = normalizeDomain(body.domain || body.url);
  if (!domain) {
    return NextResponse.json({ error: 'Please enter a valid store domain, e.g. yourstore.com' }, { status: 400 });
  }

  const plan = planFromParam(body.plan);
  const limit = Math.min(Math.max(parseInt(body.limit, 10) || 200, 1), 200);
  const email = typeof body.email === 'string' && body.email.includes('@')
    ? body.email.trim().toLowerCase()
    : null;

  try { await initDatabase(); } catch { /* 已有表时忽略 */ }

  const startedAt = Date.now();
  const { products, sorted } = await fetchCatalog(domain, limit);

  if (!products.length) {
    return NextResponse.json(
      {
        error: 'catalog_unavailable',
        message: `We could not read ${domain}'s product catalog. The store may have disabled /products.json, or it is not a Shopify store.`,
      },
      { status: 422 }
    );
  }

  const summary = summarize(products, products.length);
  const handles = products.map((p) => p.handle);
  // 深挖对象：按 Shopify 真实销量排序取前 N 个（拿不到销量排序时退化为"规则分最差的 N 个"）
  const deepQuota = DEEP_QUOTA[plan];
  const deepHandles = sorted
    ? handles.slice(0, deepQuota)
    : summary.worst.slice(0, deepQuota).map((w) => w.handle);

  const scanId = crypto.randomUUID();
  try {
    await saveStoreScan({
      scanId,
      email,
      storeDomain: domain,
      plan,
      productsTotal: products.length,
      productsScanned: products.length,
      bestSellingRanked: sorted,
      catalogScore: summary.score,
      summary,
      handles,
      deepHandles,
    });
  } catch (e) {
    console.warn('[store-scan] save failed:', e.message);
  }

  recordEvent('store_scan_completed', {
    domain,
    plan,
    scan_id: scanId,
    products: products.length,
    catalog_score: summary.score,
    sorted,
    duration_ms: Date.now() - startedAt,
    email,
  });

  return NextResponse.json({
    success: true,
    scan_id: scanId,
    domain,
    plan,
    best_selling_ranked: sorted,
    deep_quota: deepQuota,
    deep_handles: deepHandles,
    duration_ms: Date.now() - startedAt,
    // 不返回全部 200 行，只给汇总 + 最差的 20 个，避免响应过大
    summary: {
      score_basis: summary.score_basis,
      score: summary.score,
      average: summary.average,
      scanned: summary.scanned,
      analysed: summary.analysed,
      distribution: summary.distribution,
      issue_counts: summary.issue_counts,
      worst: summary.worst,
    },
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scanId = searchParams.get('scan_id');
  if (!scanId) {
    return NextResponse.json({ error: 'scan_id is required' }, { status: 400 });
  }
  try { await initDatabase(); } catch { /* ignore */ }
  let row = null;
  try { row = await getStoreScan(scanId); } catch (e) { console.warn('[store-scan] load failed:', e.message); }
  if (!row) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  return NextResponse.json({ success: true, scan: row });
}
