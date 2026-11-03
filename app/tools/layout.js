export const metadata = {
  title: 'Free Shopify Tools - SEO, Images, AI & Calculators',
  description: '39 free tools for Shopify merchants: SEO analyzer, image compressor, AI content generator, profit calculator and more. No signup required.',
  alternates: {
    canonical: 'https://mygeocheck.com/tools',
  },
  openGraph: {
    title: 'Free Shopify Tools - SEO, Images, AI & Calculators',
    description: '39 free tools for Shopify merchants: SEO analyzer, image compressor, AI content generator, profit calculator and more.',
    type: 'website',
    url: 'https://mygeocheck.com/tools',
    siteName: 'My GEO Check',
  },
};

export default function ToolsLayout({ children }) {
  return (
    <>
      {children}
      {/* 维护信号：工具页会过期，明确标注复核时间，避免读者以为站点停更 */}
      <div className="max-w-3xl mx-auto px-4 pb-12 text-center text-xs text-gray-400">
        All tool pages reviewed and updated October 2026. Spot something outdated? Email hello@mygeocheck.com.
      </div>
    </>
  );
}
