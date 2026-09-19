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

  // 认证信息
  const certifications = productData.certifications || [];
  const certificationsStr = certifications.length > 0 
    ? certifications.join(', ') 
    : 'None detected';
  
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
- Certifications: ${certificationsStr}
- Canonical URL: ${canonical}

## Your Task

Analyze this product page and produce a JSON report with the following structure. Think about:
1. What score does this page deserve for AI search visibility (0-100)?
2. Would ChatGPT recommend this product? (verdict)
3. What 7 questions would a real buyer type into ChatGPT/Perplexity when shopping for this type of product?
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
    "message": "<e.g. 'You scored better than 23% of similar stores'>",
    "exposure_score": <0-100, calculated as: (count of medium/high matches in query_match_scores) / 7 * 100, rounded to integer. This represents the percentage of real buyer queries that this page can be recommended for in AI search>
  },
  "buyer_queries": [
    "<question 1 - USE-CASE>",
    "<question 2 - PRODUCT-FIT>",
    "<question 3 - COMPARISON>",
    "<question 4 - GIFT/OCCASION>",
    "<question 5 - ALTERNATIVES>",
    "<question 6 - TRUST & PROOF>",
    "<question 7 - PRICE & VALUE>"
  ],
  "query_match_scores": [
    {"query": "<same as buyer_queries[0]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[1]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[2]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[3]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[4]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[5]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"},
    {"query": "<same as buyer_queries[6]>", "match": "<fail|low|medium|high>", "reason": "<brief reason>"}
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
  "query_fixes": [
    {"query_index": <0-6, only include queries with match fail or low>, "fix": "<specific page change to improve this query's match>", "expected_impact": "<which other queries this fix also improves>"}
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
- exposure_score: calculate as (count of medium + high matches in query_match_scores) / 7 * 100, rounded to nearest integer. This represents "your page can be recommended by AI for X% of real buyer queries". Higher is better.

### buyer_queries (Based on Real AI Shopping Data 2026)
Research from Anagram.ai (June 2026), Triple Whale, Adobe Analytics, and Google AI Mode 2026 shows that DTC shoppers ask AI 7 specific types of pre-purchase questions. Generate exactly ONE query per type, in this order:

1. USE-CASE (discovery): The most common entry point. "Best [category] for [specific situation/constraint]." Examples from real data: "best noise-canceling headphones for commuting", "best running shoes for flat feet under $150". MUST include a specific constraint (budget, body type, environment, skill level, problem).

2. PRODUCT-FIT (matching): "Will [product/feature] work for [specific constraint]?" Examples: "Is [product] safe for sensitive skin?", "Does [product] come in wide width?", "Is [product] good for beginners?". MUST reference this product's unique feature or the buyer's specific situation.

3. COMPARISON (high-intent, close to purchase): "What makes [product/brand] different from typical [category]?" or "What's special about [product] compared to standard [category]?" or "Why would someone choose [product] over cheaper options?". MUST focus on THIS product's unique selling points — do NOT name specific competing brands (legal risk). Compare against "typical/standard/regular [category]" instead.

4. GIFT/OCCASION (persona-driven): "What's a good [category] for [person/occasion]?" or "Best [category] gift for [age/hobby/relationship]?" Examples: "best skincare gift for my mom", "good cookies for a school bake sale". MUST reference a specific recipient, occasion, or gifting scenario.

5. ALTERNATIVES (constraint-driven): "Show me [category] like [feature] but [constraint]" or "Is there a [category] that's [cheaper/more sustainable/local/simpler]?" Examples: "vegan cookies like Oreos but without palm oil", "cheaper alternative to [product]". MUST reference a specific constraint that differentiates from the default option.

6. TRUST & PROOF (risk reduction): "Is [brand] worth it?" or "What do buyers say about [specific attribute of THIS product]?" or "Does [brand] have a good return policy?". MUST be about THIS specific product or brand, not generic.

7. PRICE & VALUE (purchase decision): "Is [product] worth $[price]?" or "How does [product] compare in value to cheaper alternatives?" or "What do you get for $[price] with [product]?". MUST reference this product's actual price point.

CRITICAL RULES:
- MAX 1 ALLERGEN/DIETARY QUERY: Out of 7 queries, AT MOST ONE can mention allergens, gluten-free, dairy-free, vegan, nut-free, or any dietary restriction. If the product has multiple allergen features, combine them into one query (e.g., "safe for kids with nut AND dairy allergies?"). Use the remaining slots for OTHER angles: taste, texture, convenience, gifting, portability, storage, kid-friendly, preparation, occasion, seasonality, etc.
- ALLERGEN QUERY REASON RULE: When evaluating allergen-related queries, if the Certifications field shows ANY allergen-related certifications (Top-9-Allergen-Free, Gluten-Free, Vegan, Nut-Free, Dairy-Free, etc.) OR the description mentions allergen-friendly features, mark the match as at least "medium". Do NOT say "lacks specific mention of [specific allergen]" — image-based allergen badges (e.g., "No Tree Nuts" icons) may not be captured by text scraping, and the certifications field already covers allergen claims at the category level.
- NO DUPLICATE TOPICS: Each of the 7 queries MUST cover a genuinely different dimension. Check before outputting: if two queries touch the same topic, merge them and replace the duplicate with a different angle.
- NO $0.00 IN QUERIES: If the product price is $0.00 (pre-launch, out of stock, or third-party sold), do NOT generate "Is X worth $0.00?" — instead use "Where can I find pricing for [product]?" or "How is [product] priced compared to alternatives?"
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
- If the product has certifications (Gluten-Free, Vegan, Non-GMO, Kosher, Top-9-Allergen-Free, etc.), these certifications ARE value justifications. Do NOT say "no value justification for price" or "price seems high" when the product has premium certifications that explain the pricing. Certifications like Non-GMO, Vegan, Allergen-Free are premium features that command higher prices in the market.
- When evaluating query_match_scores for the PRICE/VALUE query (type 5): if Certifications are present, mark match as at least "medium" — the certifications (especially premium ones like Non-GMO, Allergen-Free) demonstrate that the product has value beyond just the base category. Do NOT mark price/value as "fail" or "low" when certifications exist.

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

### CRITICAL: Diagnosis Internal Consistency
- NEVER contradict yourself across diagnosis items. If the page description or certifications mention allergen information (e.g., "free of top 9 allergens", "allergen-friendly", "gluten-free", "vegan"), you CANNOT simultaneously say "allergen info not mentioned" in one diagnosis item and "mentions allergen-friendly features" in another.
- Before outputting diagnosis, check all 3 items for logical contradictions. If two items contradict each other, merge or replace them.
- If the Certifications field shows certifications exist, do NOT say those certifications are missing or not mentioned. Acknowledge them as present and evaluate whether they are sufficiently highlighted for AI search.

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

### query_fixes
- Only include entries for queries where match is "fail" or "low"
- query_index: the 0-based index of the query in buyer_queries array (0-6)
- fix: specific page change that would improve THIS query's match score (different from diagnosis-level fixes — be query-specific)
- expected_impact: which OTHER queries (by index) this fix would also improve
- Do NOT include entries for queries that already match medium or high
- CRITICAL: query_fixes are the key paid value — they tell the merchant EXACTLY what to change to appear in AI answers for specific buyer questions

### Language
${langInstruction}

### General
- Keep all string values concise (under 150 chars each)
- Be specific — reference actual page data in diagnosis and fixes
- Do NOT wrap output in markdown code blocks`;
}
