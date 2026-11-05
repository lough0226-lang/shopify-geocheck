'use client';

// 复测按钮：用同一次扫描的商品列表重跑规则层，显示前后分数差。
// 单独拆成客户端组件，是因为报告页是服务端渲染，只有这块需要交互。
import { useState } from 'react';

export default function RecheckButton({ scanId }) {
  const [state, setState] = useState({ running: false, data: null, error: '' });

  async function run() {
    if (state.running) return;
    setState({ running: true, data: null, error: '' });
    try {
      const r = await fetch('/api/store-scan/recheck', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scan_id: scanId }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.success) setState({ running: false, data: null, error: j?.error || 'Re-check failed' });
      else setState({ running: false, data: j, error: '' });
    } catch {
      setState({ running: false, data: null, error: 'Network error' });
    }
  }

  const d = state.data;

  return (
    <div className="rounded-2xl border border-gray-200 p-5 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Re-check</h2>
          <p className="text-xs text-gray-500 mt-1">
            Re-runs the same {d?.compared ?? ''} products from this scan and compares scores. Catalog changes are ignored so the delta only reflects page edits.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={state.running}
          className="rounded-lg border border-primary-700 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-60"
        >
          {state.running ? 'Re-checking…' : 'Re-check now'}
        </button>
      </div>

      {state.error && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{state.error}</p>
      )}

      {d && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{d.store.before}</span>
            <span className="text-gray-400">→</span>
            <span className="text-2xl font-bold text-gray-900">{d.store.after}</span>
            <span
              className={`text-sm font-semibold ${d.store.delta > 0 ? 'text-emerald-600' : d.store.delta < 0 ? 'text-red-600' : 'text-gray-500'}`}
            >
              {d.store.delta > 0 ? '+' : ''}{d.store.delta}
            </span>
            <span className="text-xs text-gray-500">
              {d.compared} products compared{d.gone ? `, ${d.gone} no longer in the catalog` : ''}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">Improved {d.counts.improved}</span>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">Regressed {d.counts.regressed}</span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">Unchanged {d.counts.unchanged}</span>
          </div>

          {d.regressed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Got worse</p>
              <ul className="space-y-1">
                {d.regressed.slice(0, 5).map((r) => (
                  <li key={r.handle} className="flex justify-between gap-2 text-xs text-gray-600">
                    <span className="truncate">{r.title}</span>
                    <span className="shrink-0 font-semibold text-red-600">{r.delta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {d.improved.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Improved</p>
              <ul className="space-y-1">
                {d.improved.slice(0, 5).map((r) => (
                  <li key={r.handle} className="flex justify-between gap-2 text-xs text-gray-600">
                    <span className="truncate">{r.title}</span>
                    <span className="shrink-0 font-semibold text-emerald-600">+{r.delta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
