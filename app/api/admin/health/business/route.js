// Business Health Check Endpoint
// GET /api/admin/health/business?token=xxx
// Performs payment reconciliation, subscription checks, refund/dispute monitoring
// Designed for Coze Agent scheduled execution

import { NextResponse } from 'next/server';
import fs from 'fs';
import { Pool } from 'pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ========== Helpers ==========
function envVal(name) {
  const v = process.env[name];
  if (v) return v;
  try {
    const blob = fs.readFileSync('/proc/self/environ', 'utf8');
    for (const entry of blob.split('\0')) {
      const idx = entry.indexOf('=');
      if (idx > 0 && entry.slice(0, idx) === name) return entry.slice(idx + 1);
    }
  } catch (e) { /* not linux */ }
  return '';
}

function verifyToken(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const expected = process.env.HEALTH_TOKEN || 'mygeocheck-hc-2026';
  return token === expected;
}

function getDBPool() {
  const connectionString = envVal('DATABASE_URL') || envVal('POSTGRES_CONNECTION_STRING') || envVal('DBURI');
  if (!connectionString) throw new Error('DATABASE_URL not configured');
  return new Pool({ connectionString, max: 5, idleTimeoutMillis: 10000 });
}

// ========== Creem API ==========
async function fetchCreemTransactions(apiKey) {
  const res = await fetch('https://api.creem.io/v1/transactions', {
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Creem transactions API failed: ${res.status} ${body}`);
  }
  return res.json();
}

async function fetchCreemSubscriptions(apiKey) {
  const res = await fetch('https://api.creem.io/v1/subscriptions/search', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Creem subscriptions API failed: ${res.status} ${body}`);
  }
  return res.json();
}

