import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getRelatedPosts, extractHeadings, addHeadingIds, getWordCount, author } from '../../../lib/posts';
import ReadingProgress from '../../../components/ReadingProgress';
import Newsletter from '../../../components/Newsletter';

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
      modifiedTime: post.updated || post.date,
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

  const headings = extractHeadings(post.content);
  const contentWithIds = addHeadingIds(post.content);
  const wordCount = getWordCount(post.content);
  const relatedPosts = getRelatedPosts(post.slug, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    wordCount: wordCount,
    author: {
      '@type': 'Person',
      name: author.name,
      jobTitle: author.title,
      url: author.url,
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
    keywords: post.tags.join(', '),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mygeocheck.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://mygeocheck.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title.slice(0, 50), item: `https://mygeocheck.com/blog/${post.slug}` },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Article header */}
      <header className="bg-primary-800 text-white pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="text-sm mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 flex-wrap">
              <li><Link href="/" className="text-primary-300 hover:text-white transition-colors">Home</Link></li>
              <li className="text-primary-500">/</li>
              <li><Link href="/blog" className="text-primary-300 hover:text-white transition-colors">Blog</Link></li>
              <li className="text-primary-500">/</li>
              <li className="text-primary-200 truncate max-w-[200px]">{post.title}</li>
            </ol>
          </nav>

          <Link
            href="/blog"
            className="inline-flex items-center text-primary-300 hover:text-white text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-primary-200 text-lg mb-6">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <time className="text-primary-300 text-sm">{post.dateDisplay}</time>
            <span className="text-primary-400">·</span>
            <span className="text-primary-300 text-sm">{post.readingTime}</span>
            {post.updated && post.updated !== post.date && (
              <>
                <span className="text-primary-400">·</span>
                <span className="text-primary-300 text-sm">Updated {post.updated}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => {
              const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={tag}
                  href={`/blog/tag/${tagSlug}`}
                  className="text-xs font-medium bg-primary-700 hover:bg-primary-600 text-primary-200 hover:text-white px-3 py-1 rounded-full transition-colors"
                >
                  {tag}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Article body */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Table of contents (server-rendered, no JS needed) */}
        {headings.length > 0 && (
          <nav className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8" aria-label="Table of contents">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">On this page</h3>
            <ul className="space-y-1.5">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className="text-sm text-gray-600 hover:text-accent-600 transition-colors"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:text-primary-800 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5 prose-a:text-accent-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:my-5 prose-ol:my-5 prose-li:text-gray-700 prose-li:mb-2"
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />

        {/* Tags at bottom */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 mr-2">Tagged:</span>
            {post.tags.map((tag) => {
              const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={tag}
                  href={`/blog/tag/${tagSlug}`}
                  className="text-xs font-medium bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-700 px-3 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Share */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Share this article:</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://mygeocheck.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-100 hover:bg-black hover:text-white text-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X / Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://mygeocheck.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-100 hover:bg-[#0A66C2] hover:text-white text-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://mygeocheck.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-100 hover:bg-[#1877F2] hover:text-white text-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
            <a
              href={`https://www.reddit.com/submit?url=${encodeURIComponent(`https://mygeocheck.com/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-100 hover:bg-[#FF4500] hover:text-white text-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
              Reddit
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-8">
          <Newsletter />
        </div>

        {/* Author bio */}
        <div className="mt-10 bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {author.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-bold text-gray-900">{author.name}</p>
            <p className="text-sm text-accent-600 mb-2">{author.title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{author.bio}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-8 text-center text-white">
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

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-primary-800 mb-5">Related articles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group block bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-primary-200 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <time className="text-xs text-gray-500">{rp.dateDisplay}</time>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500">{rp.readingTime}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-accent-600 transition-colors leading-snug text-sm">
                    {rp.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
