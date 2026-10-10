'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function ProductDescriptionPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [productName, setProductName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const tones = ['Professional', 'Casual', 'Playful', 'Luxurious'];

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setResult('');

    if (!productName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tools/product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: productName.trim(), keywords: keywords.trim(), tone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate. Please try again.');
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {p.productDescTitle}
            </h1>
            <p className="text-lg text-gray-600">
              {p.productDescSubtitle}
            </p>
          </div>

          <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.productDescNameLabel}
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Organic Cotton Tote Bag"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.productDescKeywordLabel}
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. eco-friendly bag, reusable shopping bag"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.productDescToneLabel}
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  {tones.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? '⏳ Generating...' : p.productDescGenerateBtn}
            </button>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </form>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {p.productDescResult}
                </h2>
                <button
                  onClick={handleCopy}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {copied ? '✓ Copied!' : p.productDescCopyBtn}
                </button>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{result}</p>
              </div>
              <button
                onClick={handleGenerate}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                ↻ {p.productDescRegenerateBtn}
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {p.productDescUsageTitle}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {p.productDescUsageDesc}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-700 mb-4">{p.productDescCta}</p>
            <Link
              href="/check"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {p.productDescCtaBtn}
            </Link>
          </div>
        </div>
      </main>
          </>
  );
}
