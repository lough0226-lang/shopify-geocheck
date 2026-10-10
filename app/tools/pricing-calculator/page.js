'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function PricingCalculatorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [cost, setCost] = useState('');
  const [margin, setMargin] = useState('30');
  const [fee, setFee] = useState('10');
  const [competitor, setCompetitor] = useState('');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    const c = parseFloat(cost) || 0;
    const m = parseFloat(margin) / 100 || 0;
    const f = parseFloat(fee) / 100 || 0;
    const comp = parseFloat(competitor) || 0;
    if (c <= 0) return;

    const minPrice = c / (1 - f);
    const suggestedPrice = c / (1 - f - m);
    const profitAtSuggested = suggestedPrice * (1 - f) - c;

    let finalPrice = suggestedPrice;
    let note = '';
    if (comp > 0) {
      if (comp >= minPrice && comp <= suggestedPrice * 1.2) {
        finalPrice = comp;
        note = 'Competitor-aligned pricing selected.';
      } else if (comp < minPrice) {
        note = `Competitor price ($${comp.toFixed(2)}) is below your minimum — pricing at suggested minimum.`;
        finalPrice = minPrice;
      } else {
        note = `Competitor price ($${comp.toFixed(2)}) is above suggested — you could price up to match or position below for competitive advantage.`;
      }
    }

    setResult({
      suggested: suggestedPrice.toFixed(2),
      minimum: minPrice.toFixed(2),
      final: finalPrice.toFixed(2),
      profit: profitAtSuggested.toFixed(2),
      note,
    });
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.pricingTitle}</h1>
            <p className="text-lg text-gray-600">{p.pricingSubtitle}</p>
          </div>

          <form onSubmit={calculate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.pricingCostLabel}</label>
                <input type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.pricingMarginLabel}</label>
                <input type="number" step="1" min="0" max="100" value={margin} onChange={(e) => setMargin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.pricingFeeLabel}</label>
                <input type="number" step="0.5" min="0" max="50" value={fee} onChange={(e) => setFee(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.pricingCompetitorLabel}</label>
                <input type="number" step="0.01" min="0" value={competitor} onChange={(e) => setCompetitor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.pricingCalculateBtn}
            </button>
          </form>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.pricingResult}</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.pricingSuggested}</p>
                  <p className="text-2xl font-bold text-emerald-600">${result.final}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.pricingMinPrice}</p>
                  <p className="text-2xl font-bold text-amber-600">${result.minimum}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.pricingProfitAt}</p>
                  <p className="text-2xl font-bold text-indigo-600">${result.profit}</p>
                </div>
              </div>
              {result.note && <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">{result.note}</p>}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.pricingCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.pricingCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.pricingUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.pricingUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
