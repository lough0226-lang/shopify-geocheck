'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function KeywordDensityPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState(null);

  function analyze(e) {
    e.preventDefault();
    if (!text.trim() || !keyword.trim()) return;

    const words = text.toLowerCase().replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    const kw = keyword.trim().toLowerCase();
    const kwWords = kw.split(/\s+/);

    let count = 0;
    if (kwWords.length === 1) {
      count = words.filter(w => w === kw).length;
    } else {
      const textLower = text.toLowerCase();
      let idx = 0;
      while ((idx = textLower.indexOf(kw, idx)) !== -1) {
        count++;
        idx += kw.length;
      }
    }

    const density = totalWords > 0 ? (count / totalWords) * 100 : 0;
    let status, statusColor;
    if (density === 0) { status = 'Keyword not found'; statusColor = 'text-red-600'; }
    else if (density < 0.5) { status = 'Too low — increase keyword usage'; statusColor = 'text-amber-600'; }
    else if (density <= 2.5) { status = 'Optimal density (1-2.5%)'; statusColor = 'text-emerald-600'; }
    else if (density <= 4) { status = 'Slightly high — may appear as keyword stuffing'; statusColor = 'text-amber-600'; }
    else { status = 'Too high — reduce keyword usage to avoid penalties'; statusColor = 'text-red-600'; }

    const topWords = {};
    words.filter(w => w.length > 3).forEach(w => { topWords[w] = (topWords[w] || 0) + 1; });
    const sorted = Object.entries(topWords).sort((a, b) => b[1] - a[1]).slice(0, 10);

    setResult({ count, density: density.toFixed(2), totalWords, status, statusColor, topWords: sorted });
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.keywordDensityTitle}</h1>
            <p className="text-lg text-gray-600">{p.keywordDensitySubtitle}</p>
          </div>

          <form onSubmit={analyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.keywordDensityInputLabel}</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={p.keywordDensityInputPlaceholder} rows={6} required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 resize-y" />
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.keywordDensityKeywordLabel}</label>
            <div className="flex gap-3">
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={p.keywordDensityKeywordPlaceholder} required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm">
                {p.keywordDensityAnalyzeBtn}
              </button>
            </div>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.keywordDensityResult}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">{p.keywordDensityCount}</p>
                    <p className="text-xl font-bold text-indigo-600">{result.count}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">{p.keywordDensityPercent}</p>
                    <p className="text-xl font-bold text-emerald-600">{result.density}%</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Total Words</p>
                    <p className="text-xl font-bold text-purple-600">{result.totalWords}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xs text-gray-500">{p.keywordDensityStatus}: </span>
                  <span className={`text-sm font-semibold ${result.statusColor}`}>{result.status}</span>
                </div>
              </div>

              {result.topWords.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Keywords</h2>
                  <div className="space-y-2">
                    {result.topWords.map(([word, cnt], i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{word}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, (cnt / result.topWords[0][1]) * 100)}%` }} />
                          </div>
                          <span className="text-gray-500 text-xs w-6 text-right">{cnt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.keywordDensityCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.keywordDensityCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.keywordDensityUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.keywordDensityUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
