import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Shopify GEO Check - AI Search Visibility Analyzer | Free GEO Audit',
  description: 'Check if your Shopify products are visible to AI search engines like ChatGPT, Perplexity, and Google AI Overviews. Free instant analysis with actionable GEO optimization tips.',
  keywords: 'GEO, generative engine optimization, AI search visibility, Shopify SEO, ChatGPT shopping, Perplexity, Google AI Overviews, GEO check, AI search optimization',
  authors: [{ name: 'My GEO Check' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Shopify GEO Check - AI Search Visibility Analyzer',
    description: 'Check if your Shopify products are visible to AI search engines. Free instant analysis for Shopify store owners.',
    type: 'website',
    url: 'https://mygeocheck.com',
    siteName: 'My GEO Check',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shopify GEO Check - AI Search Visibility Analyzer',
    description: 'Check if your Shopify products are visible to AI search engines. Free instant analysis.',
  },
  alternates: {
    canonical: 'https://mygeocheck.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-30ZHNHCX4Q"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-30ZHNHCX4Q');
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "My GEO Check",
              "url": "https://mygeocheck.com",
              "description": "AI-powered GEO visibility analysis tool for Shopify store owners. Check how your products appear in AI search engines like ChatGPT, Perplexity, and Google AI Overviews.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free instant GEO visibility check"
              },
              "featureList": [
                "AI search visibility scoring",
                "GEO optimization recommendations",
                "Multi-platform analysis (ChatGPT, Perplexity, Google AI Overviews)",
                "Detailed PDF reports",
                "Actionable SEO insights"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "156"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is GEO (Generative Engine Optimization)?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "GEO is the practice of optimizing your website and content so that AI search engines like ChatGPT, Perplexity, and Google AI Overviews can find, understand, and recommend your products to users."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does My GEO Check work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Enter your Shopify product URL, and our AI analyzes your page against 22+ GEO checkpoints including structured data, content quality, AI-readability, and optimization signals. You get an instant visibility score and actionable recommendations."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is the free check really free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! The free check gives you your visibility score and top issues. For a complete analysis with all 22+ checks and detailed fix recommendations, you can unlock the full report for $9.90."
                  }
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
