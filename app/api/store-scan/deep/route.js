// POST /api/store-scan/deep
// 一次只深挖一个商品。前端按 deep_handles 循环调用，进度条由调用次数驱动。
//
// 为什么不做成"一次跑完 N 个"：
//   每个深挖要抓页面 + 一次模型调用（15s 超时），20 个就是 5–8 分钟，
//   任何服务器函数的超时都撑不住。一次一个，天然可断点续跑、天然有进度。
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initDatabase, getStoreScan, saveReport, appendStoreScanDeepResult } from '../../../../lib/db';
import { scrapeProductPage } from '../../../../lib/scraper';
import { analyzeProduct } from '../../../../lib/openai';
import { DEEP_QUOTA } from '../../../../lib/storeScan';
import { recordEvent, domainFromUrl } from '../../../../lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { body = {}; }

  const scanId = typeof body.scan_id === 'string' ? body.scan_id : '';
  const handle = typeof body.handle === 'string' ? body.handle.trim().toLowerCase() : '';
  const lang = typeof body.lang === 'string' ? body.lang : 'en';

  if (!scanId || !handle) {
    return NextResponse.json({ error: 'scan_id and handle are required' }, { status: 400 });
  }

  try { await initDatabase(); } catch { /* ignore */ }

  const scan = await getStoreScan(scanId);
  if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });

  const quota = DEEP_QUOTA[scan.plan] || DEEP_QUOTA.free;
  const done = Array.isArray(scan.deep_results) ? scan.deep_results : [];

  // 已经挖过 → 直接返回，不重复烧钱
  const cached = done.find((d) => d.handle === handle);
  if (cached) {
    return NextResponse.json({ success: true, cached: true, result: cached, progress: { done: done.length, total: quota } });
  }

  if (done.length >= quota) {
    return NextResponse.json(
      {
        error: 'quota_exhausted',
        message: `This plan includes ${quota} deep analys${quota === 1 ? 'is' : 'es'}. Upgrade to analyse more products.`,
        progress: { done: done.length, total: quota },
      },
      { status: 402 }
    );
  }

  const handles = Array.isArray(scan.handles) ? scan.handles : [];
  if (!handles.includes(handle)) {
    return NextResponse.json({ error: 'handle_not_in_scan' }, { status: 400 });
  }

  const url = `https://${scan.store_domain}/products/${handle}`;

  let productData;
  try {
    productData = await scrapeProductPage(url);
  } catch (e) {
    return NextResponse.json({ error: 'scrape_failed', message: e.message }, { status: 502 });
  }

  let analysisResult;
  try {
    analysisResult = await analyzeProduct(productData, url, lang);
  } catch (e) {
    return NextResponse.json({ error: 'analysis_failed', message: e.message }, { status: 502 });
  }

  const reportId = crypto.randomUUID();
  try {
    await saveReport({
      reportId,
      url,
      domain: domainFromUrl(url),
      email: scan.email || null,
      product_name: analysisResult.product_name || productData.title,
      store_name: analysisResult.store_name || '',
      score: analysisResult.score || 0,
      free_issues: analysisResult.diagnosis || [],
      full_report: null,
      lang,
      unlocked: false,
      ai_error: null,
      is_fallback: analysisResult._fallback || false,
      verdict: analysisResult.verdict || null,
      buyer_queries: analysisResult.buyer_queries || null,
      query_match_scores: analysisResult.query_match_scores || null,
      diagnosis: analysisResult.diagnosis || null,
      paid_fixes: analysisResult.paid_fixes || null,
      industry_benchmark: analysisResult.industry_benchmark || null,
      competitors: analysisResult.competitors || [],
    });
  } catch (e) {
    console.warn('[deep] saveReport failed:', e.message);
  }

  const entry = {
    handle,
    report_id: reportId,
    score: analysisResult.score || 0,
    verdict: analysisResult.verdict || null,
    product_name: analysisResult.product_name || productData.title,
    at: new Date().toISOString(),
  };

  try {
    await appendStoreScanDeepResult(scanId, entry);
  } catch (e) {
    console.warn('[deep] append failed:', e.message);
  }

  recordEvent('store_scan_deep', {
    scan_id: scanId,
    domain: scan.store_domain,
    handle,
    score: entry.score,
    plan: scan.plan,
  });

  return NextResponse.json({
    success: true,
    result: entry,
    progress: { done: done.length + 1, total: quota },
  });
}
