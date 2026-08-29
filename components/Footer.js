'use client';

import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../lib/i18n';

export default function Footer() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;
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
            <p className="text-primary-300 text-sm max-w-sm mb-4">{p.footerBrandDesc}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">{p.footerProduct}</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-300">
              <Link href="/check" className="hover:text-white transition-colors">{p.footerFreeAnalysis}</Link>
              <a href="/#pricing" className="hover:text-white transition-colors">{p.footerPricing}</a>
              <a href="/#how-it-works" className="hover:text-white transition-colors">{p.footerHowItWorks}</a>
              <a href="/#faq" className="hover:text-white transition-colors">{p.footerFaq}</a>
              <Link href="/blog" className="hover:text-white transition-colors">{p.footerBlog}</Link>
              <a href="/rss" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                RSS
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 20 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z"/>
                </svg>
              </a>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">{p.footerSupport}</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-300">
              <a href="mailto:hello@mygeocheck.com" className="hover:text-white transition-colors">
                {p.footerContact}
              </a>
              <Link href="/privacy" className="hover:text-white transition-colors">{p.footerPrivacy}</Link>
              <Link href="/terms" className="hover:text-white transition-colors">{p.footerTerms}</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-primary-600 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-400 text-sm">
            {p.footerCopyright.replace('{year}', year)}
          </p>
          <p className="text-primary-400 text-xs">{p.footerTagline}</p>
        </div>
      </div>
    </footer>
  );
}
