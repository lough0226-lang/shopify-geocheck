// AI 分析 API 封装 - 阿里云百炼（Qwen 模型，OpenAI 兼容格式）
// v29: 15秒超时 + 6000 max_tokens + 适配新诊断+药方结构

async function callMoonshotAPI(messages, model = 'qwen-turbo') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured. Set OPENAI_API_KEY in Vercel Environment Variables.');
  }

  const requestBody = {
    model,
    messages,
    max_tokens: 6000,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  };

  const baseUrl = process.env.OPENAI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  console.log(`[Bailian] model=${model}, base_url=${baseUrl}, max_tokens=6000`);

  // 超时控制（15秒 — 新 prompt 输出更大）
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Bailian] HTTP ${response.status}:`, errorText.slice(0, 500));
      throw new Error(`Bailian API failed (${response.status}): ${errorText.slice(0, 300)}`);
    }

    const data = await response.json();
    
    const msg = data.choices?.[0]?.message;
    console.log(`[Bailian] finish_reason=${data.choices?.[0]?.finish_reason}`);
    console.log(`[Bailian] message keys: ${msg ? Object.keys(msg).join(', ') : 'NO MESSAGE'}`);
    console.log(`[Bailian] content length: ${msg?.content?.length || 0}`);
    console.log(`[Bailian] usage: ${JSON.stringify(data.usage || {})}`);

    return data;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Bailian API request timed out after 15 seconds');
    }
    throw error;
  }
}

/**
 * 从文本中提取并修复 JSON
 */
function extractAndFixJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty input text');
  }

  let cleaned = text.trim();
  
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7).trim();
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3).trim();
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3).trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) { /* continue */ }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch (e) { /* continue */ }
  }

  let fixed = cleaned;
  fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
  fixed = fixed.replace(/,\s*([}\]])/g, '$1');

  if (!fixed.trim().startsWith('{')) {
    const fb = fixed.indexOf('{');
    const lb = fixed.lastIndexOf('}');
    if (fb !== -1 && lb > fb) fixed = fixed.slice(fb, lb + 1);
  }

  try {
    return JSON.parse(fixed);
  } catch (e) {
    throw new Error(`JSON parse failed: ${e.message}. Raw(500): ${text.slice(0, 500)}`);
  }
}

/**
 * 标准化 AI 输出为新结构（确保所有字段存在）
 */
function normalizeResult(raw) {
  // 确保 verdict 是三选一
  const score = typeof raw.score === 'number' ? raw.score : 42;
  let verdict = raw.verdict || '';
  const validVerdicts = [
    'ChatGPT is unlikely to recommend this product',
    'ChatGPT might recommend this product in some searches',
    'ChatGPT is likely to recommend this product',
  ];
  if (!validVerdicts.includes(verdict)) {
    verdict = score < 40 ? validVerdicts[0] : score <= 65 ? validVerdicts[1] : validVerdicts[2];
  }

  // 确保 industry_benchmark 存在
  let benchmark = raw.industry_benchmark || {};
  if (typeof benchmark.percentile !== 'number') {
    // 从 score 推算 percentile
    if (score < 40) benchmark.percentile = 10 + Math.round((score - 20) * 1.25);
    else if (score < 60) benchmark.percentile = 35 + Math.round((score - 40) * 1.5);
    else benchmark.percentile = 65 + Math.round((score - 60) * 1.25);
    benchmark.percentile = Math.max(5, Math.min(95, benchmark.percentile));
  }
  // 强制 message 与 percentile 数字一致，避免 AI 返回两者对不上的情况
  benchmark.message = `You scored better than ${benchmark.percentile}% of similar stores`;

  // 确保 buyer_queries 是 5 个
  let buyerQueries = Array.isArray(raw.buyer_queries) ? raw.buyer_queries : [];
  while (buyerQueries.length < 5) buyerQueries.push('best product in this category');
  buyerQueries = buyerQueries.slice(0, 5);

  // 确保 query_match_scores 对应
  let queryMatchScores = Array.isArray(raw.query_match_scores) ? raw.query_match_scores : [];
  for (let i = 0; i < 5; i++) {
    if (!queryMatchScores[i]) {
      queryMatchScores[i] = { query: buyerQueries[i], match: 'low', reason: 'Insufficient data' };
    }
  }

  // 确保 competitors 是 3 个
  let competitors = Array.isArray(raw.competitors) ? raw.competitors : [];
  while (competitors.length < 3) {
    competitors.push({ name: 'Unknown Competitor', domain: 'competitor.com', why_they_win: 'Better optimized content' });
  }
  competitors = competitors.slice(0, 3);

  // 确保 diagnosis 是 3 个
  let diagnosis = Array.isArray(raw.diagnosis) ? raw.diagnosis : [];
  while (diagnosis.length < 3) {
    diagnosis.push({ category: 'General', severity: 'medium', issue: 'Analysis incomplete', impact: 'Re-run for detailed diagnosis' });
  }
  diagnosis = diagnosis.slice(0, 3);
  // 按 severity 排序：high > medium > low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  diagnosis.sort((a, b) => (severityOrder[a.severity] || 1) - (severityOrder[b.severity] || 1));

  // 确保 paid_fixes 对应 diagnosis
  let paidFixes = Array.isArray(raw.paid_fixes) ? raw.paid_fixes : [];
  for (let i = 0; i < diagnosis.length; i++) {
    if (!paidFixes[i]) {
      paidFixes[i] = { category: diagnosis[i].category, fix: '', priority: i + 1, code_snippet: '' };
    }
    // 确保 category 和 diagnosis 对齐
    paidFixes[i].category = diagnosis[i].category;
  }
  paidFixes = paidFixes.slice(0, 3);

  return {
    score,
    product_name: raw.product_name || 'Product',
    store_name: raw.store_name || '',
    verdict,
    industry_benchmark: benchmark,
    buyer_queries: buyerQueries,
    query_match_scores: queryMatchScores,
    competitors,
    diagnosis,
    paid_fixes: paidFixes,
    overall_recommendations: raw.overall_recommendations || '',
    paid_value_prop: raw.paid_value_prop || 'Unlock specific fix instructions, competitor names, schema code snippets, and multi-platform analysis',
  };
}

/**
 * 主分析函数
 */
export async function analyzeProduct(productContent, productUrl, lang = 'en') {
  const { buildAnalysisPrompt } = await import('./prompts.js');
  const prompt = buildAnalysisPrompt(productContent, productUrl, lang);

  const langNames = { en: 'English', zh: 'Chinese', de: 'German', fr: 'French', es: 'Spanish', pt: 'Portuguese' };
  const langName = langNames[lang] || 'English';
  const langInstruction = lang === 'en'
    ? ''
    : `\n7. Output all text in ${langName}. Keep technical terms (GEO, SEO, schema markup, structured data, etc.) in English. Keep buyer_queries and competitor names/domains in English.`;

  const systemPrompt = `You are a GEO (Generative Engine Optimization) expert for e-commerce. Analyze Shopify product pages for AI search visibility (ChatGPT, Perplexity, Google AI Overviews).

