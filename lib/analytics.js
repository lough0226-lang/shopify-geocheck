// Lightweight local analytics: append user-behavior events as JSONL to /data.
// Writes are fire-and-forget, never block the request and never throw —
// analytics failures must never break analysis or payment flows.
// The data directory will be mounted as a persistent Zeabur volume.
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');

/**
 * 邮箱只存哈希，不存明文。
 * events.jsonl 是明文日志文件，邮箱属于个人信息；哈希后仍可跨事件聚合同一用户，
 * 但无法反推。salt 放环境变量 ANALYTICS_SALT。
 */
function hashEmail(email) {
  if (!email || typeof email !== 'string') return undefined;
  const salt = process.env.ANALYTICS_SALT || 'mygeocheck-analytics';
  return createHash('sha256').update(`${salt}:${email.trim().toLowerCase()}`).digest('hex').slice(0, 24);
}

let dirEnsured = false;
let writeChain = Promise.resolve();

function ensureDataDir() {
  if (dirEnsured) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    dirEnsured = true;
  } catch (err) {
    // Keep retrying later if the volume is not mounted yet
    console.warn('[analytics] data dir not ready:', err.message);
  }
}

function appendLine(line) {
  try {
    fs.appendFileSync(EVENTS_FILE, line + '\n', { flag: 'a' });
  } catch (err) {
    console.warn('[analytics] write failed:', err.message);
  }
}

/**
 * Record a behavior event.
 * Safe to await but NOT required — always resolves, never rejects.
 *
 * Event types:
 *   analysis_started  { domain, email?, lang? }
 *   analysis_failed   { domain, has_email?, reason }     (AI unavailable, 503)
 *   report_email      { report_id, email, status: 'sent'|'failed', order_id?, error? }
 *   payment_created   { checkout_id?, report_id, email? }
 *   payment_checkout_completed { order_id, amount?, currency?, email, report_id }
 *   unlock_check      { report_id, email, result: 'active_sub'|'no_sub'|'error' }
 *   subscription_event { event, subscription_id?, email, status? }
 *   portal_link       { email, result: 'ok'|'not_found'|'error' }
 *
 * 注意：任何事件里的 email 在落盘前都会被替换成 email_hash（见上方 hashEmail）。
 *
 * @param {string} type
 * @param {object} [data]
 */
export function recordEvent(type, data = {}) {
  // 统一在这里把 email 换成 email_hash，所有调用点自动生效。
  // 调用方可以继续传 email，落盘时不会出现明文。
  const { email, ...rest } = data || {};
  const event = {
    ts: new Date().toISOString(),
    type,
    ...rest,
  };
  const emailHash = hashEmail(email);
  if (emailHash) event.email_hash = emailHash;

  let line;
  try {
    line = JSON.stringify(event);
  } catch (err) {
    console.warn('[analytics] failed to serialize event:', err.message);
    return Promise.resolve();
  }

  // Serialize writes onto a chain so concurrent requests don't interleave.
  writeChain = writeChain.then(() => {
    try {
      ensureDataDir();
      if (!dirEnsured) return;
      appendLine(line);
    } catch (err) {
      console.warn('[analytics] unexpected error:', err.message);
    }
  });

  return writeChain;
}

/** Extract the store domain from a Shopify/product URL for analytics. */
export function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (err) {
    return String(url || '').slice(0, 120);
  }
}
