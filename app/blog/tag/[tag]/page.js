import { getAllTags, getPostsByTag } from '../../../../lib/posts';
import BlogTagClient from '../../../../components/BlogTagClient';

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({
    tag: tag.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }) {
  const tagSlug = params.tag;
  const matchedTag = getAllTags().find(
    (t) => t.toLowerCase().replace(/\s+/g, '-') === tagSlug
  );
  const displayName = matchedTag || tagSlug;
  return {
    title: `${displayName} articles | My GEO Check Blog`,
    description: `Articles about ${displayName} — GEO, AI search visibility, and Shopify optimization insights.`,
    alternates: {
      canonical: `https://mygeocheck.com/blog/tag/${tagSlug}`,
    },
  };
}

export default function TagPage({ params }) {
  return <BlogTagClient tagSlug={params.tag} />;
}
