import BlogListClient from '../../components/BlogListClient';

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
