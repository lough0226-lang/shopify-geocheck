// AI 分析 API 封装 - 阿里云百炼（Qwen Turbo 模型，OpenAI 兼容格式）
// v30: qwen-turbo + 20s timeout + max_tokens 4000 + 2次重试

async function callMoonshotAPI(messages, model = 'qwen-turbo') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured. Set OPENAI_API_KEY in Vercel Environment Variables.');
  }

  const requestBody = {
    model,
    messages,
    max_tokens: 4000,
    temperature: 0.7,
  };

  const baseUrl = process.env.OPENAI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  console.log(`[Bailian] model=${model}, base_url=${baseUrl}, max_tokens=4000`);

  // 超时控制（20秒）
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

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
      throw new Error('Bailian API request timed out after 20 seconds');
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
 * 主分析函数 - 2次重试 + 2秒退避
 */
export async function analyzeProduct(productContent, productUrl) {
  const { buildAnalysisPrompt } = await import('./prompts.js');
  const prompt = buildAnalysisPrompt(productContent, productUrl);

  const systemPrompt = `You are a GEO (Generative Engine Optimization) expert for e-commerce. Analyze Shopify product pages for AI search visibility (ChatGPT, Perplexity, Google AI Overviews).

CRITICAL RULES:
1. Respond with ONLY valid JSON - start with { and end with }
2. Use double quotes for ALL property names and string values
3. NO markdown, NO code blocks, NO backticks, NO explanations
4. Escape all special characters in strings
5. Do NOT use comments inside JSON
6. Your response must contain valid JSON only`;

  let lastError = null;
  let lastDebugInfo = '';
  const MAX_ATTEMPTS = 2;
  const DELAYS = [2000];

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
        const result = extractAndFixJSON(content);
        console.log(`[analyze] Success on attempt ${attempt}`);
        return result;
      }

      throw new Error(`Content is empty. ${lastDebugInfo}`);
      
    } catch (error) {
      lastError = error;
      console.error(`[analyze] Attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error.message);
      
      if (attempt < MAX_ATTEMPTS) {
        const delay = DELAYS[attempt - 1] || 2000;
        console.log(`[analyze] Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  const errorMsg = `AI failed after ${MAX_ATTEMPTS} attempts. Last: ${lastError?.message}. Debug: ${lastDebugInfo}`;
  console.error('[analyze] ALL FAILED:', errorMsg);
  throw new Error(errorMsg);
}
