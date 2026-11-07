import './globals.css';
import { cookies } from 'next/headers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnalyticsConsent from '../components/AnalyticsConsent';

export const metadata = {
  metadataBase: new URL('https://mygeocheck.com'),
  title: {
    default: 'Shopify GEO Check - AI Search Visibility for Shopify Products',
    template: '%s | My GEO Check',
  },
  description: 'Check if your Shopify products are visible to AI search engines like ChatGPT and Google AI Overviews. Free instant GEO analysis.',
  keywords: 'GEO, generative engine optimization, AI search visibility, Shopify SEO, ChatGPT shopping, Perplexity, Google AI Overviews, GEO check, AI search optimization',
  authors: [{ name: 'Luo Xin' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
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
  // 从 cookie 读取用户语言，让服务端就能输出正确的 <html lang>。
  // 为什么必须这么做：原来固定 lang="en"，中文用户即使站内已切中文，
  // Chrome 仍会判断"这是英文页面"并弹翻译提示。
  let serverLang = 'en';
  try {
    const raw = (typeof cookies === 'function' ? cookies().get('geo_lang') : null);
    if (raw && ['en', 'zh', 'de', 'fr', 'es', 'pt'].includes(raw.value)) serverLang = raw.value;
  } catch (e) {}

  return (
    <html lang={serverLang}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Google Analytics 不再直接加载：由 <AnalyticsConsent /> 在用户同意后注入。
            未同意 = 不加载 = 不发任何数据（GDPR/PECR 要求默认拒绝）。 */}
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <AnalyticsConsent />
        {/* Schema.org JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "My GEO Check",
              url: "https://mygeocheck.com",
              logo: "https://mygeocheck.com/logo.png",
              founder: {
                "@type": "Person",
                name: "Luo Xin",
              },
              sameAs: [
                "https://mygeocheck.com/blog",
              ],
              description: "AI-powered GEO visibility analysis tool for Shopify store owners.",
            })
          }}
        />
        {/* Schema.org JSON-LD: WebApplication */}
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
              ]
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
                    "text": "Enter your Shopify product URL, and our AI analyzes your page against 9 signal categories including structured data, content quality, AI-readability, and optimization signals. You get an instant visibility score and actionable recommendations."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is the free check really free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! The free check gives you your visibility score and top issues. For a complete analysis across all 9 signal categories and detailed fix recommendations, you can unlock the full report for $9.90."
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
