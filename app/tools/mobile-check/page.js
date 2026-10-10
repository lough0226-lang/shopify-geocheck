'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function MobileCheckPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function check(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(url.trim());
      const html = await res.text();
      const issues = [];
      let score = 100;

      const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);
      if (!hasViewport) { score -= 30; issues.push('Missing viewport meta tag — page will not scale on mobile'); }

      const hasFontScale = /user-scalable\s*=\s*no/i.test(html);
      if (hasFontScale) { score -= 15; issues.push('Font scaling is disabled (user-scalable=no) — harms accessibility'); }

      const hasMediaQueries = /@media/i.test(html);
      if (!hasMediaQueries) { score -= 10; issues.push('No CSS media queries detected — layout may not adapt to mobile'); }

      const hasResponsiveImg = /max-width/i.test(html) && /width:\s*100%/i.test(html);
      if (!hasResponsiveImg) { score -= 5; issues.push('No responsive image styles detected — images may overflow on small screens'); }

      const hasTouchIcons = /apple-touch-icon/i.test(html);
      if (!hasTouchIcons) { score -= 5; issues.push('No apple-touch-icon found — add one for better mobile branding'); }

      const buttonSize = /min-height:\s*[34-9][0-9]px|min-width:\s*[34-9][0-9]px|44px|48px/i.test(html);
      if (!buttonSize) { score -= 5; issues.push('Touch targets may be too small — buttons should be at least 44x44px'); }

      const hasLargeFixed = /position:\s*fixed.*width:\s*[5-9][0-9][0-9]px/i.test(html);
      if (hasLargeFixed) { score -= 5; issues.push('Fixed-width elements detected — may cause horizontal scrolling on mobile'); }

      const fontSize = /font-size:\s*([0-9]+)px/i.exec(html);
      if (fontSize && parseInt(fontSize[1]) < 14) { score -= 10; issues.push('Base font size may be too small for mobile (< 14px)'); }

      score = Math.max(0, Math.min(100, score));

      const tips = [
        'Use responsive design with CSS media queries for breakpoints',
        'Ensure touch targets are at least 44x44 pixels',
        'Use relative font sizes (rem/em) instead of fixed pixels',
        'Test on real devices using Chrome DevTools device mode',
        'Optimize images with responsive srcset attributes',
        'Avoid horizontal scrolling — content should fit within viewport',
        'Use flexbox or CSS grid for flexible layouts',
      ];

      setResult({ score, issues, tips });
    } catch {
      setResult({ score: 0, issues: ['Could not fetch the page. Check the URL and try again.'], tips: [] });
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(s) { return s >= 80 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'; }
  function scoreBg(s) { return s >= 80 ? 'bg-emerald-50 border-emerald-200' : s >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'; }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.mobileCheckTitle}</h1>
            <p className="text-lg text-gray-600">{p.mobileCheckSubtitle}</p>
          </div>

          <form onSubmit={check} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.mobileCheckInputLabel}</label>
            <div className="flex gap-3">
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourstore.myshopify.com" required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm">
                {loading ? 'Checking...' : p.mobileCheckAnalyzeBtn}
              </button>
            </div>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{p.mobileCheckResult}</h2>
                  <span className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}/100</span>
                </div>
                <div className={`${scoreBg(result.score)} border rounded-xl p-4`}>
                  <p className="text-sm text-gray-600">
                    {result.score >= 80 ? 'Good mobile responsiveness detected.' :
                     result.score >= 50 ? 'Some mobile issues found — improvements recommended.' :
                     'Critical mobile issues detected — urgent fixes needed.'}
                  </p>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.mobileCheckIssues}</h2>
                  <ul className="space-y-2">
                    {result.issues.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.mobileCheckCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.mobileCheckCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.mobileCheckUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.mobileCheckUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
