// 分析 API - 接收产品 URL，抓取页面内容，调用 AI 分析
// v22: 诊断+药方分离 — 免费版只给诊断（痛点），付费版给药方（解决方案）
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { scrapeProductPage, isValidShopifyUrl, looksLikeProductPage, nonProductPageError } from '../../../lib/scraper';
import { analyzeProduct } from '../../../lib/openai';
import { recordEvent, domainFromUrl } from '../../../lib/analytics';
import { saveReport, getReport, unlockReport, updateApiUsage, getApiUsage, initDatabase, getActiveSubscription, getSubscriptionUsage, incrementSubscriptionUsage, isFoundingCustomer, enrollFoundingCustomer, countFoundingCustomers } from '../../../lib/db';

// 强制使用 Node.js 运行时（非 Edge Runtime）
export const runtime = 'nodejs';
// 禁止静态预渲染 - 必须动态运行
export const dynamic = 'force-dynamic';
// Vercel 函数最大执行时间（Pro 计划 60s，Hobby 计划 10s）
export const maxDuration = 60;

// 数据库自动初始化标志（serverless 环境每个实例只执行一次）
let dbInitialized = false;

async function ensureDbReady() {
  if (dbInitialized) return;
  try {
    await initDatabase();
    dbInitialized = true;
    console.log('[DB] Auto-init completed');
  } catch (err) {
    console.warn('[DB] Auto-init failed (non-critical):', err.message);
  }
}

/**
 * 生成降级结果（AI 分析完全失败时使用）
 */
function generateFallbackAnalysis(productData, url) {
  let fallbackProductName = 'Product';
  try {
    const parsedUrl = new URL(url);
    fallbackProductName = parsedUrl.hostname.replace('www.', '');
  } catch(e) {
    fallbackProductName = productData?.title || 'Product';
  }
  return {
    score: 50,
    product_name: fallbackProductName,
    store_name: '',
    verdict: 'ChatGPT might recommend this product in some searches',
    industry_benchmark: { percentile: 30, message: 'You scored better than 30% of similar stores', exposure_score: 0 },
    buyer_queries: [
      'best product in this category',
      'where to buy online',
      'product review and comparison',
      'affordable option for beginners',
      'top rated product this year',
      'gift idea for this product type',
      'is this worth the price',
    ],
    query_match_scores: [
      { query: 'best product in this category', match: 'low', reason: 'Analysis incomplete' },
      { query: 'where to buy online', match: 'low', reason: 'Analysis incomplete' },
      { query: 'product review and comparison', match: 'fail', reason: 'Analysis incomplete' },
      { query: 'affordable option for beginners', match: 'low', reason: 'Analysis incomplete' },
      { query: 'top rated product this year', match: 'fail', reason: 'Analysis incomplete' },
      { query: 'gift idea for this product type', match: 'low', reason: 'Analysis incomplete' },
      { query: 'is this worth the price', match: 'low', reason: 'Analysis incomplete' },
    ],
    competitors: [
      { name: 'Competitor A', domain: 'competitor-a.com', why_they_win: 'Better optimized content' },
      { name: 'Competitor B', domain: 'competitor-b.com', why_they_win: 'Stronger schema markup' },
      { name: 'Competitor C', domain: 'competitor-c.com', why_they_win: 'More comprehensive product descriptions' },
    ],
    diagnosis: [
      { category: 'General', severity: 'medium', issue: 'AI analysis was interrupted. Please re-run for detailed insights.', impact: 'Full evaluation not available.', },
      { category: 'Content', severity: 'medium', issue: 'Re-run analysis for detailed diagnosis.', impact: 'Detailed issues unavailable.', },
      { category: 'Technical', severity: 'low', issue: 'Re-run analysis for detailed diagnosis.', impact: 'Detailed issues unavailable.', },
    ],
    paid_fixes: [
      { category: 'General', fix: 'Re-run the analysis to get specific fix recommendations.', priority: 1, code_snippet: '' },
      { category: 'Content', fix: '', priority: 2, code_snippet: '' },
      { category: 'Technical', fix: '', priority: 3, code_snippet: '' },
    ],
    overall_recommendations: 'Please try the analysis again for complete recommendations.',
    paid_value_prop: 'Unlock specific fix instructions, competitor names, schema code snippets, and multi-platform analysis (ChatGPT + Perplexity + Google AI)',
    _fallback: true,
  };
}

