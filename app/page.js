'use client';

import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import PricingSection from '../components/PricingSection';
import FAQ from '../components/FAQ';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../lib/i18n';

export default function HomePage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  return (
    <>
      <HeroSection />

      {/* 痛点区域 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary-700">
            {p.painTitle}
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {p.painSubtitle}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-semibold text-lg mb-2">{p.painChatGPT}</h3>
              <p className="text-gray-600 text-sm">
                {p.painChatGPTDesc}
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-semibold text-lg mb-2">{p.painGoogle}</h3>
              <p className="text-gray-600 text-sm">
                {p.painGoogleDesc}
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-lg mb-2">{p.painPerplexity}</h3>
              <p className="text-gray-600 text-sm">
                {p.painPerplexityDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Founding Customers 活动入口 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div style={{ background: 'linear-gradient(135deg,#064e3b 0%,#065f46 60%,#047857 100%)', borderRadius: 16, padding: '36px 32px', color: '#fff', textAlign: 'center', boxShadow: '0 10px 30px -12px rgba(6,78,59,0.5)' }}>
            <span style={{ display: 'inline-block', background: 'rgba(16,185,129,0.22)', border: '1px solid rgba(110,231,183,0.5)', color: '#6ee7b7', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, padding: '4px 12px', borderRadius: 999, marginBottom: 16, textTransform: 'uppercase' }}>
              {'🚀 Limited to 30 stores'}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
              Become a founding customer &mdash; get every full report free
            </h2>
            <p className="text-base mb-6" style={{ color: '#b7e4d4', lineHeight: 1.7, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              The first 30 Shopify stores unlock the complete competitor breakdown and fix list
              (normally $29/month) at no cost, plus a free 30-day re-check that measures whether your
              visibility in ChatGPT, Perplexity and Google AI Overviews actually improved.
            </p>
            <Link href="/check" className="inline-block font-bold text-lg" style={{ background: '#10b981', color: '#fff', padding: '14px 36px', borderRadius: 10, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
              Claim a free founding spot
            </Link>
            <p className="text-sm mt-4" style={{ color: '#9fd3c0' }}>
              The only ask: return for a free re-check and share what you changed.
            </p>
          </div>
        </div>
      </section>

      <PricingSection />
      <FAQ />

      {/* 最终 CTA */}
      <section className="py-20 bg-primary-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {p.finalCtaTitle}
          </h2>
          <p className="text-primary-200 text-lg mb-8">
            {p.finalCtaDesc}
          </p>
          <Link href="/check" className="btn-primary text-lg inline-block">
            {p.finalCtaBtn}
          </Link>
        </div>
      </section>
    </>
  );
}
