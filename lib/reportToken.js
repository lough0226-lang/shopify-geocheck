// lib/reportToken.js
// 报告内容凭证：付费内容不再因为 "unlocked=true" 就对任何拿到 URL 的人可见。
//
// 原来的问题：GET /api/analyze?report_id=X 只看 reports.unlocked，
// 一旦解锁，任何人拿着裸链接都能读到全部付费内容（query fixes、完整竞品、
// overall recommendations）。裸链接还会被爬虫、聊天预览、转发带出去。
//
// 现在：邮件里的链接带 ?k=<HMAC(reportId)>，服务端用同一个密钥校验。
// 没有 k 的请求只能拿到免费版视图 —— 与未付费时完全一致。
//
// 已知取舍：k 是 bearer token，把链接转发给别人，对方仍能打开（这是刻意的，
// 买家经常需要把报告发给同事）。这里解决的是"裸 URL 裸奔"和"爬虫/枚举"，
// 不是"禁止分享"。真正的防转发需要买家邮箱验证会话，属于后续迭代。
//
// 密钥来源：REPORT_TOKEN_SECRET → 回退 CREEM_WEBHOOK_SECRET（都只在服务端）。
// 都没配置时不签发也不接受 token（宁可锁着，也不接受可伪造的凭证）。

import crypto from 'node:crypto';

function secret() {
  return process.env.REPORT_TOKEN_SECRET || process.env.CREEM_WEBHOOK_SECRET || '';
}

export function isTokenEnabled() {
  return secret().length > 0;
}

function mac(reportId) {
  return crypto
    .createHmac('sha256', secret())
    .update(String(reportId))
    .digest('base64url')
    .slice(0, 32);
}

export function signReportToken(reportId) {
  if (!isTokenEnabled() || !reportId) return '';
  return mac(reportId);
}

export function verifyReportToken(token, reportId) {
  if (!isTokenEnabled() || !token || !reportId) return false;
  const expected = mac(reportId);
  const a = Buffer.from(String(token));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// 拼报告链接：有密钥就带 k，没有就退回旧行为
export function reportUrl(baseUrl, reportId) {
  const base = `${baseUrl}/report/${reportId}`;
  const k = signReportToken(reportId);
  return k ? `${base}?k=${k}` : base;
}
