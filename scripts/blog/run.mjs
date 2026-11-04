// scripts/blog/run.mjs
// 每日「选题卡」流水线（方案 C）
//
// 为什么不再让模型写正文：
//   实测 qwen-plus / qwen-max 在「数字必须可溯源」的约束下只能写 460–670 词，
//   再往下就只能靠编，而 34 篇同构的短评对站点是负资产（scaled content）。
//   所以机器只负责：采集 → 去重 → 抠出可引用的事实 → 出选题卡；正文由人写。
//
// 产物：blog-briefs/YYYY-MM-DD.md（一个 PR）
// 环境变量：DASHSCOPE_API_KEY（可选，用于生成角度建议；缺失时降级为纯机器卡片）

import fs from 'node:fs';
import path from 'node:path';

const CFG = {
  // 百炼「业务空间」key 只能配业务空间专属地址，全局 dashscope 域名会 401。
  apiBase: process.env.BAILIAN_BASE_URL
    || 'https://ws-uy0lvbot0s5smg8l.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  model: process.env.BAILIAN_MODEL || 'qwen-plus',
  maxAgeHours: 72,
  minRelevance: 3,
  topN: 3,
  outDir: 'blog-briefs',
  postsFile: 'lib/posts.js',
};

const FEEDS = [
  { name: 'Shopify Changelog', url: 'https://shopify.dev/changelog/feed.xml', w: 3 },
  { name: 'Google Search Central', url: 'https://developers.google.com/search/blog/feed.xml', w: 2 },
  { name: 'Search Engine Journal', url: 'https://www.searchenginejournal.com/feed/', w: 1 },
  { name: 'Search Engine Land', url: 'https://searchengineland.com/feed', w: 1 },
];

const KEYWORDS = [
  ['generative engine optimization', 5], ['ai search', 4], ['ai overview', 4],
  ['agentic commerce', 4], ['shopify', 3], ['chatgpt', 3], ['llm', 2],
  ['structured data', 3], ['llms.txt', 3], ['perplexity', 2], ['product feed', 2],
];

const log = (...a) => console.log('[brief]', ...a);
const strip = (s = '') => s.replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, ' & ').replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

async function get(url, opts = {}, ms = 20000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...opts, signal: c.signal }); }
  finally { clearTimeout(t); }
}

const UA = {
  'user-agent': 'Mozilla/5.0 (compatible; MyGeoCheckBot/1.0; +https://mygeocheck.com)',
  accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
};

function parseFeed(xml) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((m) => {
    const raw = m[0];
    const pick = (tag) => {
      const t = raw.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
      return t ? strip(t[1]) : '';
    };
    const hrefs = [...raw.matchAll(/<link\b[^>]*href="([^"]+)"/gi)].map((x) => x[1]);
    const link = (hrefs[0] || (raw.match(/<link[^>]*>([^<]+)<\/link>/i) || [])[1] || '').trim();
    const dateRaw = pick('pubDate') || pick('published') || pick('updated');
    return {
      title: pick('title'), link,
      summary: (pick('description') || pick('summary') || pick('content')).slice(0, 2000),
      ts: dateRaw ? Date.parse(dateRaw) : NaN,
    };
  }).filter((x) => x.title && /^https?:\/\//.test(x.link));
}

async function collect() {
  const out = [];
  for (const f of FEEDS) {
    try {
      const r = await get(f.url, { headers: UA });
      if (!r.ok) { log(`feed ${f.name} -> ${r.status}`); continue; }
      const items = parseFeed(await r.text());
      for (const it of items) {
        const hay = `${it.title} ${it.summary}`.toLowerCase();
        let score = 0;
        for (const [k, w] of KEYWORDS) if (hay.includes(k)) score += w * f.w;
        out.push({ ...it, score, feed: f.name });
      }
      log(`feed ${f.name}: ${items.length} 条`);
    } catch (e) { log(`feed ${f.name} 失败: ${e.message}`); }
  }
  const cutoff = Date.now() - CFG.maxAgeHours * 3600e3;
  return out
    .filter((x) => x.score >= CFG.minRelevance)
    .filter((x) => !Number.isFinite(x.ts) || x.ts >= cutoff)
    .sort((a, b) => b.score - a.score);
}

