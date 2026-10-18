// 抓取 Shopify 产品页面内容 - 多重策略
// 优先使用 Jina Reader / ScraperAPI 代理，失败时降级到 Shopify JSON / HTML

import dns from 'node:dns/promises';
import net from 'node:net';

const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * 策略1：通过 Jina Reader API 代理抓取（绕过 Cloudflare 反爬）
 * Jina Reader 免费、无需 API Key，自动处理反爬和 Cloudflare 防护
 */
async function scrapeViaJinaReader(url) {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const response = await fetch(jinaUrl, {
    headers: {
      'Accept': 'text/plain',
      'X-Return-Format': 'text',
      'X-With-Generated-Alt': 'true',
    },
    signal: AbortSignal.timeout(6000),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Jina Reader returned ${response.status}`);
  }

  const text = await response.text();
  if (!text || text.length < 100) {
    throw new Error('Jina Reader returned empty or too short content');
  }

  // --- 智能提取产品标题 ---
  // 先尝试从 markdown 标题中找到产品名
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // 需要跳过的导航/横幅文本关键词
  const skipKeywords = [
    'free ground', 'free shipping', 'sign in', 'sign up', 'log in', 'cart',
    'menu', 'search', 'account', 'wishlist', 'orders over', 'subscribe',
    'cookie', 'privacy', 'terms', 'navigation', 'skip to', 'back to',
    'shop all', 'new arrivals', 'sale', 'gift card', 'help', 'contact',
  ];
  
  let title = '';
  // 查找第一个像产品标题的 markdown 标题行（# 或 ##）
  for (const line of lines) {
    const cleanLine = line.replace(/^#+\s*/, '').trim();
    if (cleanLine.length < 5 || cleanLine.length > 200) continue;
    const lower = cleanLine.toLowerCase();
    // 跳过导航文本
    if (skipKeywords.some(kw => lower.includes(kw))) continue;
    // 跳过纯数字、纯链接、纯按钮文本
    if (/^[\d\s$.,]+$/.test(cleanLine)) continue;
    if (/^(home|shop|all|men|women|kids|sale|new|blog|about|faq)$/i.test(cleanLine)) continue;
    // 这应该是一个内容标题
    title = cleanLine;
    break;
  }
  
  // 如果没找到标题，从 URL 路径提取产品名
  if (!title) {
    const handleMatch = url.match(/\/products\/([^/?]+)/);
    if (handleMatch) {
      // 将 mens-tree-dash-2-blizzard 转为 Men's Tree Dash 2 Blizzard
      title = handleMatch[1]
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } else {
      title = 'Unknown Product';
    }
  }

  // --- 提取价格 ---
  // 查找典型的价格格式
  const priceMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
  const price = priceMatch ? `$${priceMatch[1]}` : 'Price not found';

  // --- 提取描述 ---
  // 从标题后的内容中提取描述（跳过导航区域）
  let descStart = 0;
  const titleIdx = text.indexOf(title);
  if (titleIdx !== -1) {
    descStart = titleIdx + title.length;
  }
  const description = text.slice(descStart, descStart + 600).replace(/\n+/g, ' ').trim();

  return {
    url,
    title,
    description,
    price,
    imageAlts: [],
    structuredData: {},
    metaInfo: { title, description, ogTitle: '', ogDescription: '', ogImage: '', ogType: 'product', canonical: url },
    variants: [],
    faqContent: [],
    reviewContent: [],
    pageText: text.slice(0, 6000),
    hasSchemaMarkup: false,
    canonicalUrl: url,
    storeLocator: detectStoreLocator(text),
    certifications: extractCertifications(text),
    html_length: text.length,
    _source: 'jina_reader',
  };
}

/**
 * 策略2：通过 Shopify 公开 JSON 接口获取产品数据
 * 几乎所有 Shopify 店铺都支持 /products/[handle].json
 */
async function scrapeViaJson(url) {
  // 将 /products/xxx 转为 /products/xxx.json
  const jsonUrl = url.replace(/\/products\/([^/?]+).*/, '/products/$1.json');
  
  // 如果不是 /products/ 路径，尝试用 /products.json 获取全部产品再匹配
  if (!url.includes('/products/')) {
    throw new Error('Not a product page URL');
  }

  const response = await fetch(jsonUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': COMMON_HEADERS['User-Agent'],
    },
    signal: AbortSignal.timeout(6000),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`JSON endpoint returned ${response.status} (${response.statusText})`);
  }

  const data = await response.json();
  const product = data.product;
  
  if (!product || !product.title) {
    throw new Error('No product data in JSON response');
  }

  // 构造与 HTML 抓取兼容的结果格式
  const description = product.body_html
    ? product.body_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : (product.body_html || '');

  // 提取图片 alt 文本
  const imageAlts = (product.images || [])
    .map(img => (img.alt || '').trim())
    .filter(a => a && a.length > 2)
    .slice(0, 10);

  // 提取价格
  let price = 'Price not found';
  if (product.variants && product.variants.length > 0) {
    const p = product.variants[0].price;
    if (p) price = `$${p}`;
  }

  // 构造页面文本用于分析（将结构化数据拼接）
  let pageText = `Product: ${product.title}\n`;
  pageText += `Vendor: ${product.vendor || 'Unknown'}\n`;
  pageText += `Type: ${product.product_type || 'Unknown'}\n`;
  pageText += `Price: ${price}\n`;
  pageText += `Tags: ${(product.tags || []).join(', ')}\n`;
  pageText += `Description: ${description}\n`;
  
  if (product.options) {
    pageText += `Options: ${product.options.map(o => `${o.name}: ${(o.values || []).join(', ')}`).join('; ')}\n`;
  }
  
  if (imageAlts.length > 0) {
    pageText += `Image descriptions: ${imageAlts.join('; ')}\n`;
  }

  // 提取认证信息（从描述+标签中提取 vegan/gluten-free/non-GMO/kosher/nut-free 等关键词）
  const certifications = extractCertifications(description + ' ' + (product.tags || []).join(' '));

  // 构造 meta 信息
  const metaInfo = {
    title: product.title,
    description: description.slice(0, 2000), // 从300增加到2000，保留完整描述
    ogTitle: product.title,
    ogDescription: '',
    ogImage: (product.images && product.images[0]) ? product.images[0].src : '',
    ogType: 'product',
    canonical: url,
  };

  return {
    url,
    title: product.title,
    description: description.slice(0, 2000), // 使用完整描述（最多2000字符）
    certifications, // 新增：认证信息
    price,
    imageAlts,
    structuredData: product,
    metaInfo,
    variants: (product.variants || []).map(v => ({
      title: v.title,
      price: v.price,
      available: v.available,
    })),
    faqContent: [],
    reviewContent: [],
    pageText: pageText.slice(0, 8000),
    hasSchemaMarkup: !!product,
    canonicalUrl: url,
    storeLocator: detectStoreLocator(pageText),
    html_length: pageText.length,
    _source: 'json_api', // 标记数据来源
  };
}

/**
 * 策略2：通过正则从 HTML 中提取内容（降级方案）
 */
async function scrapeViaHtml(url) {
  const response = await fetch(url, {
    headers: {
      ...COMMON_HEADERS,
      'Accept-Encoding': 'identity',
    },
    signal: AbortSignal.timeout(6000),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} (${response.statusText}): Failed to fetch the page`);
  }

  const html = await response.text();

  // 提取产品标题
  const h1 = extractH1(html);
  const ogTitle = extractMetaTag(html, /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    || extractMetaTag(html, /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = h1 || ogTitle || (titleMatch ? stripHtml(titleMatch[1], 500) : 'Unknown Product');

  // 提取产品描述
  const metaDesc = extractMetaTag(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    || extractMetaTag(html, /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const ogDesc = extractMetaTag(html, /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    || extractMetaTag(html, /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  const description = metaDesc || ogDesc || '';

  const price = extractPrice(html);
  const imageAlts = extractImageAlts(html);
  const structuredData = extractJsonLd(html);

  const metaInfo = {
    title: extractMetaTag(html, /<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["']/i) || title,
    description,
    ogTitle: ogTitle || '',
    ogDescription: ogDesc || '',
    ogImage: extractMetaTag(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || extractMetaTag(html, /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i),
    ogType: extractMetaTag(html, /<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/i)
      || extractMetaTag(html, /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:type["']/i),
    canonical: extractMetaTag(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
      || extractMetaTag(html, /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i),
  };

  const pageText = stripHtml(html, 8000);
  const hasSchemaMarkup = /<script[^>]*type=["']application\/ld\+json["']/i.test(html);
  const canonicalUrl = metaInfo.canonical || '';

  return {
    url,
    title,
    description,
    price,
    imageAlts,
    structuredData,
    metaInfo,
    variants: [],
    faqContent: [],
    reviewContent: [],
    pageText,
    hasSchemaMarkup,
    canonicalUrl,
    storeLocator: detectStoreLocator(html),
    certifications: extractCertifications(html),
    html_length: html.length,
    _source: 'html_scrape',
  };
}

/**
 * 策略1.5：通过 ScraperAPI 代理抓取（备用反爬方案）
 * ScraperAPI 免费版每月 1000 次调用
 * 需要环境变量 SCRAPERAPI_KEY
 */
async function scrapeViaScraperAPI(url) {
  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey) {
    throw new Error('SCRAPERAPI_KEY not configured');
  }

  const response = await fetch(`http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`, {
    headers: { 'Accept': 'text/html' },
    signal: AbortSignal.timeout(6000),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`ScraperAPI returned ${response.status}`);
  }

  const html = await response.text();
  if (!html || html.length < 500) {
    throw new Error('ScraperAPI returned empty or too short content');
  }

  // 复用 HTML 解析逻辑提取数据
  const title = extractH1(html) || extractMetaTag(html, /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || 'Unknown Product';
  const description = extractMetaTag(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || '';
  const price = extractPrice(html);
  const imageAlts = extractImageAlts(html);
  const structuredData = extractJsonLd(html);
  const ogTitle = extractMetaTag(html, /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || '';
  const ogDescription = extractMetaTag(html, /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || '';
  const ogImage = extractMetaTag(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || '';
  const canonical = extractMetaTag(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || url;

  const pageText = stripHtml(html, 6000);
  const hasSchemaMarkup = /<script[^>]*type=["']application\/ld\+json["']/i.test(html);

  return {
    url, title, description, price, imageAlts, structuredData,
    metaInfo: { title, description, ogTitle, ogDescription, ogImage, ogType: 'product', canonical },
    variants: [],
    faqContent: [],
    reviewContent: [],
    pageText,
    hasSchemaMarkup,
    canonicalUrl: canonical,
    storeLocator: detectStoreLocator(html),
    certifications: extractCertifications(html),
    html_length: html.length,
    _source: 'scraperapi',
  };
}

// ---- 辅助正则提取函数 ----

function extractMetaTag(html, pattern) {
  const match = html.match(pattern);
  return match ? (match[1] || match[2] || '').trim() : '';
}

function extractJsonLd(html) {
  const results = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      results.push(data);
    } catch {}
  }
  return results;
}

function stripHtml(html, maxLength = 8000) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function extractH1(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (match) return stripHtml(match[1], 500);
  return '';
}

function extractImageAlts(html) {
  const alts = [];
  const regex = /<img[^>]*alt=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const alt = match[1].trim();
    if (alt && alt.length > 2) alts.push(alt);
  }
  return [...new Set(alts)].slice(0, 10);
}

function extractPrice(html) {
  const jsonLd = extractJsonLd(html);
  for (const data of jsonLd) {
    if (data.offers?.price) return `$${data.offers.price}`;
    if (data.offers?.lowPrice) return `$${data.offers.lowPrice}`;
  }
  const priceMatch = html.match(/(?:price|Price)[^0-9]*?\$?(\d+(?:\.\d{2})?)/);
  if (priceMatch) return `$${priceMatch[1]}`;
  return 'Price not found';
}

/**
 * 从文本中提取认证信息（vegan/gluten-free/non-GMO/kosher 等）
 * 认证徽章通常是图片/SVG，无法被文本抓取器读取
 * 但描述文本中通常会提到这些认证关键词
 */
function extractCertifications(text) {
  if (!text) return [];
  const certs = [];
  const lower = text.toLowerCase();
  if (/gluten[- ]?free|celiac/i.test(lower)) certs.push('Gluten-Free');
  if (/vegan/i.test(lower)) certs.push('Vegan');
  if (/non[- ]?gmo/i.test(lower)) certs.push('Non-GMO');
  if (/dairy[- ]?free|lactose[- ]?free/i.test(lower)) certs.push('Dairy-Free');
  if (/nut[- ]?free|peanut[- ]?free|tree[- ]?nut.*free/i.test(lower)) certs.push('Nut-Free');
  if (/soy[- ]?free/i.test(lower)) certs.push('Soy-Free');
  if (/kosher|ou certified/i.test(lower)) certs.push('Kosher');
  if (/top 9 allergens|free of.*allergen|allergen[- ]?free/i.test(lower)) certs.push('Top-9-Allergen-Free');
  // 去重
  return [...new Set(certs)];
}

/**
 * 检测页面是否包含门店定位元素（Store Locator / Find Near You）
 * 用户经常在 AI 中询问"某某街道附近哪里可以买到某某产品"
 */
function detectStoreLocator(html) {
  const lower = html.toLowerCase();
  const patterns = [
    'find near you', 'find near me', 'store locator', 'find a store',
    'find store', 'store finder', 'available in stores', 'available at',
    'shop at ', 'buy in store', 'retail locations', 'where to buy',
    'find a retailer', 'dealer locator', 'store locations',
  ];
  const urlPatterns = ['/store-locator', '/find-a-store', '/store-locations', '/where-to-buy', '/retailers'];
  const found = [];
  for (const p of patterns) {
    if (lower.includes(p)) found.push(p);
  }
  for (const u of urlPatterns) {
    if (lower.includes(u)) found.push(`url:${u}`);
  }
  return found;
}

/**
 * 策略3：通过 Shopify 店铺根 /products.json 搜索匹配产品
 */
async function scrapeViaStoreJson(url) {
  const parsed = new URL(url);
  const storeUrl = `${parsed.protocol}//${parsed.host}`;
  
  // 从 URL 提取产品 handle
  const handleMatch = url.match(/\/products\/([^/?]+)/);
  if (!handleMatch) throw new Error('No product handle in URL');
  const handle = handleMatch[1];

  // 先尝试 /products.json?handle=xxx（Shopify 支持 handle 过滤）
  const response = await fetch(`${storeUrl}/products.json?handle=${handle}&limit=1`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': COMMON_HEADERS['User-Agent'],
    },
    signal: AbortSignal.timeout(6000),
    redirect: 'follow',
  });

  if (!response.ok) throw new Error(`Store products.json returned ${response.status}`);
  
  const data = await response.json();
  const products = data.products || [];
  if (products.length === 0) throw new Error('Product not found in store JSON');
  
  const product = products[0];
  
  // 验证返回的产品 handle 是否与 URL 中的 handle 匹配
  // Shopify 的 ?handle= 过滤有时会返回不相关的产品
  if (product.handle && product.handle !== handle) {
    throw new Error(`Handle mismatch: expected "${handle}", got "${product.handle}"`);
  }
  
  // 复用 scrapeViaJson 的结果格式化逻辑
  const description = product.body_html
    ? product.body_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  const imageAlts = (product.images || []).map(img => (img.alt || '').trim()).filter(a => a.length > 2).slice(0, 10);
  let price = 'Price not found';
  if (product.variants && product.variants.length > 0) {
    const p = product.variants[0].price;
    if (p) price = `$${p}`;
  }
  
  let pageText = `Product: ${product.title}\nVendor: ${product.vendor || 'Unknown'}\nType: ${product.product_type || 'Unknown'}\nPrice: ${price}\nTags: ${(product.tags || []).join(', ')}\nDescription: ${description}\n`;
  if (imageAlts.length) pageText += `Image descriptions: ${imageAlts.join('; ')}\n`;

  return {
    url,
    title: product.title,
    description,
    price,
    imageAlts,
    structuredData: product,
    metaInfo: { title: product.title, description: '', ogTitle: product.title, ogDescription: '', ogImage: (product.images?.[0])?.src || '', ogType: 'product', canonical: url },
    variants: (product.variants || []).map(v => ({ title: v.title, price: v.price, available: v.available })),
    faqContent: [],
    reviewContent: [],
    pageText: pageText.slice(0, 8000),
    hasSchemaMarkup: true,
    canonicalUrl: url,
    storeLocator: detectStoreLocator(pageText),
    certifications: extractCertifications(description + ' ' + (product.tags || []).join(' ')),
    html_length: pageText.length,
    _source: 'store_json',
  };
}

/**
 * 辅助函数：将 Shopify JSON product 对象格式化为统一的抓取结果
 */
function formatShopifyProduct(product, url, source) {
  const description = product.body_html
    ? product.body_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  const imageAlts = (product.images || [])
    .map(img => (img.alt || '').trim())
    .filter(a => a && a.length > 2)
    .slice(0, 10);
  let price = 'Price not found';
  if (product.variants && product.variants.length > 0) {
    const p = product.variants[0].price;
    if (p) price = `$${p}`;
  }

  let pageText = `Product: ${product.title}\n`;
  pageText += `Vendor: ${product.vendor || 'Unknown'}\n`;
  pageText += `Type: ${product.product_type || 'Unknown'}\n`;
  pageText += `Price: ${price}\n`;
  pageText += `Tags: ${(product.tags || []).join(', ')}\n`;
  pageText += `Description: ${description}\n`;
  if (product.options) {
    pageText += `Options: ${product.options.map(o => `${o.name}: ${(o.values || []).join(', ')}`).join('; ')}\n`;
  }
  if (imageAlts.length) pageText += `Image descriptions: ${imageAlts.join('; ')}\n`;

  const metaInfo = {
    title: product.title,
    description: description.slice(0, 300),
    ogTitle: product.title,
    ogDescription: '',
    ogImage: (product.images && product.images[0]) ? product.images[0].src : '',
    ogType: 'product',
    canonical: url,
  };

  return {
    url,
    title: product.title,
    description: metaInfo.description,
    price,
    imageAlts,
    structuredData: product,
    metaInfo,
    variants: (product.variants || []).map(v => ({
      title: v.title,
      price: v.price,
      available: v.available,
    })),
    faqContent: [],
    reviewContent: [],
    pageText: pageText.slice(0, 8000),
    hasSchemaMarkup: true,
    canonicalUrl: url,
    storeLocator: detectStoreLocator(pageText),
    certifications: extractCertifications(pageText),
    html_length: pageText.length,
    _source: source,
  };
}

/**
 * 策略5：通过 .myshopify.com 后端域名获取产品数据
 * 适用于使用自定义前端（如 Next.js + AWS WAF）但仍以 Shopify 为后端的品牌店铺
 * 例如 Gymshark（www.gymshark.com → gymshark.myshopify.com）
 */
async function scrapeViaMyshopifyFallback(url) {
  const parsed = new URL(url);
  const handleMatch = url.match(/\/products\/([^/?]+)/);
  if (!handleMatch) throw new Error('No product handle in URL');
  const handle = handleMatch[1];

  // 从域名推导 myshopify.com 域名
  let hostname = parsed.hostname.replace(/^www\./, '');
  let brandName = hostname.split('.')[0]; // e.g., 'gymshark' from 'gymshark.com'

  // 候选 myshopify 域名（常见模式）
  const candidates = [
    `${brandName}.myshopify.com`,
    `${brandName.replace(/-/g, '')}.myshopify.com`,
    `${brandName.replace(/\./g, '-')}.myshopify.com`,
  ];
  // 去重
  const uniqueCandidates = [...new Set(candidates)];

  for (const myshopifyDomain of uniqueCandidates) {
    try {
      const jsonUrl = `https://${myshopifyDomain}/products/${handle}.json`;
      const response = await fetch(jsonUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': COMMON_HEADERS['User-Agent'],
        },
        signal: AbortSignal.timeout(6000),
        redirect: 'follow',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.product && data.product.title) {
          return formatShopifyProduct(data.product, url, 'myshopify_fallback');
        }
      }
    } catch (e) {
      // Try next candidate
    }
  }

  throw new Error(`myshopify fallback failed for ${uniqueCandidates.join(', ')}`);
}

/**
 * 错误分类：分析抓取失败原因，返回用户友好的错误信息
 */
export function classifyScrapeError(url, errors) {
  const errorText = errors.join(' | ').toLowerCase();
  const errorCodes = errors.map(e => {
    const m = e.match(/(\d{3})/);
    return m ? parseInt(m[1]) : null;
  }).filter(Boolean);

  const allNotFound = errorCodes.length > 0 && errorCodes.every(c => c === 404);
  const has403 = errorCodes.some(c => c === 403);
  const has401 = errorCodes.some(c => c === 401);
  const hasStrongProtection = has403 && (errorText.includes('jina') || errorText.includes('scraperapi'));

  if (allNotFound) {
    return {
      type: 'NOT_FOUND',
      title: 'Product Not Found',
      message: 'We couldn\'t find this product page. The product may have been removed, renamed, or the URL might be incorrect.',
      suggestions: [
        'Double-check that the URL is spelled correctly',
        'Visit the store directly and copy the product URL from the address bar again',
        'Make sure the product hasn\'t been discontinued or sold out',
      ],
    };
  }

  if (hasStrongProtection || (has403 && has401)) {
    return {
      type: 'ANTI_BOT',
      title: 'Advanced Store Protection',
      message: 'This store uses advanced security protection (such as Cloudflare or AWS WAF) that blocks automated page access. This is a store-side restriction, not an issue with our tool.',
      suggestions: [
        'Try a different product URL from the same store',
        'Try a product from another Shopify store',
        'If you own this store, temporarily disable bot protection and try again',
      ],
    };
  }

  if (has403 || has401) {
    return {
      type: 'ACCESS_DENIED',
      title: 'Access Restricted',
      message: 'This store restricts automated access to its product pages. Our scraping tools were unable to bypass the store\'s security settings.',
      suggestions: [
        'Try a different product from another Shopify store',
        'If this is your store, check your bot protection settings',
      ],
    };
  }

  return {
    type: 'GENERIC',
    title: 'Unable to Access Page',
    message: 'We couldn\'t access this product page. The store may be temporarily unavailable, undergoing maintenance, or blocking automated access.',
    suggestions: [
      'Try again in a few minutes',
      'Try a different product URL',
      'Make sure the store is still online and the product exists',
    ],
  };
}

/**
 * 抓取质量门控：判断一次抓取结果是否足够完整可用。
 * 反爬常返回残缺页（内容极短、或只剩 $1 这类异常低价），
 * 直接评分会产生假低分、污染复查对比，故不可用时继续尝试下一通道。
 */
function isScrapeUsable(result) {
  if (!result) return false;
  const text = result.pageText || result.description || '';
  if (!text || text.replace(/\s+/g, '').length < 350) return false;
  if (result.price) {
    const m = String(result.price).match(/\$?\s*([0-9]+(?:\.[0-9]+)?)/);
    if (m && parseFloat(m[1]) <= 1) return false;
  }
  return true;
}

/**
 * 主入口：抓取产品页面 - 多重策略 + 质量门控
 * 优先 JSON API，任何通道结果不完整则继续尝试下一通道。
 * @param {string} url - 产品页面 URL
 * @returns {object} 抓取到的产品数据
 */
export async function scrapeProductPage(url) {
  const errors = [];

  // 策略0：Shopify 产品级 JSON API（最稳定，公开接口，不受 Cloudflare 影响）
  // 几乎所有 Shopify 店铺都支持 /products/[handle].json
  if (url.includes('/products/')) {
    try {
      const r0 = await scrapeViaJson(url);
      if (isScrapeUsable(r0)) return r0;
      errors.push('JSON: incomplete result, trying next strategy');
    } catch (e) {
      errors.push(`JSON: ${e.message}`);
    }

    // 策略0.5：店铺级 JSON 接口
    try {
      const r05 = await scrapeViaStoreJson(url);
      if (isScrapeUsable(r05)) return r05;
      errors.push('StoreJSON: incomplete result, trying next strategy');
    } catch (e) {
      errors.push(`StoreJSON: ${e.message}`);
    }
  }

  // 策略1：Jina Reader 代理抓取（绕过 Cloudflare 反爬，免费无需Key）
  try {
    const r1 = await scrapeViaJinaReader(url);
    if (isScrapeUsable(r1)) return r1;
    errors.push('JinaReader: incomplete result, trying next strategy');
  } catch (e) {
    errors.push(`JinaReader: ${e.message}`);
  }

  // 策略1.5：ScraperAPI 备用代理抓取
  if (process.env.SCRAPERAPI_KEY) {
    try {
      const r15 = await scrapeViaScraperAPI(url);
      if (isScrapeUsable(r15)) return r15;
      errors.push('ScraperAPI: incomplete result, trying next strategy');
    } catch (e) {
      errors.push(`ScraperAPI: ${e.message}`);
    }
  }

  // 策略4：降级到 HTML 直接抓取
  try {
    const r4 = await scrapeViaHtml(url);
    if (isScrapeUsable(r4)) return r4;
    errors.push('HTML: incomplete result, trying next strategy');
  } catch (e) {
    errors.push(`HTML: ${e.message}`);
  }

  // 策略5：通过 .myshopify.com 后端域名获取（绕过自建前端反爬）
  // 适用于 Gymshark 等使用 Shopify 后端 + 自定义前端 + WAF 的品牌
  if (url.includes('/products/')) {
    try {
      const r5 = await scrapeViaMyshopifyFallback(url);
      if (isScrapeUsable(r5)) return r5;
      errors.push('MyshopifyFallback: incomplete result');
    } catch (e) {
      errors.push(`MyshopifyFallback: ${e.message}`);
    }
  }

  // 所有策略失败或均不完整，抛出分类后的错误
  const classified = classifyScrapeError(url, errors);
  const err = new Error(classified.message);
  err.errorType = classified.type;
  err.errorTitle = classified.title;
  err.suggestions = classified.suggestions;
  err.allErrors = errors;
  throw err;
}

// ============ SSRF 防护 ============

// IPv4 私有/保留段（CIDR，字节比较）；启动时预解析为 32 位整数与掩码
const IPV4_BLOCKED_RANGES_RAW = [
  ['0.0.0.0', 8],        // 0.0.0.0/8 "本网络"
  ['10.0.0.0', 8],       // 私网
  ['100.64.0.0', 10],    // CGNAT
  ['127.0.0.0', 8],      // loopback
  ['169.254.0.0', 16],   // link-local（含云元数据 169.254.169.254）
  ['172.16.0.0', 12],    // 私网
  ['192.0.0.0', 24],     // IETF 协议保留
  ['192.0.2.0', 24],     // TEST-NET-1
  ['192.88.99.0', 24],   // 6to4 中继任播（已废弃，保留）
  ['192.168.0.0', 16],   // 私网
  ['198.18.0.0', 15],    // 基准测试
  ['198.51.100.0', 24],  // TEST-NET-2
  ['203.0.113.0', 24],   // TEST-NET-3
  ['224.0.0.0', 4],      // 组播
  ['240.0.0.0', 4],      // 保留（含 255.255.255.255 广播）
];
const IPV4_BLOCKED_RANGES = IPV4_BLOCKED_RANGES_RAW.map(([base, prefix]) => ({
  base: parseIpv4(base),
  mask: (0xffffffff << (32 - prefix)) >>> 0,
}));

// IPv6 私域/保留段在 buildIpv6Ranges() 中以 BigInt 数值区间构建

function buildIpv6Ranges() {
  const ranges = [];
  // ::ffff:0:0/96 IPv4-mapped —— 最后 32 位按 IPv4 规则逐段判断
  ranges.push([0xffff00000000n, 0xffffffffffffffffn]);
  // ::1/128 loopback
  ranges.push([0x1n, 0x1n]);
  // ::/128 unspecified
  ranges.push([0x0n, 0x0n]);
  // 64:ff9b::/96（NAT64，内嵌 IPv4，同样按 IPv4 规则判定时单独处理）
  ranges.push([0x0064ff9b000000000000000000000000n, 0x0064ff9b00000000ffffffffffffffffn]);
  // 100::/64 丢弃前缀
  ranges.push([0x01000000000000000000000000000000n, 0x0100000000000000ffffffffffffffffn]);
  // 2001::/32 Teredo（隧道，可被用来触达内网映射）
  ranges.push([0x20010000000000000000000000000000n, 0x20010000ffffffffffffffffffffffffn]);
  // 2001:db8::/32 文档示例
  ranges.push([0x20010db8000000000000000000000000n, 0x20010db8ffffffffffffffffffffffffn]);
  // 2002::/16 6to4（内嵌 IPv4，下面按内嵌地址再判一次，整段先拦）
  ranges.push([0x20020000000000000000000000000000n, 0x2002ffffffffffffffffffffffffffffn]);
  // fc00::/7 unique local
  ranges.push([0xfc000000000000000000000000000000n, 0xfdffffffffffffffffffffffffffffffn]);
  // fe80::/10 link-local
  ranges.push([0xfe800000000000000000000000000000n, 0xfebfffffffffffffffffffffffffffffn]);
  // ff00::/8 组播
  ranges.push([0xff000000000000000000000000000000n, 0xffffffffffffffffffffffffffffffffn]);
  // 2000::/3 是目前唯一分配的全球单播区间，其外一律拦截（覆盖其他未分配/保留段）
  return {
    ranges,
    globalUnicastStart: 0x20000000000000000000000000000000n,
    globalUnicastEnd: 0x3fffffffffffffffffffffffffffffffn,
  };
}

const IPV6_DATA = buildIpv6Ranges();

/**
 * 把 IPv4 字符串解析为 32 位无符号整数；非法返回 null。
 * 同时拒绝八进制（前导 0）/十六进制（0x）等非标准写法的变体——
 * Node 的 URL 会把纯数字主机当 opaque name，但这里对所有形如 4 段数字的主机从严解析。
 */
function parseIpv4(str) {
  if (typeof str !== 'string') return null;
  const parts = str.split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    if (!/^(0|[1-9][0-9]*)$/.test(part)) return null; // 拒绝 01、0x7f 等写法
    const n = Number(part);
    if (n > 255) return null;
    result = (result * 256) + n;
  }
  return result >>> 0;
}

function ipv4InBlockedRanges(ipNum) {
  for (const range of IPV4_BLOCKED_RANGES) {
    if ((ipNum & range.mask) === (range.base & range.mask)) return true;
  }
  return false;
}

/**
 * 解析 IPv6 为 BigInt（支持 :: 压缩与内嵌 IPv4，如 ::ffff:127.0.0.1）
 */
function parseIpv6(str) {
  if (typeof str !== 'string' || str.length === 0) return null;
  let s = str.toLowerCase().replace(/^\[|\]$/g, '');
  if (s.includes('.')) {
    // 内嵌 IPv4：取出最后一段，转成两个 16 位组
    const lastColon = s.lastIndexOf(':');
    const v4Part = s.slice(lastColon + 1);
    const v4Num = parseIpv4(v4Part);
    if (v4Num === null) return null;
    s = s.slice(0, lastColon + 1) + ((v4Num >> 16) & 0xffff).toString(16) + ':' + (v4Num & 0xffff).toString(16);
  }
  const doubleColon = s.split('::');
  if (doubleColon.length > 2) return null;
  let head = [];
  let tail = [];
  if (doubleColon.length === 2) {
    head = doubleColon[0] ? doubleColon[0].split(':') : [];
    tail = doubleColon[1] ? doubleColon[1].split(':') : [];
  } else {
    head = s.split(':');
  }
  const groups = head.concat(new Array(8 - head.length - tail.length).fill('0')).concat(tail);
  if (groups.length !== 8) return null;
  let result = 0n;
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    result = (result << 16n) + BigInt(parseInt(g, 16));
  }
  return result;
}

/**
 * 判断 IP 字符串是否为私网/保留/回环/链路本地等不可信地址。
 * 支持 IPv4、IPv6 及 IPv4-mapped IPv6（::ffff:a.b.c.d）。
 */
export function isPrivateIp(ip) {
  if (!ip || typeof ip !== 'string') return true;
  const trimmed = ip.replace(/^\[|\]$/g, '').trim();
  if (!trimmed) return true;

  // 先按 IPv4 解析
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) {
    const num = parseIpv4(trimmed);
    if (num === null) return true;
    return ipv4InBlockedRanges(num);
  }

  // IPv6
  const big = parseIpv6(trimmed);
  if (big === null) return true;

  // IPv4-mapped IPv6（::ffff:a.b.c.d）：提取内嵌 IPv4 再判
  if (big >= 0xffff00000000n && big <= 0xffffffffffffffffn) {
    const v4Num = Number(big & 0xffffffffn) >>> 0;
    return ipv4InBlockedRanges(v4Num);
  }
  // NAT64 前缀 64:ff9b::/96 内嵌 IPv4
  if (big >= 0x0064ff9b000000000000000000000000n && big <= 0x0064ff9b00000000ffffffffffffffffn) {
    const v4Num = Number(big & 0xffffffffn) >>> 0;
    return ipv4InBlockedRanges(v4Num);
  }

  for (const [start, end] of IPV6_DATA.ranges) {
    if (big >= start && big <= end) return true;
  }
  // 2000::/3 之外（非全球单播）一律视为不可信
  if (big < IPV6_DATA.globalUnicastStart || big > IPV6_DATA.globalUnicastEnd) return true;

  return false;
}

/**
 * 主机名是否为 IP 字面量（含十进制/十六进制/八进制整数、点分十进制、IPv6）
 */
function isIpLiteral(hostname) {
  if (net.isIP(hostname)) return true;
  // 纯整数形式（如 2130706433 = 127.0.0.1，0x7f000001，017700000001）
  if (/^(0x[0-9a-f]+|0[0-7]+|\d+)$/i.test(hostname)) return true;
  // 点分但每段允许 hex/octal/单整数的非标准 IPv4 写法（Node 不解析但要拦）
  if (/^[0-9a-fx.]+\.([0-9a-fx.]+)$/i.test(hostname) && hostname.split('.').every(p => /^(0x[0-9a-f]+|0[0-7]+|\d+)$/i.test(p))) {
    return true;
  }
  return false;
}

/**
 * 验证 URL 是否为可安全抓取的 Shopify「产品详情页」（async）
 * 规则：
 *   1. 仅 http/https 协议；
 *   2. 拒绝 localhost、.local、.internal 结尾主机名、IP 字面量；
 *   3. 路径必须包含 /products/<handle>；
 *   4. DNS 解析（3 秒超时）后的任一 A/AAAA 落在私网/保留段即拒绝；
 *   5. DNS 失败/超时按不可信拒绝。
 * @returns {Promise<boolean>}
 */
export async function isValidShopifyUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, '');
  if (!hostname || !hostname.includes('.')) return false;

  // 拒绝本机/内网域名
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return false;
  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return false;

  // 拒绝一切 IP 字面量主机（含十进制/十六进制/八进制变体）
  if (isIpLiteral(hostname)) return false;

  // 必须是 /products/<handle>，handle 非空
  const match = parsed.pathname.match(/\/products\/([^/?#]+)/);
  if (!match || match[1].length === 0) return false;

  // DNS 解析 + 私网 IP 校验（3 秒超时，失败即拒绝）
  let addresses;
  try {
    // lookup 的 signal 选项（Node 16+）在超时时中断底层解析，
    // 避免 Promise.race 的悬挂定时器拖住 serverless 实例冻结
    addresses = await dns.lookup(hostname, { all: true, signal: AbortSignal.timeout(3000) });
  } catch {
    return false;
  }
  if (!Array.isArray(addresses) || addresses.length === 0) return false;
  for (const entry of addresses) {
    if (!entry || !entry.address || isPrivateIp(entry.address)) return false;
  }

  return true;
}

// 非产品页关键词：目录页 / 政策页 / 服务条款 / 账号等页面标题或 URL 常见词
const NON_PRODUCT_HINTS = [
  'return policy', 'returns policy', 'shipping policy', 'privacy policy',
  'terms of service', 'terms and conditions', 'refund policy', 'contact us',
  'about us', 'faq', 'frequently asked', 'size guide', 'size chart',
  'track order', 'track your order', 'free returns', 'return coverage',
  'all products', 'view all', 'collection:', 'shop all',
];

/**
 * 判断抓取到的内容是否真的是一个「产品详情页」。
 * 防止大站抓取到目录页/政策页内容后被误当成产品，生成荒谬的买家搜索词。
 * 只有明显是「非产品页」时才返回 false，避免误伤真实但内容简陋的店铺。
 */
export function looksLikeProductPage(productData, url) {
  if (!productData || typeof productData !== 'object') return false;

  // 强产品信号（任一即可）：有真实价格、有变体、有 Product 结构化数据
  const hasPrice = productData.price &&
    !/not found|unknown|price/i.test(String(productData.price));
  const hasVariants = Array.isArray(productData.variants) && productData.variants.length > 0;
  let hasProductSchema = false;
  const sd = productData.structuredData;
  if (Array.isArray(sd)) {
    hasProductSchema = sd.some(function(item) {
      const t = item && (item['@type'] || item.type);
      return t === 'Product' || (Array.isArray(t) && t.includes('Product'));
    });
  }
  if (hasPrice || hasVariants || hasProductSchema) return true;

  // 兜底：标题明显是政策/目录类页面 → 判定非产品页
  const title = String(productData.title || '').toLowerCase();
  const isHintTitle = NON_PRODUCT_HINTS.some(function(h) { return title.includes(h); });
  if (isHintTitle) return false;

  // 标题是通用占位词
  if (!title || title === 'unknown product' || title === 'product not found') return false;

  // 有标题但缺少强信号：放行（真实小店铺可能确实简陋），交给 AI 分析
  return true;
}

/**
 * 构造「非产品详情页」的结构化错误（供 API 层使用）
 */
export function nonProductPageError() {
  return {
    message: 'This link is not a specific product page, so we cannot measure its AI search visibility. Please paste a link to one individual product.',
    errorType: 'NOT_PRODUCT_PAGE',
    errorTitle: 'Please use a product link',
    suggestions: [
      'Open the product you want to check in your store',
      'Copy the link from your browser address bar — it should contain /products/',
      'Example: https://yourstore.com/products/your-product-name',
    ],
  };
}
