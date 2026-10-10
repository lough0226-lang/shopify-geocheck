// Lightweight local analytics: append user-behavior events as JSONL to /data.
// Writes are fire-and-forget, never block the request and never throw —
// analytics failures must never break analysis or payment flows.
// The data directory will be mounted as a persistent Zeabur volume.
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');

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
 *   analysis_fallback { domain, reason }        (AI degraded)
 *   report_email      { report_id, email, status: 'sent'|'failed', order_id?, error? }
 *   payment_created   { checkout_id?, report_id, email? }
 *   payment_checkout_completed { order_id, amount?, currency?, email, report_id }
 *   unlock_check      { report_id, email, result: 'active_sub'|'no_sub'|'error' }
 *   subscription_event { event, subscription_id?, email, status? }
 *   portal_link       { email, result: 'ok'|'not_found'|'error' }
 *
 * @param {string} type
 * @param {object} [data]
 */
export function recordEvent(type, data = {}) {
  const event = {
    ts: new Date().toISOString(),
    type,
    ...data,
  };

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
