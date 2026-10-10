'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function UrlAnalyzerPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);

  function analyzeUrl(raw) {
    const issues = [];
    let score = 100;

    let parsed;
    try { parsed = new URL(raw.trim()); } catch { issues.push('Invalid URL format'); return { score: 0, issues, length: raw.length }; }

    const full = parsed.href;
    const len = full.length;
    const path = parsed.pathname;
    const pathWords = path.replace(/[\/\-_]/g, ' ').trim().split(/\s+/).filter(Boolean);

    if (len > 100) { score -= 20; issues.push('URL is too long (over 100 characters) — shorter URLs perform better'); }
    else if (len > 75) { score -= 10; issues.push('URL is somewhat long — aim for under 75 characters'); }

    if (parsed.protocol !== 'https:') { score -= 20; issues.push('URL does not use HTTPS — this is critical for SEO'); }

    if (/[_\s%#@!$&()=+]/.test(path)) { score -= 15; issues.push('URL contains special characters or spaces — use hyphens to separate words'); }

    if (path.includes('--') || path.includes('__')) { score -= 10; issues.push('URL contains consecutive separators — clean up formatting'); }

    const hasHyphens = path.includes('-');
    const hasUnderscores = path.includes('_');
    if (hasUnderscores) { score -= 10; issues.push('Use hyphens (-) instead of underscores (_) as word separators'); }

    const pathLower = path.toLowerCase();
    const hasUppercase = /[A-Z]/.test(path);
    if (hasUppercase) { score -= 5; issues.push('URL contains uppercase characters — use lowercase for consistency'); }

    const keywords = pathWords.filter(w => w.length > 3);
    if (keywords.length === 0) { score -= 15; issues.push('No descriptive keywords found in URL path'); }

    const stopWords = ['the', 'a', 'an', 'and', 'or', 'of', 'for', 'to', 'in'];
    const hasStop = pathWords.some(w => stopWords.includes(w.toLowerCase()));
    if (hasStop) { score -= 5; issues.push('URL contains stop words — consider removing them'); }

    const numbers = path.match(/\d+/g);
    if (numbers && numbers.some(n => n.length > 3)) { issues.push('URL contains long numbers (possibly IDs) — use descriptive slugs instead'); score -= 10; }

    score = Math.max(0, Math.min(100, score));

    const tips = [];
    if (parsed.protocol === 'https:') tips.push('Good: URL uses HTTPS');
    if (!hasUnderscores) tips.push('Good: No underscores in URL');
    if (keywords.length > 0) tips.push(`Found ${keywords.length} keyword segments in URL`);
    if (len <= 75) tips.push('URL length is within optimal range');
    tips.push('Keep URLs short, descriptive and keyword-rich');
    tips.push('Use hyphens to separate words in the URL slug');
    tips.push('Avoid dynamic parameters like ?id=123 in product URLs');

    return { score, length: len, issues, tips, url: full };
  }

  function handleAnalyze(e) {
    e.preventDefault();
    setResult(analyzeUrl(url));
  }

  function scoreColor(s) { return s >= 80 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'; }
  function scoreBg(s) { return s >= 80 ? 'bg-emerald-50 border-emerald-200' : s >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'; }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.urlAnalyzerTitle}</h1>
            <p className="text-lg text-gray-600">{p.urlAnalyzerSubtitle}</p>
          </div>

          <form onSubmit={handleAnalyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.urlAnalyzerInputLabel}</label>
            <div className="flex gap-3">
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={p.urlAnalyzerInputPlaceholder} required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm">
                {p.urlAnalyzerAnalyzeBtn}
              </button>
            </div>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{p.urlAnalyzerScore}</h2>
                  <span className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}/100</span>
                </div>
                <div className={`${scoreBg(result.score)} border rounded-xl p-4`}>
                  <p className="text-gray-800 text-sm break-all">{result.url}</p>
                  <span className="text-xs text-gray-500 mt-1">{result.length} characters</span>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.urlAnalyzerIssues}</h2>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.urlAnalyzerTips}</h2>
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
            <p className="text-gray-700 mb-4">{p.urlAnalyzerCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.urlAnalyzerCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.urlAnalyzerUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.urlAnalyzerUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
