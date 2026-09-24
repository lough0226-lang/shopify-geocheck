'use client';

import { useLang, PAGE_CONTENT } from '../lib/i18n';

export default function HowItWorks() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const steps = [
    {
      number: '01',
      title: p.howStep1Title,
      description: p.howStep1Desc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
      ),
    },
    {
      number: '02',
      title: p.howStep2Title,
      description: p.howStep2Desc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9C3.48 14.9 3 13.5 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      ),
    },
    {
      number: '03',
      title: p.howStep3Title,
      description: p.howStep3Desc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      ),
    },
    {
      number: '04',
      title: p.howStep4Title,
      description: p.howStep4Desc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18M7 14l4-4 3 3 5-6"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* 数据冲击条：先回答“为什么需要 AI 搜索可见度” */}
        <div className="max-w-3xl mx-auto mb-12 rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600 px-8 py-7 text-center text-white shadow-lg">
          <p className="text-lg md:text-xl font-semibold leading-relaxed">
            {p.howStat}
          </p>
          <p className="mt-2 font-medium text-primary-100">
            {p.howStatQuestion}
          </p>
          <p className="mt-3 text-xs text-primary-200">
            {p.howStatSource}
          </p>
        </div>

        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
            {p.howTitle}
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            {p.howSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* 连接线（桌面端，穿过四个图标中心） */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-accent-300 to-primary-200"></div>

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
