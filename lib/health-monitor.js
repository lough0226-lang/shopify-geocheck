// Shared health monitoring utilities
// Extracted from health/route.js to avoid circular dependency with webhook/route.js

const recentFailures = [];
const MAX_FAILURES = 50;
const FAILURE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export function recordWebhookFailure(type, details) {
  const now = Date.now();
  while (recentFailures.length > 0 && now - recentFailures[0].timestamp > FAILURE_WINDOW_MS) {
    recentFailures.shift();
  }
  if (recentFailures.length >= MAX_FAILURES) recentFailures.shift();
  recentFailures.push({ timestamp: now, time: new Date(now).toISOString(), type, ...details });
}

export function getFailureStats() {
  const now = Date.now();
  const recent = recentFailures.filter(f => now - f.timestamp < FAILURE_WINDOW_MS);
  const byType = {};
  for (const f of recent) byType[f.type] = (byType[f.type] || 0) + 1;
  return { total_24h: recent.length, by_type: byType, latest: recent.length > 0 ? recent[recent.length - 1] : null };
}
