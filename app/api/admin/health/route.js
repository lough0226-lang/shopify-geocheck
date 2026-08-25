// Health Check + Queue Processing Endpoint
// GET  /api/admin/health?token=xxx  → Health status
// POST /api/admin/health?token=xxx  → Process delivery queue (retry failed emails)
import { NextResponse } from 'next/server';
import {
  processDeliveryQueue,
  getQueueStats,
  retryQueuedDelivery,
  sendFallbackEmail,
} from '../../webhook/route.js';

import { recordWebhookFailure, getFailureStats } from '../../../lib/health-monitor.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifyToken(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const expected = process.env.HEALTH_TOKEN || 'mygeocheck-hc-2026';
  return token === expected;
}

/**
 * GET - Health check (for agent monitoring)
 */
export async function GET(request) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = getFailureStats();
  const queueStats = getQueueStats();
  const usage = global._apiUsage || { calls: 0, estimated_cost: 0 };
  const budget = parseFloat(process.env.MONTHLY_API_BUDGET || '50');
  const budgetPercent = (usage.estimated_cost / budget) * 100;

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    site: 'mygeocheck.com',
    api_usage: {
      calls: usage.calls || 0,
      cost: `$${(usage.estimated_cost || 0).toFixed(2)}`,
      budget: `$${budget.toFixed(2)}`,
      percent: `${budgetPercent.toFixed(1)}%`,
      warning: budgetPercent >= 80 ? 'WARNING' : null,
      critical: budgetPercent >= 95 ? 'CRITICAL' : null,
    },
    webhook_health: {
      failures_24h: stats.total_24h,
      by_type: stats.by_type,
      latest_failure: stats.latest,
    },
    delivery_queue: {
      pending: queueStats.pending,
      items: queueStats.items,
    },
    env: {
      CREEM_API_KEY: !!process.env.CREEM_API_KEY,
      CREEM_WEBHOOK_SECRET: !!process.env.CREEM_WEBHOOK_SECRET,
      BREVO_API_KEY: !!process.env.BREVO_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      SCRAPERAPI_KEY: !!process.env.SCRAPERAPI_KEY,
    },
    alerts: [],
  };

  if (budgetPercent >= 95) { health.alerts.push('CRITICAL: API budget nearly exhausted'); health.status = 'critical'; }
  else if (budgetPercent >= 80) { health.alerts.push('WARNING: API budget above 80%'); if (health.status === 'ok') health.status = 'warning'; }
  if (stats.total_24h > 0) { health.alerts.push(`ATTENTION: ${stats.total_24h} failure(s) in 24h`); if (health.status === 'ok') health.status = 'warning'; }
  if (queueStats.pending > 0) { health.alerts.push(`QUEUE: ${queueStats.pending} delivery(ies) pending retry`); }
  if (!process.env.SCRAPERAPI_KEY) { health.alerts.push('INFO: ScraperAPI not configured'); }
  if (!process.env.CREEM_API_KEY) { health.alerts.push('ACTION: Creem.io not configured'); }

  return NextResponse.json(health);
}

/**
 * POST - Process delivery queue (retry failed emails + send fallbacks)
 * Called by agent monitoring script every 30 minutes
 */
export async function POST(request) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = processDeliveryQueue();
  const results = { retried: 0, succeeded: 0, fallback_sent: 0, failed: 0 };

  for (const item of items) {
    if (item.action === 'fallback') {
      // 24h expired - send simplified fallback
      const sent = await sendFallbackEmail(item.reportId, item.email);
      if (sent) {
        results.fallback_sent++;
        console.log('Fallback email sent:', item.reportId, item.email);
      } else {
        results.failed++;
        console.error('Even fallback email failed:', item.reportId, item.email);
      }
    } else {
      // Retry full delivery
      results.retried++;
      const success = await retryQueuedDelivery(item);
      if (success) results.succeeded++;
      else results.failed++;
    }
  }

  return NextResponse.json({
    processed: items.length,
    results,
    remaining_queue: getQueueStats().pending,
    timestamp: new Date().toISOString(),
  });
}
