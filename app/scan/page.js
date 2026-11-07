'use client';

// 整店扫描页：输入店铺域名 → 规则层扫最多 200 个商品 → 汇总 + 最差清单 + 深挖入口
//
// 口径说明（重要）：这里的分是 Catalog readiness（规则层，确定性检查），
// 不是报告页的 AI Visibility Score（那个要跑 7 个买家问题的模型分析）。
// 页面上必须写清楚，否则用户会以为 65 分等于"AI 可见性 65 分"。

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '../../lib/i18n';

const COPY = {
  en: {
    h1: 'Scan your whole catalog',
    sub: 'Paste your store domain to check up to 200 products at once, or paste a single product URL to analyse just that page. No login, no card.',
    ph: 'yourstore.com or a product URL',
    btn: 'Scan my store',
    scanning: 'Reading your catalog…',
    scoreTitle: 'Catalog readiness',
    scoreNote: 'Rule-based check of nine signals. This is not the AI Visibility Score — that one runs a model analysis of the seven buyer questions.',
    needsWork: 'Needs work',
    close: 'Close',
    good: 'Good',
    issuesTitle: 'What shows up most often',
    worstTitle: 'Weakest products',
    colProduct: 'Product',
    colScore: 'Score',
    colIssues: 'Issues',
    deepTitle: 'Deep analysis',
    deepNote: 'These are the products Shopify ranks as best-selling. A deep analysis runs the seven buyer questions through a model and gives you the exact fix.',
    deepCta: 'Analyse this product',
    deepRunning: 'Analysing',
    deepStart: 'Run deep analysis',
    deepOpen: 'Open report',
    quotaLine: 'Free plan: one deep analysis per store per month. The catalogue scan is unlimited.',
    deepQuota: 'This store was already analysed this month, so you are seeing that result. Nothing is broken. To analyse more products in the same store, unlock a paid plan.',
    footer: 'Scanned {n} products in {ms} ms. Catalog data comes from your store’s public product feed.',
    err: 'We could not read that catalog. Check the domain, or the store may not be on Shopify.',
    emailPh: 'Email (optional) — applies your paid plan',
    emailHint: 'Already bought the $29 or $49 plan? Enter the same email and the scan unlocks 3 or 20 deep analyses.',
  },
  zh: {
    h1: '扫描你的整店商品',
    sub: '粘贴店铺域名，一次检查最多 200 个商品；或粘贴单个商品页链接，只分析这一个页面。不用注册，不用绑卡。',
    ph: 'yourstore.com 或商品页链接',
    btn: '扫描我的店',
    scanning: '正在读取商品目录…',
    scoreTitle: '商品页可读性',
    scoreNote: '这是九类信号的确定性检查，不是 AI Visibility Score——后者要跑 7 个买家问题的模型分析。',
    needsWork: '需要改',
    close: '接近',
    good: '良好',
    issuesTitle: '最普遍的问题',
    worstTitle: '最弱的商品',
    colProduct: '商品',
    colScore: '分数',
    colIssues: '问题',
    deepTitle: '深度分析',
    deepNote: '这些是 Shopify 判定为热销的商品。深度分析会把 7 个买家问题跑一遍模型，并给出可以直接粘贴的修复。',
    deepCta: '分析这个商品',
    deepRunning: '分析中',
    deepStart: '开始深度分析',
    deepOpen: '打开报告',
    quotaLine: '免费套餐：每个店铺每月 1 次深度分析；整店扫描不限次数。',
    deepQuota: '这家店本月已经分析过一次，你看到的就是那次的结果，网站没有问题。想分析同一家店的更多商品，需要升级套餐。',
    footer: '共扫描 {n} 个商品，耗时 {ms} 毫秒。商品数据来自店铺公开的商品目录。',
    err: '读不到这个商品目录。请检查域名，或者这家店不在 Shopify 上。',
    emailPh: '邮箱（可选）—— 用于匹配已购买的套餐',
    emailHint: '已购买 $29 或 $49 套餐？填同一个邮箱，扫描会自动解锁 3 个或 20 个深挖。',
  },
  de: {
    h1: 'Katalog scannen',
    sub: 'Bis zu 200 Produktseiten prüfen und neun Signale testen, die entscheiden, ob ein KI-Assistent Ihre Produkte beschreiben und empfehlen kann. Ohne Login, ohne Karte.',
    ph: 'dein-shop.de',
    btn: 'Shop scannen',
    scanning: 'Katalog wird gelesen…',
    scoreTitle: 'Katalog-Lesbarkeit',
    scoreNote: 'Regelbasierte Prüfung von neun Signalen. Nicht der AI Visibility Score — dafür läuft eine Modellanalyse der sieben Käuferfragen.',
    needsWork: 'Handlungsbedarf',
    close: 'Knapp',
    good: 'Gut',
    issuesTitle: 'Häufigste Probleme',
    worstTitle: 'Schwächste Produkte',
    colProduct: 'Produkt',
    colScore: 'Punkte',
    colIssues: 'Probleme',
    deepTitle: 'Tiefenanalyse',
    deepNote: 'Diese Produkte stuft Shopify als Bestseller ein. Die Tiefenanalyse prüft die sieben Käuferfragen und liefert die konkrete Korrektur.',
    deepCta: 'Produkt analysieren',
    deepRunning: 'Analyse läuft',
    deepStart: 'Tiefenanalyse starten',
    deepOpen: 'Bericht öffnen',
    deepQuota: 'Das Kontingent für Tiefenanalysen ist aufgebraucht.',
    footer: '{n} Produkte in {ms} ms geprüft. Daten aus dem öffentlichen Produktfeed des Shops.',
    err: 'Katalog nicht lesbar. Prüfen Sie die Domain — oder der Shop läuft nicht auf Shopify.',
  },
  fr: {
    h1: 'Analyser tout votre catalogue',
    sub: "Jusqu'à 200 fiches produit et neuf signaux qui décident si un assistant IA peut décrire et recommander vos produits. Sans compte, sans carte.",
    ph: 'votreboutique.fr',
    btn: 'Analyser ma boutique',
    scanning: 'Lecture du catalogue…',
    scoreTitle: 'Lisibilité du catalogue',
    scoreNote: "Contrôle par règles de neuf signaux. Ce n'est pas le score de visibilité IA — celui-ci passe les sept questions d'acheteur dans un modèle.",
    needsWork: 'À corriger',
    close: 'Limite',
    good: 'Bon',
    issuesTitle: 'Problèmes les plus fréquents',
    worstTitle: 'Produits les plus faibles',
    colProduct: 'Produit',
    colScore: 'Score',
    colIssues: 'Problèmes',
    deepTitle: 'Analyse approfondie',
    deepNote: 'Ces produits sont classés meilleures ventes par Shopify. L’analyse approfondie teste les sept questions et donne la correction exacte.',
    deepCta: 'Analyser ce produit',
    deepRunning: 'Analyse en cours',
    deepStart: 'Lancer l’analyse',
    deepOpen: 'Ouvrir le rapport',
    deepQuota: 'Le quota d’analyses approfondies est épuisé.',
    footer: '{n} produits analysés en {ms} ms. Données issues du flux produit public de la boutique.',
    err: "Catalogue illisible. Vérifiez le domaine, ou la boutique n'est pas sur Shopify.",
  },
  es: {
    h1: 'Analiza todo tu catálogo',
    sub: 'Hasta 200 fichas de producto y nueve señales que deciden si un asistente de IA puede describir y recomendar tus productos. Sin registro, sin tarjeta.',
    ph: 'tutienda.com',
    btn: 'Analizar mi tienda',
    scanning: 'Leyendo tu catálogo…',
    scoreTitle: 'Legibilidad del catálogo',
    scoreNote: 'Comprobación por reglas de nueve señales. No es la puntuación de visibilidad IA: esa pasa las siete preguntas del comprador por un modelo.',
    needsWork: 'A corregir',
    close: 'Al límite',
    good: 'Bien',
    issuesTitle: 'Problemas más frecuentes',
    worstTitle: 'Productos más débiles',
    colProduct: 'Producto',
    colScore: 'Puntos',
    colIssues: 'Problemas',
    deepTitle: 'Análisis profundo',
    deepNote: 'Estos productos son los más vendidos según Shopify. El análisis profundo prueba las siete preguntas y da la corrección exacta.',
    deepCta: 'Analizar este producto',
    deepRunning: 'Analizando',
    deepStart: 'Iniciar análisis profundo',
    deepOpen: 'Abrir informe',
    deepQuota: 'La cuota de análisis profundo está agotada.',
    footer: '{n} productos analizados en {ms} ms. Datos del feed público de la tienda.',
    err: 'No pudimos leer ese catálogo. Revisa el dominio o la tienda no está en Shopify.',
  },
  pt: {
    h1: 'Analise todo o seu catálogo',
    sub: 'Até 200 páginas de produto e nove sinais que decidem se um assistente de IA consegue descrever e recomendar seus produtos. Sem cadastro, sem cartão.',
    ph: 'sualoja.com',
    btn: 'Analisar minha loja',
    scanning: 'Lendo seu catálogo…',
    scoreTitle: 'Legibilidade do catálogo',
    scoreNote: 'Verificação por regras de nove sinais. Não é a pontuação de visibilidade em IA — essa roda as sete perguntas do comprador num modelo.',
    needsWork: 'A corrigir',
    close: 'No limite',
    good: 'Bom',
    issuesTitle: 'Problemas mais comuns',
    worstTitle: 'Produtos mais fracos',
    colProduct: 'Produto',
    colScore: 'Nota',
    colIssues: 'Problemas',
    deepTitle: 'Análise profunda',
    deepNote: 'Estes são os produtos mais vendidos segundo a Shopify. A análise profunda testa as sete perguntas e entrega a correção exata.',
    deepCta: 'Analisar este produto',
    deepRunning: 'Analisando',
    deepStart: 'Iniciar análise profunda',
    deepOpen: 'Abrir relatorio',
    deepQuota: 'A cota de análise profunda acabou.',
    footer: '{n} produtos analisados em {ms} ms. Dados do feed público da loja.',
    err: 'Não conseguimos ler esse catálogo. Verifique o domínio ou a loja não está na Shopify.',
  },
};

