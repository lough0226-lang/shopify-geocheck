export const metadata = {
  title: 'Methodology — How the AI Visibility Score is calculated | My GEO Check',
  description:
    'Exactly what we read, how we score it, the seven buyer questions we test, and where the analysis is wrong. No black box.',
  alternates: { canonical: 'https://mygeocheck.com/methodology' },
  openGraph: {
    title: 'Methodology — How the AI Visibility Score is calculated',
    description:
      'What we read, how we score it, the seven buyer questions we test, and the limits of the analysis.',
    type: 'article',
    url: 'https://mygeocheck.com/methodology',
    siteName: 'My GEO Check',
  },
};

const SECTIONS = [
  { id: 'what', label: 'What the score is' },
  { id: 'inputs', label: 'What we read' },
  { id: 'signals', label: 'What we diagnose' },
  { id: 'questions', label: 'The seven questions' },
  { id: 'scoring', label: 'How scoring works' },
  { id: 'limits', label: 'What it cannot see' },
];

function H2({ id, children }) {
  return (
    <h2 id={id} className="mt-14 mb-4 text-2xl font-bold text-primary-700 scroll-mt-24">
      {children}
    </h2>
  );
}

function P({ children }) {
  return <p className="mb-4 text-[15px] leading-7 text-gray-700">{children}</p>;
}

