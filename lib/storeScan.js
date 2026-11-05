// lib/storeScan.js
// 整店扫描的「规则层」：只做确定性检查，不调用任何模型。
//
// 为什么单独一层：
//   一次深挖要花模型调用与十几秒；一个店有两百个商品，全都深挖既慢又贵。
//   但"标题多长、有没有 alt、价格是否一致、有没有库存"这类判断根本不需要模型。
//   所以：规则层扫全店（成本≈0），只对最差的 N 个做 LLM 深挖。
//
// 数据来源：Shopify 每个店都暴露 /products.json（除非店主关掉）。
//   一次 250 条，含 title / body_html / images(alt) / variants(price,available)
//   / product_type / tags / handle / published_at。够跑全部规则，不需要抓 HTML。
//
// 九个检查项对应定价页说的 "9 signal categories"。

const UA = {
  'user-agent': 'Mozilla/5.0 (compatible; MyGeoCheckBot/1.0; +https://mygeocheck.com)',
  accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
};

// 各档位的深挖额度。定价页、条款、Creem 描述必须与这里一致。
export const DEEP_QUOTA = { free: 1, onetime: 3, monthly: 20 };

export function normalizeDomain(input) {
  if (!input || typeof input !== 'string') return null;
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '');
  s = s.split('/')[0].split('?')[0].split('#')[0];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)) return null;
  if (s.includes('..') || s.startsWith('.') || s.endsWith('.')) return null;
  return s;
}

async function getJson(url, ms = 15000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { headers: UA, signal: c.signal });
    if (!r.ok) return { ok: false, status: r.status, data: null };
    return { ok: true, status: r.status, data: await r.json() };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e.message };
  } finally {
    clearTimeout(t);
  }
}

// 取商品目录，最多 limit 个。
//
// 首选 /collections/all/products.json?sort_by=best-selling ：
//   这是 Shopify 用真实销量算出的排序，一条请求同时拿到「商品数据」和「热销名次」。
//   抓 HTML 里 /products/ 链接的旧做法不可靠 —— 大量主题是 JS 渲染的，
//   实测 gymshark 首页 200 但 0 个 handle，tentree 还会 429。
// 回退 /products.json ：店主关掉集合 JSON 时仍能扫，只是没有销量排序。
async function fetchPaged(base, limit, extraQuery = '') {
  const out = [];
  const perPage = 250;
  for (let page = 1; page <= Math.ceil(limit / perPage) + 1 && out.length < limit; page += 1) {
    const r = await getJson(`${base}?limit=${perPage}&page=${page}${extraQuery}`);
    if (!r.ok || !Array.isArray(r.data?.products)) break;
    const batch = r.data.products;
    if (!batch.length) break;
    out.push(...batch);
    if (batch.length < perPage) break;
  }
  return out.slice(0, limit);
}

export async function fetchCatalog(domain, limit = 200) {
  const sorted = await fetchPaged(`https://${domain}/collections/all/products.json`, limit, '&sort_by=best-selling');
  if (sorted.length) {
    return { products: sorted.map((p, i) => ({ ...p, best_selling_rank: i + 1 })), sorted: true };
  }
  const plain = await fetchPaged(`https://${domain}/products.json`, limit);
  return { products: plain, sorted: false };
}

const stripHtml = (s = '') => String(s)
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const wordCount = (s = '') => (s.trim() ? s.trim().split(/\s+/).length : 0);

