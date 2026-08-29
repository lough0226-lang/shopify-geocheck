import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import PricingSection from '../components/PricingSection';
import FAQ from '../components/FAQ';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* 社会证明区域 */}
      <section className="py-12 bg-primary-700">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-3xl md:text-4xl font-bold text-white">22</div>
          <div className="text-primary-200 mt-1 text-sm">GEO Check Points</div>
        </div>
      </section>

      {/* 痛点区域 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary-700">
            AI Search Is Changing Everything
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Your customers are asking ChatGPT, &quot;What&apos;s the best product for...?&quot; — 
            and AI is recommending products. If yours aren&apos;t showing up, you&apos;re losing sales to competitors.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-semibold text-lg mb-2">ChatGPT Shopping</h3>
              <p className="text-gray-600 text-sm">
                ChatGPT now recommends specific products when users ask for recommendations
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-semibold text-lg mb-2">Google AI Overviews</h3>
              <p className="text-gray-600 text-sm">
                Google&apos;s AI summaries pull from product pages with clear, structured content
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-lg mb-2">Perplexity & More</h3>
              <p className="text-gray-600 text-sm">
                AI search engines cite and recommend products based on page quality signals
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
            Don&apos;t Let Your Products Stay Invisible
          </h2>
          <p className="text-primary-200 text-lg mb-8">
            Join thousands of Shopify merchants optimizing for AI search. 
            Start with a free check — see your score in seconds.
          </p>
          <Link href="/check" className="btn-primary text-lg inline-block">
            Check Your Product Now — Free
          </Link>
        </div>
      </section>
    </>
  );
}
