'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function RoiCalculatorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [adSpend, setAdSpend] = useState('');
  const [revenue, setRevenue] = useState('');
  const [orders, setOrders] = useState('');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    const spend = parseFloat(adSpend) || 0;
    const rev = parseFloat(revenue) || 0;
    const ord = parseInt(orders) || 0;
    if (spend <= 0) return;

    const roi = ((rev - spend) / spend) * 100;
    const perOrder = ord > 0 ? rev / ord : 0;
    const cac = ord > 0 ? spend / ord : 0;
    const profit = rev - spend;
    const roas = rev / spend;

    setResult({ roi: roi.toFixed(1), perOrder: perOrder.toFixed(2), cac: cac.toFixed(2), profit: profit.toFixed(2), roas: roas.toFixed(2) });
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.roiTitle}</h1>
            <p className="text-lg text-gray-600">{p.roiSubtitle}</p>
          </div>

          <form onSubmit={calculate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.roiAdSpendLabel}</label>
                <input type="number" step="0.01" min="0" value={adSpend} onChange={(e) => setAdSpend(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.roiRevenueLabel}</label>
                <input type="number" step="0.01" min="0" value={revenue} onChange={(e) => setRevenue(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.roiOrdersLabel}</label>
                <input type="number" min="0" value={orders} onChange={(e) => setOrders(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.roiCalculateBtn}
            </button>
          </form>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.roiResult}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`border rounded-xl p-4 text-center ${parseFloat(result.roi) >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-xs text-gray-500 mb-1">{p.roiPercent}</p>
                  <p className={`text-xl font-bold ${parseFloat(result.roi) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{result.roi}%</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">ROAS</p>
                  <p className="text-xl font-bold text-indigo-600">{result.roas}x</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.roiPerOrder}</p>
                  <p className="text-xl font-bold text-purple-600">${result.perOrder}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.roiCac}</p>
                  <p className="text-xl font-bold text-amber-600">${result.cac}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Net profit: ${result.profit}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.roiCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.roiCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.roiUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.roiUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
