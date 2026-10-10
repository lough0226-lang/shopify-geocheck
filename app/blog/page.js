import BlogListClient from '../../components/BlogListClient';

// 让博客列表页最多 60 秒自动重新生成，避免新文章被 CDN 长期缓存住
export const revalidate = 60;

export const metadata = {
  title: 'Blog - GEO & AI Search Insights for Shopify Merchants | My GEO Check',
  description: 'Practical insights on Generative Engine Optimization (GEO), AI search visibility, and how Shopify stores can get found in ChatGPT, Perplexity, and Google AI Overviews.',
  openGraph: {
    title: 'GEO & AI Search Insights for Shopify Merchants',
    description: 'Practical insights on how Shopify stores can get found in ChatGPT, Perplexity, and Google AI Overviews.',
    type: 'website',
    url: 'https://mygeocheck.com/blog',
  },
  alternates: {
    canonical: 'https://mygeocheck.com/blog',
  },
};

export default function BlogPage() {
  return <BlogListClient />;
}
