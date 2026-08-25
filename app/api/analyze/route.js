// 分析 API - 接收产品 URL，抓取页面内容，调用 AI 分析
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { scrapeProductPage, isValidShopifyUrl } from '../../../lib/scraper';
import { analyzeProduct } from '../../../lib/openai';

// 强制使用 Node.js 运行时（非 Edge Runtime）
export const runtime = 'nodejs';
// 禁止静态预渲染 - 必须动态运行
export const dynamic = 'force-dynamic';

// 内存存储：暂存分析结果（用于付费后查看完整报告）
const reportStore = new Map();

// 月度 API 预算追踪（内存计数，Vercel 无状态但可跨请求累计）
// 注意：Vercel 无服务器环境下内存不会跨实例持久化，此为尽力而为的保护
const apiUsageTracker = {
  currentMonth: new Date().toISOString().slice(0, 7), // "2026-08"
  callCount: 0,
  estimatedCost: 0, // 单位：美元
  // 每次 GPT-4o-mini 级别调用成本约 $0.01-0.03，按 $0.02 估算
  COST_PER_CALL: 0.02,
};

function checkBudgetLimit() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  
  // 月初重置计数器
  if (apiUsageTracker.currentMonth !== currentMonth) {
    apiUsageTracker.currentMonth = currentMonth;
    apiUsageTracker.callCount = 0;
    apiUsageTracker.estimatedCost = 0;
    console.log(`[Budget] Month reset: ${currentMonth}`);
  }
  
  const monthlyBudget = parseFloat(process.env.MONTHLY_API_BUDGET || '50'); // 默认 $50/月
  const warningThreshold = monthlyBudget * 0.8; // 80% 时预警
  
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
 * 生成降级结果（AI 分析失败时使用）
 */
function generateFallbackAnalysis(productData, url) {
  return {
    score: 50,
    product_name: productData?.title || 'Product',
    store_name: '',
    free_issues: [
      {
        category: 'Structure',
        severity: 'medium',
        issue: 'AI analysis was interrupted. Re-run for detailed insights.',
        impact: 'Full evaluation not available.',
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
 * Response: { score, product_name, free_issues, report_id }
 */
export async function POST(request) {
  try {
    const { url } = await request.json();

    // 1. 验证 URL 格式
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid URL' },
        { status: 400 }
      );
    }

    // 2. 验证是否为 Shopify 产品页面
    if (!isValidShopifyUrl(url)) {
      return NextResponse.json(
        { error: 'Please enter a valid Shopify product URL (must be a myshopify.com store or contain /products/ path)' },
        { status: 400 }
      );
    }

    // 3. 抓取产品页面内容
    let productData;
    try {
      productData = await scrapeProductPage(url);
    } catch (scrapeError) {
      console.error('Scraping failed:', scrapeError.message);
      return NextResponse.json(
        { error: 'Could not access the product page.', debug: scrapeError.message },
        { status: 422 }
      );
    }

    // 3.5 检查月度 API 预算
    const budgetCheck = checkBudgetLimit();
    if (!budgetCheck.allowed) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable due to high demand. Please try again next month.' },
        { status: 503 }
      );
    }

    // 4. 调用 AI 分析（带降级）
    let analysisResult;
    let aiErrorInfo = null;
    try {
      analysisResult = await analyzeProduct(productData, url);
      // AI 分析成功，记录调用
      recordApiCall();
    } catch (aiError) {
      console.error('AI analysis failed, using fallback:', aiError.message);
      aiErrorInfo = aiError.message;
      analysisResult = generateFallbackAnalysis(productData, url);
    }

    // 5. 生成报告 ID 并存储完整结果
    const reportId = crypto.randomUUID();

    reportStore.set(reportId, {
      url,
      result: analysisResult,
      timestamp: Date.now(),
      product_name: analysisResult.product_name || productData.title,
    });

    // 6. 返回结果（包含完整报告数据，供前端 localStorage 存储）
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
    console.error('Error stack:', error.stack);

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
 * 用于付费后获取完整报告
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

// 导出 reportStore 供其他模块使用
export { reportStore };
