// Daily Report API Endpoint
// GET /api/admin/reports/daily?token=xxx
// Generates daily report: GA data + DB stats → Markdown → Email via Brevo
// Replaces unreliable node-cron scheduling; designed for Coze Agent external trigger

import { NextResponse } from 'next/server';
import https from 'https';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ========== Configuration ==========
const GA_PROPERTY_ID = 'G-30ZHNHCX4Q';
const REPORT_EMAIL = 'lough0226@gmail.com';
const REPORT_DIR = path.join(process.cwd(), 'scripts', 'reports');

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

// ========== Google Analytics ==========
function getGAKeyJSON() {
  const b64 = envVal('GAKEY');
  if (!b64) throw new Error('GAKEY environment variable not set');
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
}

function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const key = getGAKeyJSON();
    const now = Math.floor(Date.now() / 1000);
    const header = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
    const claim = JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: key.token_uri,
      exp: now + 3600,
      iat: now,
    });

    const h64 = base64url(header);
    const c64 = base64url(claim);
    const signInput = `${h64}.${c64}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signInput);
    const sig = signer.sign(key.private_key, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwt = `${h64}.${c64}.${sig}`;

    const data = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${encodeURIComponent(jwt)}`;
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error(`Token parse failed: ${body}`));
        } catch { reject(new Error(`Token parse failed: ${body}`)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function gaQuery(token, propertyId, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'analyticsdata.googleapis.com',
      path: `/v1beta/properties/${propertyId}:runReport`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error(`GA parse failed: ${body}`)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function listProperties(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'analyticsadmin.googleapis.com',
      path: '/v1beta/accountSummaries',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error(`List parse failed: ${body}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ========== Database Stats ==========
async function getDBStats(pool) {
  const client = await pool.connect();
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const totalReports = await client.query('SELECT COUNT(*) FROM reports');
    const totalReportsCount = parseInt(totalReports.rows[0].count);

    const yesterdayReports = await client.query(
      "SELECT COUNT(*) FROM reports WHERE created_at >= $1 AND created_at < $2",
      [`${yesterday}T00:00:00Z`, `${today}T00:00:00Z`]
    );
    const yesterdayCount = parseInt(yesterdayReports.rows[0].count);

    const paidOrders = await client.query("SELECT COUNT(*) FROM orders WHERE status = 'paid'");
    const paidCount = parseInt(paidOrders.rows[0].count);

    const yesterdayPaid = await client.query(
      "SELECT COUNT(*) FROM orders WHERE status = 'paid' AND created_at >= $1 AND created_at < $2",
      [`${yesterday}T00:00:00Z`, `${today}T00:00:00Z`]
    );
    const yesterdayPaidCount = parseInt(yesterdayPaid.rows[0].count);

    const totalRevenue = await client.query("SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'paid'");
    const totalRevenueAmount = parseFloat(totalRevenue.rows[0].sum || totalRevenue.rows[0].coalesce || 0);

    const yesterdayRevenue = await client.query(
      "SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'paid' AND created_at >= $1 AND created_at < $2",
      [`${yesterday}T00:00:00Z`, `${today}T00:00:00Z`]
    );
    const yesterdayRevenueAmount = parseFloat(yesterdayRevenue.rows[0].sum || yesterdayRevenue.rows[0].coalesce || 0);

    const uniqueEmails = await client.query("SELECT COUNT(DISTINCT email) FROM reports WHERE email IS NOT NULL AND email != ''");
    const uniqueEmailCount = parseInt(uniqueEmails.rows[0].count);

    const avgScore = await client.query('SELECT AVG(score) FROM reports WHERE score IS NOT NULL');
    const avgScoreVal = parseFloat(avgScore.rows[0].avg || 0).toFixed(1);

    return {
      totalReports: totalReportsCount,
      yesterdayReports: yesterdayCount,
      paidOrders: paidCount,
      yesterdayPaid: yesterdayPaidCount,
      totalRevenue: totalRevenueAmount,
      yesterdayRevenue: yesterdayRevenueAmount,
      uniqueEmails: uniqueEmailCount,
      avgScore: avgScoreVal,
    };
  } finally {
    client.release();
  }
}

// ========== Report Generation ==========
function generateReport(gaData, dbStats) {
  const today = new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const sessions = gaData?.rows?.[0]?.metricValues?.[0]?.value || '0';
  const pageviews = gaData?.rows?.[0]?.metricValues?.[1]?.value || '0';
  const users = gaData?.rows?.[0]?.metricValues?.[2]?.value || '0';

  const conversionRate = dbStats.yesterdayReports > 0
    ? ((dbStats.yesterdayPaid / dbStats.yesterdayReports) * 100).toFixed(1)
    : '0.0';

  const arpu = dbStats.uniqueEmails > 0
    ? (dbStats.totalRevenue / dbStats.uniqueEmails).toFixed(2)
    : '0.00';

  return `# MyGEOCheck 每日流量报告

**日期：** ${today}（数据截止 ${yesterday}）

---

## 一、网站流量概览（Google Analytics）

| 指标 | 近7日汇总 |
|------|---------|
| 总会话数 | ${sessions} |
| 页面浏览量 | ${pageviews} |
| 活跃用户数 | ${users} |

---

## 二、用户与收入数据（数据库）

| 指标 | 数值 |
|------|------|
| 总报告数 | ${dbStats.totalReports} |
| 昨日新增报告 | ${dbStats.yesterdayReports} |
| 总付费订单 | ${dbStats.paidOrders} |
| 昨日付费订单 | ${dbStats.yesterdayPaid} |
| 总收入 | $${dbStats.totalRevenue.toFixed(2)} |
| 昨日收入 | $${dbStats.yesterdayRevenue.toFixed(2)} |
| 独立用户数 | ${dbStats.uniqueEmails} |
| 平均检测分 | ${dbStats.avgScore} |
| 付费转化率 | ${conversionRate}% |
| 每用户平均收入 | $${arpu} |

---

## 三、数据分析与洞察

### 流量分析
${parseInt(sessions) > 0
  ? `近7日有 ${sessions} 次访问，${users} 个独立访客。`
  : '近7日暂无访问数据，网站可能刚上线或流量极低。'}

### 转化分析
${dbStats.yesterdayPaid > 0
  ? `昨日完成 ${dbStats.yesterdayPaid} 笔付费订单，收入 $${dbStats.yesterdayRevenue.toFixed(2)}。转化率 ${conversionRate}%。`
  : dbStats.yesterdayReports > 0
    ? `昨日有 ${dbStats.yesterdayReports} 份报告生成，但零付费转化。需要优化付费引导流程。`
    : '昨日无新用户生成报告。'}

### 潜在问题
${parseInt(sessions) === 0 ? '- 网站零流量，需要立即检查 SEO 和推广渠道' : ''}
${dbStats.yesterdayReports > 0 && dbStats.yesterdayPaid === 0 ? '- 有免费用户但未转化，检查付费引导是否清晰' : ''}
${parseFloat(dbStats.avgScore) < 30 ? '- 用户检测分数普遍偏低，说明痛点真实，是好信号' : ''}

---

*报告由系统自动生成 | ${today}*`;
}

// ========== Email via Brevo ==========
async function sendReportEmail(reportMarkdown) {
  const apiKey = envVal('BREVO_API_KEY');
  if (!apiKey) {
    console.log('[DailyReport] Brevo API key not set, skipping email');
    return;
  }

  const htmlContent = reportMarkdown
    .replace(/\n/g, '<br>')
    .replace(/# (.+)/g, '<h1>$1</h1>')
    .replace(/## (.+)/g, '<h2>$1</h2>')
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/---/g, '<hr>');

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { name: 'MyGEOCheck', email: 'hello@mygeocheck.com' },
      to: [{ email: REPORT_EMAIL }],
      subject: `MyGEOCheck 每日流量报告 - ${new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}`,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Brevo email failed: ${res.status} ${errBody}`);
  }
  console.log('[DailyReport] Email sent to', REPORT_EMAIL);
}

// ========== Save Report File ==========
function saveReportFile(report) {
  try {
    if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  } catch (e) {
    console.warn('[DailyReport] Could not create reports dir:', e.message);
  }
  const dateStr = new Date().toISOString().split('T')[0];
  const filePath = path.join(REPORT_DIR, `daily-report-${dateStr}.md`);
  try {
    fs.writeFileSync(filePath, report, 'utf-8');
    console.log('[DailyReport] Report saved to', filePath);
  } catch (e) {
    console.warn('[DailyReport] Could not save report file:', e.message);
  }
  return filePath;
}

// ========== Main Handler ==========
export async function GET(request) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  console.log('[DailyReport] Starting daily report generation...');

  let pool;
  try {
    // 1. Get GA access token
    console.log('[DailyReport] Getting GA access token...');
    const token = await getAccessToken();
    console.log('[DailyReport] GA token obtained');

    // 2. Resolve property ID
    const summaries = await listProperties(token);
    let propertyId = null;
    for (const acct of summaries.accountSummaries || []) {
      for (const ps of acct.propertySummaries || []) {
        if (ps.measurementId === GA_PROPERTY_ID) {
          propertyId = ps.property.split('/').pop();
          break;
        }
      }
      if (propertyId) break;
    }
    if (!propertyId) {
      const firstProp = summaries.accountSummaries?.[0]?.propertySummaries?.[0];
      if (firstProp) {
        propertyId = firstProp.property.split('/').pop();
        console.log(`[DailyReport] Using fallback property ${propertyId}`);
      } else {
        throw new Error('No GA properties found');
      }
    }

    // 3. Query GA data (7-day summary)
    const gaResult = await gaQuery(token, propertyId, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
      metrics: [
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    // 4. Query DB stats
    pool = getDBPool();
    const dbStats = await getDBStats(pool);

    // 5. Generate report
    const report = generateReport(gaResult, dbStats);

    // 6. Save report file
    const reportPath = saveReportFile(report);

    // 7. Send email
    await sendReportEmail(report);

    const elapsed = Date.now() - startTime;
    console.log(`[DailyReport] Completed in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      elapsed_ms: elapsed,
      report_file: reportPath,
      summary: {
        ga_sessions: gaResult?.rows?.[0]?.metricValues?.[0]?.value || 'N/A',
        ga_pageviews: gaResult?.rows?.[0]?.metricValues?.[1]?.value || 'N/A',
        ga_users: gaResult?.rows?.[0]?.metricValues?.[2]?.value || 'N/A',
        db_total_reports: dbStats.totalReports,
        db_yesterday_reports: dbStats.yesterdayReports,
        db_paid_orders: dbStats.paidOrders,
        db_yesterday_paid: dbStats.yesterdayPaid,
        db_total_revenue: dbStats.totalRevenue,
        db_yesterday_revenue: dbStats.yesterdayRevenue,
        db_unique_users: dbStats.uniqueEmails,
        db_avg_score: dbStats.avgScore,
      },
    });
  } catch (error) {
    console.error('[DailyReport] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}
