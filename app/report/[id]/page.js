'use client';

import { useState, useEffect } from 'react';

export default function ReportPage() {
  var params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  var pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  var reportId = null;

  // Extract report ID from URL path /report/[id]
  if (typeof window !== 'undefined') {
    var parts = window.location.pathname.split('/');
    for (var pi = 0; pi < parts.length; pi++) {
      if (parts[pi] && !isNaN(parseInt(parts[pi]))) {
        reportId = parts[pi];
        break;
      }
    }
  }

  var [report, setReport] = useState(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [paymentVerified, setPaymentVerified] = useState(false);
  var [orderId, setOrderId] = useState('');
  var [emailStatus, setEmailStatus] = useState(''); // '' | 'sending' | 'sent' | 'error'
  var [emailMsg, setEmailMsg] = useState('');

  useEffect(function() {
    // Detect Creem payment success redirect
    if (typeof window !== 'undefined') {
      var search = new URLSearchParams(window.location.search);
      var status = search.get('status');
      var oid = search.get('order_id');
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
            // fall through to API fetch
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
          <p style={{ color: '#4b5563', fontWeight: 500, fontSize: 18 }}>Loading your full report...</p>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>This usually takes a moment</p>
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

  // No data state
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
  var fullReport = report.full_report || {};
  var checks = Array.isArray(fullReport.detailed_checks) ? fullReport.detailed_checks : [];
  var quickWins = Array.isArray(fullReport.quick_wins) ? fullReport.quick_wins : [];
  var overallRecs = fullReport.overall_recommendations || '';
  var score = typeof report.score === 'number' ? report.score : 0;
  var productName = report.product_name || 'Your Product';

  // Sort by priority
  var sortedChecks = checks.slice().sort(function(a, b) {
    return (a.priority || 5) - (b.priority || 5);
  });

  var scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  var scoreTextColor = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';

  // Count pass/warn/fail
  var passCount = checks.filter(function(c) { return c.status === 'pass'; }).length;
  var warnCount = checks.filter(function(c) { return c.status === 'warn'; }).length;
  var failCount = checks.filter(function(c) { return c.status === 'fail'; }).length;
  var totalChecks = checks.length || 1;

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
        setEmailMsg('✅ Sent! Check your inbox (and spam folder)');
      } else {
        setEmailStatus('error');
        setEmailMsg('❌ ' + (res.data.error || 'Failed. Contact hello@mygeocheck.com'));
      }
      setTimeout(function() { setEmailStatus(''); setEmailMsg(''); }, 5000);
    })
    .catch(function() {
      setEmailStatus('error');
      setEmailMsg('❌ Network error. Contact hello@mygeocheck.com');
      setTimeout(function() { setEmailStatus(''); setEmailMsg(''); }, 5000);
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <section style={{ background: '#1e3a5f', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', fontSize: 12, fontWeight: 500,
          padding: '4px 12px', borderRadius: 999, marginBottom: 16,
          background: 'rgba(16,185,129,0.2)', color: '#34d399',
        }}>
          {'\u2705'} FULL REPORT {'\u2014'} UNLOCKED
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
            {emailStatus === 'sending' ? '⏳ Sending...' : '📧 Email This Report'}
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
        {/* Score Overview */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 128, height: 128, borderRadius: '50%',
                border: '4px solid ' + scoreColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 700, color: scoreTextColor,
              }}>
                {score}
              </div>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>AI Visibility Score</p>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, marginTop: 0, color: '#111827' }}>Score Breakdown</h2>
              {[
                { label: 'Passing', count: passCount, color: '#22c55e' },
                { label: 'Needs Work', count: warnCount, color: '#f59e0b' },
                { label: 'Failing', count: failCount, color: '#ef4444' },
              ].map(function(item) {
                var pct = Math.round((item.count / totalChecks) * 100);
                return (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: '#4b5563', width: 96 }}>{item.label}</span>
                    <div style={{ flex: 1, height: 12, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: item.color, borderRadius: 999, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#374151', width: 32, textAlign: 'right' }}>{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <div style={{ borderRadius: 16, padding: 24, marginBottom: 32, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16, marginTop: 0 }}>
              {'\u26A1'} Quick Wins
              <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>{' \u2014 Fix these first for maximum impact'}</span>
            </h2>
            <div>
              {quickWins.map(function(win, i) {
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{
                      background: '#10b981', color: '#fff', width: 24, height: 24,
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2,
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ color: '#374151', margin: 0, fontSize: 15 }}>{win}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Checks */}
        {checks.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: 32, marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 24, marginTop: 0 }}>
              Detailed Analysis ({checks.length} checks)
            </h2>
            <div>
              {sortedChecks.map(function(check, i) {
                var status = check.status || 'fail';
                var borderColor = status === 'pass' ? '#bbf7d0' : status === 'warn' ? '#fde68a' : '#fecaca';
                var bgColor = status === 'pass' ? '#f0fdf4' : status === 'warn' ? '#fffbeb' : '#fef2f2';
                var icon = status === 'pass' ? '\u2705' : status === 'warn' ? '\u26A0\uFE0F' : '\u274C';
                var scoreVal = typeof check.score === 'number' ? check.score : 0;
                var sColor = scoreVal >= 7 ? '#16a34a' : scoreVal >= 4 ? '#d97706' : '#dc2626';
                var priority = check.priority || 5;

                return (
                  <div key={i} style={{
                    border: '1px solid ' + borderColor, borderRadius: 12, padding: 20,
                    background: bgColor, marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 18 }}>{icon}</span>
                        <h3 style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 16 }}>{check.category || 'Check'}</h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 14, color: '#6b7280' }}>Score:</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: sColor }}>{scoreVal}/10</span>
                        <span style={{ fontSize: 12, background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 999 }}>
                          P{priority}
                        </span>
                      </div>
                    </div>
                    {check.issue && check.issue !== 'No issues found' && (
                      <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 8, marginTop: 0 }}>
                        <span style={{ fontWeight: 500 }}>Issue: </span>{check.issue}
                      </p>
                    )}
                    {check.fix && check.fix !== 'Already good' && (
                      <div style={{ fontSize: 14, color: '#374151', background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: 12 }}>
                        <span style={{ fontWeight: 500, color: '#047857' }}>{'\u{1F4A1}'} Fix: </span>{check.fix}
                      </div>
                    )}
                    {status === 'pass' && (
                      <p style={{ fontSize: 14, color: '#16a34a', fontStyle: 'italic', margin: 0 }}>{'\u2713'} This area looks good</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Overall Recommendations */}
        {overallRecs && (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: 32, marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16, marginTop: 0 }}>
              {'\u{1F4CA}'} Strategic Recommendations
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{overallRecs}</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>Want to check another product?</p>
          <a href="/check" style={{
            display: 'inline-block', border: '2px solid #1e3a5f', color: '#1e3a5f',
            fontWeight: 600, padding: '12px 32px', borderRadius: 8,
            textDecoration: 'none', fontSize: 16,
          }}>
            Analyze Another Product
          </a>
        </div>
      </div>
    </div>
  );
}
