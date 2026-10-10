'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function FaqGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [productInfo, setProductInfo] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faqs, setFaqs] = useState('');
  const [schema, setSchema] = useState('');
  const [schemaCopied, setSchemaCopied] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setFaqs('');
    setSchema('');

    if (!productInfo.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tools/faq-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productInfo: productInfo.trim(), keywords: keywords.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate. Please try again.');
      }

      const data = await res.json();
      setFaqs(data.result);
      setSchema(data.schema || '');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopySchema() {
    navigator.clipboard.writeText(schema);
    setSchemaCopied(true);
    setTimeout(() => setSchemaCopied(false), 2000);
  }

  // Parse FAQ items for display
  function parseFaqItems(text) {
    const items = [];
    const qaRegex = /Q\d+:\s*([\s\S]*?)\nA\d+:\s*([\s\S]*?)(?=\n\nQ\d+:|$)/g;
    let match;
    while ((match = qaRegex.exec(text)) !== null) {
      items.push({ question: match[1].trim(), answer: match[2].trim() });
    }
    return items;
  }

  const faqItems = parseFaqItems(faqs);

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {p.faqGenTitle}
            </h1>
            <p className="text-lg text-gray-600">
              {p.faqGenSubtitle}
            </p>
          </div>

          <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.faqGenProductLabel}
                </label>
                <textarea
                  value={productInfo}
                  onChange={(e) => setProductInfo(e.target.value)}
                  placeholder="e.g. Wireless Bluetooth Earbuds - Premium sound quality, 24hr battery life, IPX5 waterproof, noise cancellation"
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.faqGenKeywordLabel}
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. wireless earbuds, bluetooth headphones"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? '⏳ Generating...' : p.faqGenGenerateBtn}
            </button>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </form>

          {faqItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {p.faqGenResult}
              </h2>
              <div className="space-y-4">
                {faqItems.map((item, i) => (
                  <div
                    key={i}
                    className="bg-indigo-50 border border-indigo-200 rounded-xl p-4"
                  >
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Q: {item.question}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      A: {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {schema && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  JSON-LD FAQ Schema
                </h2>
                <button
                  onClick={handleCopySchema}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {schemaCopied ? '✓ Copied!' : p.faqGenSchemaBtn}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto">
                <code>{schema}</code>
              </pre>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {p.faqGenUsageTitle}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {p.faqGenUsageDesc}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-700 mb-4">{p.faqGenCta}</p>
            <Link
              href="/check"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {p.faqGenCtaBtn}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