export default function MethodologyPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-600">Methodology</p>
        <h1 className="mb-5 text-3xl font-bold leading-tight text-primary-700 md:text-4xl">
          How the AI Visibility Score is calculated
        </h1>
        <p className="mb-8 text-lg leading-8 text-gray-600">
          What we read, how we score it, the seven buyer questions we test, and where the analysis is
          wrong. If a number on your report cannot be traced back to this page, treat it as a bug and{' '}
          <a className="text-primary-700 underline" href="mailto:hello@mygeocheck.com">
            email us
          </a>
          .
        </p>

        <nav className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">On this page</p>
          <ul className="grid gap-1.5 text-sm text-primary-700 sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a className="hover:underline" href={`#${s.id}`}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <H2 id="what">What the score is — and is not</H2>
        <P>
          The AI Visibility Score is a <strong>diagnostic, not a prediction</strong>. It answers one
          question: if an AI assistant tried to understand and recommend this product page today, how
          much usable material would it find?
        </P>
        <P>
          It does not answer whether ChatGPT will recommend you next Tuesday. That depends on the
          shopper&apos;s exact wording, the assistant&apos;s retrieval, the competitive set, and factors
          outside your page entirely. Anyone selling you that answer is guessing.
        </P>

        <H2 id="inputs">What we read</H2>
        <P>
          We fetch the product URL once and extract twelve fields. That is the entire input — if a signal
          is not in this list, it did not influence your score.
        </P>
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Field</th>
                <th className="px-4 py-3">What we look for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['1', 'Product URL', 'Whether it resolves to a single product page'],
                ['2', 'Title', 'Whether it names the product rather than a slogan'],
                ['3', 'Meta description', 'Whether a clear summary exists and its length'],
                ['4', 'OG title', 'Social/assistant preview text'],
                ['5', 'OG description', 'Same, longer form'],
                ['6', 'Page copy', 'Whether facts are stated plainly or buried in marketing language'],
                ['7', 'Price', 'Presence and consistency with the page'],
                ['8', 'Image alt texts', 'Whether images are describable'],
                ['9', 'Schema.org markup', 'Whether Product/Offer structured data is present'],
                ['10', 'Store locator', 'Signals for "where can I buy" questions'],
                ['11', 'Certifications', 'Verifiable claims that justify trust and price'],
                ['12', 'Canonical URL', 'Whether the page declares itself canonical'],
              ].map(([n, f, why]) => (
                <tr key={n} className="align-top">
                  <td className="px-4 py-3 text-gray-400">{n}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{f}</td>
                  <td className="px-4 py-3 text-gray-600">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <H2 id="signals">What we diagnose</H2>
        <P>
          The report names the <strong>three issues costing you the most</strong>, sorted by severity.
          Three, not twenty-two — we would rather give you three real problems than pad a list. Each
          issue is drawn from nine categories:
        </P>
        <ul className="mb-6 grid gap-2 sm:grid-cols-2">
          {[
            'Description quality',
            'Structured data (schema)',
            'Content depth',
            'Image alt text',
            'Product title',
            'Meta tags',
            'Price and availability',
            'Brand authority',
            'Technical SEO',
          ].map((c) => (
            <li key={c} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
              {c}
            </li>
          ))}
        </ul>
        <P>
          Every issue is paired with a fix, ranked 1–3 by priority, and includes a JSON-LD snippet when
          the fix is about structured data.
        </P>

        <H2 id="questions">The seven buyer questions</H2>
        <P>
          We generate seven questions a real shopper would type into an assistant for this specific
          product, then grade how well the page can answer each one. The seven types are fixed:
        </P>
        <ol className="mb-6 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-gray-700">
          <li>
            <strong>Use case</strong> — &quot;best [category] for [specific situation or constraint]&quot;
          </li>
          <li>
            <strong>Product fit</strong> — &quot;will [feature] work for [my constraint]&quot;
          </li>
          <li>
            <strong>Comparison</strong> — &quot;what makes this different from typical [category]&quot;
          </li>
          <li>
            <strong>Gift / occasion</strong> — &quot;good [category] for [person or occasion]&quot;
          </li>
          <li>
            <strong>Alternatives</strong> — &quot;something like this but [cheaper / simpler / local]&quot;
          </li>
          <li>
            <strong>Trust and proof</strong> — &quot;is [brand] worth it / what do buyers say&quot;
          </li>
          <li>
            <strong>Price and value</strong> — &quot;is this worth [price]&quot;
          </li>
        </ol>
        <P>
          Each question is graded <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">fail</code>,{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">low</code>,{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">medium</code> or{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">high</code>. The report also shows a
          separate <strong>question coverage</strong> figure: the share of those seven that reached medium
          or high. The overall score is not that number — they measure different things.
        </P>

        <H2 id="scoring">How scoring works</H2>
        <P>
          The score is a 0–100 judgement over the twelve fields, weighted toward whether an assistant
          could extract and trust facts. Most Shopify product pages land between 25 and 65.
        </P>
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3">What it means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 font-medium">0–39</td>
                <td className="px-4 py-3">Unlikely to be recommended</td>
                <td className="px-4 py-3 text-gray-600">An assistant has little usable material</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">40–65</td>
                <td className="px-4 py-3">Might be recommended</td>
                <td className="px-4 py-3 text-gray-600">Some facts are extractable, key gaps remain</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">66–100</td>
                <td className="px-4 py-3">Likely to be recommended</td>
                <td className="px-4 py-3 text-gray-600">Quotable, consistent, verifiable</td>
              </tr>
            </tbody>
          </table>
        </div>
        <P>
          The <strong>percentile</strong> shown next to your score is derived from the score itself, using
          the same band mapping for every report. It compares you against other pages we have scored, not
          against your industry.
        </P>

        <H2 id="limits">What it cannot see</H2>
        <P>Being explicit about this is the point of a methodology page, so here it is:</P>
        <ul className="mb-6 space-y-2.5 text-[15px] leading-7 text-gray-700">
          <li>
            <strong>No live assistant query.</strong> We score your page&apos;s readiness. We do not open a
            ChatGPT session and read the answer — retrieval changes daily and per user.
          </li>
          <li>
            <strong>No Shopify admin access.</strong> We only read the public page. Internal fields,
            unpublished metafields and catalog settings are invisible to us.
          </li>
          <li>
            <strong>No full competitive set.</strong> We benchmark a small number of named competitors, not
            the entire category.
          </li>
          <li>
            <strong>Score variance.</strong> The judgement is produced by a language model, so the same
            page can move a few points between runs. Every report shows its analysis date. Treat movement
            inside that range as noise, not improvement.
          </li>
          <li>
            <strong>We do not guarantee a ranking or a citation.</strong> Nobody can.
          </li>
        </ul>

        <H2 id="rechecks">Re-checks are comparable by design</H2>
        <P>
          When you re-scan, we reuse the <strong>same seven questions</strong> from your original report
          instead of generating new ones. New questions would make improvement impossible to measure — this
          is the one part of the pipeline we refuse to change.
        </P>

        <div className="mt-14 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <p className="mb-3 text-sm text-gray-600">
            Reviewed and updated November 2026. Found something here that does not match what you see in your
            report? That is a bug worth reporting.
          </p>
          <a
            className="inline-block rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
            href="/check"
          >
            Get my free score
          </a>
          <a className="ml-4 text-sm text-primary-700 underline" href="mailto:hello@mygeocheck.com">
            hello@mygeocheck.com
          </a>
        </div>
      </div>
    </main>
  );
}
