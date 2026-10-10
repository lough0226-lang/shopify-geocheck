import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your full GEO report is ready. 
            Check your email for the report link, or click below to view it now.
          </p>

          <div className="space-y-4">
            <Link href="/check" className="btn-primary w-full inline-block text-center">
              Analyze Another Product
            </Link>
            <Link href="/" className="btn-outline w-full inline-block text-center">
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              If you don&apos;t see your report, please contact us at <a href="mailto:hello@mygeocheck.com" style={{color:'#6366f1'}}>hello@mygeocheck.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
