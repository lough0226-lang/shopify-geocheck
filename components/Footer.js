'use client';

import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../lib/i18n';

const TOOL_LABELS = {
  en: {
    'meta-description': 'Shopify Meta Description Generator',
    'schema-tester': 'Shopify Schema Markup Tester',
    'title-analyzer': 'Shopify Title Tag Analyzer',
    'bg-remover': 'Shopify Background Remover',
    'og-image-generator': 'Shopify OG Image Generator',
    'alt-text-generator': 'Shopify Alt Text Generator',
    'profit-calculator': 'Shopify Profit Margin Calculator',
    'discount-calculator': 'Shopify Discount Calculator',
    'cookie-banner': 'Shopify Cookie Banner Generator',
  },
  zh: {
    'meta-description': '商品描述 Meta 生成器',
    'schema-tester': '结构化数据检测',
    'title-analyzer': '标题标签分析',
    'bg-remover': '商品图去背景',
    'og-image-generator': '分享图生成器',
    'alt-text-generator': '图片 Alt 文本生成',
    'profit-calculator': '利润计算器',
    'discount-calculator': '折扣计算器',
    'cookie-banner': 'Cookie 横幅生成',
  },
};

const FOOTER_LINKS = {
  en: ['About', 'Methodology', 'Refund policy', '{fl[3]}'],
  zh: ['关于我们', '方法论', '退款政策', 'Cookie 设置'],
  de: ['Über uns', 'Methodik', 'Rückerstattung', 'Cookie-Einstellungen'],
  fr: ['À propos', 'Méthodologie', 'Remboursement', 'Réglages cookies'],
  es: ['Acerca de', 'Metodología', 'Reembolsos', 'Ajustes de cookies'],
  pt: ['Sobre', 'Metodologia', 'Reembolsos', 'Configurações de cookies'],
};

export default function Footer() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;
  const fl = FOOTER_LINKS[lang] || FOOTER_LINKS.en;
  const tl = TOOL_LABELS[lang] || TOOL_LABELS.en;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-800 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center">
                <img src="/footer-logo.png" alt="mygeocheck" className="h-[48px]" />
              </Link>
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
            <h4 className="font-semibold mb-3 text-sm">{p.footerTools}</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-300">
              <Link href="/tools/meta-description" className="hover:text-white transition-colors">{tl['meta-description'] || 'Shopify Meta Description Generator'}</Link>
              <Link href="/tools/schema-tester" className="hover:text-white transition-colors">{tl['schema-tester'] || 'Shopify Schema Markup Tester'}</Link>
              <Link href="/tools/title-analyzer" className="hover:text-white transition-colors">{tl['title-analyzer'] || 'Shopify Title Tag Analyzer'}</Link>
              <Link href="/tools/bg-remover" className="hover:text-white transition-colors">{tl['bg-remover'] || 'Shopify Background Remover'}</Link>
              <Link href="/tools/og-image-generator" className="hover:text-white transition-colors">{tl['og-image-generator'] || 'Shopify OG Image Generator'}</Link>
              <Link href="/tools/alt-text-generator" className="hover:text-white transition-colors">{tl['alt-text-generator'] || 'Shopify Alt Text Generator'}</Link>
              <Link href="/tools/profit-calculator" className="hover:text-white transition-colors">{tl['profit-calculator'] || 'Shopify Profit Margin Calculator'}</Link>
              <Link href="/tools/discount-calculator" className="hover:text-white transition-colors">{tl['discount-calculator'] || 'Shopify Discount Calculator'}</Link>
              <Link href="/tools/cookie-banner" className="hover:text-white transition-colors">{tl['cookie-banner'] || 'Shopify Cookie Banner Generator'}</Link>
              <Link href="/tools" className="hover:text-white transition-colors font-medium">{p.footerViewAllTools}</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">{p.footerSupport}</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-300">
              <Link href="/about" className="hover:text-white transition-colors">{fl[0]}</Link>
              <Link href="/methodology" className="hover:text-white transition-colors">{fl[1]}</Link>
              <Link href="/refund-policy" className="hover:text-white transition-colors">{fl[2]}</Link>
              <a href="mailto:hello@mygeocheck.com" className="hover:text-white transition-colors">
                {p.footerContact}
              </a>
              <Link href="/privacy" className="hover:text-white transition-colors">{p.footerPrivacy}</Link>
              <Link href="/terms" className="hover:text-white transition-colors">{p.footerTerms}</Link>
              {/* 撤回同意入口：GDPR 要求用户能随时改变或撤回同意，不能只能"同意一次" */}
              <button
                type="button"
                onClick={() => {
                  try { localStorage.removeItem('geo_cookie_consent'); } catch { /* ignore */ }
                  window.location.reload();
                }}
                className="text-left hover:text-white transition-colors"
              >
                {fl ? fl[3] : 'Cookie settings'}
              </button>
            </nav>
          </div>
        </div>

        {/* 主体信息：欧盟/英国电商披露义务要求可识别经营者；也是"是不是骗子"的第一道检查 */}
        <div className="border-t border-primary-600 mt-10 pt-6">
          <p className="text-primary-300 text-xs leading-6">
            My GEO Check is operated by Luo Xin · Yuci District, Jinzhong City, Shanxi Province, China ·{' '}
            <a href="mailto:hello@mygeocheck.com" className="underline hover:text-white">hello@mygeocheck.com</a>
          </p>
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