/**
 * 模糊化竞品名（免费版）
 */
function blurCompetitors(competitors) {
  if (!Array.isArray(competitors)) return [];
  return competitors.map(c => ({
    name: 'A well-known brand in this category',
    domain: 'competitor-store.com',
    why_they_win: c.why_they_win || '',
  }));
}

/**
 * 将 paid_fixes 转为 teasers（免费版）
 */
function generateTeasers(paidFixes) {
  if (!Array.isArray(paidFixes)) return [];
  const teaserTemplates = [
    'Get a complete rewrite of your product description optimized for AI search',
    'Receive ready-to-use Schema markup code for your product page',
    'Get a content expansion plan with FAQ, comparison, and buying guide templates',
    'Unlock step-by-step fix instructions with code examples',
    'See exactly what to change and where on your page',
  ];
  return paidFixes.map((fix, i) => ({
    category: fix.category || 'General',
    teaser: teaserTemplates[i] || 'Unlock specific fix instructions and code examples',
  }));
}

/**
 * 判断用户是否有付费权限（已解锁 或 有活跃订阅）
 */
async function checkPaidAccess(report, customerEmail) {
  // 已解锁的报告
  if (report && report.unlocked) return true;
  // 有活跃订阅的用户 / 创始用户
  if (customerEmail) {
    try {
      const sub = await getActiveSubscription(customerEmail);
      if (sub) return true;
    } catch (e) {
      console.warn('[PaidAccess] Subscription check failed:', e.message);
    }
    try {
      if (await isFoundingCustomer(customerEmail)) return true;
    } catch (e) {
      console.warn('[PaidAccess] Founding check failed:', e.message);
    }
  }
  return false;
}

/**
 * POST /api/analyze
 * Body: { url: string, lang?: string, email?: string }
 */
