'use client';

import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../lib/i18n';

export default function PricingSection() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const checkIcon = (
    <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
    </svg>
  );

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
            {p.pricingTitle}
          </h2>
          <p className="text-gray-600 text-lg">
            {p.pricingSubtitle}
          </p>
        </div>

        {/* Transparent pricing bar */}
        <div className="mb-10 flex items-center justify-center gap-2 text-sm text-gray-600 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            {p.pricingBarFree}
          </span>
          <span className="text-gray-300">•</span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-primary-700"></span>
            {p.pricingBarOneTime}
          </span>
          <span className="text-gray-300">•</span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-accent-500"></span>
            {p.pricingBarSub}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free plan */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-7 relative">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{p.pricingFreeTitle}</h3>
              <p className="text-gray-500 text-sm">{p.pricingFreeSubtitle}</p>
            </div>
            <div className="mb-5">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500 ml-1 text-sm">{p.pricingFreePer}</span>
            </div>
            <ul className="space-y-2.5 mb-7">
              {(p.pricingFreeFeatures || []).map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  {checkIcon}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/check"
              className="block w-full text-center py-2.5 px-5 rounded-lg border-2 border-primary-700 text-primary-700 font-semibold hover:bg-primary-700 hover:text-white transition-all duration-200 text-sm"
            >
              {p.pricingFreeCta}
            </Link>
          </div>

          {/* $19 one-time */}
          <div className="bg-white rounded-2xl border-2 border-primary-700 p-7 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                {p.pricingOneTimeBadge}
              </span>
            </div>
            <div className="mb-5 mt-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{p.pricingOneTimeTitle}</h3>
              <p className="text-gray-500 text-sm">{p.pricingOneTimeSubtitle}</p>
            </div>
            <div className="mb-5">
              <span className="text-4xl font-bold text-gray-900">{p.pricingOneTimePrice}</span>
              <span className="text-gray-500 ml-1 text-sm">{p.pricingOneTimePer}</span>
            </div>
            <ul className="space-y-2.5 mb-7">
              {(p.pricingOneTimeFeatures || []).map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  {checkIcon}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/check"
              className="block w-full text-center py-2.5 px-5 rounded-lg bg-primary-700 text-white font-semibold hover:bg-primary-800 transition-all duration-200 shadow-md text-sm"
            >
              {p.pricingOneTimeCta}
            </Link>
          </div>

          {/* $29/month subscription */}
          <div className="bg-white rounded-2xl border-2 border-accent-500 p-7 relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {p.pricingSubBadge}
              </span>
            </div>
            <div className="mb-5 mt-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{p.pricingSubTitle}</h3>
              <p className="text-gray-500 text-sm">{p.pricingSubSubtitle}</p>
            </div>
            <div className="mb-5">
              <span className="text-4xl font-bold text-gray-900">{p.pricingSubPrice}</span>
              <span className="text-gray-500 ml-1 text-sm">{p.pricingSubPer}</span>
            </div>
            <ul className="space-y-2.5 mb-7">
              {(p.pricingSubFeatures || []).map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  {checkIcon}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/check"
              className="block w-full text-center py-2.5 px-5 rounded-lg bg-accent-500 text-white font-semibold hover:bg-accent-600 transition-all duration-200 shadow-md text-sm"
            >
              {p.pricingSubCta}
            </Link>
          </div>
        </div>

        {/* Guarantee */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            {p.pricingGuarantee}
          </p>
        </div>
      </div>
    </section>
  );
}
