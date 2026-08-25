import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '../../../lib/posts';

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | My GEO Check Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://mygeocheck.com/blog/${post.slug}`,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `https://mygeocheck.com/blog/${post.slug}`,
    },
  };
}

export default function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'My GEO Check',
      url: 'https://mygeocheck.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'My GEO Check',
      url: 'https://mygeocheck.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://mygeocheck.com/blog/${post.slug}`,
    },
  };

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article header */}
      <header className="bg-primary-800 text-white pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-primary-300 hover:text-white text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <time className="text-primary-300 text-sm">{post.dateDisplay}</time>
            <span className="text-primary-400">·</span>
            <span className="text-primary-300 text-sm">{post.readingTime}</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-primary-200 text-lg">{post.excerpt}</p>
          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium bg-primary-700 text-primary-200 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Article body */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <div
          className="prose prose-lg max-w-none prose-headings:text-primary-800 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5 prose-a:text-accent-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:my-5 prose-ol:my-5 prose-li:text-gray-700 prose-li:mb-2"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* In-article CTA */}
        <div className="mt-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Check Your Store's GEO Score — Free</h3>
          <p className="text-accent-50 mb-6">
            Enter any Shopify URL and get an instant AI visibility report across ChatGPT, Perplexity, and Google AI Overviews.
          </p>
          <Link
            href="/check"
            className="inline-block bg-white text-accent-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Run Free GEO Check →
          </Link>
        </div>

        {/* Share */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Share this article:</p>
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://mygeocheck.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              𝕏 Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://mygeocheck.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
