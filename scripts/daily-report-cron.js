// 每日流量报告生成器 - 运行在 Zeabur 服务器上
// 每天北京时间 9:00 自动执行，拉取 GA 数据 + DB 数据，生成报告并通过 Brevo 邮件发送

const cron = require('node-cron');
const { Pool } = require('pg');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ========== 配置 ==========
const GA_KEY_JSON = process.env.GA_SERVICE_ACCOUNT_KEY; // Zeabur 环境变量，JSON 字符串
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const REPORT_EMAIL = 'lough0226@gmail.com'; // 发送到的邮箱
const REPORT_DIR = path.join(__dirname, 'reports');

// 确保报告目录存在
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

// ========== 数据库连接 ==========
function getDBPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10000,
  });
}

// ========== Google Analytics API ==========
function getAccessToken() {
  return new Promise((resolve, reject) => {
    const key = JSON.parse(GA_KEY_JSON);
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

    // 用 Node.js crypto 签名（不依赖 openssl 命令行）
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
          resolve(JSON.parse(body).access_token);
        } catch {
          reject(new Error(`Token parse failed: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function gaQuery(token, propertyId, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'analyticsdata.googleapis.com',
      path: `/v1beta/properties/${propertyId}:runReport`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error(`GA parse failed: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 列出 GA properties 获取 property ID
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
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error(`List parse failed: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ========== 数据库查询 ==========
async function getDBStats(pool) {
  const client = await pool.connect();
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // 总报告数
    const totalReports = await client.query('SELECT COUNT(*) FROM reports');
    const totalReportsCount = parseInt(totalReports.rows[0].count);

    // 昨天新增报告数
    const yesterdayReports = await client.query(
      "SELECT COUNT(*) FROM reports WHERE created_at >= $1 AND created_at < $2",
      [`${yesterday}T00:00:00Z`, `${today}T00:00:00Z`]
    );
    const yesterdayCount = parseInt(yesterdayReports.rows[0].count);

    // 付费订单总数
    const paidOrders = await client.query("SELECT COUNT(*) FROM orders WHERE status = 'paid'");
    const paidCount = parseInt(paidOrders.rows[0].count);

    // 昨天付费订单
    const yesterdayPaid = await client.query(
      "SELECT COUNT(*) FROM orders WHERE status = 'paid' AND created_at >= $1 AND created_at < $2",
      [`${yesterday}T00:00:00Z`, `${today}T00:00:00Z`]
    );
    const yesterdayPaidCount = parseInt(yesterdayPaid.rows[0].count);

    // 付费收入（总额）
    const totalRevenue = await client.query("SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'paid'");
    const totalRevenueAmount = parseFloat(totalRevenue.rows[0].sum || totalRevenue.rows[0].coalesce || 0);

    // 昨天收入
    const yesterdayRevenue = await client.query(
      "SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'paid' AND created_at >= $1 AND created_at < $2",
      [`${yesterday}T00:00:00Z`, `${today}T00:00:00Z`]
    );
    const yesterdayRevenueAmount = parseFloat(yesterdayRevenue.rows[0].sum || yesterdayRevenue.rows[0].coalesce || 0);

    // 总独立访客（不同邮箱数）
    const uniqueEmails = await client.query('SELECT COUNT(DISTINCT email) FROM reports WHERE email IS NOT NULL AND email != \'\'');
    const uniqueEmailCount = parseInt(uniqueEmails.rows[0].count);

    // 平均分数
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

// ========== 生成报告 ==========
function generateReport(gaData, dbStats) {
  const today = new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });

  // 解析 GA 数据
  const sessions = gaData?.rows?.[0]?.metricValues?.[0]?.value || '0';
  const pageviews = gaData?.rows?.[0]?.metricValues?.[1]?.value || '0';
  const users = gaData?.rows?.[0]?.metricValues?.[2]?.value || '0';
  const avgSessionDuration = gaData?.rows?.[0]?.metricValues?.[3]?.value || '0';
  const bounceRate = gaData?.rows?.[0]?.metricValues?.[4]?.value || '0';

  // 付费转化率
  const conversionRate = dbStats.yesterdayReports > 0
    ? ((dbStats.yesterdayPaid / dbStats.yesterdayReports) * 100).toFixed(1)
    : '0.0';

  // ARPU（每用户平均收入）
  const arpu = dbStats.uniqueEmails > 0
    ? (dbStats.totalRevenue / dbStats.uniqueEmails).toFixed(2)
    : '0.00';

  const report = `# MyGEOCheck 每日流量报告

**日期：** ${today}（数据截止 ${yesterday}）

---

## 一、网站流量概览（Google Analytics）

| 指标 | 昨日数据 |
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
  ? `昨日有 ${sessions} 次访问，${users} 个独立访客。`
  : '昨日暂无访问数据，网站可能刚上线或流量极低。'}

### 转化分析
${dbStats.yesterdayPaid > 0
  ? `昨日完成 ${dbStats.yesterdayPaid} 笔付费订单，收入 $${dbStats.yesterdayRevenue.toFixed(2)}。转化率 ${conversionRate}%。`
  : dbStats.yesterdayReports > 0
    ? `昨日有 ${dbStats.yesterdayReports} 份报告生成，但零付费转化。需要优化付费引导流程。`
    : '昨日无新用户生成报告。'}

### 潜在问题
${parseInt(sessions) === 0 ? '- 网站零流量，需要立即检查 SEO 和推广渠道' : ''}
${dbStats.yesterdayReports > 0 && dbStats.yesterdayPaid === 0 ? '- 有免费用户但未转化，检查付费引导是否清晰' : ''}
${dbStats.avgScore < 30 ? '- 用户检测分数普遍偏低，说明痛点真实，是好信号——但需要让用户看到"我们能解决"' : ''}

### 商机建议
${parseInt(users) > parseInt(dbStats.uniqueEmails) ? '- 大量访客未注册，加强"免费检测"CTA引导' : ''}
${dbStats.paidOrders > 0 ? '- 已有付费用户，考虑推出"老用户推荐"机制扩大用户群' : '- 尚无付费用户，优先验证产品价值，考虑给前10个用户免费升级'}

---

*报告由系统自动生成 | ${today}*`;

  return report;
}

// ========== 发送邮件 ==========
function sendReportEmail(reportMarkdown) {
  return new Promise((resolve, reject) => {
    if (!BREVO_API_KEY) {
      console.log('[CRON] Brevo API key not set, skipping email');
      resolve();
      return;
    }

    const htmlContent = reportMarkdown
      .replace(/\n/g, '<br>')
      .replace(/# (.+)/g, '<h1>$1</h1>')
      .replace(/## (.+)/g, '<h2>$1</h2>')
      .replace(/\| (.+?) \|/g, '<tr><td>$1</td></tr>')
      .replace(/---/g, '<hr>');

    const data = JSON.stringify({
      sender: { name: 'MyGEOCheck', email: 'hello@mygeocheck.com' },
      to: [{ email: REPORT_EMAIL }],
      subject: `MyGEOCheck 每日流量报告 - ${new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}`,
      htmlContent,
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve('Email sent');
        } else {
          reject(new Error(`Email failed: ${res.statusCode} ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ========== 保存报告文件 ==========
function saveReportFile(report) {
  const dateStr = new Date().toISOString().split('T')[0];
  const filePath = path.join(REPORT_DIR, `daily-report-${dateStr}.md`);
  fs.writeFileSync(filePath, report, 'utf-8');
  console.log(`[CRON] Report saved to ${filePath}`);
  return filePath;
}

// ========== 主流程 ==========
async function runDailyReport() {
  console.log(`[CRON] Starting daily report at ${new Date().toISOString()}`);

  try {
    // 1. 获取 GA token
    console.log('[CRON] Getting GA access token...');
    const token = await getAccessToken();
    console.log('[CRON] Token obtained');

    // 2. 获取 property ID
    const summaries = await listProperties(token);
    let propertyId = null;
    for (const acct of summaries.accountSummaries || []) {
      for (const ps of acct.propertySummaries || []) {
        if (ps.measurementId === 'G-30ZHNHCX4Q') {
          propertyId = ps.property.split('/').pop();
          break;
        }
      }
    }

    if (!propertyId) {
      // 如果没找到匹配的，用第一个
      const firstProp = summaries.accountSummaries?.[0]?.propertySummaries?.[0];
      if (firstProp) {
        propertyId = firstProp.property.split('/').pop();
        console.log(`[CRON] Using property ${propertyId} (${firstProp.displayName})`);
      } else {
        throw new Error('No GA properties found');
      }
    }

    // 3. 查询 GA 数据（最近7天汇总）
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

    // 4. 查询 DB 数据
    const pool = getDBPool();
    const dbStats = await getDBStats(pool);
    await pool.end();

    // 5. 生成报告
    const report = generateReport(gaResult, dbStats);

    // 6. 保存文件
    saveReportFile(report);

    // 7. 发送邮件
    await sendReportEmail(report);

    console.log('[CRON] Daily report completed successfully');
  } catch (err) {
    console.error('[CRON] Error:', err.message);
  }
}

// ========== 启动 ==========
console.log('[CRON] Daily report scheduler started');
console.log('[CRON] Schedule: Every day at 9:00 AM Beijing time (1:00 AM UTC)');

// 北京时间 9:00 = UTC 1:00
// node-cron 格式: 分 时 日 月 星期
cron.schedule('0 1 * * *', () => {
  console.log('[CRON] Triggered daily report job');
  runDailyReport();
}, {
  timezone: 'UTC',
});

// 启动时也跑一次（确保部署后能立即生成一份）
console.log('[CRON] Running initial report...');
runDailyReport();
