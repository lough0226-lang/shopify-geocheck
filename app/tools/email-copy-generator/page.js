'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function EmailCopyGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [emailType, setEmailType] = useState('Welcome');
  const [productContext, setProductContext] = useState('');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const emailTypes = ['Welcome', 'Promo', 'Abandoned Cart', 'Newsletter', 'Thank You'];
  const tones = ['Professional', 'Casual', 'Playful', 'Luxurious'];

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!emailType.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tools/email-copy-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailType, productContext: productContext.trim(), tone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate. Please try again.');
      }

      const data = await res.json();
      setResult({ subject: data.subject, body: data.body, full: data.result });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    const text = result ? result.full : '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {p.emailCopyTitle}
            </h1>
            <p className="text-lg text-gray-600">
              {p.emailCopySubtitle}
            </p>
          </div>

          <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.emailCopyTypeLabel}
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  {emailTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.emailCopyProductLabel}
                </label>
                <textarea
                  value={productContext}
                  onChange={(e) => setProductContext(e.target.value)}
                  placeholder="e.g. Premium yoga mats, eco-friendly, non-slip, target audience: fitness enthusiasts aged 25-45"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.emailCopyToneLabel}
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
              {loading ? '⏳ Generating...' : p.emailCopyGenerateBtn}
            </button>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </form>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {p.emailCopyResult}
                </h2>
                <button
                  onClick={handleCopy}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {copied ? '✓ Copied!' : p.emailCopyCopyBtn}
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">
                    {p.emailCopySubject}
                  </p>
                  <p className="text-sm font-medium text-gray-900">{result.subject}</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">
                    {p.emailCopyBody}
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{result.body}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {p.emailCopyUsageTitle}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {p.emailCopyUsageDesc}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-700 mb-4">{p.emailCopyCta}</p>
            <Link
              href="/check"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {p.emailCopyCtaBtn}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
