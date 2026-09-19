// AI 分析提示词模板 - v22: 诊断+药方分离, 模拟搜索, 竞品对比
// 免费版给诊断（痛点），付费版给药方（解决方案）

/**
 * 安全地截断和清理文本
 */
function sanitize(text, maxLength = 800) {
  if (!text) return '';
  return String(text)
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
    .trim();
}

const LANGUAGE_NAMES = {
  en: 'English', zh: 'Chinese', de: 'German',
  fr: 'French', es: 'Spanish', pt: 'Portuguese',
};

/**
 * 构建分析提示词 - v22: 诊断+药方模式
 */
export function buildAnalysisPrompt(productData, productUrl, lang = 'en') {
  const title = sanitize(productData.title || 'Unknown', 200);
  const description = sanitize(productData.description || productData.pageText || '', 600);
  const price = sanitize(productData.price || 'Unknown', 50);
  const metaDesc = sanitize(productData.metaInfo?.description || '', 200);
  const ogTitle = sanitize(productData.metaInfo?.ogTitle || '', 200);
  const ogDesc = sanitize(productData.metaInfo?.ogDescription || '', 200);
  const canonical = sanitize(productData.canonicalUrl || '', 200);
  const hasSchemaMarkup = productData.hasSchemaMarkup ? 'Yes' : 'No';
  
  // 门店定位元素检测
  const storeLocator = productData.storeLocator || [];
  const storeLocatorStr = storeLocator.length > 0 
    ? `YES: ${storeLocator.join(', ')}` 
    : 'No store locator found';
  
  const imageAlts = (productData.imageAlts || [])
    .map(a => sanitize(a, 80))
    .filter(a => a.length > 2)
    .slice(0, 6);
  const imageAltsStr = imageAlts.length > 0 ? imageAlts.join('; ') : 'None found';

  const langInstruction = lang === 'en'
    ? '- ALL text values (verdict, diagnosis, paid_fixes, overall_recommendations, industry_benchmark.message) in English'
    : `- Output verdict, diagnosis (issue, impact), paid_fixes (fix), overall_recommendations, and industry_benchmark.message in ${LANGUAGE_NAMES[lang] || 'English'}
- Keep technical terms in English: GEO, SEO, schema markup, structured data, AI Overviews, Product schema, meta description, OG tags, canonical URL, alt text, FAQ, JSON-LD
- buyer_queries MUST remain in English (they simulate real English-language searches)
- competitor name and domain MUST remain in English (they are real brand names)
- Example style for diagnosis issue: "产品描述仅有40个字符，AI无法理解你卖什么"
- Numeric/enum fields (score, severity, priority, match, percentile) remain unchanged`;

  return `You are a GEO (Generative Engine Optimization) expert. Analyze this Shopify product page for AI search visibility.

## Page Data
- URL: ${productUrl}
- Title: ${title}
- Meta Description: ${metaDesc}
- OG Title: ${ogTitle}
- OG Description: ${ogDesc}
- Description: ${description}
- Price: ${price}
- Image Alt Texts: ${imageAltsStr}
- Schema.org Markup: ${hasSchemaMarkup}
- Store Locator / Find Near You: ${storeLocatorStr}
- Canonical URL: ${canonical}

## Your Task

Analyze this product page and produce a JSON report with the following structure. Think about:
1. What score does this page deserve for AI search visibility (0-100)?
2. Would ChatGPT recommend this product? (verdict)
3. What 5 questions would a real buyer type into ChatGPT/Perplexity when shopping for this type of product?
4. For each buyer question, how well does this page match what AI would need to recommend it?
5. Who are the 3 main competitors in this product category that ARE visible in AI search?
6. What are the top 3 problems (diagnosis) holding this page back?
7. What specific fixes (paid_fixes) would solve each problem?

## Output JSON Format

Return ONLY this JSON structure. No markdown, no backticks, no extra text.

{
  "score": <0-100, most pages score 25-65>,
  "product_name": "${title}",
  "store_name": "<extracted from URL domain or brand, or empty string>",
  "verdict": "<one of exactly: 'ChatGPT is unlikely to recommend this product' | 'ChatGPT might recommend this product in some searches' | 'ChatGPT is likely to recommend this product'>",
  "industry_benchmark": {
    "percentile": <0-100, derived from score: score 20-40 -> percentile 10-35, score 40-60 -> percentile 35-65, score 60-80 -> percentile 65-90>,
    "message": "<e.g. 'You scored better than 23% of similar stores'>"
  },
  "buyer_queries": [
    "<question 1>",
    "<question 2>",
    "<question 3>",
    "<question 4>",
    "<question 5>"
  ],
  "query_match_scores": [
    {"query": "<same as buyer_queries[0]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[1]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[2]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[3]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[4]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"}
  ],
  "competitors": [
    {"name": "<real brand name>", "domain": "<real domain>", "why_they_win": "<brief reason>"},
    {"name": "<real brand name>", "domain": "<real domain>", "why_they_win": "<brief reason>"},
    {"name": "<real brand name>", "domain": "<real domain>", "why_they_win": "<brief reason>"}
  ],
  "diagnosis": [
    {"category": "<short name>", "severity": "high", "issue": "<what's wrong>", "impact": "<why it matters for AI search>"},
    {"category": "<short name>", "severity": "<high|medium>", "issue": "<what's wrong>", "impact": "<why it matters>"},
    {"category": "<short name>", "severity": "<medium|low>", "issue": "<what's wrong>", "impact": "<why it matters>"}
  ],
  "paid_fixes": [
    {"category": "<same as diagnosis[0].category>", "fix": "<specific actionable fix>", "priority": 1, "code_snippet": "<optional JSON-LD or HTML snippet, or empty string>"},
    {"category": "<same as diagnosis[1].category>", "fix": "<specific actionable fix>", "priority": <1|2>, "code_snippet": "<optional, or empty string>"},
    {"category": "<same as diagnosis[2].category>", "fix": "<specific actionable fix>", "priority": <2|3>, "code_snippet": "<optional, or empty string>"}
  ],
  "overall_recommendations": "<2-3 sentences summarizing the key strategy>",
  "paid_value_prop": "Unlock specific fix instructions, competitor names, schema code snippets, and multi-platform analysis (ChatGPT + Perplexity + Google AI)"
}

## Rules

### CRITICAL: Data Fidelity
- product_name MUST be exactly the Title provided above (character-for-character match, including trademark symbols like ™)
- DO NOT substitute the product name with any other product name from your training data, even if that other product is more famous or well-known in the category
- store_name MUST be derived from the URL domain or the brand name in the data
- buyer_queries MUST be tailored to THIS specific product, not generic category-level questions. If the product is "Soft Baked Lemon Cookies", queries should mention "lemon" specifically, not generic "cookies"

### score
- Realistic scoring: most Shopify pages score 25-65
- Consider: description length, schema presence, title quality, image alts, content depth

### verdict
- score < 40 → "ChatGPT is unlikely to recommend this product"
- score 40-65 → "ChatGPT might recommend this product in some searches"
- score > 65 → "ChatGPT is likely to recommend this product"

### industry_benchmark
- percentile must be consistent with score (use the mapping above)
- message should reference the percentile number

### buyer_queries (Based on Real AI Shopping Data 2026)
Research from Anagram.ai (June 2026), Triple Whale, and Adobe Analytics shows that DTC shoppers ask AI 5 specific types of pre-purchase questions. Generate exactly ONE query per type, in this order:

1. USE-CASE (discovery): The most common entry point. "Best [category] for [specific situation/constraint]." Examples from real data: "best noise-canceling headphones for commuting", "best running shoes for flat feet under $150". MUST include a specific constraint (budget, body type, environment, skill level, problem).

2. PRODUCT-FIT (matching): "Will [product/feature] work for [specific constraint]?" Examples: "Is [product] safe for sensitive skin?", "Does [product] come in wide width?", "Is [product] good for beginners?". MUST reference this product's unique feature or the buyer's specific situation.

3. COMPARISON (high-intent, close to purchase): "[Product/Brand] vs [competitor]" or "Is the premium version worth it?" or "What's the cheaper alternative to [product]?". MUST include a specific comparison angle relevant to this product's category.

4. TRUST & PROOF (risk reduction): "Is [brand] worth it?" or "What do buyers say about [specific attribute of THIS product]?" or "Does [brand] have a good return policy?". MUST be about THIS specific product or brand, not generic.

5. PRICE & VALUE (purchase decision): "Is [product] worth $[price]?" or "How does [product] compare in value to cheaper alternatives?" or "What do you get for $[price] with [product]?". MUST reference this product's actual price point.

CRITICAL RULES:
- DIVERSITY: Each of the 5 queries MUST cover a genuinely different dimension. If two queries would touch the same topic (e.g., both about allergies), merge them into ONE query and use the freed slot for a different angle (e.g., taste, texture, convenience, gifting, dietary restriction, portability, storage, preparation, kid-friendly, etc.).
- NO $0.00 IN QUERIES: If the product price is $0.00 (pre-launch, out of stock, or third-party sold), do NOT generate "Is X worth $0.00?" — instead use "Where can I find pricing for [product]?" or "How is [product] priced compared to alternatives?"
- NO DUPLICATE TOPICS: If the product has multiple allergen-related features, combine them into ONE query (e.g., "Is [product] safe for kids with nut AND dairy allergies?") rather than spreading across two queries.
- PRODUCT-SPECIFIC: Each query MUST mention this product's unique attributes. "Best cookies" → WRONG. "Best soft baked lemon cookies for lactose intolerant kids" → RIGHT.
ALL queries must be in English regardless of lang parameter.

### query_match_scores
- Each query maps to exactly one buyer_query
- match: "fail" = page has nothing relevant, "low" = minimal signal, "medium" = partial match, "high" = strong match
- reason: brief, specific to the actual page data
- CRITICAL: NEVER mention "$0.00" or "price is unclear" or "price may confuse" in any reason. If price is $0.00, simply state "Price information available on product page" or skip price commentary entirely. Price being $0.00 is NOT a negative signal — it may indicate pre-launch, variant selection required, or third-party sales.

### CRITICAL: Match Scoring Logic for Purchase/Availability Queries
- If this is a product detail page on an e-commerce site (URL contains /products/, page has price, Add to Cart, or Shop buttons), then queries like "where can I buy X", "where to purchase X", "how to get X" should be marked as **HIGH** match, because the page itself IS the purchase location
- If the Page Data shows "Store Locator / Find Near You: YES", then queries about physical store availability, nearby stores, or retail locations should be marked as **MEDIUM** or **HIGH** match (the page supports offline discovery)
- If the Page Data shows "Store Locator / Find Near You: No store locator found", then queries about store availability should be marked as **LOW** (not fail — the product can still be bought online), with reason "No store locator detected on page; online purchase available"
- NEVER mark purchase-related queries as "fail" when analyzing a product page that clearly has purchase functionality
- The fact that a user is ON a product page with buy buttons means the page answers "where can I buy" — recognize this obvious signal

### CRITICAL: Price Accuracy
- Use the EXACT price value provided in the Page Data above
- NEVER claim the price is "$0.00" or "unclear" unless the actual data shows price as $0.00 or empty
- If price is provided (e.g., "$35.99"), use it accurately in your analysis
- Do NOT hallucinate price issues that don't exist in the data

### CRITICAL: Do NOT Flag Normal UX as Problems
- Shopify product pages often show $0.00 price BEFORE the customer selects a variant (size, quantity, flavor, etc.)
- This is NORMAL behavior, NOT a problem. Do NOT create diagnosis items like "Price is listed as $0.00, which is unclear"
- If the page has variant selectors (Size, Quantity, Options), the $0.00 price is expected and correct
- Only flag price issues if: (a) price is truly missing from the data, OR (b) price is clearly wrong (e.g., negative, or $0.00 with no variants)
- Do NOT invent problems just to fill 3 diagnosis slots. Better to have 2 real issues than 1 real + 1 fake

### CRITICAL: Do NOT Flag Purchase Location/Links as Missing
- This page IS a product page on an e-commerce/shopping website. The page itself is the purchase location.
- NEVER create diagnosis items like "no purchase information", "where to buy is not clear", "lacks buying instructions", "no link to purchase", "unclear where to buy", "missing purchase path"
- The product page inherently has purchase functionality (price, Add to Cart, Buy button). This is a given, not a selling point.
- If the page has "Find Near You", "Store Locator", "Shop [Retailer]", "Available in Stores" elements, that is a POSITIVE signal for AI search visibility — mention it as a strength, not flag its absence as a problem.
- Customers DO ask AI "where can I buy [product] near [location]" — so store locator presence IS valuable for GEO. But a product page without a store locator is NOT broken or deficient.

### competitors
- Use REAL well-known brands in this product category
- domain must be the real website domain
- why_they_win: what they do better for AI search visibility
- Competitor name and domain stay in English regardless of lang

### diagnosis
- Exactly 3 items, sorted by severity (high first)
- Be specific — reference actual page data (e.g., "description is only 40 characters", not "description is too short")
- Categories to consider: Description, Schema, Content Depth, Image Alt Text, Title, Meta Tags, Price/Availability, Brand Authority, Technical SEO

### paid_fixes
- Correspond 1:1 with diagnosis items (same category)
- fix must be specific and actionable (include word counts, exact schema fields, content structure)
- code_snippet: include JSON-LD example when fix involves schema markup, otherwise empty string
- priority: 1 = do immediately, 2 = do soon, 3 = do later

### Language
${langInstruction}

### General
- Keep all string values concise (under 150 chars each)
- Be specific — reference actual page data in diagnosis and fixes
- Do NOT wrap output in markdown code blocks`;
}
