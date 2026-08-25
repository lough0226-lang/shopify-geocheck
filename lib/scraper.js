// 抓取 Shopify 产品页面内容 - 多重策略
// 优先使用 Jina Reader / ScraperAPI 代理，失败时降级到 Shopify JSON / HTML

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
    signal: AbortSignal.timeout(7000),
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
    signal: AbortSignal.timeout(15000),
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

  // 构造 meta 信息
  const metaInfo = {
    title: product.title,
    description: product.body_html ? product.body_html.replace(/<[^>]+>/g, '').slice(0, 300) : '',
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
    hasSchemaMarkup: !!product,
    canonicalUrl: url,
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
    signal: AbortSignal.timeout(15000),
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
    signal: AbortSignal.timeout(8000),
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
    signal: AbortSignal.timeout(15000),
    redirect: 'follow',
  });

  if (!response.ok) throw new Error(`Store products.json returned ${response.status}`);
  
  const data = await response.json();
  const products = data.products || [];
  if (products.length === 0) throw new Error('Product not found in store JSON');
  
  const product = products[0];
  
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
    html_length: pageText.length,
    _source: 'store_json',
  };
}

/**
 * 主入口：抓取产品页面 - 五重策略
 * 优先使用 JSON API（最稳定，不受 Cloudflare 影响）
 * @param {string} url - 产品页面 URL
 * @returns {object} 抓取到的产品数据
 */
export async function scrapeProductPage(url) {
  const errors = [];

  // 策略0：Shopify 产品级 JSON API（最稳定，公开接口，不受 Cloudflare 影响）
  // 几乎所有 Shopify 店铺都支持 /products/[handle].json
  if (url.includes('/products/')) {
    try {
      return await scrapeViaJson(url);
    } catch (e) {
      errors.push(`JSON: ${e.message}`);
    }

    // 策略0.5：店铺级 JSON 接口
    try {
      return await scrapeViaStoreJson(url);
    } catch (e) {
      errors.push(`StoreJSON: ${e.message}`);
    }
  }

  // 策略1：Jina Reader 代理抓取（绕过 Cloudflare 反爬，免费无需Key）
  try {
    return await scrapeViaJinaReader(url);
  } catch (e) {
    errors.push(`JinaReader: ${e.message}`);
  }

  // 策略1.5：ScraperAPI 备用代理抓取
  if (process.env.SCRAPERAPI_KEY) {
    try {
      return await scrapeViaScraperAPI(url);
    } catch (e) {
      errors.push(`ScraperAPI: ${e.message}`);
    }
  }

  // 策略4：降级到 HTML 直接抓取
  try {
    return await scrapeViaHtml(url);
  } catch (e) {
    errors.push(`HTML: ${e.message}`);
  }

  throw new Error(`All scraping methods failed. Details: ${errors.join(' | ')}`);
}

/**
 * 验证 URL 是否为 Shopify 产品页面
 */
export function isValidShopifyUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const isShopifyDomain = hostname.endsWith('.myshopify.com');
    const hasProductPath = parsed.pathname.includes('/products/');
    return isShopifyDomain || hasProductPath;
  } catch {
    return false;
  }
}
