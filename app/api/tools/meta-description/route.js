import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * POST /api/tools/meta-description
 * Body: { url: string }
 * Fetches a Shopify product page, extracts meta description + title,
 * and generates 3 optimized meta description suggestions.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the page HTML
    let html;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MyGEOCheck/1.0; +https://mygeocheck.com)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch page (HTTP ${res.status})` }, { status: 422 });
      }

      html = await res.text();
    } catch (err) {
      if (err.name === 'AbortError') {
        return NextResponse.json({ error: 'Page took too long to load. Please try again.' }, { status: 504 });
      }
      return NextResponse.json({ error: 'Could not fetch the page. Check the URL and try again.' }, { status: 422 });
    }

    // Parse HTML with regex
    const pageTitle = extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || '';
    const ogTitle = extractMeta(html, 'og:title') || '';
    const metaDescription = extractMeta(html, 'description') || '';
    const ogDescription = extractMeta(html, 'og:description') || '';

    const productTitle = ogTitle || pageTitle || 'Product';
    const productDescription = ogDescription || metaDescription || '';

    // Extract store name from hostname
    let storeName = '';
    try {
      storeName = parsedUrl.hostname.replace('www.', '').replace('.myshopify.com', '').split('.')[0];
      storeName = storeName.charAt(0).toUpperCase() + storeName.slice(1).replace(/-/g, ' ');
    } catch {
      storeName = 'Store';
    }

    // Generate 3 optimized meta descriptions using templates
    const suggestions = generateSuggestions(productTitle, productDescription, storeName, parsedUrl);

    return NextResponse.json({
      currentMeta: metaDescription,
      currentLength: metaDescription.length,
      productTitle,
      pageTitle,
      suggestions,
    });
  } catch (err) {
    console.error('[MetaDescription API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Extract content from an HTML tag using regex
 */
function extractTag(html, regex) {
  const match = html.match(regex);
  if (!match || !match[1]) return '';
  return decodeHtmlEntities(match[1].trim());
}

/**
 * Extract meta tag content by name or property
 */
function extractMeta(html, name) {
  // Try name="description"
  const nameRegex = new RegExp(
    '<meta[^>]+name=["\']' + escapeRegex(name) + '["\'][^>]+content=["\']([^"\']*)["\']',
    'i'
  );
  const nameMatch = html.match(nameRegex);
  if (nameMatch && nameMatch[1]) return decodeHtmlEntities(nameMatch[1].trim());

  // Try property="og:xxx"
  const propRegex = new RegExp(
    '<meta[^>]+property=["\']' + escapeRegex('og:' + name.replace('og:', '')) + '["\'][^>]+content=["\']([^"\']*)["\']',
    'i'
  );
  const propMatch = html.match(propRegex);
  if (propMatch && propMatch[1]) return decodeHtmlEntities(propMatch[1].trim());

  // Try reversed attribute order: content before name/property
  const revNameRegex = new RegExp(
    '<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']' + escapeRegex(name) + '["\']',
    'i'
  );
  const revNameMatch = html.match(revNameRegex);
  if (revNameMatch && revNameMatch[1]) return decodeHtmlEntities(revNameMatch[1].trim());

  const revPropRegex = new RegExp(
    '<meta[^>]+content=["\']([^"\']*)["\'][^>]+property=["\']' + escapeRegex('og:' + name.replace('og:', '')) + '["\']',
    'i'
  );
  const revPropMatch = html.match(revPropRegex);
  if (revPropMatch && revPropMatch[1]) return decodeHtmlEntities(revPropMatch[1].trim());

  return '';
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * Generate 3 optimized meta descriptions within 120-160 chars
 */
function generateSuggestions(title, description, storeName, parsedUrl) {
  const suggestions = [];
  const shortTitle = title.length > 40 ? title.substring(0, 40).trim() : title;
  const snippet = description.length > 60 ? description.substring(0, 60).trim() + '...' : (description || 'High-quality product');

  // Template 1: Product Name — Key Feature. Benefit. CTA
  const t1 = `${shortTitle} — ${snippet} Shop now at ${storeName}.`;
  suggestions.push(trimToRange(t1, 120, 160));

  // Template 2: Discover + feature + USP
  const featureWord = extractFeatureWord(description);
  const t2 = `Discover ${shortTitle} with ${featureWord}. ${snippet} Free shipping. Buy today!`;
  suggestions.push(trimToRange(t2, 120, 160));

  // Template 3: By store + snippet + social proof
  const t3 = `${shortTitle} by ${storeName} — ${snippet} Rated by customers. Order now!`;
  suggestions.push(trimToRange(t3, 120, 160));

  return suggestions;
}

/**
 * Trim or pad a string to fit within min-max character range
 */
function trimToRange(str, min, max) {
  if (str.length <= max) return str;
  // Truncate and add ellipsis
  return str.substring(0, max - 3).trim() + '...';
}

/**
 * Extract a feature keyword from description
 */
function extractFeatureWord(description) {
  if (!description) return 'premium quality';
  const words = description.split(/\s+/).slice(0, 5);
  const meaningful = words.find(w => w.length > 4 && !['about', 'this', 'that', 'with', 'from', 'your'].includes(w.toLowerCase()));
  return meaningful ? meaningful.toLowerCase() : 'premium quality';
}
