'use client';

import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../lib/i18n';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ToolsPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const categories = [
    {
      name: lang === 'zh' ? 'SEO 优化工具' : 'SEO Optimization',
      icon: '🔍',
      desc: lang === 'zh' ? '提升搜索引擎排名，获取更多自然流量' : 'Boost search rankings and drive organic traffic',
      tools: [
        { href: '/tools/meta-description', icon: '📝', title: p.metaTitle, desc: p.metaSubtitle },
        { href: '/tools/schema-tester', icon: '🔍', title: p.schemaTitle, desc: p.schemaSubtitle },
        { href: '/tools/title-analyzer', icon: '🏷️', title: p.titleAnalyzerTitle, desc: p.titleAnalyzerSubtitle },
        { href: '/tools/alt-text-generator', icon: '🖼️', title: p.altTextTitle, desc: p.altTextSubtitle },
        { href: '/tools/url-analyzer', icon: '🔗', title: p.urlAnalyzerTitle, desc: p.urlAnalyzerSubtitle },
        { href: '/tools/keyword-density', icon: '📊', title: p.keywordDensityTitle, desc: p.keywordDensitySubtitle },
        { href: '/tools/internal-link', icon: '🔗', title: p.internalLinkTitle, desc: p.internalLinkSubtitle },
        { href: '/tools/competitor-seo', icon: '🏆', title: p.competitorTitle, desc: p.competitorSubtitle },
        { href: '/tools/keyword-trends', icon: '📈', title: p.keywordTrendsTitle, desc: p.keywordTrendsSubtitle },
      ],
    },
    {
      name: lang === 'zh' ? '网站结构工具' : 'Site Structure',
      icon: '🏗️',
      desc: lang === 'zh' ? '优化网站架构，提升爬虫索引效率' : 'Optimize site architecture for better crawling',
      tools: [
        { href: '/tools/breadcrumb-generator', icon: '🧭', title: p.breadcrumbTitle, desc: p.breadcrumbSubtitle },
        { href: '/tools/robots-checker', icon: '🤖', title: p.robotsTitle, desc: p.robotsSubtitle },
        { href: '/tools/sitemap-checker', icon: '🗺️', title: p.sitemapTitle, desc: p.sitemapSubtitle },
      ],
    },
    {
      name: lang === 'zh' ? '性能与体验工具' : 'Performance & UX',
      icon: '⚡',
      desc: lang === 'zh' ? '提升页面加载速度和移动端体验' : 'Improve page speed and mobile experience',
      tools: [
        { href: '/tools/page-speed', icon: '⚡', title: p.pageSpeedTitle, desc: p.pageSpeedSubtitle },
        { href: '/tools/mobile-check', icon: '📱', title: p.mobileCheckTitle, desc: p.mobileCheckSubtitle },
        { href: '/tools/core-web-vitals', icon: '💚', title: p.coreVitalsTitle, desc: p.coreVitalsSubtitle },
      ],
    },
    {
      name: lang === 'zh' ? '图片处理工具' : 'Image Tools',
      icon: '🖼️',
      desc: lang === 'zh' ? '压缩、转换和优化产品图片' : 'Compress, convert and optimize product images',
      tools: [
        { href: '/tools/image-compressor', icon: '📦', title: p.imageCompressorTitle, desc: p.imageCompressorSubtitle },
        { href: '/tools/image-resizer', icon: '📐', title: p.imageResizerTitle, desc: p.imageResizerSubtitle },
        { href: '/tools/image-to-webp', icon: '🔄', title: p.imageWebpTitle, desc: p.imageWebpSubtitle },
        { href: '/tools/bg-remover', icon: '✂️', title: p.bgRemoverTitle, desc: p.bgRemoverSubtitle },
        { href: '/tools/favicon-generator', icon: '⭐', title: p.faviconTitle, desc: p.faviconSubtitle },
        { href: '/tools/og-image-generator', icon: '🎨', title: p.ogImageTitle, desc: p.ogImageSubtitle },
      ],
    },
    {
      name: lang === 'zh' ? 'AI 内容创作工具' : 'AI Content Creation',
      icon: '🤖',
      desc: lang === 'zh' ? 'AI 驱动的产品描述、博客标题、FAQ 等内容生成' : 'AI-powered product descriptions, blog titles, FAQs and more',
      tools: [
        { href: '/tools/product-description', icon: '✍️', title: p.productDescTitle, desc: p.productDescSubtitle },
        { href: '/tools/blog-title-generator', icon: '📰', title: p.blogTitleTitle, desc: p.blogTitleSubtitle },
        { href: '/tools/faq-generator', icon: '❓', title: p.faqGenTitle, desc: p.faqGenSubtitle },
        { href: '/tools/email-copy-generator', icon: '📧', title: p.emailCopyTitle, desc: p.emailCopySubtitle },
        { href: '/tools/social-copy-generator', icon: '💬', title: p.socialCopyTitle, desc: p.socialCopySubtitle },
      ],
    },
    {
      name: lang === 'zh' ? '合规与法律工具' : 'Compliance & Legal',
      icon: '📋',
      desc: lang === 'zh' ? '生成隐私政策、服务条款、Cookie 横幅等合规文件' : 'Generate privacy policies, terms, cookie banners and more',
      tools: [
        { href: '/tools/cookie-banner', icon: '🍪', title: p.cookieBannerTitle, desc: p.cookieBannerSubtitle },
        { href: '/tools/privacy-policy-generator', icon: '🔒', title: p.privacyPolicyTitle, desc: p.privacyPolicySubtitle },
        { href: '/tools/return-policy-generator', icon: '↩️', title: p.returnPolicyTitle, desc: p.returnPolicySubtitle },
        { href: '/tools/terms-generator', icon: '📄', title: p.termsTitle, desc: p.termsTitleSubtitle },
        { href: '/tools/ada-checker', icon: '♿', title: p.adaTitle, desc: p.adaSubtitle },
      ],
    },
    {
      name: lang === 'zh' ? '商业计算器' : 'Business Calculators',
      icon: '🧮',
      desc: lang === 'zh' ? '利润、折扣、运费、ROI 等电商必备计算' : 'Profit, discount, shipping, ROI and essential e-commerce calculations',
      tools: [
        { href: '/tools/profit-calculator', icon: '💰', title: p.profitTitle, desc: p.profitSubtitle },
        { href: '/tools/discount-calculator', icon: '🏷️', title: p.discountTitle, desc: p.discountSubtitle },
        { href: '/tools/shipping-calculator', icon: '🚚', title: p.shippingTitle, desc: p.shippingSubtitle },
        { href: '/tools/roi-calculator', icon: '📈', title: p.roiTitle, desc: p.roiSubtitle },
        { href: '/tools/pricing-calculator', icon: '💲', title: p.pricingTitle, desc: p.pricingSubtitle },
        { href: '/tools/promo-code-generator', icon: '🎟️', title: p.promoTitle, desc: p.promoSubtitle },
      ],
    },
    {
      name: lang === 'zh' ? '转化优化工具' : 'Conversion Optimization',
      icon: '🎯',
      desc: lang === 'zh' ? '优化结账流程和定价展示，提升转化率' : 'Optimize checkout flow and pricing to boost conversions',
      tools: [
        { href: '/tools/checkout-analyzer', icon: '🛒', title: p.checkoutTitle, desc: p.checkoutSubtitle },
        { href: '/tools/pricing-table-generator', icon: '📊', title: p.pricingTableTitle, desc: p.pricingTableSubtitle },
      ],
    },
  ];

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {p.toolsTitle}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {p.toolsSubtitle}
            </p>
          </div>

          <div className="space-y-12">
            {categories.map((cat) => (
              <section key={cat.name}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                    <p className="text-sm text-gray-500">{cat.desc}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group block"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                            {tool.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {tool.desc}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-14">
            <p className="text-gray-700 mb-4">{p.toolsCta}</p>
            <Link
              href="/check"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {p.toolsCtaBtn}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
