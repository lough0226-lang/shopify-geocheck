'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function PromoCodeGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [prefix, setPrefix] = useState('SAVE');
  const [count, setCount] = useState('10');
  const [length, setLength] = useState('6');
  const [codes, setCodes] = useState([]);
  const [copied, setCopied] = useState(false);

  function generate(e) {
    e.preventDefault();
    const n = parseInt(count) || 10;
    const len = parseInt(length) || 6;
    const pre = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || 'CODE';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const generated = new Set();

    while (generated.size < Math.min(n, 500)) {
      let code = pre;
      for (let i = 0; i < len; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      generated.add(code);
    }

    setCodes([...generated]);
  }

  function copyAll() {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCSV() {
    const csv = 'Code\n' + codes.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promo-codes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.promoTitle}</h1>
            <p className="text-lg text-gray-600">{p.promoSubtitle}</p>
          </div>

          <form onSubmit={generate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.promoPrefixLabel}</label>
                <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="SAVE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.promoCountLabel}</label>
                <input type="number" min="1" max="500" value={count} onChange={(e) => setCount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.promoLengthLabel}</label>
                <input type="number" min="3" max="12" value={length} onChange={(e) => setLength(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.promoGenerateBtn}
            </button>
          </form>

          {codes.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{p.promoResult}</h2>
                <div className="flex gap-2">
                  <button onClick={copyAll} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors">
                    {copied ? '✓ Copied' : p.promoCopyBtn}
                  </button>
                  <button onClick={downloadCSV} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-600 hover:bg-emerald-100 transition-colors">
                    {p.promoDownloadBtn}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {codes.map((code, i) => (
                  <span key={i} className="bg-gray-50 border border-gray-200 text-gray-800 text-sm px-3 py-1.5 rounded-lg font-mono">{code}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">{codes.length} unique codes generated</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.promoCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.promoCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.promoUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.promoUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
