'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function ShippingCalculatorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [dest, setDest] = useState('domestic');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    const w = parseFloat(weight) || 0;
    const l = parseFloat(length) || 0;
    const wd = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    if (w <= 0) return;

    const volumetric = (l * wd * h) / 5000;
    const billable = Math.max(w, volumetric);

    let baseRate;
    if (dest === 'domestic') {
      baseRate = 5 + billable * 2.5;
    } else if (dest === 'international') {
      baseRate = 15 + billable * 6;
    } else {
      baseRate = 10 + billable * 4;
    }

    const domestic = (5 + billable * 2.5).toFixed(2);
    const international = (15 + billable * 6).toFixed(2);
    const express = (10 + billable * 4).toFixed(2);

    setResult({
      domestic,
      international,
      express,
      billableWeight: billable.toFixed(2),
      volumetric: volumetric.toFixed(2),
    });
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.shippingTitle}</h1>
            <p className="text-lg text-gray-600">{p.shippingSubtitle}</p>
          </div>

          <form onSubmit={calculate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.shippingWeightLabel}</label>
                <input type="number" step="0.01" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.shippingLengthLabel}</label>
                <input type="number" step="0.1" min="0" value={length} onChange={(e) => setLength(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.shippingWidthLabel}</label>
                <input type="number" step="0.1" min="0" value={width} onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.shippingHeightLabel}</label>
                <input type="number" step="0.1" min="0" value={height} onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{p.shippingDestLabel}</label>
              <select value={dest} onChange={(e) => setDest(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="domestic">Domestic (US)</option>
                <option value="international">International</option>
                <option value="express">Express</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.shippingCalculateBtn}
            </button>
          </form>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.shippingResult}</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.shippingDomestic}</p>
                  <p className="text-xl font-bold text-emerald-600">${result.domestic}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.shippingInternational}</p>
                  <p className="text-xl font-bold text-indigo-600">${result.international}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.shippingExpress}</p>
                  <p className="text-xl font-bold text-purple-600">${result.express}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Billable weight: {result.billableWeight} kg (volumetric: {result.volumetric} kg). Estimates based on standard carrier rates — actual costs may vary.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.shippingCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.shippingCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.shippingUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.shippingUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