// ========== Database Queries ==========
async function getRecentOrders(pool, days = 7) {
  const client = await pool.connect();
  try {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const result = await client.query(
      `SELECT order_id, report_id, email, amount, currency, status, subscription_id, created_at
       FROM orders
       WHERE created_at >= $1
       ORDER BY created_at DESC`,
      [since]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

async function getUnlockedReportsWithoutContent(pool) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT report_id, email, domain, unlocked, created_at
       FROM reports
       WHERE unlocked = TRUE
         AND (full_report IS NULL OR full_report = 'null'::jsonb OR full_report = '{}'::jsonb)
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return result.rows;
  } finally {
    client.release();
  }
}

async function getPaidOrdersWithoutUnlock(pool, days = 7) {
  const client = await pool.connect();
  try {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const result = await client.query(
      `SELECT o.order_id, o.report_id, o.email, o.amount, o.created_at
       FROM orders o
       LEFT JOIN reports r ON o.report_id = r.report_id
       WHERE o.status = 'paid'
         AND o.created_at >= $1
         AND (r.unlocked = FALSE OR r.unlocked IS NULL)
       ORDER BY o.created_at DESC`,
      [since]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// ========== Reconciliation Logic ==========
function reconcilePayments(creemTransactions, dbOrders) {
  const issues = [];

  // Build lookup sets
  const dbOrderIds = new Set(dbOrders.map(o => o.order_id));
  const creemTransactionIds = new Set();

  // Normalize Creem transactions
  const creemPayments = (creemTransactions || []).filter(t => {
    const status = (t.status || '').toLowerCase();
    return status === 'completed' || status === 'succeeded' || status === 'paid' || !t.status;
  });

  for (const txn of creemPayments) {
    const txnId = txn.id || txn.transaction_id || txn.order_id;
    if (txnId) creemTransactionIds.add(txnId);

    // Check: Creem has payment but DB doesn't have this order
    if (txnId && !dbOrderIds.has(txnId)) {
      issues.push({
        type: 'missing_db_record',
        severity: 'high',
        creem_transaction_id: txnId,
        customer_email: txn.customer_email || txn.customer?.email || 'unknown',
        amount: txn.amount || txn.total_amount,
        currency: txn.currency || 'USD',
        creem_status: txn.status,
        description: 'Creem has payment but no matching order in database',
      });
    }
  }

  return issues;
}

function checkSubscriptionAlerts(subscriptionsData) {
  const alerts = [];
  const subscriptions = subscriptionsData?.subscriptions || subscriptionsData?.data || subscriptionsData || [];

  if (!Array.isArray(subscriptions)) return alerts;

  for (const sub of subscriptions) {
    const status = (sub.status || '').toLowerCase();
    if (status === 'past_due') {
      alerts.push({
        type: 'subscription_past_due',
        severity: 'medium',
        subscription_id: sub.id || sub.subscription_id,
        customer_email: sub.customer_email || sub.customer?.email || 'unknown',
        plan: sub.plan_name || sub.plan || 'unknown',
        current_period_end: sub.current_period_end,
        description: 'Subscription is past due — payment may have failed',
      });
    }
  }

  return alerts;
}

function checkRefundsAndDisputes(creemTransactions) {
  const issues = [];
  if (!Array.isArray(creemTransactions)) return issues;

  for (const txn of creemTransactions) {
    const status = (txn.status || '').toLowerCase();
    const txnType = (txn.type || txn.event_type || '').toLowerCase();

    if (status === 'refunded' || txnType.includes('refund')) {
      issues.push({
        type: 'refund',
        severity: 'high',
        transaction_id: txn.id || txn.transaction_id,
        customer_email: txn.customer_email || txn.customer?.email || 'unknown',
        amount: txn.amount || txn.refund_amount || txn.total_amount,
        currency: txn.currency || 'USD',
        reason: txn.refund_reason || txn.reason || 'not specified',
        created_at: txn.created_at || txn.created,
        description: 'Refund detected',
      });
    }

    if (status === 'disputed' || status === 'chargeback' || txnType.includes('dispute')) {
      issues.push({
        type: 'dispute',
        severity: 'critical',
        transaction_id: txn.id || txn.transaction_id,
        customer_email: txn.customer_email || txn.customer?.email || 'unknown',
        amount: txn.amount || txn.dispute_amount || txn.total_amount,
        currency: txn.currency || 'USD',
        reason: txn.dispute_reason || txn.reason || 'not specified',
        created_at: txn.created_at || txn.created,
        description: 'Dispute/chargeback detected — immediate attention required',
      });
    }
  }

  return issues;
}

// ========== Main Handler ==========
export async function GET(request) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const creemApiKey = envVal('CREEM_API_KEY');
  const results = {
    reconciliation_issues: [],
    subscription_alerts: [],
    refund_disputes: [],
    summary: {},
  };

  let pool;
  try {
    // === Creem API calls (parallel) ===
    let creemTransactions = [];
    let creemSubscriptions = [];

    if (creemApiKey) {
      const [txnResult, subResult] = await Promise.allSettled([
        fetchCreemTransactions(creemApiKey),
        fetchCreemSubscriptions(creemApiKey),
      ]);

      if (txnResult.status === 'fulfilled') {
        creemTransactions = txnResult.value?.transactions || txnResult.value?.data || txnResult.value || [];
      } else {
        console.error('[BusinessHealth] Creem transactions fetch failed:', txnResult.reason?.message);
        results.reconciliation_issues.push({
          type: 'api_error',
          severity: 'medium',
          description: `Creem transactions API failed: ${txnResult.reason?.message}`,
        });
      }

      if (subResult.status === 'fulfilled') {
        creemSubscriptions = subResult.value;
      } else {
        console.error('[BusinessHealth] Creem subscriptions fetch failed:', subResult.reason?.message);
        results.subscription_alerts.push({
          type: 'api_error',
          severity: 'medium',
          description: `Creem subscriptions API failed: ${subResult.reason?.message}`,
        });
      }
    } else {
      console.warn('[BusinessHealth] CREEM_API_KEY not set, skipping Creem checks');
    }

    // === DB queries (parallel) ===
    pool = getDBPool();
    const [recentOrders, unlockedNoContent, paidNotUnlocked] = await Promise.all([
      getRecentOrders(pool),
      getUnlockedReportsWithoutContent(pool),
      getPaidOrdersWithoutUnlock(pool),
    ]);

    // === Reconciliation ===
    const paymentIssues = reconcilePayments(creemTransactions, recentOrders);
    results.reconciliation_issues.push(...paymentIssues);

    // Check: DB has paid orders but reports not unlocked
    for (const order of paidNotUnlocked) {
      results.reconciliation_issues.push({
        type: 'report_not_unlocked',
        severity: 'high',
        order_id: order.order_id,
        report_id: order.report_id,
        customer_email: order.email,
        amount: order.amount,
        description: 'Order is paid but report is not unlocked',
      });
    }

    // Check: Reports unlocked but no full_report content
    for (const report of unlockedNoContent) {
      results.reconciliation_issues.push({
        type: 'empty_full_report',
        severity: 'medium',
        report_id: report.report_id,
        customer_email: report.email,
        domain: report.domain,
        description: 'Report is unlocked but full_report content is empty/missing',
      });
    }

    // === Subscription alerts ===
    results.subscription_alerts.push(...checkSubscriptionAlerts(creemSubscriptions));

    // === Refunds & disputes ===
    results.refund_disputes.push(...checkRefundsAndDisputes(creemTransactions));

    // === Summary ===
    const totalIssues = results.reconciliation_issues.length +
      results.subscription_alerts.length +
      results.refund_disputes.length;

    results.summary = {
      timestamp: new Date().toISOString(),
      elapsed_ms: Date.now() - startTime,
      creem_transactions_checked: Array.isArray(creemTransactions) ? creemTransactions.length : 0,
      db_orders_7d: recentOrders.length,
      total_issues: totalIssues,
      critical_issues: [...results.reconciliation_issues, ...results.subscription_alerts, ...results.refund_disputes]
        .filter(i => i.severity === 'critical').length,
      high_issues: [...results.reconciliation_issues, ...results.subscription_alerts, ...results.refund_disputes]
        .filter(i => i.severity === 'high').length,
      status: totalIssues === 0 ? 'healthy' : totalIssues <= 2 ? 'warning' : 'needs_attention',
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('[BusinessHealth] Error:', error.message);
    return NextResponse.json(
      { ...results, error: error.message, summary: { ...results.summary, status: 'error' } },
      { status: 500 }
    );
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}
