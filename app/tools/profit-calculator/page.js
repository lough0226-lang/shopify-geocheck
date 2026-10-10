'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function ProfitCalculatorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [fee, setFee] = useState('10');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    const c = parseFloat(cost) || 0;
    const pr = parseFloat(price) || 0;
    const f = parseFloat(fee) || 0;
    if (c <= 0 || pr <= 0) return;

    const feeAmount = pr * (f / 100);
    const profit = pr - c - feeAmount;
    const margin = pr > 0 ? (profit / pr) * 100 : 0;
    const breakEven = c / (1 - f / 100);
    const suggestedPrice = c / (1 - f / 100 - 0.2);

    setResult({
      profit: profit.toFixed(2),
      margin: margin.toFixed(1),
      feeAmount: feeAmount.toFixed(2),
      breakEven: breakEven.toFixed(2),
      suggestedPrice: suggestedPrice.toFixed(2),
    });
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.profitTitle}</h1>
            <p className="text-lg text-gray-600">{p.profitSubtitle}</p>
          </div>

          <form onSubmit={calculate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.profitCostLabel}</label>
                <input type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.profitPriceLabel}</label>
                <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.profitFeeLabel}</label>
                <input type="number" step="0.1" min="0" max="100" value={fee} onChange={(e) => setFee(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.profitCalculateBtn}
            </button>
          </form>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.profitResult}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.profitAmount}</p>
                  <p className="text-xl font-bold text-emerald-600">${result.profit}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.profitMargin}</p>
                  <p className="text-xl font-bold text-indigo-600">{result.margin}%</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.profitBreakEven}</p>
                  <p className="text-xl font-bold text-amber-600">${result.breakEven}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.profitSuggestion}</p>
                  <p className="text-xl font-bold text-purple-600">${result.suggestedPrice}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Platform fee: ${result.feeAmount} | Suggested price targets 20% net margin after fees.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.profitCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.profitCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.profitUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.profitUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
