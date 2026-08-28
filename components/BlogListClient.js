'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllPosts } from '../lib/posts';
import { postsZh } from '../lib/posts-zh';

export default function BlogListClient() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('geo_lang');
      if (saved) setLang(saved);
    } catch (e) {}

    function handleChange(e) {
      if (e.detail && e.detail.lang) setLang(e.detail.lang);
    }
    window.addEventListener('languagechange', handleChange);
    return () => window.removeEventListener('languagechange', handleChange);
  }, []);

  const allPosts = getAllPosts();
  const isZh = lang === 'zh';

  const title = isZh ? 'GEO 与 AI 搜索洞察' : 'GEO & AI Search Insights';
  const subtitle = isZh
    ? '关于 Shopify 店铺如何在 ChatGPT、Perplexity 和 Google AI Overviews 等 AI 搜索引擎中赢得曝光的实战文章。'
    : 'Practical articles on how Shopify stores can win visibility in AI-powered search engines like ChatGPT, Perplexity, and Google AI Overviews.';
  const ctaTitle = isZh ? '检测你店铺的 GEO 评分' : "Check Your Store's GEO Score";
  const ctaDesc = isZh
    ? '30 秒内查看你的 Shopify 店铺在各 AI 搜索引擎中的可见度。'
    : 'See how visible your Shopify store is across AI search engines in under 30 seconds.';
  const ctaBtn = isZh ? '免费开始 GEO 检测 →' : 'Run Free GEO Check →';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">{subtitle}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {allPosts.map((post) => {
            const zh = postsZh[post.slug];
            const displayTitle = isZh && zh ? zh.title : post.title;
            const displayExcerpt = isZh && zh ? zh.excerpt : post.excerpt;

            return (
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
                    {displayTitle}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">{displayExcerpt}</p>
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
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">{ctaTitle}</h3>
          <p className="text-accent-50 mb-6">{ctaDesc}</p>
          <Link
            href="/check"
            className="inline-block bg-white text-accent-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {ctaBtn}
          </Link>
        </div>
      </section>
    </div>
  );
}
