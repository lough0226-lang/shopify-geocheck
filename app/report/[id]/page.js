'use client';

import { useState, useEffect } from 'react';

export default function ReportPage() {
  var params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  var pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  var reportId = null;

  if (typeof window !== 'undefined') {
    var reportIdx = pathname.indexOf('/report/');
    if (reportIdx !== -1) {
      var segment = pathname.substring(reportIdx + 8).replace(/\/$/, '').split('/')[0];
      if (segment) {
        reportId = segment;
      }
    }
  }

  var [report, setReport] = useState(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [paymentVerified, setPaymentVerified] = useState(false);
  var [orderId, setOrderId] = useState('');
  var [emailStatus, setEmailStatus] = useState('');
  var [emailMsg, setEmailMsg] = useState('');
  var [lang, setLang] = useState('en');
  var [t, setT] = useState(null);
  var [rechecking, setRechecking] = useState(false);
  var [recheckResult, setRecheckResult] = useState(null);
  var [recheckError, setRecheckError] = useState('');

  useEffect(function() {
    // Detect language
    try {
      var saved = localStorage.getItem('geo_lang');
      if (saved && ['en','de','fr','es','pt','zh'].includes(saved)) setLang(saved);
    } catch(e) {}

    // Detect Creem payment success redirect
    if (typeof window !== 'undefined') {
      var search = new URLSearchParams(window.location.search);
      var status = search.get('status');
      var oid = search.get('order_id') || search.get('subscription_id') || '';
      if (status === 'success' && oid) {
        setPaymentVerified(true);
        setOrderId(oid);
      }
    }

    if (!reportId) {
      setError('No report ID provided');
      setLoading(false);
      return;
    }

    function fetchReport() {
      try {
        var localKey = 'geo_report_' + reportId;
        var localData = localStorage.getItem(localKey);

        if (localData) {
          var parsed = JSON.parse(localData);
          var storedAt = parsed.stored_at || 0;
          var now = Date.now();
          if (now - storedAt > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(localKey);
          } else {
            setReport(parsed);
            setLoading(false);
            return;
          }
        }

        fetch('/api/analyze?report_id=' + reportId)
          .then(function(res) {
            if (!res.ok) throw new Error('Failed to load report');
            return res.json();
          })
          .then(function(data) {
            setReport(data);
            setLoading(false);
          })
          .catch(function(err) {
            setError(err.message || 'Failed to load report');
            setLoading(false);
          });
      } catch (err) {
        setError(err.message || 'Failed to load report');
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  // Load translations
  useEffect(function() {
    import('@/lib/i18n').then(function(mod) {
      var translations = mod.default;
      setT(translations[lang] || translations.en);
    }).catch(function() {});
  }, [lang]);

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, border: '4px solid #e5e7eb',
            borderTop: '4px solid #10b981', borderRadius: '50%',
            animation: 'reportSpin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{'@keyframes reportSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
          <p style={{ color: '#4b5563', fontWeight: 500, fontSize: 18 }}>Loading your report...</p>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Results ready in about 10 seconds</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{'\u{1F614}'}</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Report Not Available</h1>
          <p style={{ color: '#4b5563', marginBottom: 24 }}>{error}</p>
          <a href="/check" style={{
            display: 'inline-block', background: '#10b981', color: '#fff',
            fontWeight: 600, padding: '12px 32px', borderRadius: 8,
            textDecoration: 'none', fontSize: 16,
          }}>
            Run a New Analysis
          </a>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{'\u{1F50D}'}</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Report Not Found</h1>
          <p style={{ color: '#4b5563', marginBottom: 24 }}>The report data could not be loaded.</p>
          <a href="/check" style={{
            display: 'inline-block', background: '#10b981', color: '#fff',
            fontWeight: 600, padding: '12px 32px', borderRadius: 8,
            textDecoration: 'none', fontSize: 16,
          }}>
            Run a New Analysis
          </a>
        </div>
      </div>
    );
  }

  // Safe data extraction
  var score = typeof report.score === 'number' ? report.score : 0;
  var productName = report.product_name || 'Your Product';
  var isUnlocked = report.unlocked === true;
  var verdict = report.verdict || '';
  var industryBenchmark = report.industry_benchmark || {};
  var buyerQueries = Array.isArray(report.buyer_queries) ? report.buyer_queries : [];
  var queryMatchScores = Array.isArray(report.query_match_scores) ? report.query_match_scores : [];
  var competitors = Array.isArray(report.competitors) ? report.competitors : [];
  var diagnosis = Array.isArray(report.diagnosis) ? report.diagnosis : (Array.isArray(report.free_issues) ? report.free_issues : []);
  var paidFixes = Array.isArray(report.paid_fixes) ? report.paid_fixes : [];
  var paidFixesTeasers = Array.isArray(report.paid_fixes_teasers) ? report.paid_fixes_teasers : [];
  var queryFixes = Array.isArray(report.query_fixes) ? report.query_fixes : [];
  var overallRecs = report.overall_recommendations || '';

  var scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  var scoreTextColor = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';

  // Verdict styling
  var verdictIcon = verdict.includes('unlikely') ? '\u274C' : verdict.includes('likely to recommend') ? '\u2705' : '\u26A0\uFE0F';
  var verdictBg = verdict.includes('unlikely') ? '#fef2f2' : verdict.includes('likely to recommend') ? '#f0fdf4' : '#fffbeb';
  var verdictBorder = verdict.includes('unlikely') ? '#fecaca' : verdict.includes('likely to recommend') ? '#bbf7d0' : '#fde68a';
  var verdictColor = verdict.includes('unlikely') ? '#991b1b' : verdict.includes('likely to recommend') ? '#166534' : '#92400e';

  // Match score icons
  function matchIcon(match) {
    if (match === 'high') return '\u2705';
    if (match === 'medium') return '\u26A0\uFE0F';
    if (match === 'low') return '\u26A0\uFE0F';
    return '\u274C';
  }
  function matchBg(match) {
    if (match === 'high') return '#f0fdf4';
    if (match === 'medium') return '#fffbeb';
    if (match === 'low') return '#fffbeb';
    return '#fef2f2';
  }
  function matchLabel(match) {
    if (!t) return match;
    if (match === 'high') return t.matchHigh || 'Strong match';
    if (match === 'medium') return t.matchMedium || 'Partial match';
    if (match === 'low') return t.matchLow || 'Weak match';
    return t.matchFail || 'Not matching';
  }

  // Severity styling
  function severityStyle(sev) {
    if (sev === 'high') return { bg: '#fef2f2', border: '#fecaca', icon: '\u{1F534}', badgeBg: '#fee2e2', badgeText: '#b91c1c', label: t?.highImpact || 'High Impact' };
    if (sev === 'medium') return { bg: '#fffbeb', border: '#fde68a', icon: '\u{1F7E1}', badgeBg: '#fef3c7', badgeText: '#b45309', label: t?.mediumImpact || 'Medium Impact' };
    return { bg: '#eff6ff', border: '#bfdbfe', icon: '\u{1F535}', badgeBg: '#dbeafe', badgeText: '#1d4ed8', label: t?.lowImpact || 'Low Impact' };
  }

  function handleCheckout() {
    if (!reportId) return;
    setLoading(true);
    fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: reportId }),
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setLoading(false);
      }
    })
    .catch(function() { setLoading(false); });
  }

  function handleEmailReport() {
    var addr = prompt('Enter your email address to receive this report:');
    if (!addr || !addr.includes('@')) return;
    setEmailStatus('sending');
    setEmailMsg('');
    fetch('/api/resend-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: reportId, email: addr }),
    })
    .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
    .then(function(res) {
      if (res.ok) {
        setEmailStatus('sent');
        setEmailMsg('\u2705 Sent! Check your inbox (and spam folder)');
      } else {
        setEmailStatus('error');
        setEmailMsg('\u274C ' + (res.data.error || 'Failed. Contact hello@mygeocheck.com'));
      }
      setTimeout(function() { setEmailStatus(''); setEmailMsg(''); }, 5000);
    })
    .catch(function() {
      setEmailStatus('error');
      setEmailMsg('\u274C Network error. Contact hello@mygeocheck.com');
      setTimeout(function() { setEmailStatus(''); setEmailMsg(''); }, 5000);
    });
  }

  // i18n fallback helper
  function tk(key, fallback) {
    return (t && t[key]) || fallback;
  }

  function handleRecheck() {
    if (!reportId || rechecking) return;
    setRechecking(true);
    setRecheckError('');
    fetch('/api/recheck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: reportId, email: report.email || undefined, lang: lang }),
    })
      .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
      .then(function(res) {
        setRechecking(false);
        if (res.ok) {
          setRecheckResult(res.data);
        } else {
          setRecheckError(res.data.error || 'Recheck failed');
        }
      })
      .catch(function() {
        setRechecking(false);
        setRecheckError('Network error. Please try again.');
      });
  }

  function matchRank(m) {
    return { high: 4, medium: 3, low: 2, fail: 1 }[m] || 0;
  }
  function deltaArrow(before, after) {
    var d = matchRank(after) - matchRank(before);
    if (d > 0) return { symbol: '\u2191', color: '#16a34a' };
    if (d < 0) return { symbol: '\u2193', color: '#dc2626' };
    return { symbol: '=', color: '#9ca3af' };
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <section style={{ background: '#1e3a5f', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', fontSize: 12, fontWeight: 500,
          padding: '4px 12px', borderRadius: 999, marginBottom: 16,
          background: isUnlocked ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)',
          color: isUnlocked ? '#86efac' : '#8bb5db',
        }}>
          {isUnlocked ? '\u{1F513} FULL REPORT — UNLOCKED' : '\u{1F50D} FREE SCAN RESULTS'}
        </div>
        {paymentVerified && (
          <div style={{
            display: 'block', fontSize: 11, fontWeight: 500,
            padding: '4px 10px', borderRadius: 999, marginBottom: 12,
            background: 'rgba(34,197,94,0.15)', color: '#86efac',
          }}>
            {'\u{1F4B3}'} Payment Verified — Order: {orderId}
          </div>
        )}
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 8, marginTop: 0 }}>
          GEO Analysis Report
        </h1>
        <p style={{ fontSize: 14, color: '#8bb5db', margin: 0 }}>{productName}</p>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleEmailReport}
            disabled={emailStatus === 'sending'}
            style={{
              background: emailStatus === 'sending' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              cursor: emailStatus === 'sending' ? 'wait' : 'pointer',
            }}
          >
            {emailStatus === 'sending' ? '\u23F3 Sending...' : '\u{1F4E7} Email This Report'}
          </button>
          {emailMsg && (
            <p style={{
              fontSize: 13, marginTop: 8, marginBottom: 0,
              color: emailStatus === 'sent' ? '#86efac' : '#fca5a5',
            }}>{emailMsg}</p>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 16px' }}>

        {/* 1. Verdict Card */}
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

        {/* 2. Score + Industry Benchmark */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 128, height: 128, borderRadius: '50%',
                border: '4px solid ' + scoreColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 700, color: scoreTextColor,
              }}>
                {score}<span style={{ fontSize: 18, color: '#9ca3af' }}>/100</span>
              </div>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>AI Visibility Score</p>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              {industryBenchmark.percentile != null && (
                <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, border: '1px solid #bae6fd' }}>
                  <p style={{ fontSize: 15, color: '#0369a1', fontWeight: 600, margin: 0 }}>
                    {'\u{1F4CA}'} {tk('industryBenchmark', 'You scored better than {percentile}% of similar stores').replace('{percentile}', industryBenchmark.percentile)}
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

        {/* 3. Simulated Search Match */}
        {buyerQueries.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 20, marginTop: 0 }}>
              {'\u{1F50E}'} {tk('buyerQueriesTitle', 'How buyers search for products like yours')}
            </h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {buyerQueries.map(function(query, i) {
                var matchData = queryMatchScores[i] || {};
                var match = matchData.match || 'low';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: matchBg(match), borderRadius: 10, padding: '14px 16px',
                    border: '1px solid ' + (match === 'high' ? '#bbf7d0' : match === 'medium' ? '#fde68a' : match === 'low' ? '#fde68a' : '#fecaca'),
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{matchIcon(match)}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#1f2937', margin: 0, fontFamily: 'monospace' }}>
                        "{query}"
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                          background: match === 'high' ? '#dcfce7' : match === 'medium' ? '#fef3c7' : match === 'low' ? '#fef3c7' : '#fee2e2',
                          color: match === 'high' ? '#166534' : match === 'medium' ? '#92400e' : match === 'low' ? '#92400e' : '#991b1b',
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

        {/* 3.5 Recheck — unlocked only */}
        {isUnlocked && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8, marginTop: 0 }}>
              {'\u{1F501}'} Follow-up Recheck
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, marginTop: 0 }}>
              Re-run the SAME buyer questions against the current page to see if your changes improved AI visibility. Your original 7 queries are locked so results stay comparable.
            </p>

            {!recheckResult && (
              <button
                onClick={handleRecheck}
                disabled={rechecking}
                style={{
                  background: rechecking ? '#9ca3af' : '#1e3a5f', color: '#fff', fontWeight: 600,
                  padding: '12px 28px', borderRadius: 8, border: 'none',
                  fontSize: 15, cursor: rechecking ? 'wait' : 'pointer',
                }}
              >
                {rechecking ? '\u23F3 Re-running your locked queries...' : '\u{1F501} Run Free Recheck Now'}
              </button>
            )}

            {recheckError && (
              <p style={{ color: '#dc2626', fontSize: 14, marginTop: 12, marginBottom: 0 }}>{recheckError}</p>
            )}

            {recheckResult && (
              <div>
                {/* Score summary */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
                  <div style={{ flex: 1, minWidth: 160, background: '#f9fafb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px 0' }}>Overall Score</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                      {recheckResult.before.score} <span style={{ color: '#9ca3af', fontSize: 18 }}>→</span> {recheckResult.after.score}
                    </p>
                    {(() => {
                      var sd = recheckResult.after.score - recheckResult.before.score;
                      return (
                        <span style={{ fontSize: 13, fontWeight: 600, color: sd > 0 ? '#16a34a' : sd < 0 ? '#dc2626' : '#9ca3af' }}>
                          {sd > 0 ? '+' + sd : sd} points
                        </span>
                      );
                    })()}
                  </div>
                  <div style={{ flex: 1, minWidth: 160, background: '#f0fdf4', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #bbf7d0' }}>
                    <p style={{ fontSize: 12, color: '#166534', margin: '0 0 6px 0' }}>{'\u{1F3AF}'} AI Exposure Score</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: '#166534', margin: 0 }}>
                      {(recheckResult.before.exposure_score ?? '—') + '%'} <span style={{ color: '#86efac', fontSize: 18 }}>→</span> {recheckResult.after.exposure_score}%
                    </p>
                    {(() => {
                      if (recheckResult.before.exposure_score == null) return null;
                      var ed = recheckResult.after.exposure_score - recheckResult.before.exposure_score;
                      return (
                        <span style={{ fontSize: 13, fontWeight: 600, color: ed > 0 ? '#16a34a' : ed < 0 ? '#dc2626' : '#9ca3af' }}>
                          {ed > 0 ? '+' + ed : ed} points
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Per-query before → after */}
                <div style={{ display: 'grid', gap: 10 }}>
                  {recheckResult.comparison.map(function(c, i) {
                    var d = deltaArrow(c.before, c.after);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fafafa', borderRadius: 10, padding: '12px 16px', border: '1px solid #eef2f7' }}>
                        <span style={{ fontSize: 12, color: '#9ca3af', width: 18 }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#1f2937', margin: 0, fontFamily: 'monospace' }}>"{c.query}"</p>
                          {c.reason && <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0 0' }}>{c.reason}</p>}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          {c.before || '—'}
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: d.color, width: 16, textAlign: 'center' }}>{d.symbol}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', color: c.after === 'high' ? '#16a34a' : c.after === 'fail' ? '#dc2626' : '#92400e' }}>
                          {c.after || '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleRecheck}
                  style={{ marginTop: 20, background: 'transparent', color: '#1e3a5f', fontWeight: 600, padding: '8px 0', border: 'none', fontSize: 14, cursor: 'pointer' }}
                >
                  Re-run again
                </button>
              </div>
            )}
          </div>
        )}


        {competitors.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 20, marginTop: 0 }}>
              {'\u{1F3C6}'} {tk('competitorTitle', "Who's winning these searches")}
            </h2>
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
                        {isBlurred && <span style={{ fontSize: 16 }}>{'\u{1F512}'}</span>}
                      </div>
                      {!isBlurred && comp.domain && (
                        <a href={'https://' + comp.domain} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>
                          {comp.domain}
                        </a>
                      )}
                      {isBlurred && (
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0 0', fontStyle: 'italic' }}>
                          {tk('competitorBlurred', 'A well-known brand in this category')}
                        </p>
                      )}
                      <p style={{ fontSize: 13, color: '#4b5563', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                        {comp.why_they_win}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Diagnosis */}
        {diagnosis.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16, marginTop: 0 }}>
              {'\u{1F50D}'} {tk('diagnosisTitle', 'Issues Found')}
            </h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {diagnosis.map(function(issue, i) {
                var sev = severityStyle(issue.severity);
                var paidFix = isUnlocked ? paidFixes[i] : null;
                var teaser = !isUnlocked ? paidFixesTeasers[i] : null;

                return (
                  <div key={i} style={{ background: sev.bg, border: '1px solid ' + sev.border, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 18 }}>{sev.icon}</span>
                        <h3 style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 16 }}>{issue.category || 'Issue'}</h3>
                      </div>
                      <span style={{ background: sev.badgeBg, color: sev.badgeText, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {sev.label}
                      </span>
                    </div>
                    {issue.issue && <p style={{ color: '#374151', fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>{issue.issue}</p>}
                    {issue.impact && (
                      <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }}>{tk('impactLabel', 'Impact on AI Search Visibility:')}</p>
                        <p style={{ fontSize: 14, color: '#4b5563', margin: 0 }}>{issue.impact}</p>
                      </div>
                    )}

                    {/* Paid fix (unlocked) or teaser (locked) */}
                    {isUnlocked && paidFix && paidFix.fix && (
                      <div style={{ marginTop: 16, background: '#f0fdf4', borderRadius: 8, padding: 16, border: '1px solid #bbf7d0' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#047857', margin: '0 0 8px 0' }}>
                          {'\u{1F4A1}'} Fix:
                        </p>
                        <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 }}>{paidFix.fix}</p>
                        {paidFix.code_snippet && (
                          <pre style={{
                            marginTop: 12, background: '#1f2937', color: '#e5e7eb',
                            padding: 12, borderRadius: 6, fontSize: 12, overflow: 'auto',
                            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                          }}>
                            {paidFix.code_snippet}
                          </pre>
                        )}
                      </div>
                    )}
                    {!isUnlocked && (
                      <div style={{
                        marginTop: 16, background: 'rgba(255,255,255,0.5)', borderRadius: 8,
                        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        border: '1px dashed #d1d5db',
                      }}>
                        <span style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
                          {teaser ? teaser.teaser : tk('paidValueProp', 'Unlock this fix')}
                        </span>
                        <span style={{ fontSize: 18 }}>{'\u{1F512}'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Query-Specific Fixes (unlocked only) */}
        {isUnlocked && queryFixes.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8, marginTop: 0 }}>
              {'\u{1F3AF}'} {tk('queryFixesTitle', 'Query-Specific Fixes')}
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>{tk('queryFixesDesc', 'Targeted improvements for each buyer query where your page underperforms')}</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {queryFixes.map(function(qf, i) {
                return (
                  <div key={i} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', margin: '0 0 4px 0' }}>
                      {tk('query', 'Query') + ' ' + (qf.query_index + 1) + ': ' + (qf.query || '')}
                    </p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px 0' }}>
                      {tk('match', 'Match')}: {qf.match || 'N/A'} — {qf.reason || ''}
                    </p>
                    <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 }}>
                      {'\u{1F4A1}'} {qf.fix || ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Overall Recommendations (unlocked only) */}
        {isUnlocked && overallRecs && (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16, marginTop: 0 }}>
              {'\u{1F4CA}'} Strategic Recommendations
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{overallRecs}</p>
          </div>
        )}

        {/* 6. CTA — Show when not unlocked */}
        {!isUnlocked && (
          <div style={{
            borderRadius: 16, padding: '40px 32px', textAlign: 'center', color: '#fff',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)',
            position: 'relative', overflow: 'hidden', marginBottom: 32,
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u{1F513}'}</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, marginTop: 0 }}>
                {tk('unlockTitle', 'Unlock Full Report')}
              </h2>
              <p style={{ fontSize: 14, marginBottom: 24, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', color: '#8bb5db' }}>
                {tk('paidValueProp', 'Unlock specific fix instructions, competitor names, and multi-platform analysis')}
              </p>

              {/* Benefits list */}
              {t && t.unlockBenefits && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28, fontSize: 14, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
                  {t.unlockBenefits.map(function(benefit, i) {
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d1fae5' }}>
                        <span style={{ color: '#34d399' }}>{'\u2713'}</span>
                        <span style={{ fontSize: 13 }}>{benefit}</span>
                      </div>
                    );
                  })}
                </div>
              )}

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
                {tk('unlockTitle', 'Unlock Full Report')} — {tk('unlockPrice', '$19 one-time report')}
              </button>

              <p style={{ fontSize: 13, marginTop: 16, color: '#8bb5db' }}>
                {tk('unlockPro', '$29/month Pro plan')}
              </p>
              <p style={{ fontSize: 11, marginTop: 10, marginBottom: 0, color: '#6ee7b7' }}>
                {'\u2705'} Cancel anytime {'\u2022'} {'\u2705'} Instant access
              </p>
            </div>
          </div>
        )}

        {/* Bottom: Test next product */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', borderRadius: 16, padding: '40px 32px', textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8, marginTop: 0 }}>
            {'\u{1F680}'} Test Your Next Product
          </h2>
          <p style={{ color: '#8bb5db', fontSize: 15, marginBottom: 24, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            Keep optimizing — check another product and improve your store's AI search visibility.
          </p>
          <a href="/check" style={{
            display: 'inline-block', background: '#10b981', color: '#fff',
            fontWeight: 700, padding: '14px 40px', borderRadius: 8,
            textDecoration: 'none', fontSize: 16,
            boxShadow: '0 4px 6px -1px rgba(16,185,129,0.3)',
          }}>
            {'Analyze Another Product \u2192'}
          </a>
        </div>
      </div>
    </div>
  );
}
