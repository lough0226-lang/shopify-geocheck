'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function RobotsCheckerPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [content, setContent] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [result, setResult] = useState(null);

  function analyze(e) {
    e.preventDefault();
    if (!content.trim()) return;

    const lines = content.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const directives = [];
    const issues = [];
    const sitemaps = [];
    let hasUserAgentWildcard = false;
    const blockedPaths = [];

    for (const line of lines) {
      if (line.startsWith('#') || !line) continue;

      const [directive, ...rest] = line.split(':');
      const value = rest.join(':').trim();
      const dir = directive.trim().toLowerCase();

      directives.push({ directive: dir, value });

      if (dir === 'sitemap') { sitemaps.push(value); }
      if (dir === 'user-agent' && value === '*') { hasUserAgentWildcard = true; }
      if (dir === 'disallow' && value) { blockedPaths.push(value); }
    }

    if (!hasUserAgentWildcard) issues.push('No wildcard User-agent: * found — some crawlers may not be covered');
    if (sitemaps.length === 0) issues.push('No Sitemap directive found — add Sitemap: https://yoursite.com/sitemap.xml');

    const criticalPaths = ['/products/', '/collections/', '/pages/', '/sitemap.xml', '/robots.txt'];
    for (const cp of criticalPaths) {
      const isBlocked = blockedPaths.some(bp => cp.startsWith(bp) || bp === cp);
      if (isBlocked) issues.push(`Critical path "${cp}" appears to be blocked — this may hurt SEO`);
    }

    if (blockedPaths.some(bp => bp === '/')) issues.push('Root path "/" is blocked — this blocks the entire site from crawlers!');
    if (blockedPaths.length > 10) issues.push('Large number of Disallow rules — consider simplifying for better crawl efficiency');

    let pageBlocked = false;
    if (pageUrl.trim()) {
      try {
        const path = new URL(pageUrl.trim()).pathname;
        pageBlocked = blockedPaths.some(bp => {
          if (bp.endsWith('$')) return path === bp.slice(0, -1);
          return path.startsWith(bp);
        });
        if (pageBlocked) issues.push(`Page "${pageUrl.trim()}" is blocked by robots.txt`);
      } catch {}
    }

    setResult({
      directiveCount: directives.length,
      sitemaps,
      blockedPaths: blockedPaths.length,
      issues,
      pageBlocked,
    });
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.robotsTitle}</h1>
            <p className="text-lg text-gray-600">{p.robotsSubtitle}</p>
          </div>

          <form onSubmit={analyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.robotsInputLabel}</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6}
              placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/&#10;Sitemap: https://yoursite.com/sitemap.xml"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 font-mono resize-y" />
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.robotsPageLabel}</label>
            <div className="flex gap-3">
              <input type="text" value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} placeholder="https://yourstore.com/products/example"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm">
                {p.robotsAnalyzeBtn}
              </button>
            </div>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.robotsResult}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Directives</p>
                    <p className="text-xl font-bold text-indigo-600">{result.directiveCount}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Sitemaps</p>
                    <p className="text-xl font-bold text-emerald-600">{result.sitemaps.length}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Blocked Paths</p>
                    <p className="text-xl font-bold text-amber-600">{result.blockedPaths}</p>
                  </div>
                </div>
                {result.sitemaps.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Sitemaps found:</p>
                    {result.sitemaps.map((s, i) => <p key={i} className="text-xs text-indigo-600 break-all">{s}</p>)}
                  </div>
                )}
              </div>

              {result.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Issues Found</h2>
                  <ul className="space-y-2">
                    {result.issues.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.robotsCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.robotsCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.robotsUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.robotsUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
