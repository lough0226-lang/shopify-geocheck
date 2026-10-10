'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function BreadcrumbGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [items, setItems] = useState('Home\nCollections\nSummer Shirts');
  const [baseUrl, setBaseUrl] = useState('https://yourstore.com');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  function generate(e) {
    e.preventDefault();
    const lines = items.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return;

    const base = baseUrl.trim().replace(/\/$/, '');
    const itemList = lines.map((name, i) => {
      const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const url = i === 0 ? base : `${base}/${slug}`;
      return { name: name.trim(), url };
    });

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: itemList.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    };

    setCode(JSON.stringify(jsonLd, null, 2));
  }

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.breadcrumbTitle}</h1>
            <p className="text-lg text-gray-600">{p.breadcrumbSubtitle}</p>
          </div>

          <form onSubmit={generate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.breadcrumbInputLabel}</label>
            <textarea value={items} onChange={(e) => setItems(e.target.value)} rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 resize-y" />
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.breadcrumbUrlLabel}</label>
            <div className="flex gap-3">
              <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder={p.breadcrumbUrlPlaceholder}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm">
                {p.breadcrumbGenerateBtn}
              </button>
            </div>
          </form>

          {code && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{p.breadcrumbResult}</h2>
                <button onClick={copy} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors">
                  {copied ? '✓ Copied' : p.breadcrumbCopyBtn}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap">{code}</pre>
              <p className="text-xs text-gray-400 mt-2">Paste this code in your product page template within the head tag.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.breadcrumbCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.breadcrumbCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.breadcrumbUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.breadcrumbUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
