// 分析 API - 接收产品 URL，抓取页面内容，调用 AI 分析
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { scrapeProductPage, isValidShopifyUrl } from '../../../lib/scraper';
import { analyzeProduct } from '../../../lib/openai';

// 强制使用 Node.js 运行时（非 Edge Runtime）
export const runtime = 'nodejs';
// 禁止静态预渲染 - 必须动态运行
export const dynamic = 'force-dynamic';
// Vercel 函数最大执行时间（Pro 计划 60s，Hobby 计划 10s）
export const maxDuration = 60;

// 内存存储：暂存分析结果（用于付费后查看完整报告）
const reportStore = new Map();

// 月度 API 预算追踪
const apiUsageTracker = {
  currentMonth: new Date().toISOString().slice(0, 7),
  callCount: 0,
  estimatedCost: 0,
  COST_PER_CALL: 0.02,
};

function checkBudgetLimit() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  
  if (apiUsageTracker.currentMonth !== currentMonth) {
    apiUsageTracker.currentMonth = currentMonth;
    apiUsageTracker.callCount = 0;
    apiUsageTracker.estimatedCost = 0;
    console.log(`[Budget] Month reset: ${currentMonth}`);
  }
  
  const monthlyBudget = parseFloat(process.env.MONTHLY_API_BUDGET || '50');
  const warningThreshold = monthlyBudget * 0.8;
  
  if (apiUsageTracker.estimatedCost >= monthlyBudget) {
    return {
      allowed: false,
      reason: `Monthly API budget of $${monthlyBudget} exceeded. Current: $${apiUsageTracker.estimatedCost.toFixed(2)}`,
      usage: apiUsageTracker,
    };
  }
  
  if (apiUsageTracker.estimatedCost >= warningThreshold) {
    console.warn(`[Budget] WARNING: Approaching limit. $${apiUsageTracker.estimatedCost.toFixed(2)} / $${monthlyBudget}`);
  }
  
  return { allowed: true, usage: apiUsageTracker };
}

function recordApiCall() {
  apiUsageTracker.callCount++;
  apiUsageTracker.estimatedCost += apiUsageTracker.COST_PER_CALL;
  console.log(`[Budget] Call #${apiUsageTracker.callCount}, estimated cost: $${apiUsageTracker.estimatedCost.toFixed(2)}`);
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
    const { url, lang } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid URL' },
        { status: 400 }
      );
    }

    if (!isValidShopifyUrl(url)) {
      return NextResponse.json(
        { error: 'Please enter a valid Shopify product URL (must be a myshopify.com store or contain /products/ path)' },
        { status: 400 }
      );
    }

    // 抓取产品页面内容
    let productData;
    try {
      productData = await scrapeProductPage(url);
    } catch (scrapeError) {
      console.error('Scraping failed:', scrapeError.message);
      // 返回结构化错误信息，前端可展示用户友好的提示
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

    // 检查月度 API 预算
    const budgetCheck = checkBudgetLimit();
    if (!budgetCheck.allowed) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable due to high demand. Please try again next month.' },
        { status: 503 }
      );
    }

    // 调用 AI 分析（lib/openai.js 内部已有 3 次重试 + 指数退避）
    let analysisResult;
    let aiErrorInfo = null;
    try {
      analysisResult = await analyzeProduct(productData, url, lang || 'en');
      recordApiCall();
    } catch (aiError) {
      console.error('AI analysis failed after all retries:', aiError.message);
      aiErrorInfo = aiError.message;
      analysisResult = generateFallbackAnalysis(productData, url);
    }

    // 生成报告 ID 并存储
    const reportId = crypto.randomUUID();
    reportStore.set(reportId, {
      url,
      result: analysisResult,
      timestamp: Date.now(),
      product_name: analysisResult.product_name || productData.title,
      lang: lang || 'en',
    });

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
      responseData._api_usage = budgetCheck.usage;
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

  const report = reportStore.get(reportId);
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
    ...report.result,
  });
}

export { reportStore };
