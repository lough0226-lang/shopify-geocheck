// POST /api/store-scan/deep
// 一次只深挖一个商品。前端按 deep_handles 循环调用，进度条由调用次数驱动。
//
// 为什么不做成"一次跑完 N 个"：
//   每个深挖要抓页面 + 一次模型调用（15s 超时），20 个就是 5–8 分钟，
//   任何服务器函数的超时都撑不住。一次一个，天然可断点续跑、天然有进度。
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initDatabase, getStoreScan, saveReport, appendStoreScanDeepResult, getDeepUsage, incrementDeepUsage } from '../../../../lib/db';
import { scrapeProductPage } from '../../../../lib/scraper';
import { analyzeProduct } from '../../../../lib/openai';
import { DEEP_QUOTA } from '../../../../lib/storeScan';
import { resolveScanPlan, higherPlan } from '../../../../lib/plans';
import { recordEvent, domainFromUrl } from '../../../../lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const VID_COOKIE = 'geo_vid';

function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

// 身份：有邮箱用邮箱（付费用户），否则用设备 cookie 的哈希。
// 额度必须绑在"人"上 —— 绑在 scan_id 上时，用户重新扫一次就能重置额度。
function identityFor(request, email) {
  if (email && email.includes('@')) return { identity: `email:${email.trim().toLowerCase()}`, setCookie: null };
  const existing = readCookie(request, VID_COOKIE);
  if (existing && /^[a-f0-9-]{16,64}$/i.test(existing)) {
    return { identity: `vid:${existing}`, setCookie: null };
  }
  const vid = crypto.randomUUID();
  return { identity: `vid:${vid}`, setCookie: `${VID_COOKIE}=${vid}; Path=/; Max-Age=31536000; SameSite=Lax` };
}

// $29 一次性档买的是"这一次"，不分月；其余按月计
function periodFor(plan, now = new Date()) {
  if (plan === 'onetime') return 'lifetime';
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

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

  // 档位在深挖时重新解析一次：用户在扫描之后才付款，也能立刻用上新额度。
  // 取「扫描时记录的档位」与「当前 orders 解析出的档位」中较高者。
  const livePlan = await resolveScanPlan(scan.email);
  const effectivePlan = higherPlan(livePlan, scan.plan);
  const quota = DEEP_QUOTA[effectivePlan] || DEEP_QUOTA.free;
  const done = Array.isArray(scan.deep_results) ? scan.deep_results : [];

  // 已经挖过 → 直接返回，不重复烧钱
  const cached = done.find((d) => d.handle === handle);
  if (cached) {
    return NextResponse.json({ success: true, cached: true, result: cached, progress: { done: done.length, total: quota } });
  }

  // 额度按「身份 + 期间」计，不是按 scan_id —— 否则重新扫一次就能重置
  // 额度键改为「店铺域名 + 期间」，不再用设备 cookie。
  //
  // 为什么：cookie / IP 是弱身份，清一下就能绕——技术上既不可靠，
  // 也让懂行的人觉得这个限制是摆设。而"同一个店这个月算过了"
  // 在逻辑上是缓存，不是限制：任何人来都拿到同一份结果，成本也只烧一次。
  const identity = 'domain:' + String(scan.store_domain || '').toLowerCase();
  const period = periodFor(scan.plan);
  const setCookie = null;
  let usedBefore = 0;
  try { usedBefore = await getDeepUsage(identity, period); } catch (e) { console.warn('[deep] usage read failed:', e.message); }

  if (usedBefore >= quota) {
    const res = NextResponse.json(
      {
        error: 'quota_exhausted',
        message: `This store was already analysed this ${period === 'lifetime' ? 'purchase' : 'month'}. The result from that run is what you see here. Upgrade to analyse more products in the same store.`,
        progress: { done: usedBefore, total: quota },
      },
      { status: 402 }
    );
    if (setCookie) res.headers.append('set-cookie', setCookie);
    return res;
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
    identity_kind: identity.split(':')[0],
  });

  // 额度用量以数据库为准（原子自增），不用 scan.deep_results 的长度
  let usedAfter = usedBefore + 1;
  try { usedAfter = await incrementDeepUsage(identity, period, scan.plan); } catch (e) { console.warn('[deep] usage bump failed:', e.message); }

  const res = NextResponse.json({
    success: true,
    result: entry,
    progress: { done: usedAfter, total: quota, remaining: Math.max(0, quota - usedAfter) },
  });
  if (setCookie) res.headers.append('set-cookie', setCookie);
  return res;
}