export async function POST(request) {
  try {
    await ensureDbReady();

    const { url, lang, email, join_founding, founding_agreements } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid URL' },
        { status: 400 }
      );
    }

    // Analytics
    recordEvent('analysis_started', {
      domain: domainFromUrl(url),
      email: typeof email === 'string' && email.includes('@') ? email.trim() : null,
      lang: lang || 'en',
    });

    if (!isValidShopifyUrl(url)) {
      const np = nonProductPageError();
      return NextResponse.json(
        {
          error: np.message,
          error_type: 'NOT_PRODUCT_PAGE',
          error_title: np.errorTitle,
          suggestions: np.suggestions,
        },
        { status: 422 }
      );
    }

    // 订阅额度检查
    const customerEmail = typeof email === 'string' && email.includes('@') ? email.trim().toLowerCase() : null;
    let subscription = null;
    let monthlyUsed = 0;

    if (customerEmail) {
      try {
        subscription = await getActiveSubscription(customerEmail);
        if (subscription && subscription.plan_type === 'monthly') {
          monthlyUsed = await getSubscriptionUsage(customerEmail);
          if (monthlyUsed >= 5) {
            return NextResponse.json({
              success: true,
              score: 0,
              product_name: '',
              store_name: '',
              diagnosis: [],
              report_id: null,
              quota_exceeded: true,
              monthly_used: 5,
              monthly_limit: 5,
              message: 'You have used all 5 reports included in your monthly plan. Each additional report is $9, or wait for next month to reset.',
            });
          }
        }
      } catch (quotaErr) {
        console.warn('[Quota] Subscription check failed (non-critical):', quotaErr.message);
      }
    }

    // 抓取产品页面
    let productData;
    try {
      productData = await scrapeProductPage(url);
    } catch (scrapeError) {
      console.error('Scraping failed:', scrapeError.message);
      return NextResponse.json(
        {
          error: scrapeError.message || 'Could not access the product page.',
          error_type: scrapeError.errorType || 'GENERIC',
          error_title: scrapeError.errorTitle || 'Unable to Access Page',
          suggestions: scrapeError.suggestions || [],
          debug: process.env.NODE_ENV === 'development' ? scrapeError.allErrors?.join(' | ') : undefined,
        },
        { status: 422 }
      );
    }

    // 抓取结果可信度校验：确认抓到的确实是产品详情页，而非目录页/政策页
    if (!looksLikeProductPage(productData, url)) {
      console.warn('[Scrape] Content is not a product page:', url, JSON.stringify(productData?.title || ''));
      recordEvent('analysis_not_product', { domain: domainFromUrl(url), lang: lang || 'en' });
      const np = nonProductPageError();
      return NextResponse.json(
        {
          error: np.message,
          error_type: np.errorType,
          error_title: np.errorTitle,
          suggestions: np.suggestions,
        },
        { status: 422 }
      );
    }

    // 月度 API 预算检查
    let apiUsage;
    try {
      apiUsage = await getApiUsage();
    } catch (err) {
      console.warn('[Budget] DB unavailable, using default values');
      apiUsage = { call_count: 0, estimated_cost: 0 };
    }

    const monthlyBudget = parseFloat(process.env.MONTHLY_API_BUDGET || '50');
    const cost = parseFloat(apiUsage.estimated_cost) || 0;

    if (cost >= monthlyBudget) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable due to high demand. Please try again next month.' },
        { status: 503 }
      );
    }

    if (cost >= monthlyBudget * 0.8) {
      console.warn(`[Budget] WARNING: Approaching limit. $${cost.toFixed(2)} / $${monthlyBudget}`);
    }

    // 调用 AI 分析
    let analysisResult;
    let aiErrorInfo = null;
    try {
      analysisResult = await analyzeProduct(productData, url, lang || 'en');
    } catch (aiError) {
      console.error('AI analysis failed after all retries:', aiError.message);
      aiErrorInfo = aiError.message;
      analysisResult = generateFallbackAnalysis(productData, url);
    }
    // API 用量统计独立执行，失败不影响分析结果，也不污染 AI 错误信息
    try {
      await updateApiUsage();
    } catch (usageErr) {
      console.warn('[Quota] updateApiUsage failed (non-fatal):', usageErr.message);
    }

    // 保存到数据库
    const reportId = crypto.randomUUID();

    try {
      await saveReport({
        reportId,
        url,
        domain: domainFromUrl(url),
        email: customerEmail,
        product_name: analysisResult.product_name || productData.title,
        store_name: analysisResult.store_name || '',
        score: analysisResult.score || 0,
        free_issues: analysisResult.diagnosis || [],  // diagnosis 作为 free_issues 存储
        full_report: null,  // 不再使用旧结构
        lang: lang || 'en',
        unlocked: false,
        ai_error: aiErrorInfo,
        is_fallback: analysisResult._fallback || false,
        verdict: analysisResult.verdict || null,
        buyer_queries: analysisResult.buyer_queries || null,
        query_match_scores: analysisResult.query_match_scores || null,
        competitors: analysisResult.competitors || null,
        diagnosis: analysisResult.diagnosis || null,
        paid_fixes: analysisResult.paid_fixes || null,
        industry_benchmark: analysisResult.industry_benchmark || null,
      });
      console.log('[DB] Report saved:', reportId);
    } catch (dbErr) {
      console.error('[DB] Failed to save report:', dbErr.message);
    }

    // 订阅用户用量追踪
    if (subscription && subscription.plan_type === 'monthly') {
      try {
        await incrementSubscriptionUsage(customerEmail, 'monthly');
        console.log('[Quota] Monthly usage incremented for', customerEmail);
      } catch (usageErr) {
        console.warn('[Quota] Failed to track usage:', usageErr.message);
      }
    }

    // Analytics
    if (analysisResult._fallback) {
      recordEvent('analysis_fallback', {
        report_id: reportId,
        domain: domainFromUrl(url),
        email: customerEmail,
        reason: aiErrorInfo || 'ai_analysis_failed',
      });
    }

    // 构建免费版响应（模糊竞品，paid_fixes 变 teasers）
    const responseData = {
      success: true,
      score: analysisResult.score,
      product_name: analysisResult.product_name || productData.title,
      store_name: analysisResult.store_name || '',
      verdict: analysisResult.verdict,
      industry_benchmark: analysisResult.industry_benchmark,
      buyer_queries: analysisResult.buyer_queries,
      query_match_scores: analysisResult.query_match_scores,
      competitors: blurCompetitors(analysisResult.competitors),
      diagnosis: analysisResult.diagnosis,
      paid_fixes_teasers: generateTeasers(analysisResult.paid_fixes),
      paid_value_prop: analysisResult.paid_value_prop,
      report_id: reportId,
      unlocked: false,
      _fallback: analysisResult._fallback || false,
      _source: productData._source || 'unknown',
    };

    // 创始用户入组：带邮箱且主动申请，名额未满则登记（前30名）
    let foundingInfo = null;
    if (customerEmail && join_founding) {
      try {
        foundingInfo = await enrollFoundingCustomer(customerEmail, reportId, {
          agreed_return: founding_agreements?.agreed_return ?? true,
          agreed_feedback: founding_agreements?.agreed_feedback ?? true,
          agreed_case: founding_agreements?.agreed_case ?? false,
        });
        console.log('[Founding] Enroll result:', JSON.stringify(foundingInfo));
      } catch (e) {
        console.warn('[Founding] Enroll failed:', e.message);
      }
    }

    // 如果用户有付费权限，返回完整数据
    const hasPaidAccess = await checkPaidAccess(null, customerEmail);
    if (hasPaidAccess) {
      responseData.competitors = analysisResult.competitors;
      responseData.paid_fixes = analysisResult.paid_fixes;
      responseData.unlocked = true;
      // 自动解锁这个报告
      try {
        await unlockReport(reportId);
      } catch (e) {
        console.warn('[Unlock] Failed to auto-unlock:', e.message);
      }
    }

    if (foundingInfo) {
      responseData.founding = foundingInfo;
      let slotsLeft = null;
      try { slotsLeft = Math.max(0, 30 - await countFoundingCustomers()); } catch (e) {}
      responseData.founding.slots_left = slotsLeft;
    }

    if (aiErrorInfo) {
      responseData._ai_error = aiErrorInfo;
    }
    if (process.env.NODE_ENV === 'development') {
      const freshUsage = await getApiUsage().catch(() => ({ call_count: 0, estimated_cost: 0 }));
      responseData._api_usage = freshUsage;
    }
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { 
        error: 'Something went wrong. Please try again.',
        debug: error.message || 'unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze?report_id=xxx[&unlock=true]
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('report_id');
  const shouldUnlock = searchParams.get('unlock') === 'true';
  const email = searchParams.get('email');

  if (!reportId) {
    return NextResponse.json(
      { error: 'Report ID is required' },
      { status: 400 }
    );
  }

  let report;
  try {
    report = await getReport(reportId);
  } catch (err) {
    console.error('[DB] getReport failed:', err.message);
  }

  if (!report) {
    return NextResponse.json(
      { error: 'Report not found or has expired. Please run a new analysis.' },
      { status: 404 }
    );
  }

  // 判断是否应该返回付费内容
  let showFullContent = report.unlocked || false;
  
  // 如果需要解锁 或 用户有订阅，检查权限
  if (shouldUnlock || email) {
    const customerEmail = typeof email === 'string' && email.includes('@') ? email.trim().toLowerCase() : null;
    showFullContent = await checkPaidAccess(report, customerEmail);
    if (showFullContent && !report.unlocked) {
      try {
        await unlockReport(reportId);
      } catch (e) {
        console.warn('[Unlock] Failed:', e.message);
      }
    }
  }

  // 构建响应
  const baseResponse = {
    success: true,
    url: report.url,
    product_name: report.product_name,
    store_name: report.store_name || '',
    score: report.score,
    verdict: report.verdict || null,
    industry_benchmark: report.industry_benchmark || null,
    buyer_queries: report.buyer_queries || null,
    query_match_scores: report.query_match_scores || null,
    diagnosis: report.diagnosis || report.free_issues || [],
    lang: report.lang || 'en',
    unlocked: showFullContent,
    report_id: reportId,
  };

  if (showFullContent) {
    // 付费版：完整竞品 + 完整 paid_fixes
    baseResponse.competitors = report.competitors || [];
    baseResponse.paid_fixes = report.paid_fixes || [];
    baseResponse.overall_recommendations = report.full_report?.overall_recommendations || '';
  } else {
    // 免费版：模糊竞品 + teasers
    baseResponse.competitors = blurCompetitors(report.competitors);
    baseResponse.paid_fixes_teasers = generateTeasers(report.paid_fixes);
    baseResponse.paid_value_prop = 'Unlock specific fix instructions, competitor names, schema code snippets, and multi-platform analysis (ChatGPT + Perplexity + Google AI)';
  }

  return NextResponse.json(baseResponse);
}
