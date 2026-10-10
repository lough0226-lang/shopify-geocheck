'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function CheckoutAnalyzerPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [steps, setSteps] = useState('Cart\nShipping Info\nPayment\nConfirmation');
  const [abandonRate, setAbandonRate] = useState('70');
  const [result, setResult] = useState(null);

  function analyze(e) {
    e.preventDefault();
    const stepList = steps.trim().split('\n').filter(Boolean);
    const abandon = parseFloat(abandonRate) || 0;

    if (stepList.length === 0) return;

    let score = 100;
    const issues = [];
    const tips = [];

    if (stepList.length > 4) {
      score -= 20;
      issues.push(`Checkout has ${stepList.length} steps — too many. Aim for 3-4 steps maximum.`);
    } else if (stepList.length < 3) {
      score -= 10;
      issues.push(`Only ${stepList.length} checkout step detected — ensure all necessary steps (shipping, payment) are included.`);
    }

    const hasCart = stepList.some(s => s.toLowerCase().includes('cart'));
    if (!hasCart) {
      tips.push('Consider adding a cart review step before checkout');
    }

    const hasShipping = stepList.some(s => /ship|address|deliver/i.test(s));
    if (!hasShipping) {
      issues.push('No shipping/address step detected — customers need to enter delivery information.');
      score -= 15;
    }

    const hasPayment = stepList.some(s => /pay|checkout|billing/i.test(s));
    if (!hasPayment) {
      issues.push('No payment step detected — ensure customers can complete payment.');
      score -= 15;
    }

    if (abandon > 80) {
      score -= 20;
      issues.push(`Cart abandonment rate (${abandon}%) is critically high — industry average is ~70%.`);
    } else if (abandon > 70) {
      score -= 10;
      issues.push(`Cart abandonment rate (${abandon}%) is above average.`);
    } else if (abandon > 50) {
      score -= 5;
    }

    if (stepList.length > 1) {
      const hasReview = stepList.some(s => /review|confirm|summary/i.test(s));
      if (!hasReview) {
        tips.push('Add an order review/summary step to reduce errors and boost confidence');
      }
    }

    tips.push('Offer guest checkout — don\'t force account creation');
    tips.push('Show progress indicator so customers know how many steps remain');
    tips.push('Display security badges and trust signals on payment step');
    tips.push('Enable multiple payment options (credit card, PayPal, Apple Pay, Google Pay)');
    tips.push('Send abandoned cart recovery emails within 1-4 hours');
    tips.push('Minimize form fields — use autofill and address lookup');
    tips.push('Show shipping costs early — hidden costs at checkout are the #1 abandonment reason');

    score = Math.max(0, Math.min(100, score));

    setResult({ score, steps: stepList, abandonRate: abandon, issues, tips });
  }

  function scoreColor(s) { return s >= 80 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'; }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.checkoutTitle}</h1>
            <p className="text-lg text-gray-600">{p.checkoutSubtitle}</p>
          </div>

          <form onSubmit={analyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.checkoutStepsLabel}</label>
                <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={5}
                  placeholder="Cart&#10;Shipping Info&#10;Payment&#10;Confirmation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.checkoutAbandonLabel}</label>
                <input type="number" min="0" max="100" value={abandonRate} onChange={(e) => setAbandonRate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.checkoutAnalyzeBtn}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{p.checkoutResult}</h2>
                  <span className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}/100</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Checkout Flow ({result.steps.length} steps)</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.steps.map((s, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>
                        {i < result.steps.length - 1 && <span className="text-gray-300">→</span>}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Abandonment rate: {result.abandonRate}%</p>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.checkoutIssues}</h2>
                  <ul className="space-y-2">
                    {result.issues.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.checkoutTips}</h2>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span><span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.checkoutCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.checkoutCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.checkoutUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.checkoutUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
