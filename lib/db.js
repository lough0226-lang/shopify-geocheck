// PostgreSQL 数据库客户端 - Zeabur 托管
// 使用连接池，适应 serverless 环境

const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
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
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_reports_email ON reports(email);
      CREATE INDEX IF NOT EXISTS idx_reports_domain ON reports(domain);
      CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
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
 * 保存分析报告
 */
async function saveReport(data) {
  const client = await getPool().connect();
  try {
    const {
      reportId, url, domain, email, product_name, store_name,
      score, free_issues, full_report, lang, unlocked, ai_error, is_fallback
    } = data;

    const result = await client.query(`
      INSERT INTO reports (report_id, url, domain, email, product_name, store_name, score, free_issues, full_report, lang, unlocked, ai_error, is_fallback)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11, $12, $13)
      RETURNING report_id
    `, [reportId, url, domain, email, product_name, store_name, score, JSON.stringify(free_issues), JSON.stringify(full_report), lang, unlocked, ai_error || null, is_fallback || false]);

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
 * 标记报告为已解锁
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
};
