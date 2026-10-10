// Schema Markup Tester API - 抓取页面 HTML，解析 JSON-LD，验证 Product schema 字段
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Product schema 需要检查的字段及其权重
var FIELDS = [
  { name: "name",              weight: 15, required: true  },
  { name: "offers.price",      weight: 15, required: true  },
  { name: "description",       weight: 10, required: false },
  { name: "image",             weight: 10, required: false },
  { name: "sku",               weight: 10, required: false },
  { name: "brand",             weight: 10, required: false },
  { name: "offers.availability", weight: 10, required: false },
  { name: "aggregateRating",   weight: 10, required: false },
  { name: "review",            weight: 10, required: false },
];

// 从对象中读取嵌套字段（支持 offers.price 这种路径）
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  var parts = path.split(".");
  var current = obj;
  for (var i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return undefined;
    current = current[parts[i]];
  }
  return current;
}

// 检查值是否为有效非空
function hasValue(val) {
  if (val === undefined || val === null) return false;
  if (typeof val === "string" && val.trim() === "") return false;
  if (Array.isArray(val) && val.length === 0) return false;
  if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) return false;
  return true;
}

// 从 HTML 中提取所有 JSON-LD 块
function extractJsonLd(html) {
  var results = [];
  var regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  var match;
  while ((match = regex.exec(html)) !== null) {
    var raw = match[1].trim();
    if (!raw) continue;
    try {
      var parsed = JSON.parse(raw);
      results.push(parsed);
    } catch (e) {
      // 跳过格式错误的 JSON-LD 块
      console.warn("[Schema Tester] Invalid JSON-LD block:", e.message);
    }
  }
  return results;
}

// 递归展开 @graph 数组，找到实际 schema 对象
function flattenSchemas(blocks) {
  var flat = [];
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (Array.isArray(block)) {
      flat = flat.concat(flattenSchemas(block));
    } else if (block && typeof block === "object") {
      if (block["@graph"] && Array.isArray(block["@graph"])) {
        flat = flat.concat(flattenSchemas(block["@graph"]));
      } else {
        flat.push(block);
      }
    }
  }
  return flat;
}

// 查找 Product 类型的 schema
function findProductSchema(schemas) {
  for (var i = 0; i < schemas.length; i++) {
    var s = schemas[i];
    if (!s || typeof s !== "object") continue;
    var type = s["@type"] || "";
    // @type 可能是字符串或数组
    if (typeof type === "string" && type.indexOf("Product") !== -1) return s;
    if (Array.isArray(type)) {
      for (var j = 0; j < type.length; j++) {
        if (typeof type[j] === "string" && type[j].indexOf("Product") !== -1) return s;
      }
    }
  }
  return null;
}

// 检查 Product schema 并返回字段检测结果
function analyzeProductSchema(productSchema) {
  var fields = [];
  var score = 0;
  var missingFields = [];

  for (var i = 0; i < FIELDS.length; i++) {
    var def = FIELDS[i];
    var val = getNestedValue(productSchema, def.name);
    var present = hasValue(val);
    fields.push({
      name: def.name,
      present: present,
      required: def.required,
    });
    if (present) {
      score += def.weight;
    } else {
      missingFields.push(def.name);
    }
  }

  return {
    fields: fields,
    score: score,
    missingFields: missingFields,
  };
}

export async function POST(request) {
  try {
    var body = await request.json();
    var url = (body && body.url) ? String(body.url).trim() : "";

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // URL 格式校验
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // 抓取目标页面 HTML
    var html = "";
    try {
      var response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MyGEOCheck/1.0; +https://mygeocheck.com)",
          "Accept": "text/html,application/xhtml+xml",        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch the page (HTTP " + response.status + "). Please check the URL and try again." },
          { status: 422 }
        );
      }

      html = await response.text();
    } catch (fetchErr) {
      console.error("[Schema Tester] Fetch error:", fetchErr.message);
      return NextResponse.json(
        { error: "Could not reach the page. Please verify the URL is accessible and try again." },
        { status: 422 }
      );
    }

    // 解析 JSON-LD
    var jsonLdBlocks = extractJsonLd(html);
    if (jsonLdBlocks.length === 0) {
      return NextResponse.json({
        found: false,
        schemaType: null,
        fields: [],
        score: 0,
        missingFields: [],
        rawSchema: null,
      });
    }

    // 展开并查找 Product schema
    var allSchemas = flattenSchemas(jsonLdBlocks);
    var productSchema = findProductSchema(allSchemas);

    if (!productSchema) {
      // 有 JSON-LD 但不是 Product 类型
      var firstType = null;
      for (var i = 0; i < allSchemas.length; i++) {
        if (allSchemas[i] && allSchemas[i]["@type"]) {
          firstType = Array.isArray(allSchemas[i]["@type"])
            ? allSchemas[i]["@type"].join(", ")
            : allSchemas[i]["@type"];
          break;
        }
      }
      return NextResponse.json({
        found: false,
        schemaType: firstType,
        fields: [],
        score: 0,
        missingFields: [],
        rawSchema: null,
      });
    }

    // 分析 Product schema 字段
    var analysis = analyzeProductSchema(productSchema);
    var schemaType = Array.isArray(productSchema["@type"])
      ? productSchema["@type"].join(", ")
      : (productSchema["@type"] || "Product");

    return NextResponse.json({
      found: true,
      schemaType: schemaType,
      fields: analysis.fields,
      score: analysis.score,
      missingFields: analysis.missingFields,
      rawSchema: productSchema,
    });

  } catch (err) {
    console.error("[Schema Tester] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
