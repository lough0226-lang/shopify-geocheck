import { getAllPosts, getAllTags } from '../lib/posts';

// 工具页 slug 列表。
// 项目里没有独立的纯数据文件：工具页是 app/tools/<slug>/page.js 静态目录（均为 'use client'），
// 唯一的完整清单维护在 app/tools/page.js（客户端组件，不能被服务端 sitemap 直接 import）。
// 新增/删除工具页时，必须与 app/tools/page.js 的 categories 链接列表保持同步。
const TOOL_SLUGS = [
  // SEO Optimization
  'meta-description',
  'schema-tester',
  'title-analyzer',
  'alt-text-generator',
  'url-analyzer',
  'keyword-density',
  'internal-link',
  'competitor-seo',
  'keyword-trends',
  // Site Structure
  'breadcrumb-generator',
  'robots-checker',
  'sitemap-checker',
  // Performance & UX
  'page-speed',
  'mobile-check',
  'core-web-vitals',
  // Image Tools
  'image-compressor',
  'image-resizer',
  'image-to-webp',
  'bg-remover',
  'favicon-generator',
  'og-image-generator',
  // AI Content Creation
  'product-description',
  'blog-title-generator',
  'faq-generator',
  'email-copy-generator',
  'social-copy-generator',
  // Compliance & Legal
  'cookie-banner',
  'privacy-policy-generator',
  'return-policy-generator',
  'terms-generator',
  'ada-checker',
  // Business Calculators
  'profit-calculator',
  'discount-calculator',
  'shipping-calculator',
  'roi-calculator',
  'pricing-calculator',
  'promo-code-generator',
  // Conversion Optimization
  'checkout-analyzer',
  'pricing-table-generator',
];

export default function sitemap() {
  const baseUrl = 'https://mygeocheck.com';
  const posts = getAllPosts();
  const tags = getAllTags();

  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date('2026-09-03'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/check`,
      lastModified: new Date('2026-09-03'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2026-09-03'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      // 整店扫描入口：这是付费产品的主入口，优先级高于单页工具
      url: `${baseUrl}/scan`,
      lastModified: new Date('2026-11-05'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      // 方法页：信任资产，也是这个站最该被 AI 引用的页面之一
      url: `${baseUrl}/methodology`,
      lastModified: new Date('2026-11-03'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-11-03'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date('2026-11-03'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // privacy and terms are noindex — excluded from sitemap
  ];

  const blogPosts = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated || post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // 去重：getAllTags() 会返回同名但大小写/空格不同的标签，
  // 归一化后产生重复 slug（线上曾出现 /blog/tag/ai-shopping-agents 两次）。
  const tagSlugs = [...new Set(
    tags.map((tag) => tag.toLowerCase().replace(/\s+/g, '-'))
  )];

  const tagPages = tagSlugs.map((slug) => ({
    url: `${baseUrl}/blog/tag/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  const toolPages = TOOL_SLUGS.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...blogPosts, ...tagPages, ...toolPages];
}
