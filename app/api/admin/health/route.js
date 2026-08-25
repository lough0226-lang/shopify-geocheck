// Health Check Endpoint - Monitoring for agent
// GET /api/admin/health
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * In-memory tracking of recent webhook failures.
 * Note: Vercel serverless is ephemeral - this only tracks
 * failures within the current function instance's lifetime.
 * For persistent monitoring, the daily agent check should
 * also verify Creem.io dashboard and Vercel logs.
 */
const recentFailures = [];
const MAX_FAILURES = 50;
const FAILURE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Record a webhook failure for monitoring
 */
export function recordWebhookFailure(type, details) {
  const now = Date.now();
  // Clean old entries
  while (recentFailures.length > 0 && now - recentFailures[0].timestamp > FAILURE_WINDOW_MS) {
    recentFailures.shift();
  }
  if (recentFailures.length >= MAX_FAILURES) {
    recentFailures.shift();
  }
  recentFailures.push({
    timestamp: now,
    time: new Date(now).toISOString(),
    type,
    ...details,
  });
}

/**
 * Get failure stats for the monitoring endpoint
 */
export function getFailureStats() {
  const now = Date.now();
  const recent = recentFailures.filter(f => now - f.timestamp < FAILURE_WINDOW_MS);
  const byType = {};
  for (const f of recent) {
    byType[f.type] = (byType[f.type] || 0) + 1;
  }
  return {
    total_24h: recent.length,
    by_type: byType,
    latest: recent.length > 0 ? recent[recent.length - 1] : null,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Simple auth - use HEALTH_TOKEN env var
  const expectedToken = process.env.HEALTH_TOKEN || 'mygeocheck-health-2026';
  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = getFailureStats();

  // Check if we're in the 80%+ budget warning zone
  // The analyze route records usage via recordApiCall()
  const usage = global._apiUsage || { calls: 0, estimated_cost: 0 };
  const budget = parseFloat(process.env.MONTHLY_API_BUDGET || '50');
  const budgetPercent = (usage.estimated_cost / budget) * 100;

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    site: 'mygeocheck.com',

    // API Budget tracking
    api_usage: {
      calls_this_period: usage.calls || 0,
      estimated_cost: `$${(usage.estimated_cost || 0).toFixed(2)}`,
      budget_limit: `$${budget.toFixed(2)}`,
      budget_used_percent: `${budgetPercent.toFixed(1)}%`,
      budget_warning: budgetPercent >= 80 ? 'WARNING: Budget usage above 80%!' : null,
      budget_critical: budgetPercent >= 95 ? 'CRITICAL: Budget nearly exhausted!' : null,
    },

    // Webhook / email delivery failures
    webhook_health: {
      failures_24h: stats.total_24h,
      failure_breakdown: stats.by_type,
      latest_failure: stats.latest,
      status: stats.total_24h === 0 ? 'healthy' : stats.total_24h <= 2 ? 'warnings' : 'degraded',
    },

    // Environment checks
    env_checks: {
      CREEM_API_KEY: !!process.env.CREEM_API_KEY,
      CREEM_WEBHOOK_SECRET: !!process.env.CREEM_WEBHOOK_SECRET,
      BREVO_API_KEY: !!process.env.BREVO_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      SCRAPERAPI_KEY: !!process.env.SCRAPERAPI_KEY,
      MONTHLY_API_BUDGET: process.env.MONTHLY_API_BUDGET || '$50 (default)',
    },

    // Action items for the agent
    alerts: [],
  };

  // Generate alerts
  if (budgetPercent >= 95) {
    health.alerts.push('CRITICAL: API budget nearly exhausted. Consider increasing MONTHLY_API_BUDGET or reducing usage.');
    health.status = 'critical';
  } else if (budgetPercent >= 80) {
    health.alerts.push('WARNING: API budget usage above 80%. Monitor closely.');
    health.status = 'warning';
  }

  if (stats.total_24h > 0) {
    health.alerts.push(`ATTENTION: ${stats.total_24h} webhook/email failure(s) in the last 24 hours. Check Vercel logs for details.`);
    if (health.status === 'ok') health.status = 'warning';
  }

  if (!process.env.SCRAPERAPI_KEY) {
    health.alerts.push('INFO: ScraperAPI not configured. Backup scraping strategy is inactive.');
  }

  if (!process.env.CREEM_API_KEY) {
    health.alerts.push('ACTION_NEEDED: Creem.io API key not configured. Payment processing is disabled.');
  }

  return NextResponse.json(health);
}
