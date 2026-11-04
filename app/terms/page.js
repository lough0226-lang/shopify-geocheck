export const metadata = {
  title: 'Terms of Service - My GEO Check',
  description: 'Terms of service for My GEO Check. Read our terms and conditions for using the GEO visibility analysis service.',
  robots: 'noindex, follow',
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '80vh', background: '#f9fafb' }}>
      <div style={{ background: '#1e3a5f', padding: '40px 16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: 0 }}>Terms of Service</h1>
        <p style={{ color: '#8bb5db', marginTop: 8, fontSize: 14 }}>Last updated: October 15, 2026</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '32px' }}>
          <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
            <p>By accessing and using My GEO Check (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>1. Service Description</h2>
            <p>My GEO Check provides AI-powered analysis of Shopify product pages for Generative Engine Optimization (GEO) purposes. Our service analyzes publicly accessible product URLs and provides visibility scores, optimization recommendations, and detailed reports.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>2. Free Analysis</h2>
            <p>The free analysis provides:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li>A visibility score based on GEO checkpoints</li>
              <li>A limited number of top issues</li>
              <li>General optimization suggestions</li>
            </ul>
            <p>The free analysis is provided &quot;as is&quot; for informational purposes.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>3. Paid Plans</h2>
            <p>Paid plans are processed through Creem.io. Both plans are priced per Shopify store, not per page:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li><strong>One-off report ($29.00 USD, single payment):</strong> one full-catalogue scan of up to 200 product pages, 3 products analysed in depth, competitor benchmarks and an action plan, with full access to the resulting report. No subscription, no automatic renewal.</li>
              <li><strong>Monthly subscription ($49.00 USD/month):</strong> everything in the one-off report, plus 20 products analysed in depth each month, re-checks on day 2, 7, 14 and 30 for every product analysed, and email alerts when a score changes.</li>
            </ul>
            <p>What &quot;in depth&quot; means: the full-catalogue scan applies nine deterministic signal checks to every page at no additional cost; a deep analysis runs the seven buyer questions through a language model and is what the quota above counts. Deep analyses beyond your plan&apos;s quota are available at $2.00 USD each.</p>
            <p><strong>Billing and renewal:</strong> The subscription renews automatically each month at $49.00 USD until cancelled. You can cancel at any time, self-service, in the Creem customer billing portal (via the &quot;Manage Subscription&quot; link on your payment confirmation page or in your report email). After cancelling, you keep full access until the end of the current billing period; you will not be charged again and the subscription will not renew automatically.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>4. Payment &amp; Refunds</h2>
            <p>Payments are processed through Creem.io. By making a purchase, you agree to Creem.io&apos;s terms.</p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li><strong>7-day money-back guarantee:</strong> Within 7 days of purchase, you can request a full refund by emailing hello@mygeocheck.com. This guarantee applies both to the one-off report ($29.00 USD) and to the first payment of a monthly subscription ($49.00 USD). We will refund the full amount you paid.</li>
              <li><strong>Cancellation:</strong> Subscriptions can be cancelled at any time in the Creem customer billing portal. After cancellation you can continue using the Service until the end of the current billing period, after which no further charges will be made and the subscription will not renew.</li>
              <li><strong>Technical issues:</strong> If you experience technical problems and cannot receive your report, contact us at hello@mygeocheck.com and we will help you access it or, if the problem cannot be resolved, arrange a refund under the 7-day guarantee above.</li>
              <li><strong>Disputes:</strong> If you believe there was an error in your charge, please contact us first before initiating a chargeback.</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>5. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li>Use the service to circumvent access controls, or to scrape or bulk-download it beyond normal interactive use</li>
              <li>Automate, scrape, or abuse the service through bots or scripts</li>
              <li>Attempt to circumvent payment requirements</li>
              <li>Resell or redistribute reports to third parties</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>6. Accuracy of Results</h2>
            <p>Our analysis is based on automated evaluation of publicly available data. While we strive for accuracy:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li>Results are advisory and do not guarantee specific rankings or AI citations</li>
              <li>AI search engine algorithms change frequently</li>
              <li>Results reflect the page as fetched at the time of analysis. We may reuse a cached result for up to 24 hours; every report shows its analysis timestamp and can be re-run on request</li>
              <li>The service analyzes publicly accessible content only</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>7. Intellectual Property</h2>
            <p>The Service, including its design, code, and analysis methodology, is owned and operated by My GEO Check. You retain ownership of any content on your own product pages. We do not claim ownership of the URLs or content you analyze.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, My GEO Check shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities arising from the use of the Service.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>9. Service Availability</h2>
            <p>We aim for high availability but do not guarantee uninterrupted access. We may temporarily suspend service for maintenance, updates, or security reasons.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>10. Modifications</h2>
            <p>We reserve the right to modify these Terms at any time. Changes take effect immediately upon posting. Your continued use of the Service constitutes acceptance of modified Terms.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>11. Governing Law</h2>
            <p>These Terms are governed by the laws of the jurisdiction in which the Service operator is based, without regard to conflict of laws principles.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>12. Contact</h2>
            <p style={{ marginBottom: 0 }}>
              For questions about these Terms, contact us at:<br />
              <strong>Email:</strong> <a href="mailto:hello@mygeocheck.com" style={{ color: '#6366f1' }}>hello@mygeocheck.com</a><br />
              <strong>Website:</strong> <a href="https://mygeocheck.com" style={{ color: '#6366f1' }}>mygeocheck.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