export default function ScanPage() {
  const lang = useLang();
  const t = COPY[lang] || COPY.en;

  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  // 深挖：逐个跑，进度由调用次数驱动（一次请求只处理一个商品，避免函数超时）
  const [deepState, setDeepState] = useState({ running: false, done: [], total: 0, current: null, error: '' });

  // 首页的输入框会带 ?q= 过来：直接开始扫，顾客不需要再点一次
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search).get('q');
    if (!q) return;
    setDomain(q);
    startScan(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(e) {
    e.preventDefault();
    if (!domain.trim() || loading) return;
    startScan(domain);
  }

  async function startScan(value) {
    // 一个输入框，两种意图，自动判断：
    //   含 /products/ → 这是单个商品页，直接深挖这一个（不必先扫全店）
    //   其余 → 当作店铺域名，扫全店
    // 对顾客只有一个入口，不需要理解"整店扫描"和"单品检测"的区别。
    const raw = (value || '').trim();
    if (!raw) return;
    if (/\/products\/[^/?#]+/i.test(raw)) {
      const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      window.location.href = `/check?url=${encodeURIComponent(url)}`;
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setDeepState({ running: false, done: [], total: 0, current: null, error: '' });
    try {
      const r = await fetch('/api/store-scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ domain: raw, email: email.trim() || null, limit: 200 }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.success) {
        setError(j?.message || t.err);
      } else {
        setResult(j);
        // 扫完直接跑第 1 个深挖，不让用户再点一次 —— 免费额度本来就有 1 次，
        // 早 5 秒看到完整诊断，比让他自己去找按钮重要。
        if (j.deep_handles && j.deep_handles.length) runDeep(j);
      }
    } catch {
      setError(t.err);
    } finally {
      setLoading(false);
    }
  }

  async function runDeep(scanArg) {
    const scan = scanArg || result;
    if (!scan || deepState.running) return;
    const handles = (scan.deep_handles || []).slice(0, scan.deep_quota);
    setDeepState({ running: true, done: [], total: handles.length, current: null, error: '' });

    const done = [];
    for (let i = 0; i < handles.length; i += 1) {
      const handle = handles[i];
      setDeepState((s) => ({ ...s, current: handle }));
      try {
        const r = await fetch('/api/store-scan/deep', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ scan_id: scan.scan_id, handle, lang }),
        });
        const j = await r.json().catch(() => null);
        if (j?.success) {
          done.push(j.result);
          setDeepState((s) => ({ ...s, done: [...done] }));
        } else {
          setDeepState((s) => ({ ...s, error: j?.error || j?.message || 'failed', current: null }));
          break;
        }
      } catch {
        setDeepState((s) => ({ ...s, error: 'network', current: null }));
        break;
      }
    }
    setDeepState((s) => ({ ...s, running: false, current: null }));
  }

  const d = result?.summary;
  const total = d ? d.distribution.needsWork + d.distribution.close + d.distribution.good : 0;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t.h1}</h1>
      <p className="text-gray-600 leading-7 mb-8">{t.sub}</p>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mb-3">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder={t.ph}
          autoComplete="off"
          spellCheck="false"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary-700 px-6 py-3 font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
        >
          {loading ? t.scanning : t.btn}
        </button>
      </form>

      {/* 邮箱可选：填了才会按已付款记录匹配 $29 / $49 的深挖额度 */}
      <div className="mb-8">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPh || COPY.en.emailPh}
          autoComplete="email"
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
        />
        <p className="mt-1.5 text-xs text-gray-500">{t.emailHint || COPY.en.emailHint}</p>
      </div>

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          {t.scanning}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {d && (
        <div className="space-y-8">
          {/* 分数 */}
          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">{t.scoreTitle}</div>
                <div className="text-5xl font-bold text-gray-900">{d.score}</div>
              </div>
              <div className="text-xs text-gray-500 max-w-md leading-6">{t.scoreNote}</div>
            </div>

            {/* 分布条 */}
            <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-gray-100">
              <div className="bg-red-500" style={{ width: pct(d.distribution.needsWork) + '%' }} />
              <div className="bg-amber-400" style={{ width: pct(d.distribution.close) + '%' }} />
              <div className="bg-emerald-500" style={{ width: pct(d.distribution.good) + '%' }} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
              <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5" />{t.needsWork} {d.distribution.needsWork}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />{t.close} {d.distribution.close}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />{t.good} {d.distribution.good}</span>
            </div>
          </div>

          {/* 最常见问题 */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.issuesTitle}</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {Object.entries(d.issue_counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([code, n]) => (
                  <li key={code} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <code className="text-gray-700">{code}</code>
                    <span className="font-semibold text-gray-900">{n}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* 最差商品 */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.worstTitle}</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2">{t.colProduct}</th>
                    <th className="px-4 py-2 w-20">{t.colScore}</th>
                    <th className="px-4 py-2">{t.colIssues}</th>
                  </tr>
                </thead>
                <tbody>
                  {d.worst.slice(0, 10).map((p) => (
                    <tr key={p.handle} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-gray-800">{p.title}</td>
                      <td className="px-4 py-2 font-semibold">{p.score}</td>
                      <td className="px-4 py-2 text-gray-500">{p.issues.map((i) => i.code).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 深挖入口 */}
          {result.deep_handles?.length > 0 && (
            <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{t.deepTitle}</h2>
              <p className="text-sm text-gray-600 leading-6 mb-4">{t.deepNote}</p>

              <p className="mb-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600">
                {t.quotaLine || 'Free plan: one deep analysis per store per month. Rules-based catalogue scan is unlimited.'}
              </p>
              <button
                type="button"
                onClick={() => runDeep()}
                disabled={deepState.running}
                className="mb-4 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
              >
                {deepState.running
                  ? `${t.deepRunning} ${deepState.done.length + 1}/${deepState.total}`
                  : `${t.deepStart} (${result.deep_quota})`}
              </button>

              {/* 进度 */}
              {(deepState.running || deepState.done.length > 0) && (
                <div className="mb-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white border border-gray-200">
                    <div
                      className="h-full bg-primary-700 transition-all"
                      style={{ width: `${deepState.total ? (deepState.done.length / deepState.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {deepState.done.length} / {deepState.total}
                    {deepState.current ? ` · ${deepState.current}` : ''}
                  </p>
                </div>
              )}

              {deepState.error && (
                <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {deepState.error === 'quota_exhausted' ? t.deepQuota : deepState.error}
                </p>
              )}

              {/* 结果 */}
              {deepState.done.length > 0 ? (
                <ul className="space-y-2">
                  {deepState.done.map((d) => (
                    <li key={d.handle} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2">
                      <span className="text-sm text-gray-800">{d.product_name || d.handle}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{d.score}</span>
                        {d.report_id ? (
                          <Link href={`/report/${d.report_id}`} className="text-sm font-semibold text-primary-700 hover:underline">
                            {t.deepOpen} →
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">{t.deepNoReport || 'report link unavailable'}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2">
                  {result.deep_handles.map((h) => (
                    <li key={h} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2">
                      <code className="text-xs text-gray-700">{h}</code>
                      <Link
                        href={`/check?url=${encodeURIComponent(`https://${result.domain}/products/${h}`)}`}
                        className="text-sm font-semibold text-primary-700 hover:underline"
                      >
                        {t.deepCta} →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500">
            {t.footer.replace('{n}', d.scanned).replace('{ms}', result.duration_ms)}
          </p>
        </div>
      )}
    </div>
  );
}
