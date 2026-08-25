'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  var [params, setParams] = useState({});

  useEffect(function() {
    if (typeof window !== 'undefined') {
      var search = new URLSearchParams(window.location.search);
      setParams({
        checkout_id: search.get('checkout_id') || '',
        order_id: search.get('order_id') || '',
        customer_id: search.get('customer_id') || '',
        product_id: search.get('product_id') || '',
        request_id: search.get('request_id') || '',
        status: search.get('status') || '',
      });
    }
  }, []);

  return (
    <div style={{ minHeight: '80vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>&#x2705;</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#4b5563', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
          Thank you for purchasing the GEO Visibility Report. Your payment has been processed successfully.
        </p>

        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24, marginBottom: 24, textAlign: 'left' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Order Details</h3>
          {params.order_id && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Order ID</span>
              <span style={{ color: '#111827', fontSize: 14, fontWeight: 500 }}>{params.order_id}</span>
            </div>
          )}
          {params.checkout_id && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Checkout ID</span>
              <span style={{ color: '#111827', fontSize: 14, fontWeight: 500 }}>{params.checkout_id}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ color: '#6b7280', fontSize: 14 }}>Product</span>
            <span style={{ color: '#111827', fontSize: 14, fontWeight: 500 }}>GEO Visibility Report</span>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <p style={{ color: '#047857', fontSize: 15, fontWeight: 500, margin: 0 }}>
            &#x1F4E7; A confirmation email with your report link has been sent to your inbox.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
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
