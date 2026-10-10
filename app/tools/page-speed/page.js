'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function PageSpeedPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleCheck(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const start = performance.now();
      const res = await fetch(url.trim(), { mode: 'no-cors' });
      const elapsed = performance.now() - start;

      const loadTime = (elapsed / 1000).toFixed(2);
      let score = 100;
      const issues = [];

      if (elapsed > 3000) { score -= 40; issues.push('Page load time exceeds 3 seconds — critical for bounce rate'); }
      else if (elapsed > 2000) { score -= 25; issues.push('Page load time exceeds 2 seconds — aim for under 2s'); }
      else if (elapsed > 1000) { score -= 10; issues.push('Page load time is moderate — optimize for faster loading'); }

      let hostname = '';
      try { hostname = new URL(url.trim()).hostname; } catch {}

      issues.push('Note: This is a client-side estimate. For accurate results, use Google PageSpeed Insights.');
      if (elapsed < 1000) { score -= 5; issues.push('Very fast response — but this test measures server response only, not full render'); }

      const tips = [
        'Compress and optimize product images (use WebP format)',
        'Enable browser caching for static resources',
        'Minify CSS and JavaScript files',
        'Use a CDN for global content delivery',
        'Lazy-load images below the fold',
        'Reduce third-party script impact',
        'Enable HTTP/2 or HTTP/3 for faster transfers',
      ];

      score = Math.max(0, Math.min(100, score));
      setResult({ score, loadTime, issues, tips, hostname });
    } catch {
      setResult({ score: 0, loadTime: '—', issues: ['Could not reach the URL. Check that the address is correct and the site allows cross-origin requests.'], tips: [] });
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(s) { return s >= 80 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'; }
  function scoreBg(s) { return s >= 80 ? 'bg-emerald-50 border-emerald-200' : s >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'; }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.pageSpeedTitle}</h1>
            <p className="text-lg text-gray-600">{p.pageSpeedSubtitle}</p>
          </div>

          <form onSubmit={handleCheck} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.pageSpeedInputLabel}</label>
            <div className="flex gap-3">
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourstore.myshopify.com" required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm">
                {loading ? 'Checking...' : p.pageSpeedAnalyzeBtn}
              </button>
            </div>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{p.pageSpeedResult}</h2>
                  <span className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}/100</span>
                </div>
                <div className={`${scoreBg(result.score)} border rounded-xl p-4`}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{p.pageSpeedLoadTime}</span>
                    <span className="font-semibold text-gray-900">{result.loadTime}s</span>
                  </div>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.pageSpeedIssues}</h2>
                  <ul className="space-y-2">
                    {result.issues.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.tips.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Optimization Tips</h2>
                  <ul className="space-y-2">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span><span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.pageSpeedCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.pageSpeedCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.pageSpeedUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.pageSpeedUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
