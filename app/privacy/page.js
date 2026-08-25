export const metadata = {
  title: 'Privacy Policy - My GEO Check',
  description: 'Privacy policy for My GEO Check. Learn how we collect, use, and protect your personal information.',
  robots: 'noindex, follow',
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '80vh', background: '#f9fafb' }}>
      <div style={{ background: '#1e3a5f', padding: '40px 16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: 0 }}>Privacy Policy</h1>
        <p style={{ color: '#8bb5db', marginTop: 8, fontSize: 14 }}>Last updated: August 25, 2026</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '32px' }}>
          <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
            <p>At My GEO Check (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share information when you use our website and services at mygeocheck.com.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>1. Information We Collect</h2>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginTop: 20, marginBottom: 8 }}>1.1 Information You Provide</h3>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li><strong>Email address</strong> — when you subscribe to our newsletter or request a report</li>
              <li><strong>URLs you submit</strong> — product page URLs you enter for GEO analysis</li>
              <li><strong>Payment information</strong> — processed securely by our payment provider (Creem.io); we do not store credit card details</li>
            </ul>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginTop: 20, marginBottom: 8 }}>1.2 Information Collected Automatically</h3>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li><strong>Usage data</strong> — pages visited, features used, time spent on the site</li>
              <li><strong>Device information</strong> — browser type, operating system, screen resolution</li>
              <li><strong>Cookies and analytics</strong> — we use Google Analytics to understand how visitors interact with our site</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>2. How We Use Your Information</h2>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li>Provide GEO visibility analysis and reports</li>
              <li>Send welcome emails and newsletter subscriptions</li>
              <li>Process payments and deliver purchased reports</li>
              <li>Improve our services and user experience</li>
              <li>Communicate important updates about our service</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>3. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li><strong>Creem.io</strong> — payment processing (they handle your payment data)</li>
              <li><strong>Brevo (formerly Sendinblue)</strong> — email delivery for newsletters and reports</li>
              <li><strong>Google Analytics</strong> — website analytics and traffic data</li>
              <li><strong>Vercel</strong> — website hosting and deployment</li>
              <li><strong>OpenAI / Alibaba Cloud</strong> — AI analysis processing (your URLs are sent for analysis)</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>4. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your data only in these cases:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li>With service providers listed above, strictly for providing our services</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Unsubscribe from emails at any time</li>
              <li>Opt out of analytics tracking</li>
            </ul>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>7. Children&apos;s Privacy</h2>
            <p>Our service is not directed to children under 16. We do not knowingly collect personal data from children.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of the service after changes constitutes acceptance of the revised policy.</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginTop: 32, marginBottom: 12 }}>9. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or your data, contact us at:</p>
            <p style={{ marginBottom: 0 }}>
              <strong>Email:</strong> <a href="mailto:hello@mygeocheck.com" style={{ color: '#6366f1' }}>hello@mygeocheck.com</a><br />
              <strong>Website:</strong> <a href="https://mygeocheck.com" style={{ color: '#6366f1' }}>mygeocheck.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
