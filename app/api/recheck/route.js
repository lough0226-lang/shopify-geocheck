// 复查 API - 用原报告锁定的买家查询重新评分，生成前后对比
// 仅创始用户 / 付费用户可用
import { NextResponse } from 'next/server';
import { scrapeProductPage } from '../../../lib/scraper';
import { recheckProduct } from '../../../lib/openai';
import { recordEvent, domainFromUrl } from '../../../lib/analytics';
import {
  initDatabase,
  getReport,
  getActiveSubscription,
  isFoundingCustomer,
  addRecheckSnapshot,
} from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

let dbInitialized = false;
async function ensureDbReady() {
  if (dbInitialized) return;
  await initDatabase();
  dbInitialized = true;
}

/**
 * POST /api/recheck
 * Body: { report_id: string, email?: string, lang?: string, day?: number }
 */
export async function POST(request) {
  try {
    await ensureDbReady();

    const { report_id, email, lang, day } = await request.json();

    if (!report_id || typeof report_id !== 'string') {
      return NextResponse.json({ error: 'Missing report_id' }, { status: 400 });
    }

    const original = await getReport(report_id);
    if (!original) {
      return NextResponse.json({ error: 'Original report not found' }, { status: 404 });
    }

    const customerEmail = typeof email === 'string' && email.includes('@') ? email.trim().toLowerCase() : (original.email || null);

    // 权限：报告已解锁 / 有订阅 / 创始用户
    let allowed = original.unlocked === true;
    if (!allowed && customerEmail) {
      try {
        if (await getActiveSubscription(customerEmail)) allowed = true;
      } catch (e) {}
      if (!allowed) {
        try {
          if (await isFoundingCustomer(customerEmail)) allowed = true;
        } catch (e) {}
      }
    }

    if (!allowed) {
      return NextResponse.json(
        { error: 'Recheck is available for founding customers and paid reports', error_type: 'NOT_ELIGIBLE' },
        { status: 403 }
      );
    }

    const lockedQueries = Array.isArray(original.buyer_queries) ? original.buyer_queries : [];
    if (lockedQueries.length === 0) {
      return NextResponse.json({ error: 'Original report has no locked buyer queries' }, { status: 422 });
    }

    // 重新抓取当前页面
    const productData = await scrapeProductPage(original.url);
    if (!productData || !productData.pageText) {
      return NextResponse.json(
        { error: 'Could not read the current product page. Make sure the page is still live and try again.' },
        { status: 502 }
      );
    }

    const useLang = lang || original.lang || 'en';

    // 用锁定查询重新评分
    const result = await recheckProduct(productData, lockedQueries, useLang);

    // 构建快照与前后对比
    const prevMatchScores = Array.isArray(original.query_match_scores) ? original.query_match_scores : [];
    const prevExposure = original.industry_benchmark?.exposure_score ?? null;

    const comparison = lockedQueries.map((q, i) => ({
      query: q,
      before: prevMatchScores[i]?.match ?? null,
      after: result.query_match_scores[i]?.match ?? null,
      reason: result.query_match_scores[i]?.reason ?? '',
    }));

    const snapshot = {
      day: Number.isFinite(Number(day)) ? Number(day) : null,
      checked_at: new Date().toISOString(),
      score: result.score,
      exposure_score: result.exposure_score,
      query_match_scores: result.query_match_scores,
      comparison,
      before_score: original.score,
      before_exposure_score: prevExposure,
    };

    try {
      await addRecheckSnapshot(report_id, snapshot);
    } catch (e) {
      console.warn('[recheck] Failed to persist snapshot:', e.message);
    }

    recordEvent('report_rechecked', {
      report_id,
      domain: domainFromUrl(original.url),
      email: customerEmail,
      before_score: original.score,
      after_score: result.score,
    });

    return NextResponse.json({
      success: true,
      report_id,
      before: {
        score: original.score,
        exposure_score: prevExposure,
        query_match_scores: prevMatchScores,
      },
      after: {
        score: result.score,
        exposure_score: result.exposure_score,
        query_match_scores: result.query_match_scores,
      },
      comparison,
      day: snapshot.day,
      checked_at: snapshot.checked_at,
    });
  } catch (error) {
    console.error('Recheck API error:', error);
    return NextResponse.json(
      { error: error.message || 'Recheck failed, please try again' },
      { status: 500 }
    );
  }
}
