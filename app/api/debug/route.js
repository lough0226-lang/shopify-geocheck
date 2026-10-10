// 调试用 - 诊断抓取失败的具体原因
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TEST_URLS = [
  'https://allbirds.com/products/mens-tree-dash-2-blizzard',
  'https://www.gymshark.com/products/gymshark-apex-20-short-black',
  'https://kittyandchicken.com/products/kawara-tube-socks-black',
];

export async function GET(request) {
  const results = [];
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'identity',
  };

  for (const url of TEST_URLS) {
    const jsonUrl = url.replace(/\/products\/([^/?]+).*/, '/products/$1.json');
    
    // Test 1: Jina Reader (代理抓取，绕过 Cloudflare)
    let jinaResult = {};
    try {
      const jinaUrl = `https://r.jina.ai/${url}`;
      const res = await fetch(jinaUrl, {
        headers: { 'Accept': 'text/markdown', 'X-Return-Format': 'text' },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });
      jinaResult = {
        url: jinaUrl,
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
      };
      if (res.ok) {
        const text = await res.text();
        jinaResult.bodyLength = text.length;
        jinaResult.preview = text.slice(0, 300);
        jinaResult.hasContent = text.length > 100;
      }
    } catch (e) {
      jinaResult = { error: e.message };
    }

    // Test 2: HTML 直接抓取
    let htmlResult = {};
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000), redirect: 'follow' });
      htmlResult = {
        status: res.status,
        statusText: res.statusText,
        finalUrl: res.url,
        redirected: res.redirected,
        contentType: res.headers.get('content-type') || 'none',
        ok: res.ok,
      };
      if (res.ok) {
        const text = await res.text();
        htmlResult.bodyLength = text.length;
        htmlResult.isShopify = text.includes('Shopify') || text.includes('shopify');
        htmlResult.hasProducts = text.includes('/products/');
        htmlResult.title = (text.match(/<title>(.*?)<\/title>/i) || [])[1] || 'none';
      }
    } catch (e) {
      htmlResult = { error: e.message };
    }

    // Test 3: JSON 直接抓取
    let jsonResult = {};
    try {
      const res = await fetch(jsonUrl, {
        headers: { ...headers, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
        redirect: 'follow',
      });
      jsonResult = {
        url: jsonUrl,
        status: res.status,
        statusText: res.statusText,
        contentType: res.headers.get('content-type') || 'none',
        ok: res.ok,
      };
      if (res.ok) {
        const text = await res.text();
        jsonResult.bodyLength = text.length;
        try {
          const data = JSON.parse(text);
          jsonResult.hasProduct = !!data.product;
          jsonResult.productTitle = data.product?.title || 'none';
        } catch {
          jsonResult.parseError = 'Invalid JSON';
          jsonResult.preview = text.slice(0, 200);
        }
      }
    } catch (e) {
      jsonResult = { error: e.message };
    }

    results.push({ url, jina: jinaResult, html: htmlResult, json: jsonResult });
  }

  // Server info
  const serverInfo = {
    nodeVersion: process.version,
    runtime: process.env.NEXT_RUNTIME || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    env: process.env.VERCEL_ENV || 'unknown',
  };

  return NextResponse.json({ serverInfo, results, timestamp: new Date().toISOString() });
}
