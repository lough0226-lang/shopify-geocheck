'use client';

import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../lib/i18n';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ToolsPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const tools = [
    {
      href: '/tools/meta-description',
      icon: '📝',
      title: p.toolsMetaTitle,
      desc: p.toolsMetaDesc,
    },
    {
      href: '/tools/schema-tester',
      icon: '🔍',
      title: p.toolsSchemaTitle,
      desc: p.toolsSchemaDesc,
    },
  ];

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {p.toolsTitle}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {p.toolsSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-14">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 group block"
              >
                <div className="text-4xl mb-4">{tool.icon}</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {tool.desc}
                </p>
                <span className="inline-flex items-center text-indigo-600 font-medium text-sm group-hover:gap-2 transition-all">
                  {p.toolsUseBtn}
                </span>
              </Link>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-700 mb-4">{p.toolsCta}</p>
            <Link
              href="/check"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {p.toolsCtaBtn}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
