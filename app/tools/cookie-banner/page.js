'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function CookieBannerPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [shopName, setShopName] = useState('');
  const [region, setRegion] = useState('gdpr');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  function generate(e) {
    e.preventDefault();
    const name = shopName.trim() || 'Our Store';
    const text = region === 'gdpr'
      ? `We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.`
      : `We use cookies to improve your experience and analyze site traffic. By clicking "Accept", you consent to our use of cookies.`;
    const btnText = region === 'gdpr' ? 'Accept' : 'I Accept';

    const html = `<!-- Cookie Consent Banner for ${name} -->
<div id="cookie-banner" style="position:fixed;bottom:0;left:0;right:0;background:#1e293b;color:#fff;padding:16px 24px;z-index:99999;display:flex;align-items:center;justify-content:space-between;gap:16px;font-family:system-ui,sans-serif;font-size:14px;">
  <p style="margin:0;flex:1;">${text} <a href="/privacy-policy" style="color:#818cf8;text-decoration:underline;">Learn more</a></p>
  <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookie_accepted','1');" style="background:#4f46e5;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-weight:600;white-space:nowrap;">${btnText}</button>
</div>
<script>
if(localStorage.getItem('cookie_accepted')){document.getElementById('cookie-banner').style.display='none';}
</script>`;

    setCode(html);
  }

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.cookieBannerTitle}</h1>
            <p className="text-lg text-gray-600">{p.cookieBannerSubtitle}</p>
          </div>

          <form onSubmit={generate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.cookieBannerShopNameLabel}</label>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="My Store"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.cookieBannerRegionLabel}</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="gdpr">GDPR (EU)</option>
                  <option value="ccpa">CCPA (California)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.cookieBannerGenerateBtn}
            </button>
          </form>

          {code && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{p.cookieBannerResult}</h2>
                <button onClick={copy} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors">
                  {copied ? '✓ Copied' : p.cookieBannerCopyBtn}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap">{code}</pre>

              <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">{p.cookieBannerPreview}</h3>
              <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <p className="text-white text-xs flex-1">
                  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
                  <span className="text-indigo-400 underline">Learn more</span>
                </p>
                <button className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg font-semibold whitespace-nowrap">Accept</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.cookieBannerCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.cookieBannerCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.cookieBannerUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.cookieBannerUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
