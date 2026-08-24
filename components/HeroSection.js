import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-700 via-primary-700 to-primary-800 py-20 md:py-28 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* 标签 */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm px-4 py-2 rounded-full mb-8 border border-white/10">
          <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse-slow"></span>
          AI Search Optimization for Shopify
        </div>

        {/* 主标题 */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Is Your Shopify Product{' '}
          <span className="text-accent-400">Invisible</span>{' '}
          to AI Search?
        </h1>

        {/* 副标题 */}
        <p className="text-lg md:text-xl text-primary-200 max-w-2xl mx-auto mb-10 leading-relaxed">
          ChatGPT, Perplexity, and Google AI are changing how customers find products. 
          Get an instant AI search visibility score for your product page — completely free.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/check"
            className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            Check Now — Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
          <a
            href="#how-it-works"
            className="text-white/80 hover:text-white font-medium py-4 px-6 transition-colors inline-flex items-center gap-2"
          >
            See how it works
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </a>
        </div>

        {/* 信任标识 */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-primary-300 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Results in 30 seconds
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            22-point analysis
          </div>
        </div>
      </div>
    </section>
  );
}
