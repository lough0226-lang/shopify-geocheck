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
