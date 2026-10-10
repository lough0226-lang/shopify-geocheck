'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function MetaDescriptionPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleAnalyze(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tools/meta-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to analyze. Please check the URL and try again.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getLengthStatus(length) {
    if (length === 0) return { label: p.metaMissing, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (length < 120) return { label: p.metaTooShort, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (length > 160) return { label: p.metaTooLong, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: p.metaGood, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  }

  const practices = [
    p.metaPractice1,
    p.metaPractice2,
    p.metaPractice3,
    p.metaPractice4,
    p.metaPractice5,
  ];

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section style={{
        background: "#1e3a5f", padding: "48px 16px", textAlign: "center", position: "relative",
      }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
          {p.metaTitle}
        </h1>
        <p style={{ fontSize: 18, color: "#8bb5db", marginBottom: 8 }}>
          {p.metaSubtitle}
        </p>
        <p style={{ fontSize: 14, color: "#a0c4e8", maxWidth: 600, margin: "0 auto" }}>
          {p.metaOneLiner}
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Form */}
          <form onSubmit={handleAnalyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-base font-semibold text-gray-800 mb-3">{p.metaToolSectionTitle}</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {p.metaInputLabel}
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={p.metaInputPlaceholder}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm"
              >
                {loading ? p.metaAnalyzingBtn : p.metaAnalyzeBtn}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {p.metaCurrentLabel}
                </h2>
                {(() => {
                  const status = getLengthStatus(result.currentLength);
                  return (
                    <div className={`${status.bg} ${status.border} border rounded-xl p-4`}>
                      <p className="text-gray-800 text-sm mb-2 leading-relaxed">
                        {result.currentMeta || p.metaMissing}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-medium text-gray-500">
                          {result.currentLength} {p.metaCharCount}
                        </span>
                        <span className={`text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {p.metaGeneratedTitle}
                  </h2>
                  <div className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="bg-indigo-50 border border-indigo-200 rounded-xl p-4"
                      >
                        <p className="text-sm text-gray-800 leading-relaxed">{s}</p>
                        <p className="text-xs text-indigo-500 mt-1">
                          {s.length} {p.metaCharCount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {p.metaBestPractices}
                </h2>
                <ul className="space-y-2">
                  {practices.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}


          {/* Educational Content Sections */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.metaWhatIsTitle}</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{p.metaWhatIsText}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.metaHowToTitle}</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{p.metaHowToText}</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.metaWhoForTitle}</h2>
            <ul className="space-y-2">
              {p.metaWhoForItems.split(',').map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.metaBestTitle}</h2>
            <ul className="space-y-2">
              {p.metaBestItems.split(',').map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.metaMistakesTitle}</h2>
            <ul className="space-y-2">
              {p.metaMistakesItems.split(',').map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.metaFaqTitle}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.metaFaq1Q}</h3>
                <p className="text-sm text-gray-700">{p.metaFaq1A}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.metaFaq2Q}</h3>
                <p className="text-sm text-gray-700">{p.metaFaq2A}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.metaFaq3Q}</h3>
                <p className="text-sm text-gray-700">{p.metaFaq3A}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.metaFaq4Q}</h3>
                <p className="text-sm text-gray-700">{p.metaFaq4A}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.metaNextStepTitle}</h2>
            <p className="text-sm text-gray-700 mb-4">{p.metaNextStepText}</p>
            <div className="flex gap-3">
              <Link href="/tools" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View all tools →</Link>
              <Link href="/tools/schema-tester" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Schema Tester →</Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.metaCta}</p>
            <Link
              href="/check"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {p.metaCtaBtn}
            </Link>
          </div>
        </div>
      </main>
          </>
  );
}