// 九个检查项。返回 issues: 只记"有问题"的项。
export function ruleScanProduct(p) {
  const issues = [];
  const push = (code, severity, message) => issues.push({ code, severity, message });

  const title = String(p.title || '').trim();
  const descWords = wordCount(stripHtml(p.body_html));
  const images = Array.isArray(p.images) ? p.images : [];
  const variants = Array.isArray(p.variants) ? p.variants : [];

  // 1. Title：太短无法被意图命中，太长会被截断
  if (title.length < 15) push('title_short', 'high', `Title is only ${title.length} characters`);
  else if (title.length > 70) push('title_long', 'medium', `Title is ${title.length} characters and will be truncated`);

  // 2. Description：AI 读不到就答不了问题
  if (descWords < 40) push('desc_thin', 'high', `Description is ${descWords} words`);
  else if (descWords > 1200) push('desc_bloat', 'low', `Description is ${descWords} words and buries the facts`);

  // 3. 图片 alt：纯图片信息对模型不可读
  const missingAlt = images.filter((im) => !String(im.alt || '').trim()).length;
  if (images.length === 0) push('no_image', 'high', 'Product has no images');
  else if (missingAlt > 0) push('img_alt_missing', missingAlt === images.length ? 'high' : 'medium', `${missingAlt} of ${images.length} images have no alt text`);

  // 4. 价格：缺失或为 0，助手无法回答价格类问题
  const prices = variants.map((v) => parseFloat(v.price)).filter((n) => Number.isFinite(n));
  if (!prices.length) push('price_missing', 'high', 'No price on any variant');
  else if (prices.some((n) => n <= 0)) push('price_zero', 'high', 'A variant is priced at 0');

  // 5. 变体价格一致性：跨度太大时模型容易答错"多少钱"
  if (prices.length > 1) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min > 0 && max / min >= 10) push('price_spread', 'low', `Variant prices span ${Math.round(max / min)}x`);
  }

  // 6. 库存状态：全部售罄的商品会被助手排除在推荐之外
  if (variants.length && !variants.some((v) => v.available !== false)) {
    push('out_of_stock', 'medium', 'All variants are unavailable');
  }

  // 7. 品类：product_type 为空时，助手只能靠猜
  if (!String(p.product_type || '').trim()) push('no_product_type', 'medium', 'product_type is empty');

  // 8. 标签：是事实型描述的廉价来源
  const tags = Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').filter(Boolean);
  if (tags.length < 3) push('few_tags', 'low', `${tags.length} tag(s) only`);

  // 9. 尺码/材质/护理：服饰类最常见的信息缺口（AI 最答不上来的就是尺码）
  const body = stripHtml(p.body_html).toLowerCase();
  const hasFit = /(size|fit|measurement|chest|waist|inseam|cm|inch)/.test(body);
  const hasMaterial = /(cotton|wool|polyester|leather|linen|silk|nylon|material|fabric|composition)/.test(body);
  if (!hasFit && !hasMaterial) push('no_specs', 'medium', 'No size, fit or material information in the description');

  return issues;
}

const SEVERITY_WEIGHT = { high: 14, medium: 7, low: 3 };

export function scoreProduct(issues) {
  const penalty = issues.reduce((sum, i) => sum + (SEVERITY_WEIGHT[i.severity] || 0), 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

// 汇总：店级分数 = 各商品分数的中位数（中位数比平均更抗极端值）
export function summarize(products, scannedCount) {
  const rows = products.map((p) => {
    const issues = ruleScanProduct(p);
    return {
      handle: p.handle,
      title: p.title,
      product_type: p.product_type || '',
      price: p.variants?.[0]?.price ?? null,
      image: p.images?.[0]?.src ?? null,
      score: scoreProduct(issues),
      issues,
    };
  });

  const scores = rows.map((r) => r.score).sort((a, b) => a - b);
  const median = scores.length ? scores[Math.floor(scores.length / 2)] : 0;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // 每个检查项的通过率：告诉店主"你店里最普遍的问题是哪一个"
  const codes = {};
  for (const r of rows) for (const i of r.issues) codes[i.code] = (codes[i.code] || 0) + 1;

  const worst = [...rows].sort((a, b) => a.score - b.score).slice(0, 20);

  return {
    // 注意：这是「商品页可读性」分数，用确定性规则算出来，
    // 不等于报告页的 AI Visibility Score（那个要跑 7 个买家问题的模型分析）。
    // 对外必须分开表述，否则又是一次"承诺与实现不一致"。
    score_basis: 'catalog_rules',
    score: median,
    average: avg,
    scanned: scannedCount ?? rows.length,
    analysed: rows.length,
    distribution: {
      critical: rows.filter((r) => r.score < 40).length,
      weak: rows.filter((r) => r.score >= 40 && r.score < 66).length,
      ok: rows.filter((r) => r.score >= 66).length,
    },
    issue_counts: codes,
    worst,
    products: rows,
  };
}
