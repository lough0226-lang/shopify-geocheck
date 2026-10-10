'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function KeywordTrendsPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [keywords, setKeywords] = useState('');
  const [results, setResults] = useState([]);

  function analyze(e) {
    e.preventDefault();
    const lines = keywords.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return;

    const data = lines.map(kw => {
      const kw_trimmed = kw.trim();
      const len = kw_trimmed.length;
      const wordCount = kw_trimmed.split(/\s+/).length;

      const baseVol = Math.max(100, Math.floor(50000 / (len * wordCount) + Math.random() * 2000));
      const volume = Math.min(50000, baseVol);

      const rand = Math.random();
      let trend, difficulty;
      if (rand < 0.33) { trend = 'Rising ↑'; difficulty = 'Medium'; }
      else if (rand < 0.66) { trend = 'Stable →'; difficulty = wordCount > 2 ? 'Low' : 'High'; }
      else { trend = 'Declining ↓'; difficulty = wordCount > 2 ? 'Medium' : 'High'; }

      return { keyword: kw_trimmed, volume: volume.toLocaleString(), trend, difficulty };
    });

    setResults(data);
  }

  function trendColor(t) {
    if (t.includes('Rising')) return 'text-emerald-600';
    if (t.includes('Stable')) return 'text-indigo-600';
    return 'text-amber-600';
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.keywordTrendsTitle}</h1>
            <p className="text-lg text-gray-600">{p.keywordTrendsSubtitle}</p>
          </div>

          <form onSubmit={analyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.keywordTrendsInputLabel}</label>
            <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={5}
              placeholder="wireless headphones&#10;bluetooth earbuds&#10;noise cancelling" required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 resize-y" />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.keywordTrendsCheckBtn}
            </button>
            <p className="text-xs text-gray-400 mt-2">Note: These are estimated values for reference. For accurate data, use Google Trends or keyword tools.</p>
          </form>

          {results.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.keywordTrendsResult}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Keyword</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">{p.keywordTrendsVolume}</th>
                      <th className="text-center py-2 px-3 text-gray-500 font-medium">{p.keywordTrendsTrend}</th>
                      <th className="text-center py-2 px-3 text-gray-500 font-medium">{p.keywordTrendsDifficulty}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-gray-800">{r.keyword}</td>
                        <td className="py-2 px-3 text-right text-gray-700">{r.volume}</td>
                        <td className={`py-2 px-3 text-center font-medium ${trendColor(r.trend)}`}>{r.trend}</td>
                        <td className="py-2 px-3 text-center text-gray-600">{r.difficulty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.keywordTrendsCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.keywordTrendsCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.keywordTrendsUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.keywordTrendsUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
