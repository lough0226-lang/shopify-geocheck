import { getAllPosts, getAllTags } from '../lib/posts';

export default function sitemap() {
  const baseUrl = 'https://mygeocheck.com';
  const posts = getAllPosts();
  const tags = getAllTags();

  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date('2026-08-27'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/check`,
      lastModified: new Date('2026-08-27'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2026-08-27'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-08-27'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-08-27'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const blogPosts = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated || post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const tagPages = tags.map((tag) => ({
    url: `${baseUrl}/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticPages, ...blogPosts, ...tagPages];
}
