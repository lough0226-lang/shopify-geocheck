'use client';

import { useState } from 'react';

export default function FAQ() {
  const faqs = [
    {
      q: 'What is GEO (Generative Engine Optimization)?',
      a: 'GEO is the practice of optimizing your product pages so that AI-powered search engines (like ChatGPT, Perplexity, Google AI Overviews) can understand, cite, and recommend your products. Unlike traditional SEO which focuses on keyword rankings, GEO ensures your content is structured and clear enough for AI to extract and present to users.',
    },
    {
      q: 'Why should I care about AI search?',
      a: 'AI search is growing rapidly. Over 100 million people use ChatGPT weekly, and Google now shows AI Overviews for many product searches. When customers ask "What\'s the best ergonomic office chair?", AI recommends specific products. If your product page isn\'t optimized for AI understanding, you\'re invisible to these customers.',
    },
    {
      q: 'How does the free analysis work?',
      a: 'Simply paste your Shopify product URL. Our system fetches your product page, extracts all key content (title, description, structured data, images, etc.), and runs it through our AI analysis engine that checks 22+ dimensions. You get an instant visibility score and 3 key issues — no sign-up required.',
    },
    {
      q: 'What does the $29 full report include?',
      a: 'The full report includes detailed analysis of all 22+ GEO dimensions with individual scores, specific actionable fixes for each issue found, a prioritized action plan, quick wins you can implement immediately, competitor comparison insights, and strategic recommendations. It\'s a one-time payment with no subscription.',
    },
    {
      q: 'How accurate is the analysis?',
      a: 'Our analysis is powered by GPT-4o-mini and trained on thousands of Shopify product pages and AI search patterns. While no tool can guarantee exact AI search rankings (since algorithms are proprietary), our checks are based on documented best practices for AI readability and have been validated across 12,500+ product analyses.',
    },
    {
      q: 'Can I check multiple products?',
      a: 'Yes! The free analysis can be used on as many products as you want. Each full report ($29) is per-product. Many merchants start by checking their top-selling products and then expand from there.',
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg">
            Everything you need to know about AI search optimization
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
