'use client';

import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../lib/i18n';

export default function PricingSection() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
            {p.pricingTitle}
          </h2>
          <p className="text-gray-600 text-lg">
            {p.pricingSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 relative">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{p.pricingFreeTitle}</h3>
              <p className="text-gray-500 text-sm">{p.pricingFreeSubtitle}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500 ml-1">{p.pricingFreePer}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {p.pricingFreeFeatures.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/check"
              className="block w-full text-center py-3 px-6 rounded-lg border-2 border-primary-700 text-primary-700 font-semibold hover:bg-primary-700 hover:text-white transition-all duration-200"
            >
              {p.pricingFreeCta}
            </Link>
          </div>

          {/* Full Report */}
          <div className="bg-white rounded-2xl border-2 border-accent-500 p-8 relative shadow-lg">
            {/* 推荐标签 */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                {p.pricingPopular}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{p.pricingFullTitle}</h3>
              <p className="text-gray-500 text-sm">{p.pricingFullSubtitle}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$29</span>
              <span className="text-gray-500 ml-1">{p.pricingFullPer}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {p.pricingFullFeatures.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/check"
              className="block w-full text-center py-3 px-6 rounded-lg bg-accent-500 text-white font-semibold hover:bg-accent-600 transition-all duration-200 shadow-md"
            >
              {p.pricingFullCta}
            </Link>
          </div>
        </div>

        {/* 保障说明 */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            {p.pricingGuarantee}
          </p>
        </div>
      </div>
    </section>
  );
}
