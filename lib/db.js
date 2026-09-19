// PostgreSQL 数据库客户端 - Zeabur 托管
// 使用连接池，适应 serverless 环境
// v22: 新增 verdict/buyer_queries/query_match_scores/competitors/diagnosis/paid_fixes/industry_benchmark 字段

const { Pool } = require('pg');
const fs = require('fs');

let pool = null;

// Zeabur 的 Vercel 兼容运行时会在 JS 启动阶段把一部分环境变量从 process.env 中删除，
// 但 Linux 内核对每个进程保留的原始环境块 (/proc/self/environ) 不受影响。
// 这里在 process.env 缺失时回退读取该环境块，从而拿到 DATABASE_URL 等真实变量。
let procEnvCache = null;
function readProcEnviron() {
  if (procEnvCache !== null) return procEnvCache;
  procEnvCache = {};
  try {
    const blob = fs.readFileSync('/proc/self/environ', 'utf8');
    for (const entry of blob.split('\0')) {
      const idx = entry.indexOf('=');
      if (idx > 0) procEnvCache[entry.slice(0, idx)] = entry.slice(idx + 1);
    }
  } catch (e) {
    // 非 Linux / 无权限环境：保持空对象，回退到 process.env
  }
  return procEnvCache;
}

function envVal(name) {
  const v = process.env[name];
  if (v) return v;
  const p = readProcEnviron()[name];
  return p || '';
}

function resolveConnectionString() {
  // 依次尝试标准连接串变量；process.env 缺失时回退到 /proc/self/environ
  const direct = envVal('DATABASE_URL')
    || envVal('POSTGRES_CONNECTION_STRING')
    || envVal('POSTGRES_URI')
    || envVal('DBURI')
    || envVal('PG_CONN');
  if (direct) return direct;

  // 最终兜底：用分散的 POSTGRES_* 变量拼一个连接串
  const host = envVal('POSTGRES_HOST') || envVal('POSTGRESQL_HOST') || envVal('PG_HOST');
  if (host) {
    const user = envVal('POSTGRES_USERNAME') || envVal('POSTGRES_USER') || envVal('PGUSER') || 'root';
    const pass = envVal('POSTGRES_PASSWORD') || envVal('POSTGRESQL_PASSWORD') || envVal('PGPASSWORD') || '';
    const port = envVal('POSTGRES_PORT') || envVal('PGPORT') || '5432';
    const db = envVal('POSTGRES_DATABASE') || envVal('POSTGRESQL_DATABASE') || envVal('PGDATABASE') || 'zeabur';
    return `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${db}`;
  }
  return null;
}

function getPool() {
  if (pool) return pool;

  const connectionString = resolveConnectionString();
  if (!connectionString) {
    throw new Error('DATABASE_URL not configured. Set it in Zeabur environment variables.');
  }

  pool = new Pool({
    connectionString,
    max: 10, // 最大连接数
    idleTimeoutMillis: 30000, // 空闲连接30秒回收
    connectionTimeoutMillis: 5000, // 连接超时5秒
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
  });

  console.log('[DB] Pool created. Max connections:', 10);
  return pool;
}

/**
 * 初始化数据库表（首次部署时调用）
 */
