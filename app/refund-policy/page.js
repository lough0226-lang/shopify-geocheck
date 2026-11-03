export const metadata = {
  title: 'Refund Policy | My GEO Check',
  description:
    '7-day money-back guarantee on every paid report. How to request a refund, how long it takes, and the statutory rights we do not touch.',
  alternates: { canonical: 'https://mygeocheck.com/refund-policy' },
  openGraph: {
    title: 'Refund Policy | My GEO Check',
    description: '7-day money-back guarantee on every paid report.',
    type: 'article',
    url: 'https://mygeocheck.com/refund-policy',
    siteName: 'My GEO Check',
  },
};

export default function RefundPolicyPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold text-primary-700 md:text-4xl">Refund Policy</h1>
        <p className="mb-8 text-sm text-gray-500">Last updated: 3 November 2026</p>

        <div className="mb-10 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-[15px] font-medium leading-7 text-emerald-900">
            If a paid report is not useful to you, email{' '}
            <a className="underline" href="mailto:hello@mygeocheck.com">
              hello@mygeocheck.com
            </a>{' '}
            within 7 days of purchase and we refund it in full. No form, no questions, no reason
            required.
          </p>
        </div>

        <h2 className="mb-3 mt-10 text-xl font-bold text-primary-700">What this covers</h2>
        <ul className="mb-6 space-y-1.5 text-[15px] leading-7 text-gray-700">
          <li>· The $19 one-time report</li>
          <li>· The first $29 monthly subscription payment</li>
          <li>· Additional reports billed inside the first 7 days of a subscription</li>
        </ul>

        <h2 className="mb-3 mt-10 text-xl font-bold text-primary-700">How to request one</h2>
        <p className="mb-4 text-[15px] leading-7 text-gray-700">
          Email{' '}
          <a className="text-primary-700 underline" href="mailto:hello@mygeocheck.com">
            hello@mygeocheck.com
          </a>{' '}
          from the address you paid with, and include either the report link or the email used at
          checkout.
        </p>

        <h2 className="mb-3 mt-10 text-xl font-bold text-primary-700">What happens next</h2>
        <p className="mb-4 text-[15px] leading-7 text-gray-700">
          We process refunds within 2 business days of your email. Depending on your bank or card
          issuer, the money typically appears in 5–10 business days. Refunds go back to the original
          payment method via Creem, our merchant of record.
        </p>

        <h2 className="mb-3 mt-10 text-xl font-bold text-primary-700">What we do not refund</h2>
        <ul className="mb-6 space-y-1.5 text-[15px] leading-7 text-gray-700">
          <li>· A second refund request for the same product URL after one has already been refunded</li>
          <li>
            · Subscription reports after the first 7 days — you can still cancel any time and keep
            access until the end of the paid month
          </li>
          <li>· Chargebacks filed without contacting us first</li>
        </ul>

        <h2 className="mb-3 mt-10 text-xl font-bold text-primary-700">Your statutory rights</h2>
        <p className="mb-4 text-[15px] leading-7 text-gray-700">
          Nothing here limits rights you already have under consumer law in your jurisdiction,
          including the EU/UK 14-day right of withdrawal for distance sales where it applies. If the law
          gives you more than this policy, the law wins.
        </p>

        <h2 className="mb-3 mt-10 text-xl font-bold text-primary-700">Contact</h2>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
          <p>My GEO Check is operated by Luo Xin (罗鑫), an independent business based in China.</p>
          <p>Yuci District, Jinzhong City, Shanxi Province, China</p>
          <p>
            <a className="text-primary-700 underline" href="mailto:hello@mygeocheck.com">
              hello@mygeocheck.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
