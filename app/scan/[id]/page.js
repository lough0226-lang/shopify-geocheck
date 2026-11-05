// app/scan/[id]/page.js
// 店铺扫描汇总报告：可分享的链接，展示店级分数、问题分布、最差商品与深挖结果。
//
// 服务端渲染，直接从 store_scans 读，不经过 API —— 报告页不需要交互也不该被爬虫误抓。
// 口径与 /scan 一致：分数是 Catalog readiness（规则层），不是 AI Visibility Score。
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStoreScan, initDatabase } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Store scan report | My GEO Check',
  robots: { index: false, follow: false },
};

const ISSUE_LABELS = {
  title_short: 'Title too short',
  title_long: 'Title will be truncated',
  desc_thin: 'Description too thin',
  desc_bloat: 'Description buries the facts',
  no_image: 'No product images',
  img_alt_missing: 'Images without alt text',
  price_missing: 'No price on any variant',
  price_zero: 'Variant priced at 0',
  price_spread: 'Variant prices span too wide',
  out_of_stock: 'All variants unavailable',
  no_product_type: 'product_type is empty',
  few_tags: 'Too few tags',
  no_specs: 'No size / material details',
};

export default async function ScanReportPage({ params }) {
  const id = params?.id;
  if (!id) notFound();

  try { await initDatabase(); } catch { /* ignore */ }

  let row = null;
  try { row = await getStoreScan(id); } catch { /* ignore */ }
  if (!row) notFound();

  const summary = row.summary || {};
  const dist = summary.distribution || { critical: 0, weak: 0, ok: 0 };
  const total = dist.critical + dist.weak + dist.ok || 1;
  const pct = (n) => Math.round((n / total) * 100);
  const issueCounts = summary.issue_counts || {};
  const worst = Array.isArray(summary.worst) ? summary.worst : [];
  const deep = Array.isArray(row.deep_results) ? row.deep_results : [];
  const created = row.created_at ? new Date(row.created_at) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Catalog readiness report</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{row.store_domain}</h1>
      <p className="text-sm text-gray-500 mb-8">
        {created ? created.toISOString().slice(0, 16).replace('T', ' ') + ' UTC · ' : ''}
        {row.products_scanned} products scanned
        {row.best_selling_ranked ? ' · ranked by Shopify best-selling' : ' · catalog order (best-selling unavailable)'}
      </p>

      {/* 分数 */}
      <div className="rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Catalog readiness</div>
            <div className="text-5xl font-bold text-gray-900">{row.catalog_score ?? summary.score ?? '—'}</div>
          </div>
          <p className="text-xs text-gray-500 max-w-md leading-6">
            Rule-based check of nine signals, run on your public product feed. This is not the AI Visibility
            Score — that one runs a model analysis of the seven buyer questions.
          </p>
        </div>

        <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-gray-100">
          <div className="bg-red-500" style={{ width: pct(dist.critical) + '%' }} />
          <div className="bg-amber-400" style={{ width: pct(dist.weak) + '%' }} />
          <div className="bg-emerald-500" style={{ width: pct(dist.ok) + '%' }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
          <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5" />Needs work {dist.critical}</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />Close {dist.weak}</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />Good {dist.ok}</span>
        </div>
      </div>

      {/* 最常见问题 */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">What shows up most often</h2>
      <ul className="grid sm:grid-cols-2 gap-2 mb-8">
        {Object.entries(issueCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([code, n]) => (
            <li key={code} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <span className="text-gray-700">{ISSUE_LABELS[code] || code}</span>
              <span className="font-semibold text-gray-900">{n}</span>
            </li>
          ))}
      </ul>

      {/* 深挖结果 */}
      {deep.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Deep analysis</h2>
          <ul className="space-y-2 mb-8">
            {deep.map((d) => (
              <li key={d.handle} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <span className="text-sm text-gray-800">{d.product_name || d.handle}</span>
                <span className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{d.score}</span>
                  <Link href={`/report/${d.report_id}`} className="text-sm font-semibold text-primary-700 hover:underline">
                    Open report →
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 最差商品 */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">Weakest products</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 mb-10">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2 w-20">Score</th>
              <th className="px-4 py-2">Issues</th>
            </tr>
          </thead>
          <tbody>
            {worst.slice(0, 20).map((p) => (
              <tr key={p.handle} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-800">{p.title}</td>
                <td className="px-4 py-2 font-semibold">{p.score}</td>
                <td className="px-4 py-2 text-gray-500">{(p.issues || []).map((i) => i.code).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/scan" className="rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">
          Scan another store
        </Link>
        <Link href="/check" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          Run a single-product check
        </Link>
      </div>
    </div>
  );
}
