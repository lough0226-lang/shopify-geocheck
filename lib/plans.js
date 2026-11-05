// lib/plans.js
// 把「用户」映射到「档位」，一处定义，扫描与深挖共用。
//
// 为什么要单独一层：额度（free 1 / onetime 3 / monthly 20）在 storeScan.js 里，
// 但"这个人到底属于哪一档"要看 orders 表。两边直接互相引用会绕，所以拆出来。
//
// 注意：完全没有账号系统。身份锚点就是邮箱 —— 用户在 /scan 填了邮箱，
// 我们就去 orders 里查这个邮箱有没有已付款记录。没填邮箱 → free。

import { getActiveSubscription } from './db';

export const PLAN_RANK = { free: 0, onetime: 1, monthly: 2 };

export function higherPlan(a, b) {
  return (PLAN_RANK[a] ?? 0) >= (PLAN_RANK[b] ?? 0) ? a : b;
}

// 返回 'monthly' | 'onetime' | 'free'
export async function resolveScanPlan(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return 'free';
  try {
    const sub = await getActiveSubscription(email.trim().toLowerCase());
    if (sub?.plan_type === 'monthly') return 'monthly';
    if (sub?.plan_type === 'onetime') return 'onetime';
    return 'free';
  } catch (e) {
    console.warn('[plans] resolveScanPlan failed:', e.message);
    return 'free';
  }
}