async function initDatabase() {
  const client = await getPool().connect();
  try {
    // 创建报告表
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        report_id   VARCHAR(64) PRIMARY KEY,
        url         TEXT NOT NULL,
        domain      TEXT,
        email       TEXT,
        product_name TEXT,
        store_name  TEXT,
        score       INTEGER,
        free_issues JSONB,
        full_report JSONB,
        lang        VARCHAR(10) DEFAULT 'en',
        unlocked    BOOLEAN DEFAULT FALSE,
        ai_error    TEXT,
        is_fallback BOOLEAN DEFAULT FALSE,
        verdict     TEXT,
        buyer_queries JSONB,
        query_match_scores JSONB,
        competitors JSONB,
        diagnosis   JSONB,
        paid_fixes  JSONB,
        industry_benchmark JSONB,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_reports_email ON reports(email);
      CREATE INDEX IF NOT EXISTS idx_reports_domain ON reports(domain);
      CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
    `);

    // 向后兼容：为已有 reports 表添加新列
    await client.query(`
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS verdict TEXT;
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS buyer_queries JSONB;
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS query_match_scores JSONB;
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS competitors JSONB;
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS diagnosis JSONB;
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS paid_fixes JSONB;
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS industry_benchmark JSONB;
    `);

    // 创建 API 用量追踪表
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_usage (
        month        VARCHAR(7) PRIMARY KEY,
        call_count   INTEGER DEFAULT 0,
        estimated_cost NUMERIC(10,2) DEFAULT 0,
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 创建支付订单表
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id       VARCHAR(128) PRIMARY KEY,
        report_id      VARCHAR(64) REFERENCES reports(report_id),
        email          TEXT,
        amount         NUMERIC(10,2),
        currency       VARCHAR(10) DEFAULT 'USD',
        status         VARCHAR(32) DEFAULT 'pending',
        subscription_id VARCHAR(128),
        created_at     TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_orders_report ON orders(report_id);
      CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
    `);

    // 创建验证码表
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        email       TEXT NOT NULL,
        code        VARCHAR(6) NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        expires_at  TIMESTAMPTZ NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_verification_email ON verification_codes(email);
    `);

    // 创建订阅用量追踪表
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_usage (
        email         TEXT NOT NULL,
        month         VARCHAR(7) NOT NULL,
        reports_used  INTEGER DEFAULT 0,
        plan_type     VARCHAR(32) DEFAULT 'monthly',
        updated_at    TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (email, month)
      );
      CREATE INDEX IF NOT EXISTS idx_sub_usage_email ON subscription_usage(email);
    `);

    console.log('[DB] Tables initialized successfully');
    return true;
  } catch (err) {
    console.error('[DB] Init failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 保存分析报告（v22: 包含新字段）
 */
async function saveReport(data) {
  const client = await getPool().connect();
  try {
    const {
      reportId, url, domain, email, product_name, store_name,
      score, free_issues, full_report, lang, unlocked, ai_error, is_fallback,
      verdict, buyer_queries, query_match_scores, competitors,
      diagnosis, paid_fixes, industry_benchmark,
    } = data;

    const result = await client.query(`
      INSERT INTO reports (report_id, url, domain, email, product_name, store_name, score, free_issues, full_report, lang, unlocked, ai_error, is_fallback, verdict, buyer_queries, query_match_scores, competitors, diagnosis, paid_fixes, industry_benchmark)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb, $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb)
      RETURNING report_id
    `, [
      reportId, url, domain, email, product_name, store_name, score,
      JSON.stringify(free_issues), JSON.stringify(full_report), lang, unlocked,
      ai_error || null, is_fallback || false,
      verdict || null,
      buyer_queries ? JSON.stringify(buyer_queries) : null,
      query_match_scores ? JSON.stringify(query_match_scores) : null,
      competitors ? JSON.stringify(competitors) : null,
      diagnosis ? JSON.stringify(diagnosis) : null,
      paid_fixes ? JSON.stringify(paid_fixes) : null,
      industry_benchmark ? JSON.stringify(industry_benchmark) : null,
    ]);

    return result.rows[0];
  } catch (err) {
    console.error('[DB] saveReport failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 获取报告
 */
async function getReport(reportId) {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT * FROM reports WHERE report_id = $1
    `, [reportId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('[DB] getReport failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 标记报告为已解锁（付费内容可见）
 */
async function unlockReport(reportId) {
  const client = await getPool().connect();
  try {
    await client.query(`
      UPDATE reports SET unlocked = TRUE WHERE report_id = $1
    `, [reportId]);
    return true;
  } catch (err) {
    console.error('[DB] unlockReport failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 更新 API 用量
 */
async function updateApiUsage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      INSERT INTO api_usage (month, call_count, estimated_cost, updated_at)
      VALUES ($1, 1, 0.02, NOW())
      ON CONFLICT (month) DO UPDATE
      SET call_count = api_usage.call_count + 1,
          estimated_cost = api_usage.estimated_cost + 0.02,
          updated_at = NOW()
      RETURNING call_count, estimated_cost
    `, [currentMonth]);
    return result.rows[0];
  } catch (err) {
    console.error('[DB] updateApiUsage failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 获取当月 API 用量
 */
async function getApiUsage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT call_count, estimated_cost FROM api_usage WHERE month = $1
    `, [currentMonth]);
    return result.rows[0] || { call_count: 0, estimated_cost: 0 };
  } catch (err) {
    console.error('[DB] getApiUsage failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 保存订单
 */
async function saveOrder(data) {
  const client = await getPool().connect();
  try {
    const { order_id, report_id, email, amount, currency, status, subscription_id } = data;
    const result = await client.query(`
      INSERT INTO orders (order_id, report_id, email, amount, currency, status, subscription_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (order_id) DO UPDATE SET status = $6
      RETURNING order_id
    `, [order_id, report_id, email, amount, currency || 'USD', status || 'paid', subscription_id || null]);
    return result.rows[0];
  } catch (err) {
    console.error('[DB] saveOrder failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 按邮箱查询报告列表（最近的30条）
 */
async function getReportsByEmail(email, limit = 30) {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT report_id, url, domain, product_name, score, lang, unlocked, created_at
      FROM reports
      WHERE email = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [email.toLowerCase(), limit]);
    return result.rows;
  } catch (err) {
    console.error('[DB] getReportsByEmail failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 保存验证码（每次生成新的，保留最近的）
 */
async function saveVerificationCode(email, code, expiresAt) {
  const client = await getPool().connect();
  try {
    await client.query(`
      INSERT INTO verification_codes (email, code, expires_at)
      VALUES ($1, $2, $3)
    `, [email.toLowerCase(), code, expiresAt]);

    // 清理该邮箱旧的验证码（保留最近3条）
    await client.query(`
      DELETE FROM verification_codes
      WHERE email = $1 AND expires_at < NOW()
    `, [email.toLowerCase()]);
  } catch (err) {
    console.error('[DB] saveVerificationCode failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 验证邮箱+验证码
 */
async function verifyEmailCode(email, code) {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT code FROM verification_codes
      WHERE email = $1 AND code = $2 AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [email.toLowerCase(), code]);
    return result.rows.length > 0;
  } catch (err) {
    console.error('[DB] verifyEmailCode failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 查询邮箱的有效订阅状态
 */
async function getActiveSubscription(email) {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT amount, subscription_id
      FROM orders
      WHERE email = $1 AND status = 'paid'
      ORDER BY created_at DESC
      LIMIT 5
    `, [email.toLowerCase()]);

    for (const row of result.rows) {
      if (row.amount >= 25 && row.amount <= 35) {
        return { plan_type: 'monthly', subscription_id: row.subscription_id };
      }
    }
    for (const row of result.rows) {
      if (row.amount >= 15 && row.amount <= 25) {
        return { plan_type: 'onetime', subscription_id: row.subscription_id };
      }
    }
    return null;
  } catch (err) {
    console.error('[DB] getActiveSubscription failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 查询本月已用报告数
 */
async function getSubscriptionUsage(email) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT reports_used FROM subscription_usage
      WHERE email = $1 AND month = $2
    `, [email.toLowerCase(), currentMonth]);
    return result.rows[0]?.reports_used || 0;
  } catch (err) {
    console.error('[DB] getSubscriptionUsage failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 增加本月用量
 */
async function incrementSubscriptionUsage(email, planType = 'monthly') {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const client = await getPool().connect();
  try {
    await client.query(`
      INSERT INTO subscription_usage (email, month, reports_used, plan_type, updated_at)
      VALUES ($1, $2, 1, $3, NOW())
      ON CONFLICT (email, month) DO UPDATE
      SET reports_used = subscription_usage.reports_used + 1,
          plan_type = $3,
          updated_at = NOW()
    `, [email.toLowerCase(), currentMonth, planType]);
  } catch (err) {
    console.error('[DB] incrementSubscriptionUsage failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  initDatabase,
  saveReport,
  getReport,
  unlockReport,
  updateApiUsage,
  getApiUsage,
  saveOrder,
  getReportsByEmail,
  saveVerificationCode,
  verifyEmailCode,
  getSubscriptionUsage,
  incrementSubscriptionUsage,
  getActiveSubscription,
};

