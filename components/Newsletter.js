'use client';

import { useState } from 'react';

export default function Newsletter({ variant = 'inline' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Thanks for subscribing! Check your inbox.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (variant === 'card') {
    return (
      <div className="bg-primary-800 rounded-xl p-8 text-center text-white">
        <h3 className="text-xl font-bold mb-2">Get GEO insights in your inbox</h3>
        <p className="text-primary-200 text-sm mb-5">
          Practical tips on AI search visibility for Shopify stores. No spam, unsubscribe anytime.
        </p>
        {status === 'success' ? (
          <p className="text-accent-400 font-medium">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="flex-1 px-4 py-2.5 rounded-lg text-gray-900 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap"
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && <p className="text-red-300 text-sm mt-2">{message}</p>}
      </div>
    );
  }

  // inline variant (small, for article footer)
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-1">Enjoyed this article?</h3>
      <p className="text-sm text-gray-600 mb-4">
        Get notified when I publish new GEO and AI search insights for Shopify stores.
      </p>
      {status === 'success' ? (
        <p className="text-accent-600 font-medium text-sm">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}
      {status === 'error' && <p className="text-red-600 text-xs mt-2">{message}</p>}
    </div>
  );
}
