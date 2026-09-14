// 分析 API - 接收产品 URL，抓取页面内容，调用 AI 分析
// v2: 使用 PostgreSQL 持久化存储
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { scrapeProductPage, isValidShopifyUrl } from '../../../lib/scraper';
import { analyzeProduct } from '../../../lib/openai';
import { recordEvent, domainFromUrl } from '../../../lib/analytics';
import { saveReport, getReport, updateApiUsage, getApiUsage, initDatabase, getActiveSubscription, getSubscriptionUsage, incrementSubscriptionUsage } from '../../../lib/db';

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
    // 不阻断请求，后续请求会重试
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
    free_issues: [
      {
        category: 'Structure',
        severity: 'medium',
        issue: 'AI analysis was interrupted. Please re-run for detailed insights.',
        impact: 'Full evaluation not available. Try again in a few seconds.',
        dimension: 'General',
      }
    ],
    full_report: {
      detailed_checks: [],
      competitor_comparison: 'Analysis pending - please re-run.',
      quick_wins: ['Re-run analysis for complete recommendations'],
      overall_recommendations: 'Please try the analysis again.',
    },
    _fallback: true,
  };
}

/**
 * POST /api/analyze
 * Body: { url: string }
 */
export async function POST(request) {
  try {
    // 确保数据库表已创建
    await ensureDbReady();

    const { url, lang, email } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid URL' },
        { status: 400 }
      );
    }

    // Analytics: every analysis attempt (fire-and-forget, never blocks)
    recordEvent('analysis_started', {
      domain: domainFromUrl(url),
      email: typeof email === 'string' && email.includes('@') ? email.trim() : null,
      lang: lang || 'en',
    });

    if (!isValidShopifyUrl(url)) {
      return NextResponse.json(
        { error: 'Please enter a valid Shopify product URL (must be a myshopify.com store or contain /products/ path)' },
        { status: 400 }
      );
    }

    // 订阅额度检查：月订阅用户每月最多 5 份完整报告
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
              free_issues: [],
              full_report: null,
              report_id: null,
              total_issues_count: 0,
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

    // 抓取产品页面内容
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

    // 检查月度 API 预算（从数据库读取）
    let apiUsage;
    try {
      apiUsage = await getApiUsage();
    } catch (err) {
      // DB unavailable - use fallback memory-based check
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

    // 调用 AI 分析（lib/openai.js 内部已有重试机制）
    let analysisResult;
    let aiErrorInfo = null;
    try {
      analysisResult = await analyzeProduct(productData, url, lang || 'en');
      // AI 成功才记用量
      await updateApiUsage();
    } catch (aiError) {
      console.error('AI analysis failed after all retries:', aiError.message);
      aiErrorInfo = aiError.message;
      analysisResult = generateFallbackAnalysis(productData, url);
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
        free_issues: analysisResult.free_issues || [],
        full_report: analysisResult.full_report || null,
        lang: lang || 'en',
        unlocked: false,
        ai_error: aiErrorInfo,
        is_fallback: analysisResult._fallback || false,
      });
      console.log('[DB] Report saved:', reportId);
    } catch (dbErr) {
      console.error('[DB] Failed to save report:', dbErr.message);
      // DB 失败不阻断返回，用户仍能看到结果
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

    // Analytics: degraded AI result flag
    if (analysisResult._fallback) {
      recordEvent('analysis_fallback', {
        report_id: reportId,
        domain: domainFromUrl(url),
        email: customerEmail,
        reason: aiErrorInfo || 'ai_analysis_failed',
      });
    }

    // 返回结果
    const responseData = {
      success: true,
      score: analysisResult.score,
      product_name: analysisResult.product_name || productData.title,
      store_name: analysisResult.store_name || '',
      free_issues: analysisResult.free_issues || [],
      full_report: analysisResult.full_report || null,
      report_id: reportId,
      total_issues_count: analysisResult.full_report?.detailed_checks?.length || 0,
      _fallback: analysisResult._fallback || false,
      _source: productData._source || 'unknown',
    };
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
 * GET /api/analyze?report_id=xxx
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('report_id');

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

  return NextResponse.json({
    success: true,
    url: report.url,
    product_name: report.product_name,
    store_name: report.store_name || '',
    score: report.score,
    free_issues: report.free_issues || [],
    full_report: report.full_report || null,
    lang: report.lang || 'en',
    unlocked: report.unlocked,
  });
}
