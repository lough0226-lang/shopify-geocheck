'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function TermsGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [shopName, setShopName] = useState('');
  const [shopUrl, setShopUrl] = useState('');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  function generate(e) {
    e.preventDefault();
    const name = shopName.trim() || '[Store Name]';
    const url = shopUrl.trim() || '[https://yourstore.com]';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    setText(`TERMS OF SERVICE

Last updated: ${date}

## 1. Overview

Welcome to ${name}. These Terms of Service ("Terms") govern your use of our website located at ${url} (the "Site") and all associated services.

By accessing or using our Site, you agree to be bound by these Terms. If you do not agree, please do not use the Site.

## 2. Eligibility

You must be at least 18 years of age or the age of majority in your jurisdiction to use this Site. By using our Site, you represent and warrant that you meet this requirement.

## 3. Products and Services

### Product Descriptions
We make every effort to display product colors, images, and descriptions accurately. However, we do not warrant that product descriptions, colors, or other content are accurate, complete, reliable, current, or error-free.

### Pricing
All prices are subject to change without notice. We reserve the right to modify or discontinue a product without notice at any time.

### Availability
Products are subject to availability. We reserve the right to limit the quantities of any products offered.

## 4. Orders and Payment

By placing an order, you offer to purchase the product subject to these Terms. We reserve the right to refuse or cancel any order for reasons including but not limited to: product unavailability, errors in product or pricing information, or suspected fraud.

## 5. Shipping and Delivery

Estimated delivery times are provided for reference only and are not guaranteed. Risk of loss and title for items pass to you upon delivery.

## 6. Returns and Refunds

Please refer to our Return Policy for information about returning products.

## 7. Intellectual Property

All content on this Site, including text, graphics, logos, images, and software, is the property of ${name} and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.

## 8. User Accounts

If you create an account on our Site, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

## 9. Prohibited Uses

You agree not to use the Site:
- For any unlawful purpose
- To solicit others to perform unlawful acts
- To violate any international, federal, provincial, or state regulations
- To infringe upon our intellectual property rights
- To harass, abuse, or harm others
- To submit false or misleading information

## 10. Limitation of Liability

${name} shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.

## 11. Governing Law

These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ${name} operates, without regard to its conflict of law provisions.

## 12. Changes to Terms

We reserve the right to update or modify these Terms at any time. Changes will be effective immediately upon posting to the Site.

## 13. Contact Information

For questions about these Terms, please contact us through our website at ${url}.`);
  }

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.termsTitle}</h1>
            <p className="text-lg text-gray-600">{p.termsTitleSubtitle}</p>
          </div>

          <form onSubmit={generate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store name</label>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="My Store"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
                <input type="url" value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="https://yourstore.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.termsGenerateBtn}
            </button>
          </form>

          {text && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Generated Terms</h2>
                <button onClick={copy} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors">
                  {copied ? '✓ Copied' : 'Copy Text'}
                </button>
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">{text}</pre>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">Protect your business with proper legal pages via GEO check.</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">Free GEO Check →</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.termsUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.termsUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
