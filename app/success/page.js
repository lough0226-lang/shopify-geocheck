'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  var [params, setParams] = useState({});
  var [reportId, setReportId] = useState('');
  var [email, setEmail] = useState('');
  var [resendState, setResendState] = useState('idle'); // idle | loading | success | error
  var [resendMsg, setResendMsg] = useState('');

  useEffect(function() {
    if (typeof window !== 'undefined') {
      var search = new URLSearchParams(window.location.search);
      var status = search.get('status') || '';
      var oid = search.get('order_id') || '';
      setParams({
        checkout_id: search.get('checkout_id') || '',
        order_id: oid,
        customer_id: search.get('customer_id') || '',
        product_id: search.get('product_id') || '',
        status: status,
      });

      // Clear stale payment localStorage if not coming from a successful payment
      if (status !== 'success' || !oid) {
        try {
          localStorage.removeItem('last_payment_report_id');
          localStorage.removeItem('last_payment_email');
        } catch(e) {}
        return;
      }

      // Read stored report_id and email from checkout
      try {
        var rid = localStorage.getItem('last_payment_report_id');
        var em = localStorage.getItem('last_payment_email');
        if (rid) setReportId(rid);
        if (em) setEmail(em);
      } catch(e) {}
    }
  }, []);

  function handleResend() {
    if (!reportId || !email) {
      setResendState('error');
      setResendMsg('Missing report info. Please contact hello@mygeocheck.com');
      return;
    }
    setResendState('loading');
    setResendMsg('');

    fetch('/api/resend-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: reportId, email: email }),
    })
    .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
    .then(function(result) {
      if (result.ok) {
        setResendState('success');
        setResendMsg('Report resent successfully! Please check your inbox (and spam folder).');
      } else {
        setResendState('error');
        setResendMsg(result.data.error || 'Failed to resend. Please contact hello@mygeocheck.com');
      }
    })
    .catch(function() {
      setResendState('error');
      setResendMsg('Network error. Please contact hello@mygeocheck.com');
    });
  }

  var cardStyle = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24, marginBottom: 24, textAlign: 'left' };

  return (
    <div style={{ minHeight: '80vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>

        {/* Section A: Success Confirmation */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>&#x2705;</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
            Payment Successful!
          </h1>
          <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.6 }}>
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
        </div>

        {/* Section B: View Report Now — THE MOST IMPORTANT PART */}
        {reportId && (
          <div style={{ ...cardStyle, background: '#eff6ff', border: '2px solid #93c5fd', textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', marginBottom: 8, marginTop: 0 }}>
              📊 View Your Report Now
            </h2>
            <p style={{ color: '#1e40af', fontSize: 14, marginBottom: 16 }}>
              No need to wait for email — your report is ready right now.
            </p>
            <a href={'/report/' + reportId} style={{
              display: 'inline-block', background: '#2563eb', color: '#fff',
              fontWeight: 700, padding: '14px 40px', borderRadius: 8,
              textDecoration: 'none', fontSize: 18,
            }}>
              Open Full Report →
            </a>
            <p style={{ color: '#6b7280', fontSize: 12, marginTop: 12 }}>
              Bookmark this page: mygeocheck.com/report/{reportId}
            </p>
          </div>
        )}

        {/* Section C: Email Delivery Status */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 }}>
            📧 Email Delivery
          </h3>
          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <p style={{ color: '#047857', fontSize: 14, margin: 0 }}>
              ✅ A confirmation email has been sent{email ? ` to ${email}` : ''}.
            </p>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8, marginBottom: 0 }}>
              If you don&apos;t see it within 5 minutes, check your spam folder or use the button below to resend.
            </p>
          </div>

          {email && reportId && (
            <div>
              <button
                onClick={handleResend}
                disabled={resendState === 'loading'}
                style={{
                  background: resendState === 'loading' ? '#9ca3af' : '#fff',
                  color: resendState === 'loading' ? '#fff' : '#1e3a5f',
                  border: '2px solid #1e3a5f',
                  fontWeight: 600, padding: '10px 24px', borderRadius: 8,
                  fontSize: 14, cursor: resendState === 'loading' ? 'wait' : 'pointer',
                  width: '100%',
                }}
              >
                {resendState === 'loading' ? '⏳ Sending...' : '📧 Resend Report Email'}
              </button>
              {resendState === 'success' && (
                <p style={{ color: '#16a34a', fontSize: 14, marginTop: 8, fontWeight: 500 }}>
                  ✅ {resendMsg}
                </p>
              )}
              {resendState === 'error' && (
                <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>
                  ❌ {resendMsg}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Section D: Purchase Protection */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e40af', marginBottom: 12, marginTop: 0 }}>
            🛡️ Your Purchase is Protected
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ color: '#1e3a5f', fontSize: 14, margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span><strong>Instant access</strong> — your report is available online immediately, no email required</span>
            </p>
            <p style={{ color: '#1e3a5f', fontSize: 14, margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span><strong>Email backup</strong> — if the email doesn&apos;t arrive, resend it anytime with one click</span>
            </p>
            <p style={{ color: '#1e3a5f', fontSize: 14, margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span><strong>Money-back guarantee</strong> — any issues? Contact us for a full refund</span>
            </p>
          </div>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 12, marginBottom: 0, textAlign: 'center' }}>
            Need help? <a href="mailto:hello@mygeocheck.com" style={{ color: '#2563eb' }}>hello@mygeocheck.com</a>
          </p>
        </div>

        {/* Section E: Order Details */}
        {(params.order_id || params.checkout_id) && (
          <div style={{ ...cardStyle, background: '#f9fafb', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12, marginTop: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
              Order Details
            </h4>
            {params.order_id && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: '#9ca3af' }}>Order ID</span>
                <span style={{ color: '#374151', fontFamily: 'monospace' }}>{params.order_id}</span>
              </div>
            )}
            {params.checkout_id && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: '#9ca3af' }}>Checkout ID</span>
                <span style={{ color: '#374151', fontFamily: 'monospace' }}>{params.checkout_id}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
              <span style={{ color: '#9ca3af' }}>Product</span>
              <span style={{ color: '#374151' }}>GEO Visibility Report</span>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
          <Link href="/check" style={{
            display: 'inline-block', background: '#10b981', color: '#fff',
            fontWeight: 600, padding: '12px 32px', borderRadius: 8,
            textDecoration: 'none', fontSize: 16,
          }}>
            Analyze Another Product
          </Link>
          <Link href="/" style={{
            display: 'inline-block', border: '2px solid #1e3a5f', color: '#1e3a5f',
            fontWeight: 600, padding: '12px 32px', borderRadius: 8,
            textDecoration: 'none', fontSize: 16,
          }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
