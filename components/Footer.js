import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-800 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* 品牌 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-accent-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                G
              </div>
              <span className="font-bold text-lg">
                GEO<span className="text-accent-400">Check</span>
              </span>
            </div>
            <p className="text-primary-300 text-sm max-w-sm mb-4">
              Help Shopify merchants optimize their product pages for AI-powered search engines. 
              Get found by ChatGPT, Perplexity, Google AI Overviews, and more.
            </p>
          </div>

          {/* 链接 */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-300">
              <Link href="/check" className="hover:text-white transition-colors">Free Analysis</Link>
              <a href="/#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="/#faq" className="hover:text-white transition-colors">FAQ</a>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <a href="/feed.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                RSS
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z"/>
                </svg>
              </a>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Support</h4>
            <nav className="flex flex-col gap-2 text-sm text-primary-300">
              <a href="mailto:hello@mygeocheck.com" className="hover:text-white transition-colors">
                Contact Us
              </a>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-primary-600 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-400 text-sm">
            © {new Date().getFullYear()} My GEO Check. All rights reserved.
          </p>
          <p className="text-primary-400 text-xs">
            Built for Shopify merchants who want to win in AI search.
          </p>
        </div>
      </div>
    </footer>
  );
}
