// AI 分析提示词模板 - 定义 GEO 分析维度和输出格式
// v21: 多语言输出支持，专业术语保留英文

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
 * 构建分析提示词 - 精简版（10核心维度）
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
  
  const imageAlts = (productData.imageAlts || [])
    .map(a => sanitize(a, 80))
    .filter(a => a.length > 2)
    .slice(0, 6);
  const imageAltsStr = imageAlts.length > 0 ? imageAlts.join('; ') : 'None found';

  return `Analyze this Shopify product page for AI Search Visibility (GEO).

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
- Canonical URL: ${canonical}

## Evaluation Dimensions (10)

1. **Title Clarity** - Brand + product + key attributes in title
2. **Description Quality** - Detailed, well-structured, min 200 words
3. **Keyword Integration** - Natural keyword usage throughout content
4. **Meta Tags** - Compelling, keyword-optimized meta description and OG tags
5. **Schema Markup** - Product schema present and complete
6. **Image Optimization** - Descriptive alt texts for all product images
7. **Price & Availability** - Clear pricing, stock status visible
8. **Content Depth** - FAQ, reviews, specs, use cases, comparisons
9. **Brand Authority** - Brand story, credibility signals, unique selling points
10. **Technical SEO** - Canonical URL, structured data, clean markup

## Output JSON Format

Return ONLY this JSON structure. No markdown, no backticks, no extra text.

{
  "score": <0-100>,
  "product_name": "<product name>",
  "store_name": "<store name or empty string>",
  "free_issues": [
    {"category": "<short name>", "severity": "<high|medium|low>", "issue": "<problem>", "impact": "<effect>", "dimension": "<1-10>"},
    {"category": "<short name>", "severity": "<high|medium|low>", "issue": "<problem>", "impact": "<effect>", "dimension": "<1-10>"},
    {"category": "<short name>", "severity": "<high|medium|low>", "issue": "<problem>", "impact": "<effect>", "dimension": "<1-10>"}
  ],
  "full_report": {
    "detailed_checks": [
      {"category": "<dimension name>", "score": <0-10>, "status": "<pass|warn|fail>", "issue": "<problem or empty>", "fix": "<fix or empty>", "priority": <1-5>}
    ],
    "quick_wins": ["<fix 1>", "<fix 2>", "<fix 3>"],
    "overall_recommendations": "<2-3 sentence summary>"
  }
}

## Rules
- free_issues: exactly 3 items, high severity first
- detailed_checks: exactly 10 items (one per dimension)
- score: realistic (most pages score 25-65)
- Be specific - reference actual page data
- Keep string values concise (under 100 chars each)
${lang === 'en'
  ? '- ALL text values in English'
  : `- Output all text content (category, issue, impact, fix, quick_wins, overall_recommendations) in ${LANGUAGE_NAMES[lang] || 'English'}
- Keep technical terms in English: GEO, SEO, schema markup, structured data, AI Overviews, Product schema, meta description, OG tags, canonical URL, alt text, FAQ, JSON-LD
- Example style: "你的产品页面缺少 structured data 标记，会降低在 AI Overviews 中的可见性"
- Numeric/enum fields (score, severity, dimension, status, priority) remain unchanged`}`;
}
