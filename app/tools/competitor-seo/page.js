'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function CompetitorSeoPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function analyze(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(url.trim());
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const title = doc.querySelector('title')?.textContent?.trim() || 'Not found';
      const meta = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'Not found';
      const h1s = Array.from(doc.querySelectorAll('h1')).map(el => el.textContent.trim()).filter(Boolean);
      const h2s = Array.from(doc.querySelectorAll('h2')).map(el => el.textContent.trim()).filter(Boolean);
      const imgs = doc.querySelectorAll('img');
      const imgsNoAlt = Array.from(imgs).filter(img => !img.getAttribute('alt')).length;
      const links = doc.querySelectorAll('a[href]').length;
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
      const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

      const text = doc.body?.textContent || '';
      const words = text.split(/\s+/).filter(w => w.length > 4);
      const wordFreq = {};
      words.forEach(w => { const lw = w.toLowerCase().replace(/[^a-z]/g, ''); if (lw.length > 4) wordFreq[lw] = (wordFreq[lw] || 0) + 1; });
      const topKw = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);

      const strengths = [];
      const weaknesses = [];

      if (title.length >= 30 && title.length <= 60) strengths.push('Title tag length is optimal');
      else weaknesses.push(`Title tag length is ${title.length} chars (ideal: 30-60)`);

      if (meta.length >= 120 && meta.length <= 160) strengths.push('Meta description length is optimal');
      else if (meta === 'Not found') weaknesses.push('No meta description found');
      else weaknesses.push(`Meta description length is ${meta.length} chars (ideal: 120-160)`);

      if (h1s.length === 1) strengths.push('Single H1 tag — good structure');
      else if (h1s.length === 0) weaknesses.push('No H1 tag found');
      else weaknesses.push(`${h1s.length} H1 tags found — should have exactly one`);

      if (canonical) strengths.push('Canonical URL is set');
      else weaknesses.push('No canonical URL found');

      if (ogTitle) strengths.push('Open Graph title is configured');
      else weaknesses.push('No Open Graph title — social sharing will be weak');

      if (imgsNoAlt > 0) weaknesses.push(`${imgsNoAlt} image(s) missing alt text`);
      if (imgsNoAlt === 0 && imgs.length > 0) strengths.push('All images have alt text');

      setResult({ title, meta, h1s, h2s: h2s.slice(0, 5), topKw, strengths, weaknesses, totalImages: imgs.length, totalLinks: links });
    } catch {
      setResult({ error: 'Could not fetch the competitor URL. Check the address and try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.competitorTitle}</h1>
            <p className="text-lg text-gray-600">{p.competitorSubtitle}</p>
          </div>

          <form onSubmit={analyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.competitorInputLabel}</label>
            <div className="flex gap-3">
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://competitor-store.myshopify.com" required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm">
                {loading ? 'Analyzing...' : p.competitorAnalyzeBtn}
              </button>
            </div>
          </form>

          {result && !result.error && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.competitorResult}</h2>
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{p.competitorTitleTag}</p>
                    <p className="text-sm font-medium text-gray-800">{result.title}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{p.competitorMeta}</p>
                    <p className="text-sm text-gray-700">{result.meta}</p>
                  </div>
                  {result.topKw.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-2">{p.competitorKeywords}</p>
                      <div className="flex flex-wrap gap-2">
                        {result.topKw.map((kw, i) => (
                          <span key={i} className="bg-white border border-indigo-200 text-indigo-700 text-xs px-2 py-1 rounded-full">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.competitorStrengths}</h2>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.competitorWeaknesses}</h2>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span><span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {result && result.error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <p className="text-sm text-red-600">{result.error}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.competitorCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.competitorCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.competitorUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.competitorUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
