// AI 分析 API 封装 - 阿里云百炼（Qwen 模型，OpenAI 兼容格式）
// v26: 切换到阿里云百炼平台，使用 qwen3.7-plus 模型

async function callMoonshotAPI(messages, model = 'qwen3.7-plus') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured. Set OPENAI_API_KEY in Vercel Environment Variables.');
  }

  const requestBody = {
    model,
    messages,
    max_tokens: 8000,
    temperature: 0.7,
  };

  console.log(`[Bailian] model=${model}, max_tokens=8000`);

  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

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
}

/**
 * 从文本中提取并修复 JSON
 */
function extractAndFixJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty input text');
  }

  let cleaned = text.trim();
  
  // 去除 markdown 代码块标记
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7).trim();
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3).trim();
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3).trim();
  }

  // 尝试直接解析
  try {
    return JSON.parse(cleaned);
  } catch (e) { /* continue */ }

  // 提取第一个 { 到最后一个 } 之间的内容
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch (e) { /* continue */ }
  }

  // 修复常见 JSON 问题
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
 * 主分析函数
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

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[analyze] Attempt ${attempt}/2`);
      
      const response = await callMoonshotAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ], 'qwen3.7-plus');

      const choice = response.choices?.[0];
      if (!choice) {
        throw new Error(`No choices. Full: ${JSON.stringify(response).slice(0, 500)}`);
      }

      const msg = choice.message || {};
      const content = msg.content;
      const finishReason = choice.finish_reason;

      // 构建诊断信息
      lastDebugInfo = `finish=${finishReason}, content_len=${content?.length || 0}, msg_keys=[${Object.keys(msg).join(',')}]`;
      console.log(`[analyze] ${lastDebugInfo}`);

      // Qwen 模型直接返回 content，无需处理 reasoning_content
      if (content && content.trim().length > 0) {
        const result = extractAndFixJSON(content);
        console.log(`[analyze] Success from content on attempt ${attempt}`);
        return result;
      }

      // content 为空 - 可能是模型问题
      throw new Error(`Content is empty. ${lastDebugInfo}`);
      
    } catch (error) {
      lastError = error;
      console.error(`[analyze] Attempt ${attempt} failed:`, error.message);
      
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  const errorMsg = `AI failed after 2 attempts. Last: ${lastError?.message}. Debug: ${lastDebugInfo}`;
  console.error('[analyze] ALL FAILED:', errorMsg);
  throw new Error(errorMsg);
}
