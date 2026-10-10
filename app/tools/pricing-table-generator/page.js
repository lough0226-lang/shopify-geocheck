'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function PricingTableGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [plans, setPlans] = useState('Basic\nPro\nEnterprise');
  const [prices, setPrices] = useState('9\n29\n99');
  const [features, setFeatures] = useState('5 products, Email support\nUnlimited products, Priority support\nUnlimited products, Dedicated support, API access');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  function generate(e) {
    e.preventDefault();
    const planNames = plans.trim().split('\n').filter(Boolean);
    const priceList = prices.trim().split('\n').filter(Boolean);
    const featureRows = features.trim().split('\n').filter(Boolean);

    if (planNames.length === 0) return;

    const allFeatures = featureRows.map(row => row.split(',').map(f => f.trim()));
    const maxFeatures = Math.max(...allFeatures.map(f => f.length));

    let tableHTML = `<div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap;padding:40px 20px;font-family:system-ui,sans-serif;">\n`;

    planNames.forEach((name, i) => {
      const price = priceList[i] || '0';
      const featList = allFeatures[i] || [];
      const isPopular = i === 1 && planNames.length >= 2;

      tableHTML += `  <div style="flex:1;min-width:250px;max-width:320px;border:1px solid #e5e7eb;border-radius:16px;padding:32px 24px;text-align:center;${isPopular ? 'border-color:#4f46e5;border-width:2px;position:relative;' : ''}">\n`;
      if (isPopular) {
        tableHTML += `    <span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#4f46e5;color:#fff;font-size:12px;font-weight:600;padding:4px 16px;border-radius:999px;">MOST POPULAR</span>\n`;
      }
      tableHTML += `    <h3 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px 0;">${name}</h3>\n`;
      tableHTML += `    <p style="font-size:36px;font-weight:800;color:#111827;margin:0 0 4px 0;">$${price}<span style="font-size:14px;font-weight:400;color:#6b7280;">/month</span></p>\n`;
      tableHTML += `    <ul style="list-style:none;padding:0;margin:24px 0;text-align:left;">\n`;
      featList.forEach(f => {
        tableHTML += `      <li style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;display:flex;align-items:center;gap:8px;"><span style="color:#10b981;">✓</span> ${f}</li>\n`;
      });
      tableHTML += `    </ul>\n`;
      tableHTML += `    <button style="width:100%;padding:12px;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;${isPopular ? 'background:#4f46e5;color:#fff;' : 'background:#f3f4f6;color:#374151;'}">Get Started</button>\n`;
      tableHTML += `  </div>\n`;
    });

    tableHTML += `</div>`;

    setCode(tableHTML);
  }

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.pricingTableTitle}</h1>
            <p className="text-lg text-gray-600">{p.pricingTableSubtitle}</p>
          </div>

          <form onSubmit={generate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.pricingTablePlansLabel}</label>
                <textarea value={plans} onChange={(e) => setPlans(e.target.value)} rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.pricingTablePricesLabel}</label>
                <textarea value={prices} onChange={(e) => setPrices(e.target.value)} rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.pricingTableFeaturesLabel}</label>
                <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.pricingTableGenerateBtn}
            </button>
          </form>

          {code && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{p.pricingTableResult}</h2>
                <button onClick={copy} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors">
                  {copied ? '✓ Copied' : p.pricingTableCopyBtn}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap max-h-64">{code}</pre>

              <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">{p.pricingTablePreview}</h3>
              <div dangerouslySetInnerHTML={{ __html: code }} className="border border-gray-200 rounded-xl overflow-hidden" />
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.pricingTableCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.pricingTableCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.pricingTableUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.pricingTableUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
