'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function DiscountCalculatorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [original, setOriginal] = useState('');
  const [type, setType] = useState('percent');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    const o = parseFloat(original) || 0;
    const v = parseFloat(value) || 0;
    if (o <= 0 || v <= 0) return;

    let discountAmt, finalPrice;
    if (type === 'percent') {
      discountAmt = o * (Math.min(v, 100) / 100);
    } else {
      discountAmt = Math.min(v, o);
    }
    finalPrice = o - discountAmt;
    const effectivePercent = o > 0 ? (discountAmt / o) * 100 : 0;

    setResult({
      finalPrice: finalPrice.toFixed(2),
      savings: discountAmt.toFixed(2),
      effectivePercent: effectivePercent.toFixed(1),
    });
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.discountTitle}</h1>
            <p className="text-lg text-gray-600">{p.discountSubtitle}</p>
          </div>

          <form onSubmit={calculate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.discountOriginalLabel}</label>
                <input type="number" step="0.01" min="0" value={original} onChange={(e) => setOriginal(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.discountTypeLabel}</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="percent">Percentage (%)</option>
                  <option value="amount">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {type === 'percent' ? p.discountPercentLabel : p.discountAmountLabel}
                </label>
                <input type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.discountCalculateBtn}
            </button>
          </form>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.discountResult}</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.discountFinalPrice}</p>
                  <p className="text-xl font-bold text-emerald-600">${result.finalPrice}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.discountSavings}</p>
                  <p className="text-xl font-bold text-indigo-600">${result.savings}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.discountPercentOff}</p>
                  <p className="text-xl font-bold text-purple-600">{result.effectivePercent}%</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.discountCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.discountCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.discountUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.discountUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
