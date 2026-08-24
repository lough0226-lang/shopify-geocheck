export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Paste Your Product URL',
      description: 'Enter any Shopify product page URL. We support both myshopify.com stores and custom domains.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
      ),
    },
    {
      number: '02',
      title: 'AI Analyzes Your Page',
      description: 'Our AI engine checks 22+ GEO dimensions including title clarity, structured data, description quality, and AI-readability signals.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Get Your Score & Fixes',
      description: 'Receive your AI visibility score with 3 key issues for free. Unlock the full report with specific fixes and competitor insights.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Get your AI search visibility score in 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* 连接线（桌面端） */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary-200 via-accent-300 to-primary-200"></div>

          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* 图标容器 */}
              <div className="relative z-10 w-20 h-20 mx-auto mb-6 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 border-2 border-primary-100">
                {step.icon}
              </div>

              {/* 步骤号 */}
              <div className="inline-flex items-center justify-center w-7 h-7 bg-accent-500 text-white text-xs font-bold rounded-full mb-3">
                {step.number}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
