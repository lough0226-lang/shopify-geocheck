'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Language data
const LANGUAGES = {
  en: { code: 'en', label: 'English', flag: '🇺🇸' },
  zh: { code: 'zh', label: '中文', flag: '🇨🇳' },
  de: { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  fr: { code: 'fr', label: 'Français', flag: '🇫🇷' },
  es: { code: 'es', label: 'Español', flag: '🇪🇸' },
  pt: { code: 'pt', label: 'Português', flag: '🇧🇷' },
};

function detectLanguage() {
  if (typeof window === 'undefined') return 'en';
  var saved = localStorage.getItem('geo_lang');
  if (saved && LANGUAGES[saved]) return saved;
  var browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('pt')) return 'pt';
  return 'en';
}

// Nav labels per language
const NAV_LABELS = {
  en: { howItWorks: 'How It Works', pricing: 'Pricing', faq: 'FAQ', blog: 'Blog', freeCheck: 'Free Check' },
  zh: { howItWorks: '工作原理', pricing: '价格', faq: '常见问题', blog: '博客', freeCheck: '免费检测' },
  de: { howItWorks: 'So funktioniert\'s', pricing: 'Preise', faq: 'FAQ', blog: 'Blog', freeCheck: 'Gratis testen' },
  fr: { howItWorks: 'Comment ça marche', pricing: 'Tarifs', faq: 'FAQ', blog: 'Blog', freeCheck: 'Test gratuit' },
  es: { howItWorks: 'Cómo funciona', pricing: 'Precios', faq: 'FAQ', blog: 'Blog', freeCheck: 'Prueba gratis' },
  pt: { howItWorks: 'Como funciona', pricing: 'Preços', faq: 'FAQ', blog: 'Blog', freeCheck: 'Teste grátis' },
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(function() {
    setLang(detectLanguage());
  }, []);

  const t = NAV_LABELS[lang] || NAV_LABELS.en;
  const langs = Object.values(LANGUAGES);
  const currentLang = LANGUAGES[lang] || LANGUAGES.en;

  function handleLangChange(newLang) {
    setLang(newLang);
    localStorage.setItem('geo_lang', newLang);
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: newLang } }));
    setLangOpen(false);
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary-700 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
              G
            </div>
            <span className="font-bold text-lg text-primary-700">
              GEO<span className="text-accent-500">Check</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <a href="/#how-it-works" className="text-sm text-gray-600 hover:text-primary-700 transition-colors">
                {t.howItWorks}
              </a>
              <a href="/#pricing" className="text-sm text-gray-600 hover:text-primary-700 transition-colors">
                {t.pricing}
              </a>
              <a href="/#faq" className="text-sm text-gray-600 hover:text-primary-700 transition-colors">
                {t.faq}
              </a>
              <Link href="/blog" className="text-sm text-gray-600 hover:text-primary-700 transition-colors">
                {t.blog}
              </Link>
            </nav>

            <Link href="/check" className="btn-primary !py-2 !px-5 text-sm">
              {t.freeCheck}
            </Link>

            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-700 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
              >
                <span className="text-base">{currentLang.flag}</span>
                <span>{currentLang.label}</span>
                <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[160px] z-50">
                  {langs.map(function(l) {
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleLangChange(l.code)}
                        className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                          lang === l.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base">{l.flag}</span>
                        {l.label}
                        {lang === l.code && <span className="ml-auto text-green-500">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-3">
              <a href="/#how-it-works" className="text-gray-600 hover:text-primary-700 py-2" onClick={() => setMobileOpen(false)}>
                {t.howItWorks}
              </a>
              <a href="/#pricing" className="text-gray-600 hover:text-primary-700 py-2" onClick={() => setMobileOpen(false)}>
                {t.pricing}
              </a>
              <a href="/#faq" className="text-gray-600 hover:text-primary-700 py-2" onClick={() => setMobileOpen(false)}>
                {t.faq}
              </a>
              <Link href="/blog" className="text-gray-600 hover:text-primary-700 py-2" onClick={() => setMobileOpen(false)}>
                {t.blog}
              </Link>

              {/* Mobile Language Switcher */}
              <div className="py-2 border-t border-gray-100 mt-1">
                <div className="text-xs text-gray-400 mb-2">Language / 语言</div>
                <div className="flex flex-wrap gap-2">
                  {langs.map(function(l) {
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleLangChange(l.code)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          lang === l.code
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {l.flag} {l.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Link href="/check" className="btn-primary text-center !py-2 text-sm" onClick={() => setMobileOpen(false)}>
                {t.freeCheck}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