// 直接从来源里抠出带数字的句子——这些才是可引用的事实，不经过模型转述。
// 必须过滤掉导航/推荐位，否则会抓到「Join The Live Audit…」这类页面垃圾。
function keyNumbers(src, limit = 8) {
  const JUNK = /subscribe|newsletter|advertisement|read full bio|featured image|sej staff|min read|\breads\b|follow|sign in|cookie|privacy policy|share this|listen to|podcast|webinar|copyright|all rights reserved|skip to|menu\b/i;
  // 只留"数据型"数字：百分比、金额、倍数，或带研究/样本类词汇的句子
  const DATA = /\d+(?:\.\d+)?\s*%|\$\s?\d|\d+\s?x\b|\d+\s?(?:percent|million|billion)|\b(?:survey|study|respondents|users|revenue|visits|impressions|clicks|sessions|advertisers|merchants)\b/i;

  const sentences = src.split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 50 && s.length < 300)
    .filter((s) => /\d/.test(s))
    .filter((s) => !JUNK.test(s))
    .filter((s) => DATA.test(s))
    .filter((s) => /^[A-Z0-9"']/.test(s));

  const uniq = [];
  const seen = new Set();
  for (const s of sentences) {
    const k = s.slice(0, 60).toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(s);
    if (uniq.length >= limit) break;
  }
  return uniq;
}

function readExistingTitles() {
  const src = fs.readFileSync(CFG.postsFile, 'utf8');
  return [...src.matchAll(/^\s{4}title:\s*'([^']+)'/gm)].map((m) => m[1]);
}

const BRIEF_SPEC = `You are helping Luo Xin (SEO since 2003, builds My GEO Check, sells to Shopify merchants) decide whether a news item is worth writing about.

Return JSON only:
{"worthWriting": true|false, "reason": "...", "angles": ["...","..."], "pitfalls": ["..."], "shopifyAction": "..."}

Rules:
- worthWriting is false if the item is a product announcement with no consequence for merchants, a listicle, or an opinion piece with no new facts.
- angles: 2-4 specific ways to write about this FROM A PRACTITIONER'S VIEW. Each must be a claim, not a topic.
- pitfalls: what a careless writer would get wrong (over-extrapolating a US figure to all markets, calling a survey a national experiment, treating a vendor's own claim as independent research).
- shopifyAction: one concrete thing a merchant could change on their store this week, or "" if none.
- No hype words. No "leverage", "unlock", "game-changer".`

async function briefFromModel(item, src, titles) {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) return null;
  const body = {
    model: CFG.model, temperature: 0.3, max_tokens: 900,
    messages: [
      { role: 'system', content: BRIEF_SPEC },
      {
        role: 'user',
        content: `TITLE: ${item.title}\nURL: ${item.link}\n\nSOURCE:\n"""${src.slice(0, 8000)}"""\n\nRecent posts on the site (avoid repeating these angles):\n${titles.slice(0, 30).join('\n')}`,
      },
    ],
  };
  try {
    const r = await get(`${CFG.apiBase}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    }, 90000);
    if (!r.ok) { log(`  模型 ${r.status}: ${(await r.text()).slice(0, 120)}`); return null; }
    const txt = await r.text();
    const content = JSON.parse(txt).choices?.[0]?.message?.content || '';
    const m = content.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch (e) { log(`  模型调用失败: ${e.message}`); return null; }
}

function similarTitle(t, titles) {
  const norm = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3));
  const a = norm(t);
  for (const old of titles) {
    const b = norm(old);
    let inter = 0;
    for (const w of a) if (b.has(w)) inter += 1;
    if (inter / (a.size + b.size - inter || 1) > 0.75) return old;
  }
  return null;
}

async function main() {
  if (!process.env.DASHSCOPE_API_KEY) {
    log('提示：DASHSCOPE_API_KEY 未配置，降级为纯机器卡片（无角度建议）。');
  }

  const titles = readExistingTitles();
  const candidates = await collect();
  log(`候选 ${candidates.length} 条`);
  if (!candidates.length) { log('今天没有候选。'); return; }

  const picked = [];
  for (const item of candidates) {
    if (picked.length >= CFG.topN) break;
    const dup = similarTitle(item.title, titles);
    if (dup) { log(`跳过（与旧文重复）: ${item.title.slice(0, 50)}`); continue; }

    let src = item.summary;
    try {
      const r = await get(item.link, { headers: UA });
      if (r.ok) src = strip(await r.text()).slice(0, 60000);
    } catch { /* 用 summary */ }
    if (src.length < 600) { log(`跳过（来源太短）: ${item.title.slice(0, 50)}`); continue; }

    const nums = keyNumbers(src);
    const advice = await briefFromModel(item, src, titles);
    if (advice && advice.worthWriting === false) {
      log(`跳过（不值得写）: ${item.title.slice(0, 50)} — ${String(advice.reason || '').slice(0, 60)}`);
      continue;
    }
    picked.push({ item, src, nums, advice });
    log(`收录: ${item.title.slice(0, 60)}（${nums.length} 条带数字的句子）`);
  }

  if (!picked.length) { log('今天没有值得写的选题。'); return; }

  const date = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`# 选题卡 ${date}`);
  lines.push('');
  lines.push(`自动生成。共 ${picked.length} 条候选，每条附：来源、可引用的事实（原句）、角度建议、坑。`);
  lines.push('');
  picked.forEach((p, i) => {
    lines.push('---');
    lines.push('');
    lines.push(`## ${i + 1}. ${p.item.title}`);
    lines.push('');
    lines.push(`- 来源：${p.item.link}`);
    lines.push(`- 采集自：${p.item.feed}｜相关度 ${p.item.score}`);
    lines.push('');
    if (p.advice?.reason) {
      lines.push(`**为什么值得写**：${p.advice.reason}`);
      lines.push('');
    }
    if (p.advice?.angles?.length) {
      lines.push('**可用角度**');
      p.advice.angles.forEach((a) => lines.push(`- ${a}`));
      lines.push('');
    }
    if (p.nums.length) {
      lines.push('**可引用的事实**（原句照抄，写稿时直接引，不要改写数字）');
      p.nums.forEach((s) => lines.push(`- ${s}`));
      lines.push('');
    }
    if (p.advice?.pitfalls?.length) {
      lines.push('**坑**');
      p.advice.pitfalls.forEach((s) => lines.push(`- ${s}`));
      lines.push('');
    }
    if (p.advice?.shopifyAction) {
      lines.push(`**本周可落地**：${p.advice.shopifyAction}`);
      lines.push('');
    }
  });
  lines.push('---');
  lines.push('');
  lines.push('写稿要求见 `docs/08-博客写作规范.md`：第一人称只用真实经历，禁用 AI 腔，数字只能来自上方原句。');

  fs.mkdirSync(CFG.outDir, { recursive: true });
  const out = path.join(CFG.outDir, `${date}.md`);
  fs.writeFileSync(out, lines.join('\n'));
  log(`已写入 ${out}（${picked.length} 条）`);
}

await main();
