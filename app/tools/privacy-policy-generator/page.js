'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function PrivacyPolicyPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('gdpr');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  function generate(e) {
    e.preventDefault();
    const name = shopName.trim() || '[Store Name]';
    const mail = email.trim() || '[email@example.com]';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const gdprExtra = region === 'gdpr' ? `

## Your Rights Under GDPR

If you are a resident of the European Economic Area (EEA), you have the following data protection rights:
- The right to access, update, or delete your personal information
- The right of rectification
- The right to object
- The right of restriction
- The right to data portability
- The right to withdraw consent

To exercise any of these rights, please contact us at ${mail}.
` : `

## California Privacy Rights (CCPA)

If you are a California resident, you have the right to:
- Request disclosure of the categories and specific pieces of personal information collected
- Request deletion of personal information
- Opt out of the sale of personal information
- Not be discriminated against for exercising your privacy rights

To exercise these rights, contact us at ${mail}.
`;

    setText(`PRIVACY POLICY

Last updated: ${date}

${name} ("we", "our", "us") operates this website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.

## Information Collection and Use

We collect several different types of information for various purposes:

### Personal Data
While using our service, we may ask you to provide us with certain personally identifiable information, including but not limited to:
- Email address
- First name and last name
- Phone number
- Address, State, Province, ZIP/Postal code, City
- Cookies and Usage Data

### Usage Data
We may also collect information on how the service is accessed and used. This may include your computer's Internet Protocol address, browser type, browser version, the pages of our service that you visit, the time and date of your visit, and other diagnostic data.

## Cookies

We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.

## Data Sharing

We may share your personal data with third parties only to the extent necessary to provide our services, including:
- Payment processors (e.g., Stripe, PayPal)
- Shipping carriers
- Analytics services

## Data Security

The security of your data is important to us, but remember that no method of transmission over the Internet is 100% secure. We strive to use commercially acceptable means to protect your personal data.

## Children's Privacy

Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.${gdprExtra}

## Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.

## Contact Us

If you have any questions about this Privacy Policy, please contact us at ${mail}.`);
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.privacyPolicyTitle}</h1>
            <p className="text-lg text-gray-600">{p.privacyPolicySubtitle}</p>
          </div>

          <form onSubmit={generate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.privacyPolicyShopNameLabel}</label>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="My Store"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.privacyPolicyEmailLabel}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@yourstore.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.privacyPolicyRegionLabel}</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="gdpr">GDPR (EU)</option>
                  <option value="ccpa">CCPA (US)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.privacyPolicyGenerateBtn}
            </button>
          </form>

          {text && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{p.privacyPolicyResult}</h2>
                <button onClick={copy} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors">
                  {copied ? '✓ Copied' : p.privacyPolicyCopyBtn}
                </button>
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">{text}</pre>
              <p className="text-xs text-gray-400 mt-2">Review this document with a legal professional before publishing.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.privacyPolicyCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.privacyPolicyCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.privacyPolicyUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.privacyPolicyUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
