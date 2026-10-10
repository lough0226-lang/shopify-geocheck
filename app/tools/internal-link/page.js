'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function InternalLinkPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [html, setHtml] = useState('');
  const [result, setResult] = useState(null);

  function analyze(e) {
    e.preventDefault();
    if (!html.trim()) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = Array.from(doc.querySelectorAll('a[href]'));

    let internal = 0, external = 0, nofollow = 0, noAnchor = 0;
    const anchors = [];
    const issues = [];

    const shortAnchors = [];
    const genericAnchors = ['click here', 'read more', 'more', 'link', 'here'];

    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const text = (link.textContent || '').trim();
      const rel = link.getAttribute('rel') || '';

      if (rel.includes('nofollow')) nofollow++;

      if (href.startsWith('http://') || href.startsWith('https://')) {
        external++;
      } else if (href.startsWith('/') || href.startsWith('#') || (!href.startsWith('http') && !href.startsWith('//') && !href.startsWith('mailto:'))) {
        internal++;
      }

      if (!text) { noAnchor++; }
      else {
        if (text.length < 4) shortAnchors.push(text);
        if (genericAnchors.includes(text.toLowerCase())) {
          issues.push(`Generic anchor text found: "${text}" — use descriptive keywords instead`);
        }
        anchors.push(text);
      }
    }

    if (internal === 0) issues.push('No internal links found — add links to related products and collections');
    if (noAnchor > 0) issues.push(`${noAnchor} link(s) have no visible anchor text (may be image links without alt text)`);
    if (shortAnchors.length > 0) issues.push(`${shortAnchors.length} link(s) have very short anchor text (under 4 characters)`);
    if (nofollow > internal + external - nofollow) issues.push('Many links are set to nofollow — internal links should typically be dofollow');
    if (internal > 0 && internal < 3) issues.push('Few internal links — aim for at least 3-5 relevant internal links per product page');

    const tips = [
      'Link to related products and collections for better site architecture',
      'Use keyword-rich anchor text for internal links',
      'Avoid generic anchors like "click here" or "read more"',
      'Add alt text to image links for accessibility',
      'Keep internal links as dofollow to pass link equity',
    ];

    setResult({ total: links.length, internal, external, nofollow, noAnchor, issues, tips, topAnchors: anchors.slice(0, 10) });
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.internalLinkTitle}</h1>
            <p className="text-lg text-gray-600">{p.internalLinkSubtitle}</p>
          </div>

          <form onSubmit={analyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.internalLinkInputLabel}</label>
            <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={8} placeholder="<a href='/products/...'>...</a>"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 font-mono resize-y" />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.internalLinkAnalyzeBtn}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.internalLinkResult}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">{p.internalLinkCount}</p>
                    <p className="text-xl font-bold text-indigo-600">{result.total}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">{p.internalLinkInternal}</p>
                    <p className="text-xl font-bold text-emerald-600">{result.internal}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">{p.internalLinkExternal}</p>
                    <p className="text-xl font-bold text-amber-600">{result.external}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Nofollow</p>
                    <p className="text-xl font-bold text-purple-600">{result.nofollow}</p>
                  </div>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Issues Found</h2>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h2>
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
            <p className="text-gray-700 mb-4">{p.internalLinkCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.internalLinkCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.internalLinkUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.internalLinkUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
