'use client';

import { useState, useEffect, useRef, Component } from 'react';
import { useRouter } from 'next/navigation';
import translations, { LANGUAGES } from '@/lib/i18n';

// ============ Language Detection ============
function detectLanguage() {
  if (typeof window === 'undefined') return 'en';
  var saved = localStorage.getItem('geo_lang');
  if (saved && LANGUAGES[saved]) return saved;
  var browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('pt')) return 'pt';
  return 'en';
}

// ============ URL Guide Component ============
function UrlGuide({ lang }) {
  var [expanded, setExpanded] = useState(false);
  var t = translations[lang];

  return (
    <div style={{ marginTop: 16, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={function() { setExpanded(!expanded); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 16px', border: 'none',
          background: 'transparent', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, color: '#0369a1',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          {t.urlGuideTitle}
        </span>
        <svg style={{ width: 16, height: 16, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div style={{ padding: '0 16px 16px', fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 10px 0' }}>{t.urlGuideDesc}</p>
          <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#334155' }}>{t.urlGuideFormat}</p>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontFamily: 'monospace', fontSize: 13, color: '#0f172a', wordBreak: 'break-all', marginBottom: 12 }}>
            https://<span style={{ color: '#6366f1' }}>yourstore</span>.myshopify.com/<span style={{ color: '#059669' }}>products</span>/<span style={{ color: '#d97706' }}>your-product-name</span>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontFamily: 'monospace', fontSize: 13, color: '#0f172a', wordBreak: 'break-all', marginBottom: 12 }}>
            https://<span style={{ color: '#6366f1' }}>www.yourstore.com</span>/<span style={{ color: '#059669' }}>products</span>/<span style={{ color: '#d97706' }}>your-product-name</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
            ⚠️ {t.urlGuideTip}
          </p>
        </div>
      )}
    </div>
  );
}

// ============ Error Boundary ============
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>Display Error</h3>
            <p style={{ color: '#b91c1c', fontSize: 14, marginBottom: 8 }}>
              Something went wrong while displaying results. The analysis data was received successfully.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============ Inline Loading Component ============
function LoadingView({ text, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{ position: 'relative', width: 64, height: 64, marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '4px solid #e2e8f0',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg style={{ width: 32, height: 32, color: '#1e3a5f', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
            <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
      <p style={{ color: '#4b5563', fontWeight: 500, fontSize: 18, marginBottom: 8 }}>{text || 'Analyzing...'}</p>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>{hint || 'This usually takes 15-30 seconds'}</p>
      <div style={{ width: 256, marginTop: 24, height: 6, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#1e3a5f', borderRadius: 999, animation: 'loading 20s ease-in-out infinite' }} />
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          20% { width: 25%; }
          40% { width: 45%; }
          60% { width: 60%; }
          80% { width: 80%; }
          95% { width: 90%; }
          100% { width: 95%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// ============ Inline Issue Card ============
function IssueCard({ issue, lang }) {
  if (!issue || typeof issue !== 'object') return null;
  var t = translations[lang];

  var severityStyles = {
    high:   { bg: '#fef2f2', border: '#fecaca', icon: '\u{1F534}', label: t.highImpact,   badgeBg: '#fee2e2', badgeText: '#b91c1c' },
    medium: { bg: '#fffbeb', border: '#fde68a', icon: '\u{1F7E1}', label: t.mediumImpact, badgeBg: '#fef3c7', badgeText: '#b45309' },
    low:    { bg: '#eff6ff', border: '#bfdbfe', icon: '\u{1F535}', label: t.lowImpact,    badgeBg: '#dbeafe', badgeText: '#1d4ed8' },
  };

  var s = severityStyles[issue.severity] || severityStyles.medium;
  var category = issue.category || 'Issue';
  var issueText = issue.issue || '';
  var impact = issue.impact || '';
  var dimension = issue.dimension || '';

  return (
    <div style={{ background: s.bg, border: '1px solid ' + s.border, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>{s.icon}</span>
          <h4 style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{category}</h4>
        </div>
        <span style={{ background: s.badgeBg, color: s.badgeText, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
          {s.label}
        </span>
      </div>
      {issueText && <p style={{ color: '#374151', fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>{issueText}</p>}
      {impact && (
        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: 12, marginTop: 8 }}>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }}>{t.impactLabel}</p>
          <p style={{ fontSize: 14, color: '#4b5563', margin: 0 }}>{impact}</p>
        </div>
      )}
      {dimension && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, marginBottom: 0 }}>{t.dimensionLabel} {dimension}</p>}
    </div>
  );
}

// ============ Main Page Component ============
export default function CheckPage() {
  var router = useRouter();
  var [url, setUrl] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [results, setResults] = useState(null);
  var [loadingText, setLoadingText] = useState('');
  var [lang, setLang] = useState('en');
  var analysisIdRef = useRef(0);

  useEffect(function() {
    var initialLang = detectLanguage();
    setLang(initialLang);
    var onLangEvent = function(e) {
      setLang(e.detail.lang);
    };
    window.addEventListener('languagechange', onLangEvent);
    return function() {
      window.removeEventListener('languagechange', onLangEvent);
    };
  }, []);

  var t = translations[lang];

  var loadingMessages = {
    en: ['Fetching your product page...', 'Analyzing product title and metadata...', 'Checking structured data markup...', 'Evaluating AI search readiness...', 'Comparing against GEO best practices...', 'Generating your visibility score...'],
    de: ['Produktseite wird abgerufen...', 'Produkttitel und Metadaten werden analysiert...', 'Strukturierte Daten werden geprüft...', 'KI-Suchbereitschaft wird bewertet...', 'Vergleich mit GEO-Best-Practices...', 'Sichtbarkeits-Score wird erstellt...'],
    fr: ['Récupération de la page produit...', 'Analyse du titre et des métadonnées...', 'Vérification du balisage structuré...', 'Évaluation de la préparation IA...', 'Comparaison avec les meilleures pratiques...', 'Génération de votre score...'],
    es: ['Obteniendo tu página de producto...', 'Analizando título y metadatos...', 'Verificando datos estructurados...', 'Evaluando preparación para búsqueda IA...', 'Comparando con mejores prácticas GEO...', 'Generando tu puntuación...'],
    pt: ['Buscando sua página de produto...', 'Analisando título e metadados...', 'Verificando dados estruturados...', 'Avaliando prontidão para busca IA...', 'Comparando com melhores práticas GEO...', 'Gerando sua pontuação...'],
    zh: ['正在获取产品页面...', '正在分析产品标题和元数据...', '正在检查结构化数据标记...', '正在评估 AI 搜索就绪度...', '正在对比 GEO 最佳实践...', '正在生成可见度评分...'],
  };

  function handleAnalyze(e) {
    e.preventDefault();

    // Concurrent request protection: block if another analysis is in progress
    if (window.__geoAnalyzing) {
      setError(t.errorBusy);
      return;
    }
    window.__geoAnalyzing = true;

    setError('');
    setResults(null);

    var currentId = Date.now();
    analysisIdRef.current = currentId;

    var inputUrl = url.trim();
    if (!inputUrl) {
      setError(t.errorEmptyUrl);
      return;
    }
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      inputUrl = 'https://' + inputUrl;
    }
    try {
      new URL(inputUrl);
    } catch (err) {
      setError(t.errorInvalidUrl);
      return;
    }

    setLoading(true);

    var msgs = loadingMessages[lang] || loadingMessages.en;
    var msgIndex = 0;
    setLoadingText(msgs[0]);
    var msgInterval = setInterval(function() {
      msgIndex = (msgIndex + 1) % msgs.length;
      setLoadingText(msgs[msgIndex]);
    }, 2500);

    // 封装分析请求函数（支持自动重试）
    function runAnalysis() {
      return fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      })
      .then(function(res) {
        // Detect 504/503 timeout errors from Vercel concurrency limits
        if (res.status === 504 || res.status === 503) {
          throw new Error('__TIMEOUT__');
        }
        return res.json();
      })
      .then(function(data) {
        if (!data.success) {
          throw new Error(data.error || t.errorGeneric);
        }
        return data;
      });
    }

    // 保存分析结果到 localStorage
    function saveReport(data) {
      try {
        if (data && data.report_id) {
          var fullReport = {
            report_id: data.report_id,
            url: inputUrl,
            score: data.score || 0,
            product_name: data.product_name || '',
            store_name: data.store_name || '',
            free_issues: Array.isArray(data.free_issues) ? data.free_issues : [],
            full_report: data.full_report || null,
            total_issues_count: data.total_issues_count || 0,
            stored_at: Date.now(),
          };
          localStorage.setItem('geo_report_' + data.report_id, JSON.stringify(fullReport));
        }
      } catch (storageErr) {
        console.warn('localStorage save failed:', storageErr);
      }
    }

    // 执行分析，AI 失败时自动重试 1 次（前端静默重试）
    runAnalysis()
    .then(function(data) {
      // 如果 AI 分析降级（3次后端重试都失败），前端再自动重试 1 次
      if (data._fallback) {
        console.log('[Frontend] AI fallback detected, auto-retrying in 2s...');
        setLoadingText((lang === 'zh' ? '分析未完成，正在重新分析...' : 'Analysis incomplete, re-analyzing...'));
        return new Promise(function(resolve) {
          setTimeout(function() {
            runAnalysis()
            .then(function(retryData) {
              console.log('[Frontend] Retry result, fallback:', retryData._fallback);
              resolve(retryData); // 无论重试是否成功，都用新结果
            })
            .catch(function() {
              resolve(data); // 重试也失败，用原始降级结果
            });
          }, 2000);
        });
      }
      return data;
    })
    .then(function(finalData) {
      if (analysisIdRef.current !== currentId) return;
      saveReport(finalData);
      setResults(finalData);
    })
    .catch(function(err) {
      if (analysisIdRef.current !== currentId) return;
      console.error('Analysis error:', err);
      setResults(null); // 清除旧结果，防止显示之前的报告
      // Show specific message for 504/503 timeout errors
      if (err.message === '__TIMEOUT__') {
        setError(t.errorTimeout);
      } else {
        setError(err.message || t.errorGeneric);
      }
    })
    .finally(function() {
      if (analysisIdRef.current !== currentId) return;
      clearInterval(msgInterval);
      setLoading(false);
      window.__geoAnalyzing = false; // Release concurrent lock
    });
  }

  function handleCheckout() {
    if (!results || !results.report_id) return;

    // Store report_id and email for success page (in case email delivery fails)
    try {
      localStorage.setItem('last_payment_report_id', results.report_id);
      var emailEl = document.getElementById('geo-email-input');
      if (emailEl && emailEl.value) localStorage.setItem('last_payment_email', emailEl.value.trim());
    } catch(e) {}

    // Set loading state for checkout
    setLoading(true);
    setLoadingText('Redirecting to secure checkout...');

    fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: results.report_id }),
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.checkout_url) {
        // Redirect to Creem checkout
        window.location.href = data.checkout_url;
      } else {
        // Payment not configured yet — show report page (free mode)
        router.push('/report/' + results.report_id);
      }
    })
    .catch(function(err) {
      console.error('Checkout error:', err);
      // Fallback to report page
      router.push('/report/' + results.report_id);
    })
    .finally(function() {
      setLoading(false);
    });
  }

  var freeIssues = (results && Array.isArray(results.free_issues)) ? results.free_issues : [];
  var score = (results && typeof results.score === 'number') ? results.score : 0;
  var productName = (results && results.product_name) ? results.product_name : 'Your Product';
  var storeName = (results && results.store_name) ? results.store_name : '';
  var totalIssues = (results && results.total_issues_count) ? results.total_issues_count : freeIssues.length;

  var scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  var scoreTextColor = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';
  var scoreMessage = score >= 70
    ? t.scoreHigh
    : score >= 40
    ? t.scoreMedium
    : t.scoreLow;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Hero */}
      <section style={{ background: '#1e3a5f', padding: '48px 16px', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          {t.heroTitle}
        </h1>
        <p style={{ fontSize: 18, color: '#8bb5db' }}>
          {t.heroSubtitle}
        </p>
      </section>

      {/* Input Form */}
      <section style={{ padding: '48px 16px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <form onSubmit={handleAnalyze} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: 32 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              {t.inputLabel}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <input
                type="text"
                value={url}
                onChange={function(e) { setUrl(e.target.value); }}
                placeholder={t.inputPlaceholder}
                disabled={loading}
                style={{
                  flex: 1, minWidth: 200,
                  padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8,
                  fontSize: 16, color: '#1f2937', outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#10b981', color: '#fff', fontWeight: 600,
                  padding: '12px 32px', borderRadius: 8, border: 'none',
                  fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1, whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {loading ? t.analyzingBtn : t.analyzeBtn}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: 12, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 14 }}>
                {error}
              </div>
            )}

            <p style={{ marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
              {t.urlHint}
            </p>

            {/* URL Guide */}
            <UrlGuide lang={lang} />
          </form>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <section style={{ paddingBottom: 48 }}>
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px' }}>
            <LoadingView text={loadingText} hint={t.loadingHint} />
          </div>
        </section>
      )}

      {/* Results */}
      {results && !loading && (
        <ErrorBoundary>
          <section style={{ paddingBottom: 48 }}>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
              {/* Score */}
              <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: 32, marginBottom: 32 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 128, height: 128, borderRadius: '50%',
                      border: '4px solid ' + scoreColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 36, fontWeight: 700,
                      color: scoreTextColor,
                    }}>
                      {score}
                    </div>
                    <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>{t.scoreLabel}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4, marginTop: 0 }}>{productName}</h2>
                    {storeName && <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 8, marginTop: 0 }}>{storeName}</p>}
                    <p style={{ color: '#4b5563', margin: 0 }}>{scoreMessage}</p>
                  </div>
                </div>
              </div>

              {/* Free Issues */}
              {freeIssues.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
                    {t.topIssues}
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>
                      ({t.showingOf} {freeIssues.length} {t.of} {totalIssues} {t.issues})
                    </span>
                  </h3>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {freeIssues.map(function(issue, index) {
                      return <IssueCard key={index} issue={issue} lang={lang} />;
                    })}
                  </div>
                </div>
              )}

              {/* Email Collection */}
              {freeIssues.length > 0 && (
                <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 16, padding: 32, marginBottom: 32, textAlign: 'center' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8, marginTop: 0 }}>
                    📧 Get Free GEO Tips via Email
                  </h3>
                  <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 16 }}>
                    Receive weekly GEO optimization tips and AI search insights directly in your inbox.
                  </p>
                  <form onSubmit={function(e) {
                    e.preventDefault();
                    var emailInput = document.getElementById('geo-email-input');
                    var email = emailInput ? emailInput.value.trim() : '';
                    if (!email || !email.includes('@')) return;
                    fetch('/api/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: email, source: 'check_page' }),
                    }).then(function() {
                      var container = document.getElementById('email-form-container');
                      if (container) {
                        container.innerHTML = '<div style="padding:16px;color:#047857;font-weight:600;font-size:15px;">✅ Thanks! Check your inbox for a confirmation.</div>';
                      }
                    }).catch(function() {
                      var container = document.getElementById('email-form-container');
                      if (container) {
                        container.innerHTML = '<div style="padding:16px;color:#b91c1c;font-size:14px;">Something went wrong. Please try again.</div>';
                      }
                    });
                  }} id="email-form-container" style={{ display: 'flex', gap: 12, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <input
                      id="geo-email-input"
                      type="email"
                      placeholder="your@email.com"
                      required
                      style={{
                        flex: 1, minWidth: 200, padding: '10px 16px',
                        border: '2px solid #d1d5db', borderRadius: 8,
                        fontSize: 15, outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: '#10b981', color: '#fff', fontWeight: 600,
                        padding: '10px 24px', borderRadius: 8, border: 'none',
                        fontSize: 15, cursor: 'pointer',
                      }}
                    >
                      Subscribe Free
                    </button>
                  </form>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>No spam. Unsubscribe anytime.</p>
                </div>
              )}

              {/* CTA: Unlock Full Report */}
              <div style={{
                borderRadius: 16, padding: 32, textAlign: 'center', color: '#fff',
                background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u{1F513}'}</div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{t.ctaTitle}</h3>
                  <p style={{ fontSize: 14, marginBottom: 24, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', color: '#8bb5db' }}>
                    {t.ctaSubtitle}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32, fontSize: 14, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
                    {[
                      { title: t.ctaFeature1, sub: t.ctaFeature1Sub },
                      { title: t.ctaFeature2, sub: t.ctaFeature2Sub },
                      { title: t.ctaFeature3, sub: t.ctaFeature3Sub },
                      { title: t.ctaFeature4, sub: t.ctaFeature4Sub },
                    ].map(function(item, i) {
                      return (
                        <div key={i} style={{ borderRadius: 8, padding: 12, background: 'rgba(255,255,255,0.1)' }}>
                          <div style={{ fontWeight: 600 }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: '#8bb5db' }}>{item.sub}</div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleCheckout}
                    style={{
                      background: '#10b981', color: '#fff', fontWeight: 700,
                      padding: '16px 40px', borderRadius: 8, border: 'none',
                      fontSize: 18, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    onMouseOver={function(e) { e.currentTarget.style.backgroundColor = '#059669'; }}
                    onMouseOut={function(e) { e.currentTarget.style.backgroundColor = '#10b981'; }}
                  >
                    {t.ctaButton} — {t.ctaButtonPrice}
                    <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>

                  <p style={{ fontSize: 12, marginTop: 16, color: '#6ee7b7' }}>
                    {t.ctaGuarantee} &bull; {t.ctaGuarantee2} &bull; {t.ctaGuarantee3}
                  </p>
                </div>
              </div>

              {/* Full Report Contents */}
              <div style={{ marginTop: 48, background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16, marginTop: 0 }}>
                  {t.reportTitle}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, fontSize: 14 }}>
                  {t.reportItems.map(function(item, i) {
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4b5563' }}>
                        <svg style={{ width: 16, height: 16, flexShrink: 0, color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </ErrorBoundary>
      )}
    </div>
  );
}
