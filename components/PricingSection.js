import Link from 'next/link';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-lg">
            Start free. Upgrade when you want the full picture.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 relative">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free Analysis</h3>
              <p className="text-gray-500 text-sm">Perfect for a quick check</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500 ml-1">/ check</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'AI visibility score (0-100)',
                '3 key issues identified',
                'Issue severity levels',
                'Impact description',
                'Unlimited free checks',
              ].map((item, i) => (
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
              Start Free Check
            </Link>
          </div>

          {/* Full Report */}
          <div className="bg-white rounded-2xl border-2 border-accent-500 p-8 relative shadow-lg">
            {/* 推荐标签 */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Full GEO Report</h3>
              <p className="text-gray-500 text-sm">Complete analysis with fixes</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$29</span>
              <span className="text-gray-500 ml-1">/ one-time</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Everything in Free plan',
                '22+ detailed checks',
                'Score per dimension (0-10)',
                'Specific fix for each issue',
                'Prioritized action plan',
                'Quick wins list',
                'Competitor comparison',
                'Strategic recommendations',
                'Pass/Warn/Fail status',
              ].map((item, i) => (
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
              Get Full Report
            </Link>
          </div>
        </div>

        {/* 保障说明 */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            💳 Secure payment via LemonSqueezy • Instant access after payment • No subscription required
          </p>
        </div>
      </div>
    </section>
  );
}
