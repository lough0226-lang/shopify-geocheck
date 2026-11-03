export const metadata = {
  title: 'About — Who builds My GEO Check | My GEO Check',
  description:
    'My GEO Check is built by Luo Xin, who has worked in website SEO since 2003. One person, one product, and an email address you can write to.',
  alternates: { canonical: 'https://mygeocheck.com/about' },
  openGraph: {
    title: 'About — Who builds My GEO Check',
    description: 'One person, one product, and an email address you can write to.',
    type: 'profile',
    url: 'https://mygeocheck.com/about',
    siteName: 'My GEO Check',
  },
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-600">About</p>
        <h1 className="mb-6 text-3xl font-bold leading-tight text-primary-700 md:text-4xl">
          One person, one product
        </h1>

        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* 照片：把 /founder.jpg 放到 public/ 下，然后把下面这个 div 换成
              <img src="/founder.jpg" alt="Luo Xin" className="h-28 w-28 rounded-full object-cover" />
              在上线前先用占位块，避免出现破图。 */}
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl font-semibold text-gray-400"
            aria-label="Portrait placeholder"
          >
            LX
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Luo Xin · 罗鑫</p>
            <p className="mt-1 text-sm text-gray-600">
              Founder and sole developer, My GEO Check
            </p>
            <p className="mt-3 text-[15px] leading-7 text-gray-700">
              I have worked on website SEO since 2003 — more than twenty years of watching search
              engines change how they decide which pages deserve attention. This is the first time the
              rules have changed this fast.
            </p>
          </div>
        </div>

        <h2 className="mb-3 mt-12 text-2xl font-bold text-primary-700">Why this exists</h2>
        <p className="mb-4 text-[15px] leading-7 text-gray-700">
          Store owners kept asking me the same question: &quot;Google says my SEO is fine, so why is
          ChatGPT recommending my competitor?&quot;
        </p>
        <p className="mb-4 text-[15px] leading-7 text-gray-700">
          The honest answer is that those are two different problems. Search rewards the best page for
          a query. An assistant has to be able to read your product, understand it as a specific thing,
          and be confident enough to name it. A page can rank well and still be unquotable.
        </p>
        <p className="mb-4 text-[15px] leading-7 text-gray-700">
          I could not find a tool that answered &quot;can an assistant actually use my product
          page?&quot; in a way a store owner could act on, so I built one.
        </p>

        <h2 className="mb-3 mt-12 text-2xl font-bold text-primary-700">What it does, and what it doesn&apos;t</h2>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-5">
            <p className="mb-2 text-sm font-semibold text-gray-900">What it does</p>
            <ul className="space-y-1.5 text-sm leading-6 text-gray-700">
              <li>· Reads your product page the way an AI system would</li>
              <li>· Tests seven kinds of buyer questions</li>
              <li>· Names the three issues costing you the most</li>
              <li>· Pairs each issue with a fix you can ship</li>
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 p-5">
            <p className="mb-2 text-sm font-semibold text-gray-900">What it doesn&apos;t do</p>
            <ul className="space-y-1.5 text-sm leading-6 text-gray-700">
              <li>· Guarantee a ranking or a citation — nobody can</li>
              <li>· Touch your store. Read-only, no app install</li>
              <li>· Sell &quot;AI visibility&quot; through fake reviews or content networks</li>
              <li>· Pretend a score is a measurement of today&apos;s ChatGPT answer</li>
            </ul>
          </div>
        </div>
        <p className="mb-4 text-[15px] leading-7 text-gray-700">
          The scoring method is documented in full on the{' '}
          <a className="text-primary-700 underline" href="/methodology">
            methodology page
          </a>
          , including the parts it gets wrong.
        </p>

        <h2 className="mb-3 mt-12 text-2xl font-bold text-primary-700">How I work</h2>
        <p className="mb-4 text-[15px] leading-7 text-gray-700">
          No sales calls, no account managers, no chatbot pretending to be a person. You email me and I
          answer — usually within one business day. If something is broken, I would rather refund you
          than argue about it.
        </p>

        <h2 className="mb-3 mt-12 text-2xl font-bold text-primary-700">Company details</h2>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
          <p>
            <strong>My GEO Check</strong> is operated by Armitage Labs.
          </p>
          <p>Yuci District, Jinzhong City, Shanxi Province, China</p>
          <p>
            Email:{' '}
            <a className="text-primary-700 underline" href="mailto:hello@mygeocheck.com">
              hello@mygeocheck.com
            </a>
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <a
            className="inline-block rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
            href="/check"
          >
            Get my free score
          </a>
          <a className="text-sm text-primary-700 underline" href="/methodology">
            Read the methodology
          </a>
        </div>
      </div>
    </main>
  );
}
