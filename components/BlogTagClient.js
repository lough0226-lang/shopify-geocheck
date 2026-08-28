'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllTags, getPostsByTag } from '../lib/posts';
import { postsZh } from '../lib/posts-zh';

export default function TagClient({ tagSlug }) {
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

  const allTags = getAllTags();
  const matchedTag = allTags.find(
    (t) => t.toLowerCase().replace(/\s+/g, '-') === tagSlug
  );
  const posts = matchedTag ? getPostsByTag(matchedTag) : [];
  const isZh = lang === 'zh';

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-sm mb-4">
            <ol className="flex items-center gap-2 flex-wrap">
              <li><Link href="/" className="text-primary-300 hover:text-white">{isZh ? '首页' : 'Home'}</Link></li>
              <li className="text-primary-500">/</li>
              <li><Link href="/blog" className="text-primary-300 hover:text-white">{isZh ? '博客' : 'Blog'}</Link></li>
              <li className="text-primary-500">/</li>
              <li className="text-primary-200">#{matchedTag || tagSlug}</li>
            </ol>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">#{matchedTag || tagSlug}</h1>
          <p className="text-primary-200 text-lg">
            {posts.length} {isZh ? '篇相关文章' : (posts.length !== 1 ? 'articles on this topic' : 'article on this topic')}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{isZh ? '所有主题' : 'All topics'}</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => {
              const slug = t.toLowerCase().replace(/\s+/g, '-');
              const isActive = slug === tagSlug;
              return (
                <Link key={t} href={`/blog/tag/${slug}`}
                  className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-700'
                  }`}>
                  {t}
                </Link>
              );
            })}
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => {
              const zh = postsZh[post.slug];
              const displayTitle = isZh && zh ? zh.title : post.title;
              const displayExcerpt = isZh && zh ? zh.excerpt : post.excerpt;
              return (
                <article key={post.slug}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">{isZh ? '未找到该标签下的文章。' : 'No articles found for this tag.'}</p>
            <Link href="/blog" className="text-accent-600 hover:text-accent-700 font-medium">
              ← {isZh ? '返回所有文章' : 'Back to all articles'}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
