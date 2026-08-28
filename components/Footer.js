'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('geo_lang');
      if (saved) setLang(saved);
    } catch (e) {}
    function handleChange(e) {
      if (e.detail && e.detail.lang) setLang(e.detail.lang);
    }
    window.addEventListener('languagechange', handleChange);
    return () => window.removeEventListener('languagechange', handleChange);
  }, []);

  const isZh = lang === 'zh';

  const text = isZh
    ? {
        brandDesc: '帮助 Shopify 商家为 AI 搜索引擎优化产品页面。让你的产品被 ChatGPT、Perplexity、Google AI Overviews 等平台找到。',
        product: '产品',
        freeAnalysis: '免费检测',
        pricing: '价格',
        howItWorks: '工作原理',
        faq: '常见问题',
        blog: '博客',
        support: '支持',
        contact: '联系我们',
        privacy: '隐私政策',
        terms: '服务条款',
        copyright: '© {year} My GEO Check. 保留所有权利。',
        tagline: '为想在 AI 搜索中获胜的 Shopify 商家而建。',
      }
    : {
        brandDesc: 'Help Shopify merchants optimize their product pages for AI-powered search engines. Get found by ChatGPT, Perplexity, Google AI Overviews, and more.',
        product: 'Product',
        freeAnalysis: 'Free Analysis',
        pricing: 'Pricing',
        howItWorks: 'How It Works',
        faq: 'FAQ',
        blog: 'Blog',
        support: 'Support',
        contact: 'Contact Us',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        copyright: '© {year} My GEO Check. All rights reserved.',
        tagline: 'Built for Shopify merchants who want to win in AI search.',
      };

  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-800 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-accent-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                G
              </div>
              <span className="font-bold text-lg">
                GEO<span className="text-accent-400">Check</span>
              </span>
            </div>
            <p className="text-primary-300 text-sm max-w-sm mb-4">{text.brandDesc}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">{text.product}</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-300">
              <Link href="/check" className="hover:text-white transition-colors">{text.freeAnalysis}</Link>
              <a href="/#pricing" className="hover:text-white transition-colors">{text.pricing}</a>
              <a href="/#how-it-works" className="hover:text-white transition-colors">{text.howItWorks}</a>
              <a href="/#faq" className="hover:text-white transition-colors">{text.faq}</a>
              <Link href="/blog" className="hover:text-white transition-colors">{text.blog}</Link>
              <a href="/rss" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                RSS
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z"/>
                </svg>
              </a>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">{text.support}</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-300">
              <a href="mailto:hello@mygeocheck.com" className="hover:text-white transition-colors">
                {text.contact}
              </a>
              <Link href="/privacy" className="hover:text-white transition-colors">{text.privacy}</Link>
              <Link href="/terms" className="hover:text-white transition-colors">{text.terms}</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-primary-600 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-400 text-sm">
            {text.copyright.replace('{year}', year)}
          </p>
          <p className="text-primary-400 text-xs">{text.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
