"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

// ============ Score Ring Component ============
function ScoreRing({ score }) {
  var radius = 54;
  var circumference = 2 * Math.PI * radius;
  var offset = circumference - (score / 100) * circumference;
  var color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

// ============ Field Row Component ============
function FieldRow({ field, p }) {
  var isPresent = field.present;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 16px", borderRadius: 8,
      background: isPresent ? "#f0fdf4" : "#fef2f2",
      marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>{isPresent ? "✅" : "❌"}</span>
        <div>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{field.name}</span>
          {field.required && (
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 500,
              background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: 4,
            }}>Required</span>
          )}
        </div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 500,
        color: isPresent ? "#16a34a" : "#dc2626",
      }}>
        {isPresent ? p.schemaFieldPresent : p.schemaFieldMissing}
      </span>
    </div>
  );
}

// ============ Main Page Component ============
export default function SchemaTesterPage() {
  var [url, setUrl] = useState("");
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");
  var [result, setResult] = useState(null);
  var lang = useLang();

  var p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  function handleAnalyze(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    var inputUrl = url.trim();
    if (!inputUrl) {
      setError(lang === "zh" ? "请输入产品链接" : "Please enter a product URL");
      return;
    }
    if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
      inputUrl = "https://" + inputUrl;
    }
    try {
      new URL(inputUrl);
    } catch (err) {
      setError(lang === "zh" ? "链接格式无效" : "Invalid URL format");
      return;
    }

    setLoading(true);

    fetch("/api/tools/schema-tester", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: inputUrl }),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.error) {
          setError(data.error);
          return;
        }
        setResult(data);
      })
      .catch(function(err) {
        console.error("Schema tester error:", err);
        setError(lang === "zh" ? "检测失败，请稍后重试" : "Analysis failed. Please try again later.");
      })
      .finally(function() {
        setLoading(false);
      });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Hero */}
      <section style={{
        background: "#1e3a5f", padding: "48px 16px", textAlign: "center", position: "relative",
      }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
          {p.schemaTitle}
        </h1>
        <p style={{ fontSize: 18, color: "#8bb5db", marginBottom: 8 }}>
          {p.schemaSubtitle}
        </p>
        <p style={{ fontSize: 14, color: "#a0c4e8", maxWidth: 600, margin: "0 auto" }}>
          {p.schemaOneLiner}
        </p>
      </section>

      {/* Input Form */}
      <section style={{ padding: "48px 16px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <form onSubmit={handleAnalyze} style={{
            background: "#fff", borderRadius: 16,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", padding: 32,
          }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
              {p.schemaInputLabel}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <input
                type="text"
                value={url}
                onChange={function(e) { setUrl(e.target.value); }}
                placeholder={p.schemaInputPlaceholder}
                disabled={loading}
                style={{
                  flex: 1, minWidth: 200,
                  padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: 8,
                  fontSize: 16, color: "#1f2937", outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "#10b981", color: "#fff", fontWeight: 600,
                  padding: "12px 32px", borderRadius: 8, border: "none",
                  fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1, whiteSpace: "nowrap",
                }}
              >
                {loading ? (lang === "zh" ? "检测中..." : "Checking...") : p.schemaAnalyzeBtn}
              </button>
            </div>

            {error && (
              <div style={{
                marginTop: 16, padding: "12px 16px", borderRadius: 8,
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "#991b1b", fontSize: 14,
              }}>
                {error}
              </div>
            )}
          </form>

          {/* Results */}
          {result && (
            <div style={{ marginTop: 32 }}>
              {/* Score Section */}
              {result.found && (
                <div style={{
                  background: "#fff", borderRadius: 16,
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", padding: 32,
                  marginBottom: 24, textAlign: "center",
                }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 24 }}>
                    {p.schemaScore}
                  </h2>
                  <ScoreRing score={result.score} />
                  <p style={{ marginTop: 16, fontSize: 14, color: "#6b7280" }}>
                    {p.schemaType}: <strong>{result.schemaType}</strong>
                  </p>
                </div>
              )}

              {/* Found or Missing */}
              {result.found ? (
                <div style={{
                  background: "#fff", borderRadius: 16,
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", padding: 32,
                  marginBottom: 24,
                }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#16a34a", marginBottom: 20 }}>
                    ✅ {p.schemaFoundTitle}
                  </h2>

                  {result.fields && result.fields.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
                        {p.schemaFields}
                      </h3>
                      {result.fields.map(function(field, idx) {
                        return <FieldRow key={idx} field={field} p={p} />;
                      })}
                    </div>
                  )}

                  {result.missingFields && result.missingFields.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#dc2626", marginBottom: 12 }}>
                        ❌ {p.schemaMissingFields}
                      </h3>
                      {result.missingFields.map(function(fieldName, idx) {
                        return (
                          <div key={idx} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 12px", background: "#fef2f2", borderRadius: 6,
                            marginBottom: 6, fontSize: 14, color: "#991b1b",
                          }}>
                            <span>•</span>
                            <span>{fieldName}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  background: "#fff", borderRadius: 16,
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", padding: 32,
                  marginBottom: 24,
                }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#dc2626", marginBottom: 12 }}>
                    ❌ {p.schemaMissingTitle}
                  </h2>
                  <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.7, marginBottom: 24 }}>
                    {p.schemaMissingDesc}
                  </p>

                  <div style={{
                    background: "#f0f9ff", border: "1px solid #bae6fd",
                    borderRadius: 12, padding: 24,
                  }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0369a1", marginBottom: 8 }}>
                      {p.schemaFixTitle}
                    </h3>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, margin: 0 }}>
                      {p.schemaFixDesc}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Educational Content Sections */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginTop: 40, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 12 }}>{p.schemaWhatIsTitle}</h2>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{p.schemaWhatIsText}</p>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginTop: 24, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 12 }}>{p.schemaHowToTitle}</h2>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line" }}>{p.schemaHowToText}</div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginTop: 24, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 12 }}>{p.schemaWhoForTitle}</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {p.schemaWhoForItems.split(',').map(function(item, i) {
                return (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 14, color: "#374151" }}>
                    <span style={{ color: "#6366f1", flexShrink: 0 }}>{"•"}</span>
                    <span>{item.trim()}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginTop: 24, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 12 }}>{p.schemaBestTitle}</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {p.schemaBestItems.split(',').map(function(item, i) {
                return (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 14, color: "#374151" }}>
                    <span style={{ color: "#10b981", flexShrink: 0 }}>{"✓"}</span>
                    <span>{item.trim()}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginTop: 24, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 12 }}>{p.schemaMistakesTitle}</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {p.schemaMistakesItems.split(',').map(function(item, i) {
                return (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 14, color: "#374151" }}>
                    <span style={{ color: "#ef4444", flexShrink: 0 }}>{"✗"}</span>
                    <span>{item.trim()}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginTop: 24, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 16 }}>{p.schemaFaqTitle}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{p.schemaFaq1Q}</h3>
                <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{p.schemaFaq1A}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{p.schemaFaq2Q}</h3>
                <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{p.schemaFaq2A}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{p.schemaFaq3Q}</h3>
                <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{p.schemaFaq3A}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{p.schemaFaq4Q}</h3>
                <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{p.schemaFaq4A}</p>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginTop: 24, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 12 }}>{p.schemaNextStepTitle}</h2>
            <p style={{ fontSize: 14, color: "#374151", marginBottom: 16 }}>{p.schemaNextStepText}</p>
            <div style={{ display: "flex", gap: 16 }}>
              <Link href="/tools" style={{ color: "#6366f1", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>View all tools {"→"}</Link>
              <Link href="/tools/title-analyzer" style={{ color: "#6366f1", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Title Analyzer {"→"}</Link>
            </div>
          </div>

                    {/* CTA */}
          <div style={{
            marginTop: 40, background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
            borderRadius: 16, padding: "32px 24px", textAlign: "center",
          }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 20 }}>
              {p.schemaCta}
            </p>
            <Link href="/check" style={{
              display: "inline-block", background: "#10b981", color: "#fff",
              fontWeight: 600, padding: "14px 36px", borderRadius: 8,
              textDecoration: "none", fontSize: 16,
            }}>
              {p.schemaCtaBtn}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