CRITICAL RULES:
1. Respond with ONLY valid JSON - start with { and end with }
2. Use double quotes for ALL property names and string values
3. NO markdown, NO code blocks, NO backticks, NO explanations
4. Escape all special characters in strings (especially quotes inside strings: use \\" )
5. Do NOT use comments inside JSON
6. Your response must contain valid JSON only${langInstruction}`;

  let lastError = null;
  let lastDebugInfo = '';
  const MAX_ATTEMPTS = 2;
  const DELAYS = [3000, 6000];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[analyze] Attempt ${attempt}/${MAX_ATTEMPTS}`);
      
      const response = await callMoonshotAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ], 'qwen-turbo');

      const choice = response.choices?.[0];
      if (!choice) {
        throw new Error(`No choices. Full: ${JSON.stringify(response).slice(0, 500)}`);
      }

      const msg = choice.message || {};
      const content = msg.content;
      const finishReason = choice.finish_reason;

      lastDebugInfo = `finish=${finishReason}, content_len=${content?.length || 0}, msg_keys=[${Object.keys(msg).join(',')}]`;
      console.log(`[analyze] ${lastDebugInfo}`);

      if (content && content.trim().length > 0) {
        const rawResult = extractAndFixJSON(content);
        const normalized = normalizeResult(rawResult);
        // 强制纠正 AI 幻觉的产品名：以实际页面数据为准
        const actualTitle = productContent.title || productContent.pageText || '';
        if (actualTitle) {
          normalized.product_name = actualTitle.slice(0, 200);
        }
        const actualStore = productContent.store_name || productContent.vendor || '';
        if (actualStore) {
          normalized.store_name = actualStore.slice(0, 100);
        }

        // 强制买家查询多样性：5 个查询最多 1 个涉及过敏/饮食限制
        const bq = normalized.buyer_queries || [];
        const allergenKeywords = ['allerg', 'gluten', 'dairy', 'vegan', 'nut-free', 'celiac', 'intolerant'];
        const allergenIndices = [];
        bq.forEach((q, i) => {
          const ql = q.toLowerCase();
          if (allergenKeywords.some(k => ql.includes(k))) allergenIndices.push(i);
        });
        if (allergenIndices.length > 1) {
          const replacements = [
            `How does ${normalized.product_name} taste compared to similar products?`,
            `Is ${normalized.product_name} good for kids or family snacking?`,
            `How long does ${normalized.product_name} stay fresh after opening?`,
            `Can ${normalized.product_name} be shipped as a gift?`,
            `What occasions is ${normalized.product_name} best suited for?`
          ];
          let repIdx = 0;
          for (let i = 1; i < allergenIndices.length && repIdx < replacements.length; i++) {
            bq[allergenIndices[i]] = replacements[repIdx++];
          }
          normalized.buyer_queries = bq;
          console.log(`[analyze] Enforced query diversity: replaced ${allergenIndices.length - 1} duplicate allergen queries`);
        }

        // 验证价格相关诊断：$0.00 价格在 Shopify 产品页是正常行为（未选规格/第三方销售），不是问题
        // 无论实际价格是多少，都删除 AI 生成的"$0.00 价格有问题"诊断
        normalized.diagnosis = (normalized.diagnosis || []).filter(d => {
          const issue = (d.issue || '').toLowerCase();
          const category = (d.category || '').toLowerCase();
          // 匹配各种 AI 可能生成的价格$0.00 相关诊断
          const isFalsePriceClaim = issue.includes('$0.00') || 
            issue.includes('0.00') && (category.includes('price') || issue.includes('price')) ||
            issue.includes('price is listed as') ||
            (issue.includes('unclear') || issue.includes('confusing') || issue.includes('misleading')) && issue.includes('price');
          if (isFalsePriceClaim) {
            console.log(`[analyze] Removed false price diagnosis: ${d.issue}`);
            return false;
          }
          return true;
        });
        // 如果诊断被删除后不足 3 个，用通用诊断补充
        const severityOrder = { high: 0, medium: 1, low: 2 };
        while (normalized.diagnosis.length < 3) {
          normalized.diagnosis.push({
            category: 'General',
            severity: 'medium',
            issue: 'Additional optimization opportunities exist',
            impact: 'Further improvements could increase AI search visibility'
          });
        }
        normalized.diagnosis = normalized.diagnosis.slice(0, 3);
        normalized.diagnosis.sort((a, b) => (severityOrder[a.severity] || 1) - (severityOrder[b.severity] || 1));
        // 同步更新 paid_fixes 以匹配 diagnosis
        normalized.paid_fixes = (normalized.paid_fixes || []).slice(0, normalized.diagnosis.length);
        for (let i = 0; i < normalized.diagnosis.length; i++) {
          if (!normalized.paid_fixes[i]) {
            normalized.paid_fixes[i] = { category: normalized.diagnosis[i].category, fix: '', priority: i + 1, code_snippet: '' };
          }
          normalized.paid_fixes[i].category = normalized.diagnosis[i].category;
        }
        // 修正 query_match_scores 中的 $0.00 相关错误理由
        // 无论产品价格是否真的为$0.00（如预售产品），都不应将其标记为问题
        (normalized.query_match_scores || []).forEach(q => {
          const reason = (q.reason || '').toLowerCase();
          if (reason.includes('$0.00') || reason.includes('0.00') && reason.includes('price')) {
            // 替换为正面或中性理由
            const actualPrice = productContent.price || '';
            if (actualPrice && actualPrice !== '$0.00') {
              q.reason = `Price is listed as ${actualPrice}`;
            } else {
              q.reason = 'Product page has purchase functionality; price information available on page';
            }
            // 同时提升 match 等级（不应该因为价格问题判 fail）
            if (q.match === 'fail') q.match = 'low';
            console.log(`[analyze] Fixed $0.00 query_match_score reason for: "${q.query}"`);
          }
        });
        console.log(`[analyze] Success on attempt ${attempt}, score=${normalized.score}, product="${normalized.product_name}"`);
        return normalized;
      }

      throw new Error(`Content is empty. ${lastDebugInfo}`);
      
    } catch (error) {
      lastError = error;
      console.error(`[analyze] Attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error.message);
      
      if (attempt < MAX_ATTEMPTS) {
        const delay = DELAYS[attempt - 1] || 6000;
        console.log(`[analyze] Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  const errorMsg = `AI failed after ${MAX_ATTEMPTS} attempts. Last: ${lastError?.message}. Debug: ${lastDebugInfo}`;
  console.error('[analyze] ALL FAILED:', errorMsg);
  throw new Error(errorMsg);
}
