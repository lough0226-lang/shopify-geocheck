// scripts/blog/run.mjs
// 每日博客流水线：采集 → 起草 → 三道闸门 → 写入 lib/posts-auto.json → 开 PR
//
// 设计原则（2026-11 定）：
//  1) 不直接写 main，永远走分支 + PR，人看一眼再合
//  2) 三道闸门：数字可溯源 / 叙事与来源一致 / 与近 90 天查重
//  3) 写作遵守 docs/08-博客写作规范.md：第一人称只用于真实经历，禁 AI 腔
//  4) 拿不到可用来源就当天不发，宁可空转
//
// 环境变量：DASHSCOPE_API_KEY（必需）、BAILIAN_MODEL（默认 qwen-plus）

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const CFG = {
  apiBase: process.env.BAILIAN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: process.env.BAILIAN_MODEL || 'qwen-plus',
  maxAgeHours: 40,
  minRelevance: 4,
  outJson: 'lib/posts-auto.json',
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

const BANNED = [
  'delve', 'unlock', 'leverage', 'game-changer', 'revolutionary', 'seamless',
  'cutting-edge', 'holistic', 'empower', 'elevate', 'supercharge',
  "in today's fast-paced", "let's dive in", "let's break this down",
  'in conclusion', 'the bottom line is', "it's not just", 'studies show',
];

// ---------- 工具 ----------
const log = (...a) => console.log('[blog]', ...a);
const strip = (s = '') => s.replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

async function get(url, opts = {}, ms = 20000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...opts, signal: c.signal }); }
  finally { clearTimeout(t); }
}

// ---------- 采集 ----------
function parseFeed(xml) {
  const blocks = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0]);
  return blocks.map((raw) => {
    const pick = (tag) => {
      const m = raw.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
      return m ? strip(m[1]) : '';
    };
    const hrefs = [...raw.matchAll(/<link\b[^>]*href="([^"]+)"/gi)].map((m) => m[1]);
    const link = hrefs[0] || (raw.match(/<link[^>]*>([^<]+)<\/link>/i) || [])[1] || '';
    const dateRaw = pick('pubDate') || pick('published') || pick('updated');
    return {
      title: pick('title'),
      link: link.trim(),
      summary: (pick('description') || pick('summary') || pick('content')).slice(0, 1500),
      ts: dateRaw ? Date.parse(dateRaw) : NaN,
    };
  }).filter((x) => x.title && /^https?:\/\//.test(x.link));
}

