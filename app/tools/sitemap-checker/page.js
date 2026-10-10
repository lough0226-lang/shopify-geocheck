'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function SitemapCheckerPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function analyze(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);

    let xmlText = '';
    const trimmed = input.trim();

    if (trimmed.startsWith('<') || trimmed.startsWith('<?xml')) {
      xmlText = trimmed;
    } else {
      try {
        const res = await fetch(trimmed);
        xmlText = await res.text();
      } catch {
        setResult({ error: 'Could not fetch sitemap. Check the URL or paste XML content directly.' });
        setLoading(false);
        return;
      }
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      setResult({ error: 'Invalid XML format. Check your sitemap content.' });
      setLoading(false);
      return;
    }

    const urls = Array.from(doc.querySelectorAll('url > loc')).map(el => el.textContent.trim());
    const sitemapFiles = Array.from(doc.querySelectorAll('sitemap > loc')).map(el => el.textContent.trim());

    const productPages = urls.filter(u => u.includes('/products/'));
    const collectionPages = urls.filter(u => u.includes('/collections/'));
    const blogPages = urls.filter(u => u.includes('/blogs/') || u.includes('/blog/'));
    const pagePages = urls.filter(u => u.includes('/pages/'));

    const issues = [];
    if (urls.length === 0 && sitemapFiles.length === 0) issues.push('No URLs found in sitemap');
    if (productPages.length === 0 && urls.length > 0) issues.push('No product pages found — all products may be missing from sitemap');
    if (urls.length > 50000) issues.push('Sitemap exceeds 50,000 URLs — split into multiple sitemaps');

    const httpUrls = urls.filter(u => u.startsWith('http://'));
    if (httpUrls.length > 0) issues.push(`${httpUrls.length} URLs use HTTP instead of HTTPS`);

    const duplicates = urls.filter((u, i) => urls.indexOf(u) !== i);
    if (duplicates.length > 0) issues.push(`${[...new Set(duplicates)].length} duplicate URLs found`);

    setResult({
      totalUrls: urls.length,
      sitemapCount: sitemapFiles.length,
      productPages: productPages.length,
      collectionPages: collectionPages.length,
      blogPages: blogPages.length,
      pagePages: pagePages.length,
      issues,
      sitemapFiles,
    });
    setLoading(false);
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.sitemapTitle}</h1>
            <p className="text-lg text-gray-600">{p.sitemapSubtitle}</p>
          </div>

          <form onSubmit={analyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.sitemapInputLabel}</label>
            <div className="flex gap-3">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://yourstore.com/sitemap.xml" required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm">
                {loading ? 'Checking...' : p.sitemapAnalyzeBtn}
              </button>
            </div>
          </form>

          {result && !result.error && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.sitemapResult}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">{p.sitemapPages}</p>
                    <p className="text-xl font-bold text-indigo-600">{result.totalUrls}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">{p.sitemapProducts}</p>
                    <p className="text-xl font-bold text-emerald-600">{result.productPages}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Collections</p>
                    <p className="text-xl font-bold text-amber-600">{result.collectionPages}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Blogs/Pages</p>
                    <p className="text-xl font-bold text-purple-600">{result.blogPages + result.pagePages}</p>
                  </div>
                </div>
                {result.sitemapCount > 0 && (
                  <p className="text-xs text-gray-500 mt-3">Sitemap index with {result.sitemapCount} sub-sitemaps found.</p>
                )}
              </div>

              {result.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.sitemapIssues}</h2>
                  <ul className="space-y-2">
                    {result.issues.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result && result.error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <p className="text-sm text-red-600">{result.error}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.sitemapCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.sitemapCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.sitemapUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.sitemapUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
