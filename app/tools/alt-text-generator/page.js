'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function AltTextGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [productName, setProductName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(-1);

  function generate() {
    const name = productName.trim();
    if (!name) return;
    const kw = keyword.trim();
    const parts = name.split(/[-–—|]/).map(s => s.trim()).filter(Boolean);
    const core = parts[0] || name;
    const variants = parts.slice(1).join(' ').trim();

    const templates = [
      `${core}${variants ? ' - ' + variants : ''}`,
      `${core} product image${kw ? ', ' + kw : ''}`,
      `${kw || core} — high quality product photo`,
      `${core} for sale online${kw ? ' | ' + kw : ''}`,
      `${kw || core} — detailed view`,
      `Shop ${core}${kw ? ' - ' + kw : ''}`,
      `${core} front view${variants ? ', ' + variants : ''}`,
      `${kw || core} product photography`,
    ];

    const unique = [...new Set(templates)];
    setResults(unique);
  }

  function copyText(text, idx) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 2000);
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.altTextTitle}</h1>
            <p className="text-lg text-gray-600">{p.altTextSubtitle}</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); generate(); }} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.altTextInputLabel}</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={p.altTextInputPlaceholder}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.altTextKeywordLabel}</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={p.altTextKeywordPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
            />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.altTextGenerateBtn}
            </button>
          </form>

          {results.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.altTextResult}</h2>
              <div className="space-y-3">
                {results.map((text, i) => (
                  <div key={i} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-800 flex-1">{text}</p>
                    <button
                      onClick={() => copyText(text, i)}
                      className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                      {copiedIdx === i ? '✓ Copied' : p.altTextCopyBtn}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.altTextCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              {p.altTextCtaBtn}
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.altTextUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.altTextUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
