'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function BlogTitleGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titles, setTitles] = useState([]);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setTitles([]);

    if (!topic.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tools/blog-title-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), keywords: keywords.trim(), count }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate. Please try again.');
      }

      const data = await res.json();
      const parsed = data.result
        .split('\n')
        .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(Boolean);
      setTitles(parsed);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyAll() {
    const text = titles.map((t, i) => `${i + 1}. ${t}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {p.blogTitleTitle}
            </h1>
            <p className="text-lg text-gray-600">
              {p.blogTitleSubtitle}
            </p>
          </div>

          <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.blogTitleTopicLabel}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Benefits of organic skincare"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.blogTitleKeywordLabel}
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. organic skincare routine"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.blogTitleCountLabel}
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? '⏳ Generating...' : p.blogTitleGenerateBtn}
            </button>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </form>

          {titles.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {p.blogTitleResult}
                </h2>
                <button
                  onClick={handleCopyAll}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {copied ? '✓ Copied!' : p.blogTitleCopyBtn}
                </button>
              </div>
              <div className="space-y-2">
                {titles.map((title, i) => (
                  <div
                    key={i}
                    className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-3"
                  >
                    <span className="text-xs font-bold text-indigo-400 w-6 text-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-800 flex-1">{title}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(title);
                      }}
                      className="text-xs text-indigo-500 hover:text-indigo-700 flex-shrink-0"
                      title="Copy"
                    >
                      📋
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {p.blogTitleUsageTitle}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {p.blogTitleUsageDesc}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-700 mb-4">{p.blogTitleCta}</p>
            <Link
              href="/check"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {p.blogTitleCtaBtn}
            </Link>
          </div>
        </div>
      </main>
          </>
  );
}
