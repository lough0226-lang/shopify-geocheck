import Link from 'next/link';
import { getAllTags, getPostsByTag } from '../../../../lib/posts';

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({
    tag: tag.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }) {
  const tag = params.tag;
  const displayTag = tag
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return {
    title: `${displayTag} articles | My GEO Check Blog`,
    description: `Articles about ${displayTag} — GEO, AI search visibility, and Shopify optimization insights.`,
    alternates: {
      canonical: `https://mygeocheck.com/blog/tag/${tag}`,
    },
  };
}

export default function TagPage({ params }) {
  const tagSlug = params.tag;
  const allTags = getAllTags();
  // Find matching tag (case-insensitive)
  const matchedTag = allTags.find(
    (t) => t.toLowerCase().replace(/\s+/g, '-') === tagSlug
  );
  const posts = matchedTag ? getPostsByTag(matchedTag) : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-sm mb-4">
            <ol className="flex items-center gap-2 flex-wrap">
              <li><Link href="/" className="text-primary-300 hover:text-white">Home</Link></li>
              <li className="text-primary-500">/</li>
              <li><Link href="/blog" className="text-primary-300 hover:text-white">Blog</Link></li>
              <li className="text-primary-500">/</li>
              <li className="text-primary-200">Tag: {matchedTag || tagSlug}</li>
            </ol>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            #{matchedTag || tagSlug}
          </h1>
          <p className="text-primary-200 text-lg">
            {posts.length} article{posts.length !== 1 ? 's' : ''} tagged with {matchedTag || tagSlug}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        {/* All tags */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Browse all topics</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => {
              const slug = t.toLowerCase().replace(/\s+/g, '-');
              const isActive = slug === tagSlug;
              return (
                <Link
                  key={t}
                  href={`/blog/tag/${slug}`}
                  className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-700'
                  }`}
                >
                  {t}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
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
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-medium bg-primary-50 text-primary-700 px-3 py-1 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No articles found for this tag.</p>
            <Link href="/blog" className="text-accent-600 hover:text-accent-700 font-medium">
              ← Back to all articles
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
