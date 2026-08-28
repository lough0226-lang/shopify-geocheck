import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getWordCount, author } from '../../../lib/posts';
import BlogPostClient from '../../../components/BlogPostClient';

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
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

  const wordCount = getWordCount(post.content);

  // JSON-LD structured data (server-rendered, English for SEO)
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

  const faqLd = post.faq && post.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  } : null;

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJson(faqLd) }}
        />
      )}
      <BlogPostClient slug={params.slug} />
    </>
  );
}
