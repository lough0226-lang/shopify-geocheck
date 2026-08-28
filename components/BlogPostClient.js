'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getPostBySlug, getRelatedPosts, extractHeadings, addHeadingIds, getWordCount, author } from '../lib/posts';
import { postsZh, authorZh } from '../lib/posts-zh';
import ReadingProgress from './ReadingProgress';
import Newsletter from './Newsletter';

export default function BlogPostClient({ slug }) {
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

  const post = getPostBySlug(slug);
  if (!post) return null;

  const isZh = lang === 'zh';
  const zh = postsZh[slug];

  // Language-aware fields
  const title = isZh && zh ? zh.title : post.title;
  const excerpt = isZh && zh ? zh.excerpt : post.excerpt;
  const quickAnswer = isZh && zh ? zh.quickAnswer : post.quickAnswer;
  const faq = isZh && zh && zh.faq ? zh.faq : post.faq;
  const content = isZh && zh ? zh.content : post.content;
  const authorInfo = isZh ? authorZh : author;

  const headings = extractHeadings(content);
  const contentWithIds = addHeadingIds(content);
  const wordCount = getWordCount(content);
  const relatedPosts = getRelatedPosts(slug, 3);

  // UI strings
  const ui = isZh
    ? {
        backToBlog: '返回博客',
        quickAnswer: '快速回答',
        onThisPage: '本页目录',
        faqTitle: '常见问题',
        continueReading: '继续阅读 GEO 相关内容',
        checkGeo: '→ 免费检测你 Shopify 店铺的 GEO 评分',
        tagged: '标签：',
        share: '分享这篇文章：',
        related: '相关文章',
        ctaTitle: '免费检测你店铺的 GEO 评分',
        ctaDesc: '输入任意 Shopify 链接，立即获取跨 ChatGPT、Perplexity 和 Google AI Overviews 的 AI 可见度报告。',
        ctaBtn: '免费 GEO 检测 →',
        home: '首页',
        blog: '博客',
      }
    : {
        backToBlog: 'Back to Blog',
        quickAnswer: 'Quick Answer',
        onThisPage: 'On this page',
        faqTitle: 'Frequently Asked Questions',
        continueReading: 'Continue reading about GEO',
        checkGeo: "→ Check your Shopify store's GEO score (free)",
        tagged: 'Tagged:',
        share: 'Share this article:',
        related: 'Related articles',
        ctaTitle: "Check Your Store's GEO Score — Free",
        ctaDesc: 'Enter any Shopify URL and get an instant AI visibility report across ChatGPT, Perplexity, and Google AI Overviews.',
        ctaBtn: 'Run Free GEO Check →',
        home: 'Home',
        blog: 'Blog',
      };

  return (
    <div className="bg-white min-h-screen">
      <ReadingProgress />

      {/* Article header */}
      <header className="bg-primary-800 text-white pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-sm mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 flex-wrap">
              <li><Link href="/" className="text-primary-300 hover:text-white transition-colors">{ui.home}</Link></li>
              <li className="text-primary-500">/</li>
              <li><Link href="/blog" className="text-primary-300 hover:text-white transition-colors">{ui.blog}</Link></li>
              <li className="text-primary-500">/</li>
              <li className="text-primary-200 truncate max-w-[200px]">{title}</li>
            </ol>
          </nav>

          <Link href="/blog" className="inline-flex items-center text-primary-300 hover:text-white text-sm mb-6 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {ui.backToBlog}
          </Link>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4">{title}</h1>
          <p className="text-primary-200 text-lg mb-6">{excerpt}</p>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <time className="text-primary-300 text-sm">{post.dateDisplay}</time>
            <span className="text-primary-400">·</span>
            <span className="text-primary-300 text-sm">{post.readingTime}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => {
              const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link key={tag} href={`/blog/tag/${tagSlug}`}
                  className="text-xs font-medium bg-primary-700 hover:bg-primary-600 text-primary-200 hover:text-white px-3 py-1 rounded-full transition-colors">
                  {tag}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {quickAnswer && (
          <div className="bg-accent-50 border-l-4 border-accent-500 rounded-r-lg p-5 mb-8 not-prose">
            <p className="text-xs font-semibold text-accent-700 uppercase tracking-wider mb-2">{ui.quickAnswer}</p>
            <p className="text-gray-800 leading-relaxed m-0">{quickAnswer}</p>
          </div>
        )}

        {headings.length > 0 && (
          <nav className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8" aria-label="Table of contents">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{ui.onThisPage}</h3>
            <ul className="space-y-1.5">
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-sm text-gray-600 hover:text-accent-600 transition-colors">
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

        {faq && faq.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200 not-prose">
            <h2 className="text-2xl font-bold text-primary-800 mb-6">{ui.faqTitle}</h2>
            <div className="space-y-5">
              {faq.map((item, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-700 leading-relaxed m-0">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 bg-primary-50 border border-primary-200 rounded-xl p-6 not-prose">
          <h3 className="font-bold text-primary-800 mb-3">{ui.continueReading}</h3>
          <ul className="space-y-2 mb-0">
            {getAllPostsInternal(slug, isZh).map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="text-accent-700 hover:text-accent-800 font-medium text-sm">
                  → {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/check" className="text-accent-700 hover:text-accent-800 font-medium text-sm">
                {ui.checkGeo}
              </Link>
            </li>
          </ul>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 mr-2">{ui.tagged}</span>
            {post.tags.map((tag) => {
              const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link key={tag} href={`/blog/tag/${tagSlug}`}
                  className="text-xs font-medium bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-700 px-3 py-1 rounded-full transition-colors">
                  #{tag}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">{ui.share}</p>
          <div className="flex flex-wrap gap-3">
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(`https://mygeocheck.com/blog/${slug}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-100 hover:bg-black hover:text-white text-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://mygeocheck.com/blog/${slug}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-100 hover:bg-[#0A66C2] hover:text-white text-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://mygeocheck.com/blog/${slug}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-100 hover:bg-[#1877F2] hover:text-white text-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(`https://mygeocheck.com/blog/${slug}`)}&title=${encodeURIComponent(title)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-100 hover:bg-[#FF4500] hover:text-white text-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
              Reddit
            </a>
          </div>
        </div>

        <div className="mt-8"><Newsletter /></div>

        <div className="mt-10 bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {authorInfo.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-bold text-gray-900">{authorInfo.name}</p>
            <p className="text-sm text-accent-600 mb-2">{authorInfo.title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{authorInfo.bio}</p>
          </div>
        </div>

        <div className="mt-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">{ui.ctaTitle}</h3>
          <p className="text-accent-50 mb-6">{ui.ctaDesc}</p>
          <Link href="/check"
            className="inline-block bg-white text-accent-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            {ui.ctaBtn}
          </Link>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-primary-800 mb-5">{ui.related}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => {
                const rpZh = postsZh[rp.slug];
                const rpTitle = isZh && rpZh ? rpZh.title : rp.title;
                return (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`}
                    className="group block bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-primary-200 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <time className="text-xs text-gray-500">{rp.dateDisplay}</time>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{rp.readingTime}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-accent-600 transition-colors leading-snug text-sm">{rpTitle}</h3>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

function getAllPostsInternal(currentSlug, isZh) {
  const all = [
    {
      slug: 'shopify-stores-ai-search-visibility',
      titleEn: "I Checked If Shopify Stores Show Up in ChatGPT",
      titleZh: '我测了 Shopify 店铺在 ChatGPT 中的曝光率，结果令人意外',
    },
    {
      slug: 'how-to-check-brand-visibility-chatgpt-perplexity',
      titleEn: 'How to Check If Your Brand Shows Up in ChatGPT, Perplexity, and Google AI Overviews',
      titleZh: '如何检测你的品牌是否出现在 ChatGPT、Perplexity 和 Google AI Overviews 中',
    },
    {
      slug: 'geo-vs-seo-difference-2026',
      titleEn: 'GEO vs SEO: The Difference That Actually Matters in 2026',
      titleZh: 'GEO vs SEO：2026 年真正重要的区别',
    },
    {
      slug: 'get-shopify-store-mentioned-by-ai-search',
      titleEn: '7 Ways to Get Your Shopify Store Recommended by AI Search Engines',
      titleZh: '让 Shopify 店铺被 AI 搜索引擎推荐的 7 种方法',
    },
  ];
  return all
    .filter((p) => p.slug !== currentSlug)
    .map((p) => ({ slug: p.slug, title: isZh ? p.titleZh : p.titleEn }));
}
