import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';

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
  const allPosts = getAllPosts();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">GEO & AI Search Insights</h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Practical articles on how Shopify stores can win visibility in AI-powered search engines like ChatGPT, Perplexity, and Google AI Overviews.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {allPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link href={`/blog/${post.slug}`} className="block p-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <time className="text-sm text-gray-500">{post.dateDisplay}</time>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">{post.readingTime}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-primary-800 mb-3 hover:text-accent-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium bg-primary-50 text-primary-700 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Check Your Store's GEO Score</h3>
          <p className="text-accent-50 mb-6">
            See how visible your Shopify store is across AI search engines in under 30 seconds.
          </p>
          <Link
            href="/check"
            className="inline-block bg-white text-accent-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Run Free GEO Check →
          </Link>
        </div>
      </section>
    </div>
  );
}
