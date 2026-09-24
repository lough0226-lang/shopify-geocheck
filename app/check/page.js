'use client';

import { useState, useEffect, useRef, Component } from 'react';
import { useRouter } from 'next/navigation';
import translations, { LANGUAGES } from '@/lib/i18n';
import FoundingOffer from '@/components/FoundingOffer';

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
function LoadingView({ text }) {
  var COUNTDOWN = 10;
  var [countdown, setCountdown] = useState(COUNTDOWN);
  var [progress, setProgress] = useState(0);

  useEffect(function() {
    var interval = setInterval(function() {
      setCountdown(function(prev) {
        if (prev <= 1) return 0;
        return prev - 1;
      });
      setProgress(function(prev) {
        var next = prev + (100 / COUNTDOWN);
        return next > 100 ? 100 : next;
      });
    }, 1000);
    return function() { clearInterval(interval); };
  }, []);

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
      <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 0 }}>⏱ {countdown > 0 ? countdown + 's' : 'Almost done...'}</p>
      <div style={{ width: 256, marginTop: 24, height: 6, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: progress + '%', background: '#1e3a5f', borderRadius: 999, transition: 'width 1s linear' }} />
      </div>
      <style>{`
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
  var [errorInfo, setErrorInfo] = useState(null);
  var [results, setResults] = useState(null);
  var [loadingText, setLoadingText] = useState('');
  var [lang, setLang] = useState('en');
  var [autoStart, setAutoStart] = useState(false);
  var [joinFounding, setJoinFounding] = useState(false);
  var [foundingEmail, setFoundingEmail] = useState('');
  var analysisIdRef = useRef(0);

  // Pre-fill URL from query parameter (e.g., from hero input) and auto-start
  useEffect(function() {
    if (typeof window !== 'undefined') {
      var params = new URLSearchParams(window.location.search);
      var prefillUrl = params.get('url');
      if (prefillUrl) {
        setUrl(prefillUrl);
        params.delete('url');
        var newUrl = window.location.pathname;
        var remaining = params.toString();
        if (remaining) newUrl += '?' + remaining;
        window.history.replaceState({}, '', newUrl);
        // 自动触发检测
        setAutoStart(true);
      }
    }
  }, []);

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

  // Auto-start analysis when URL is pre-filled from hero input
  useEffect(function() {
    if (autoStart && url && !loading && !results) {
      setAutoStart(false);
      // 模拟表单提交事件
      handleAnalyze({ preventDefault: function() {} });
    }
  }, [autoStart, url]);

  var t = translations[lang];

  var loadingMessages = {
    en: ['Fetching your product page...', 'Analyzing product title and metadata...', 'Checking structured data markup...', 'Simulating AI search queries...', 'Identifying competitors in your category...', 'Generating your visibility score...'],
    de: ['Produktseite wird abgerufen...', 'Produkttitel und Metadaten werden analysiert...', 'Strukturierte Daten werden geprüft...', 'KI-Suchbereitschaft wird bewertet...', 'Vergleich mit GEO-Best-Practices...', 'Sichtbarkeits-Score wird erstellt...'],
    fr: ['Récupération de la page produit...', 'Analyse du titre et des métadonnées...', 'Vérification du balisage structuré...', 'Évaluation de la préparation IA...', 'Comparaison avec les meilleures pratiques...', 'Génération de votre score...'],
    es: ['Obteniendo tu página de producto...', 'Analizando título y metadatos...', 'Verificando datos estructurados...', 'Evaluando preparación para búsqueda IA...', 'Comparando con mejores prácticas GEO...', 'Generando tu puntuación...'],
    pt: ['Buscando sua página de produto...', 'Analisando título e metadados...', 'Verificando dados estruturados...', 'Avaliando prontidão para busca IA...', 'Comparando com melhores práticas GEO...', 'Gerando sua pontuação...'],
    zh: ['正在获取产品页面...', '正在分析产品标题和元数据...', '正在检查结构化数据标记...', '正在模拟 AI 搜索查询...', '正在识别同类竞品...', '正在生成可见度评分...'],
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
    setErrorInfo(null);
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
    var parsedInput;
    try {
      parsedInput = new URL(inputUrl);
    } catch (err) {
      setError(t.errorInvalidUrl);
      return;
    }

    // 前置校验：必须是 /products/<产品名> 的产品详情页，目录页/首页/政策页直接拦截
    if (!/\/products\/[^/?#]+/.test(parsedInput.pathname)) {
      setError(t.errorNotProductPage || 'This link is not a specific product page. Please paste a product link containing /products/.');
      setErrorInfo({
        type: 'NOT_PRODUCT_PAGE',
        title: t.errorNotProductTitle || 'Please use a product link',
        suggestions: (t.errorNotProductSuggestions && t.errorNotProductSuggestions.length)
          ? t.errorNotProductSuggestions
          : [
              'Open the product you want to check in your store',
              'Copy the link from your browser address bar — it should contain /products/',
              'Example: https://yourstore.com/products/your-product-name',
            ],
      });
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
      var payload = { url: inputUrl, lang: lang };
      if (joinFounding) {
        var fEmail = (foundingEmail || '').trim();
        if (fEmail && fEmail.indexOf('@') !== -1) {
          payload.email = fEmail;
          payload.join_founding = true;
          payload.founding_agreements = {
            agreed_return: true,
            agreed_feedback: true,
            agreed_case: true,
          };
        }
      }
      return fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      .then(function(res) {
        // Detect 504/503 timeout errors from Vercel concurrency limits
        if (res.status === 504 || res.status === 503) {
          throw new Error('__TIMEOUT__');
        }
        // Capture 422 structured error response before throwing
        if (res.status === 422) {
          return res.json().then(function(errData) {
            var err = new Error(errData.error || t.errorGeneric);
            err.errorType = errData.error_type || 'GENERIC';
            err.errorTitle = errData.error_title || 'Error';
            err.suggestions = errData.suggestions || [];
            throw err;
          });
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
            verdict: data.verdict || '',
            industry_benchmark: data.industry_benchmark || null,
            buyer_queries: Array.isArray(data.buyer_queries) ? data.buyer_queries : [],
            query_match_scores: Array.isArray(data.query_match_scores) ? data.query_match_scores : [],
            competitors: Array.isArray(data.competitors) ? data.competitors : [],
            diagnosis: Array.isArray(data.diagnosis) ? data.diagnosis : (Array.isArray(data.free_issues) ? data.free_issues : []),
            paid_fixes_teasers: Array.isArray(data.paid_fixes_teasers) ? data.paid_fixes_teasers : [],
            paid_value_prop: data.paid_value_prop || '',
            unlocked: data.unlocked || false,
            free_issues: Array.isArray(data.diagnosis || data.free_issues) ? (data.diagnosis || data.free_issues) : [],
            full_report: null,
            total_issues_count: (data.diagnosis || data.free_issues || []).length,
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
        setErrorInfo(null);
      } else if (err.errorType) {
        // Structured scraping error with user-friendly info
        setError(err.message);
        setErrorInfo({
          type: err.errorType,
          title: err.errorTitle,
          suggestions: err.suggestions || [],
        });
      } else {
        setError(err.message || t.errorGeneric);
        setErrorInfo(null);
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
    setLoadingText(t.checkoutRedirect);

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

  // 优先使用新 freemium 结构（diagnosis），向后兼容旧结构（free_issues）
  var diagnosis = (results && Array.isArray(results.diagnosis))
    ? results.diagnosis
    : ((results && Array.isArray(results.free_issues)) ? results.free_issues : []);
  var freeIssues = diagnosis;
  var score = (results && typeof results.score === 'number') ? results.score : 0;
  var productName = (results && results.product_name) ? results.product_name : 'Your Product';
  var storeName = (results && results.store_name) ? results.store_name : '';
  var totalIssues = (results && results.total_issues_count) ? results.total_issues_count : diagnosis.length;

  // 新增 freemium 数据
  var verdict = (results && results.verdict) ? results.verdict : '';
  var industryBenchmark = (results && results.industry_benchmark) ? results.industry_benchmark : {};
  var buyerQueries = (results && Array.isArray(results.buyer_queries)) ? results.buyer_queries : [];
  var queryMatchScores = (results && Array.isArray(results.query_match_scores)) ? results.query_match_scores : [];
  var competitors = (results && Array.isArray(results.competitors)) ? results.competitors : [];
  var paidFixesTeasers = (results && Array.isArray(results.paid_fixes_teasers)) ? results.paid_fixes_teasers : [];
  var isUnlocked = results && results.unlocked === true;

  // Verdict 样式
  var verdictIcon = verdict.indexOf('unlikely') !== -1 ? '❌'
    : verdict.indexOf('likely to recommend') !== -1 ? '✅' : '⚠️';
  var verdictBg = verdict.indexOf('unlikely') !== -1 ? '#fef2f2'
    : verdict.indexOf('likely to recommend') !== -1 ? '#f0fdf4' : '#fffbeb';
  var verdictBorder = verdict.indexOf('unlikely') !== -1 ? '#fecaca'
    : verdict.indexOf('likely to recommend') !== -1 ? '#bbf7d0' : '#fde68a';
  var verdictColor = verdict.indexOf('unlikely') !== -1 ? '#991b1b'
    : verdict.indexOf('likely to recommend') !== -1 ? '#166534' : '#92400e';

  // 翻译 helper（带默认值兜底）
  function tk(key, defaultVal) {
    return (t && t[key]) ? t[key] : defaultVal;
  }

  function matchIcon(match) {
    if (match === 'high') return '✅';
    if (match === 'medium') return '⚠️';
    if (match === 'low') return '⚠️';
    return '❌';
  }
  function matchBorder(match) {
    if (match === 'high') return '#bbf7d0';
    if (match === 'medium') return '#fde68a';
    if (match === 'low') return '#fde68a';
    return '#fecaca';
  }
  function matchBg(match) {
    if (match === 'high') return '#f0fdf4';
    if (match === 'medium') return '#fffbeb';
    if (match === 'low') return '#fffbeb';
    return '#fef2f2';
  }
  function matchBadge(match) {
    if (match === 'high') return { bg: '#dcfce7', color: '#166534' };
    if (match === 'medium' || match === 'low') return { bg: '#fef3c7', color: '#92400e' };
    return { bg: '#fee2e2', color: '#991b1b' };
  }
  function matchLabel(match) {
    if (match === 'high') return tk('matchHigh', 'Strong match');
    if (match === 'medium') return tk('matchMedium', 'Partial match');
    if (match === 'low') return tk('matchLow', 'Weak match');
    return tk('matchFail', 'Not matching');
  }

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

            <div style={{ marginTop: 24 }}>
              <FoundingOffer
                checked={joinFounding}
                onCheckedChange={setJoinFounding}
                email={foundingEmail}
                onEmailChange={setFoundingEmail}
                disabled={loading}
              />
            </div>

            {error && !errorInfo && (
              <div style={{ marginTop: 12, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 14 }}>
                {error}
              </div>
            )}

            {/* Structured Error Card with suggestions */}
            {error && errorInfo && (
              <div style={{ marginTop: 16, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 20, overflow: 'hidden' }}>
                {/* Error icon + title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>
                    {errorInfo.type === 'NOT_FOUND' ? '🔍' : errorInfo.type === 'ANTI_BOT' ? '🛡️' : errorInfo.type === 'ACCESS_DENIED' ? '🔒' : '⚠️'}
                  </span>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#92400e' }}>
                    {errorInfo.title}
                  </h4>
                </div>
                {/* Error explanation */}
                <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#78350f', lineHeight: 1.6 }}>
                  {error}
                </p>
                {/* Suggestions */}
                {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '12px 16px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 600, color: '#92400e' }}>💡 What you can try:</p>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#78350f', lineHeight: 1.8 }}>
                      {errorInfo.suggestions.map(function(s, i) {
                        return <li key={i}>{s}</li>;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <p style={{ marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
              {t.urlHint}
            </p>

            {/* URL Guide */}
            <UrlGuide lang={lang} />

            {/* Language note */}
            {lang !== 'en' && (
              <p style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                🌐 {t.reportLanguageNote}
              </p>
            )}
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
              {/* 1. Verdict 判定卡片 */}
              {verdict && (
                <div style={{
                  background: verdictBg, border: '2px solid ' + verdictBorder,
                  borderRadius: 16, padding: '28px 32px', marginBottom: 24, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{verdictIcon}</div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: verdictColor, margin: 0, lineHeight: 1.4 }}>
                    {verdict}
                  </h2>
                </div>
              )}

              {/* 2. Score + 行业对比 */}
              <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: 32, marginBottom: 24 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 128, height: 128, borderRadius: '50%',
                      border: '4px solid ' + scoreColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 36, fontWeight: 700,
                      color: scoreTextColor,
                    }}>
                      {score}<span style={{ fontSize: 18, color: '#9ca3af' }}>/100</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>{t.scoreLabel}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4, marginTop: 0 }}>{productName}</h2>
                    {storeName && <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 10, marginTop: 0 }}>{storeName}</p>}
                    <p style={{ color: '#4b5563', margin: '0 0 12px 0' }}>{scoreMessage}</p>
                    {industryBenchmark && industryBenchmark.percentile != null && (
                      <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, border: '1px solid #bae6fd' }}>
                        <p style={{ fontSize: 15, color: '#0369a1', fontWeight: 600, margin: 0 }}>
                          {'📊 ' + tk('industryBenchmark', 'You scored better than {percentile}% of similar stores').replace('{percentile}', industryBenchmark.percentile)}
                        </p>
                        {industryBenchmark.message && (
                          <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 0 0' }}>{industryBenchmark.message}</p>
                        )}
                        {industryBenchmark.exposure_score != null && (
                          <p style={{ fontSize: 14, color: '#0369a1', margin: '8px 0 0 0', fontWeight: 600 }}>
                            {'🎯 AI Exposure Score: ' + industryBenchmark.exposure_score + '% — ' + tk('exposureDesc', 'Your page can be recommended by AI for {pct}% of real buyer queries').replace('{pct}', industryBenchmark.exposure_score)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. 模拟买家搜索匹配 */}
              {buyerQueries.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: 32, marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8, marginTop: 0 }}>
                    {'🔎 ' + tk('buyerQueriesTitle', 'How buyers search for products like yours')}
                  </h2>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                    {tk('buyerQueriesSubtitle', 'Real questions buyers ask AI assistants. Here is how your page matches.')}
                  </p>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {buyerQueries.map(function(query, i) {
                      var matchData = queryMatchScores[i] || {};
                      var match = matchData.match || 'low';
                      var badge = matchBadge(match);
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          background: matchBg(match), borderRadius: 10, padding: '14px 16px',
                          border: '1px solid ' + matchBorder(match),
                        }}>
                          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{matchIcon(match)}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 500, color: '#1f2937', margin: 0, fontFamily: 'monospace' }}>
                              "{query}"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                background: badge.bg, color: badge.color,
                              }}>
                                {matchLabel(match)}
                              </span>
                              {matchData.reason && (
                                <span style={{ fontSize: 12, color: '#6b7280' }}>{matchData.reason}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. 竞品对比（免费版模糊） */}
              {competitors.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: 32, marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8, marginTop: 0 }}>
                    {'🏆 ' + tk('competitorTitle', "Who's winning these searches")}
                  </h2>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                    {tk('competitorSubtitle', 'Top competitors appearing in AI search results for your product type.')}
                  </p>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {competitors.map(function(comp, i) {
                      var isBlurred = !isUnlocked && (comp.name === 'A well-known brand in this category' || comp.domain === 'competitor-store.com');
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          background: '#fafafa', borderRadius: 10, padding: '14px 16px',
                          border: '1px solid #e5e7eb',
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                fontSize: 14, fontWeight: 600,
                                color: isBlurred ? '#9ca3af' : '#1f2937',
                                fontStyle: isBlurred ? 'italic' : 'normal',
                              }}>
                                {comp.name}
                              </span>
                              {isBlurred && <span style={{ fontSize: 16 }}>🔒</span>}
                            </div>
                            {isBlurred && (
                              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0 0', fontStyle: 'italic' }}>
                                {tk('competitorBlurred', 'A well-known brand in this category')}
                              </p>
                            )}
                            {comp.why_they_win && (
                              <p style={{ fontSize: 13, color: '#4b5563', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                                {comp.why_they_win}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. 诊断问题（免费版只给问题+影响，不给方案） */}
              {diagnosis.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                    {'🔍 ' + tk('diagnosisTitle', 'Issues Found')}
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>
                      ({t.showingOf} {diagnosis.length} {t.of} {totalIssues} {t.issues})
                    </span>
                  </h3>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                    {tk('diagnosisSubtitle', 'The specific problems blocking your product from being recommended by AI.')}
                  </p>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {diagnosis.map(function(issue, index) {
                      var sev = issue.severity === 'high'
                        ? { bg: '#fef2f2', border: '#fecaca', icon: '🔴', badgeBg: '#fee2e2', badgeText: '#b91c1c', label: t.highImpact }
                        : issue.severity === 'low'
                        ? { bg: '#eff6ff', border: '#bfdbfe', icon: '🔵', badgeBg: '#dbeafe', badgeText: '#1d4ed8', label: t.lowImpact }
                        : { bg: '#fffbeb', border: '#fde68a', icon: '🟡', badgeBg: '#fef3c7', badgeText: '#b45309', label: t.mediumImpact };
                      var teaser = paidFixesTeasers[index];
                      return (
                        <div key={index} style={{ background: sev.bg, border: '1px solid ' + sev.border, borderRadius: 12, padding: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: 18 }}>{sev.icon}</span>
                              <h4 style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 16 }}>{issue.category || 'Issue'}</h4>
                            </div>
                            <span style={{ background: sev.badgeBg, color: sev.badgeText, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
                              {sev.label}
                            </span>
                          </div>
                          {issue.issue && <p style={{ color: '#374151', fontSize: 14, marginBottom: 8, lineHeight: 1.6, marginTop: 0 }}>{issue.issue}</p>}
                          {issue.impact && (
                            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }}>{t.impactLabel}</p>
                              <p style={{ fontSize: 14, color: '#4b5563', margin: 0 }}>{issue.impact}</p>
                            </div>
                          )}
                          {/* 付费 teaser：免费版只露一句诱人的话，不露方案 */}
                          {!isUnlocked && (
                            <div style={{
                              marginTop: 16, background: 'rgba(255,255,255,0.5)', borderRadius: 8,
                              padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                              border: '1px dashed #d1d5db',
                            }}>
                              <span style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
                                {teaser && teaser.teaser ? teaser.teaser : tk('paidValueProp', 'Unlock the step-by-step fix')}
                              </span>
                              <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Email Collection */}
              {freeIssues.length > 0 && !isUnlocked && (
                <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 16, padding: 32, marginBottom: 32, textAlign: 'center' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8, marginTop: 0 }}>
                    {t.emailSubscribeTitle}
                  </h3>
                  <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 16 }}>
                    {t.emailSubscribeDesc}
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
                        container.innerHTML = '<div style="padding:16px;color:#047857;font-weight:600;font-size:15px;">' + t.emailSubscribeSuccess + '</div>';
                      }
                    }).catch(function() {
                      var container = document.getElementById('email-form-container');
                      if (container) {
                        container.innerHTML = '<div style="padding:16px;color:#b91c1c;font-size:14px;">' + t.emailSubscribeError + '</div>';
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
                      {t.emailSubscribeBtn}
                    </button>
                  </form>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>{t.emailSubscribeSpam}</p>
                </div>
              )}

              {/* CTA: Unlock Full Report */}
              {isUnlocked ? (
                <div style={{
                  borderRadius: 16, padding: '28px 32px', textAlign: 'center',
                  background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#fff',
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{'🎉'}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>
                    Founding spot confirmed &mdash; your full report is unlocked
                  </h3>
                  <p style={{ fontSize: 14, color: '#b7e4d4', margin: 0, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                    Scroll up to see every competitor and the exact fixes below each issue. Around day 30,
                    we&apos;ll invite you back for a free re-check to measure what changed.
                  </p>
                </div>
              ) : (
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
                  {t.ctaPriceNote && (
                    <p style={{ fontSize: 11, marginTop: 10, marginBottom: 0, color: '#8bb5db', lineHeight: 1.6, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
                      {'\u2139\uFE0F'} {t.ctaPriceNote}
                    </p>
                  )}
                </div>
              </div>
              )}

              {/* Paid fixes (founding / paid users only) */}
              {isUnlocked && Array.isArray(results.paid_fixes) && results.paid_fixes.length > 0 && (
                <div style={{ marginTop: 32, background: '#fff', borderRadius: 16, border: '1px solid #bbf7d0', padding: 28 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#065f46', margin: '0 0 6px' }}>
                    Your step-by-step fixes
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#4b5563', margin: '0 0 18px' }}>
                    Work through these in order. Each one targets a question real buyers ask AI.
                  </p>
                  <div style={{ display: 'grid', gap: 14 }}>
                    {results.paid_fixes.map(function (fix, i) {
                      return (
                        <div key={i} style={{ border: '1px solid #d1fae5', background: '#f0fdf4', borderRadius: 12, padding: '16px 18px' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ background: '#10b981', color: '#fff', fontWeight: 800, fontSize: 13, width: 24, height: 24, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 15, color: '#064e3b', marginBottom: 4 }}>
                                {fix.issue || fix.title || ('Fix ' + (i + 1))}
                              </div>
                              {fix.how_to_fix || fix.fix || fix.solution ? (
                                <p style={{ margin: 0, fontSize: 13.5, color: '#374151', lineHeight: 1.65 }}>
                                  {fix.how_to_fix || fix.fix || fix.solution}
                                </p>
                              ) : null}
                              {fix.example || fix.snippet ? (
                                <div style={{ marginTop: 10, background: '#fff', border: '1px dashed #6ee7b7', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#065f46' }}>
                                  {fix.example || fix.snippet}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
