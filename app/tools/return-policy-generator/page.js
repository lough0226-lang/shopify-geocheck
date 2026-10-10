'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function ReturnPolicyPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [shopName, setShopName] = useState('');
  const [days, setDays] = useState('30');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  function generate(e) {
    e.preventDefault();
    const name = shopName.trim() || '[Store Name]';
    const d = parseInt(days) || 30;
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    setText(`RETURN AND REFUND POLICY

Last updated: ${date}

Thank you for shopping at ${name}.

## Overview

We have a ${d}-day return policy, which means you have ${d} days after receiving your item to request a return.

## Eligibility for Returns

To be eligible for a return, your item must be:
- Unused and in the same condition that you received it
- In its original packaging
- Accompanied by the receipt or proof of purchase

### Items That Cannot Be Returned:
- Perishable goods (such as food, flowers, plants)
- Intimate or sanitary goods (such as underwear, swimwear)
- Hazardous materials or flammable liquids/solids
- Gift cards and downloadable software products
- Custom or personalized products

## How to Initiate a Return

To start a return, please contact us at our support email with:
1. Your order number
2. The item(s) you wish to return
3. The reason for the return

Once your return is accepted, we will send you instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.

## Refunds

Upon receiving and inspecting the returned item, we will notify you of the approval or rejection of your refund.

If approved, your refund will be processed within 5-10 business days. The refund will be credited to your original method of payment. Please note it may take additional time for your bank or credit card company to process and post the refund.

### Partial Refunds
Partial refunds may be granted if:
- An item is returned in a condition other than its original state
- An item is returned more than ${d} days after delivery
- An item shows signs of use or damage not present at delivery

## Shipping Returns

- Customers are responsible for return shipping costs unless the item received was damaged, defective, or incorrect.
- Shipping costs are non-refundable.
- We recommend using a trackable shipping service or purchasing shipping insurance for valuable items.

## Exchanges

If you need to exchange an item for the same product (e.g., different size or color), please contact us. Exchanges are subject to product availability.

## Damaged or Defective Items

If you received a damaged or defective item, please contact us immediately with photos of the damage. We will arrange a replacement or full refund at no additional cost to you.

## Contact Us

If you have any questions about our return policy, please contact our customer support team.`);
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.returnPolicyTitle}</h1>
            <p className="text-lg text-gray-600">{p.returnPolicySubtitle}</p>
          </div>

          <form onSubmit={generate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.returnPolicyShopNameLabel}</label>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="My Store"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.returnPolicyDaysLabel}</label>
                <input type="number" value={days} onChange={(e) => setDays(e.target.value)} min="1" max="365"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.returnPolicyGenerateBtn}
            </button>
          </form>

          {text && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{p.returnPolicyResult}</h2>
                <button onClick={copy} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors">
                  {copied ? '✓ Copied' : p.returnPolicyCopyBtn}
                </button>
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">{text}</pre>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.returnPolicyCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.returnPolicyCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.returnPolicyUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.returnPolicyUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