async function collect() {
  const out = [];
  for (const f of FEEDS) {
    try {
      const r = await get(f.url);
      if (!r.ok) { log(`feed ${f.name} -> ${r.status}`); continue; }
      const items = parseFeed(await r.text());
      for (const it of items) {
        const hay = `${it.title} ${it.summary}`.toLowerCase();
        let score = 0;
        for (const [k, w] of KEYWORDS) if (hay.includes(k)) score += w * f.w;
        out.push({ ...it, score });
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

// ---------- 起草 ----------
const SPEC = `You are writing as Luo Xin, who has worked in website SEO since 2003 and builds My GEO Check.
Voice rules, non-negotiable:
- First person is allowed ONLY for real experience. Never invent tests, clients, or numbers of stores checked.
- No AI-speak: no "delve", "unlock", "leverage", "game-changer", "seamless", "in today's fast-paced world",
  no "it's not just X, it's Y", no "let's dive in", no "in conclusion".
- Vary sentence length. Short sentences are fine. Admit uncertainty plainly.
- Use at most 3 em dashes in the whole piece.
- Every number must come from the SOURCE text. Never add a figure from memory.
- The framing must match the source: if the source is a survey of 4,308 shoppers, do not call it a national experiment.
- 900-1400 words. Plain HTML paragraphs (<p>), 2-4 <h2> sections, no H1.
Return JSON only: {"title":"...","excerpt":"...","tags":["..."],"html":"...","claims":[{"n":"<number as written>","quote":"<sentence from SOURCE containing it>"}]}`;

async function draft(item, sourceText, existingTitles) {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) throw new Error('DASHSCOPE_API_KEY missing');
  const body = {
    model: CFG.model,
    temperature: 0.5,
    max_tokens: 4000,
    messages: [
      { role: 'system', content: SPEC },
      {
        role: 'user',
        content: `SOURCE TITLE: ${item.title}\nSOURCE URL: ${item.link}\n\nSOURCE TEXT:\n"""\n${sourceText.slice(0, 12000)}\n"""\n\nAlready published (do not duplicate these angles):\n${existingTitles.slice(0, 40).join('\n')}`,
      },
    ],
  };
  const r = await get(`${CFG.apiBase}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  }, 120000);
  const txt = await r.text();
  if (!r.ok) throw new Error(`LLM ${r.status}: ${txt.slice(0, 200)}`);
  const content = JSON.parse(txt).choices?.[0]?.message?.content || '';
  const m = content.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no JSON in response');
  return JSON.parse(m[0]);
}

// ---------- 三道闸门 ----------
function gateNumbers(post, sourceText) {
  const body = strip(post.html || '');
  const nums = [...body.matchAll(/\d[\d,]*(?:\.\d+)?/g)]
    .map((m) => m[0].replace(/,/g, ''))
    .filter((n) => Number(n) >= 10 || n.includes('.'));
  const hay = sourceText.replace(/,/g, '');
  const missing = [...new Set(nums)].filter((n) => !hay.includes(n));
  return missing.length ? { ok: false, why: `数字不在来源里: ${missing.slice(0, 8).join(', ')}` } : { ok: true };
}

function gateFraming(post, sourceText, sourceTitle) {
  // 标题里出现的"事件词"必须在来源里也出现，防止把 8 月的调查写成双十一
  const WINDOWS = ['double 11', '618', 'black friday', 'cyber monday', 'q1', 'q2', 'q3', 'q4',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const hayText = `${post.title} ${post.excerpt}`.toLowerCase();
  const src = `${sourceTitle} ${sourceText}`.toLowerCase();
  const claimed = WINDOWS.filter((w) => hayText.includes(w));
  const unsupported = claimed.filter((w) => !src.includes(w));
  return unsupported.length
    ? { ok: false, why: `标题/摘要提到「${unsupported.join(', ')}」但来源里没有` }
    : { ok: true };
}

function gateBanned(post) {
  const body = `${post.title} ${post.excerpt} ${strip(post.html)}`.toLowerCase();
  const hit = BANNED.filter((w) => body.includes(w));
  return hit.length ? { ok: false, why: `禁用词: ${hit.join(', ')}` } : { ok: true };
}

function gateDuplicate(post, existingTitles) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
  const a = new Set(norm(post.title));
  for (const t of existingTitles) {
    const b = new Set(norm(t));
    let inter = 0;
    for (const w of a) if (b.has(w)) inter += 1;
    const jac = inter / (a.size + b.size - inter || 1);
    if (jac > 0.75) return { ok: false, why: `与已有标题过于相似: ${t}` };
  }
  return { ok: true };
}

// ---------- 主流程 ----------
function readExistingTitles() {
  const src = fs.readFileSync(CFG.postsFile, 'utf8');
  return [...src.matchAll(/^\s{4}title:\s*'([^']+)'/gm)].map((m) => m[1]);
}

function slugify(s) {
  return s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

async function main() {
  const titles = readExistingTitles();
  const candidates = await collect();
  log(`候选 ${candidates.length} 条`);
  if (!candidates.length) { log('无可发布选题，今天不发。'); return; }

  for (const item of candidates.slice(0, 4)) {
    log(`尝试: ${item.title.slice(0, 70)}`);
    let src = item.summary;
    try {
      const r = await get(item.link, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; MyGeoCheckBot)' } });
      if (r.ok) src = strip(await r.text()).slice(0, 60000);
    } catch { /* 用 summary 兜底 */ }
    if (src.length < 1500) { log('  来源正文太短，跳过'); continue; }

    let post;
    try { post = await draft(item, src, titles); }
    catch (e) { log(`  起草失败: ${e.message}`); continue; }

    const gates = [
      ['数字溯源', gateNumbers(post, src)],
      ['叙事一致', gateFraming(post, src, item.title)],
      ['禁用词', gateBanned(post)],
      ['查重', gateDuplicate(post, titles)],
    ];
    let pass = true;
    for (const [name, g] of gates) {
      log(`  ${g.ok ? '✓' : '✗'} ${name}${g.ok ? '' : ' — ' + g.why}`);
      if (!g.ok) pass = false;
    }
    if (!pass) { log('  闸门未过，丢弃\n'); continue; }

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const entry = {
      slug: `${date}-${slugify(post.title)}`,
      title: post.title,
      excerpt: post.excerpt,
      date,
      updated: date,
      dateDisplay: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }),
      readingTime: `${Math.max(5, Math.round(strip(post.html).split(/\s+/).length / 230))} min read`,
      tags: (post.tags || []).slice(0, 6),
      coverColor: 'from-slate-700 to-slate-900',
      quickAnswer: null,
      faq: [],
      content: post.html,
      source: item.link,
      auto: true,
    };

    const prev = fs.existsSync(CFG.outJson) ? JSON.parse(fs.readFileSync(CFG.outJson, 'utf8')) : [];
    fs.writeFileSync(CFG.outJson, JSON.stringify([entry, ...prev], null, 2));
    log(`  已写入 ${CFG.outJson}: ${entry.slug}`);
    log('  四道闸门全部通过。');
    return;
  }
  log('全部候选都未通过，今天不发。');
}

await main();
