'use client';

import Link from 'next/link';
import { useLang } from '../lib/i18n';

// 2026-11-04 定价改版：$19 一次性 + $29/月 → $29 一次性 + $49/月
//
// 为什么文案写在本文件里而不走 PAGE_CONTENT：
// 旧的 pricing* 键在六种语言里各有一套、且互相不同步（有的语言还写着 $19 和"5 份/月"）。
// 价格是最不能出现不一致的内容，所以这里用一份内嵌表，六种语言逐条对齐。
//
// 关键设计：所有档位都是"整店"口径，没有"每页 X 元"。
// 因为按页计费会让用户在第一屏就算出 200 × 价格，直接放弃（见 docs/04）。

const COPY = {
  en: {
    barFree: 'Free scan',
    barOneTime: '$29 one-off report',
    barSub: '$49/month with re-checks',
    freeTitle: 'Free scan',
    freeSubtitle: 'See where your store stands.',
    freePrice: '$0',
    freePer: '',
    freeFeatures: ['Full-catalog scan (up to 200 products)', '1 product analysed in depth', '1 complete fix you can ship'],
    freeCta: 'Run free scan',
    oneTitle: 'One-off report',
    oneSubtitle: 'Check once, fix the worst three.',
    onePrice: '$29',
    onePer: 'one payment',
    oneFeatures: ['Full-catalog scan (up to 200 products)', '3 products analysed in depth', 'All 7 buyer-question fixes', 'Competitor benchmarks with links', 'No auto-renewal'],
    oneCta: 'Get the report — $29',
    subTitle: 'Monitoring',
    subSubtitle: 'Keep it current as you fix things.',
    subPrice: '$49',
    subPer: '/ month',
    subFeatures: ['Everything in the one-off report', '20 products analysed in depth each month', 'Re-checks on day 2, 7, 14 and 30', 'Email alert when a score changes', 'Cancel any time'],
    subCta: 'Start monthly — $49',
    popular: 'MOST POPULAR',
    guarantee: 'Secure payment via Creem · Card, Apple Pay, Google Pay · 7-day money-back guarantee · Cancel in the Creem portal',
  },
  zh: {
    barFree: '免费扫描',
    barOneTime: '$29 单次报告',
    barSub: '$49/月 含自动复检',
    freeTitle: '免费扫描',
    freeSubtitle: '先看看你的店现在什么水平。',
    freePrice: '$0',
    freePer: '',
    freeFeatures: ['全店扫描（最多 200 个商品）', '1 个商品深度分析', '1 条可直接落地的完整修复'],
    freeCta: '开始免费扫描',
    oneTitle: '单次报告',
    oneSubtitle: '查一次，先修最严重的三个。',
    onePrice: '$29',
    onePer: '一次付费',
    oneFeatures: ['全店扫描（最多 200 个商品）', '3 个商品深度分析', '全部 7 类买家问题的修复', '竞品对比（含链接）', '不自动续费'],
    oneCta: '获取报告 — $29',
    subTitle: '持续监控',
    subSubtitle: '边修边看，分数有没有真的动。',
    subPrice: '$49',
    subPer: '/ 月',
    subFeatures: ['包含单次报告的全部内容', '每月 20 个商品深度分析', '第 2/7/14/30 天自动复检', '分数变化邮件提醒', '随时可取消'],
    subCta: '按月订阅 — $49',
    popular: '最多人选择',
    guarantee: '通过 Creem 安全支付 · 银行卡、Apple Pay、Google Pay · 7 天无理由退款 · 可在 Creem 门户取消',
  },
  de: {
    barFree: 'Kostenloser Scan',
    barOneTime: '$29 Einmalbericht',
    barSub: '$49/Monat mit Nachprüfungen',
    freeTitle: 'Kostenloser Scan',
    freeSubtitle: 'Sehen Sie, wo Ihr Shop steht.',
    freePrice: '$0',
    freePer: '',
    freeFeatures: ['Katalog-Scan (bis zu 200 Produkte)', '1 Produkt ausführlich analysiert', '1 vollständige Korrektur zum Umsetzen'],
    freeCta: 'Kostenlos starten',
    oneTitle: 'Einmalbericht',
    oneSubtitle: 'Einmal prüfen, die drei schlimmsten Fälle beheben.',
    onePrice: '$29',
    onePer: 'einmalig',
    oneFeatures: ['Katalog-Scan (bis zu 200 Produkte)', '3 Produkte ausführlich analysiert', 'Alle 7 Käuferfrage-Korrekturen', 'Wettbewerbsvergleich mit Links', 'Keine automatische Verlängerung'],
    oneCta: 'Bericht holen — $29',
    subTitle: 'Monitoring',
    subSubtitle: 'Aktuell halten, während Sie korrigieren.',
    subPrice: '$49',
    subPer: '/ Monat',
    subFeatures: ['Alles aus dem Einmalbericht', '20 Produkte pro Monat ausführlich analysiert', 'Nachprüfungen an Tag 2, 7, 14 und 30', 'E-Mail bei Score-Änderung', 'Jederzeit kündbar'],
    subCta: 'Monatlich starten — $49',
    popular: 'BELIEBTESTE',
    guarantee: 'Sichere Zahlung über Creem · Karte, Apple Pay, Google Pay · 7-Tage-Geld-zurück-Garantie · Kündbar im Creem-Portal',
  },
  fr: {
    barFree: 'Analyse gratuite',
    barOneTime: 'Rapport unique 29 $',
    barSub: '49 $/mois avec re-vérifications',
    freeTitle: 'Analyse gratuite',
    freeSubtitle: 'Voyez où en est votre boutique.',
    freePrice: '$0',
    freePer: '',
    freeFeatures: ['Analyse du catalogue (jusqu\'à 200 produits)', '1 produit analysé en détail', '1 correction complète à appliquer'],
    freeCta: 'Lancer l\'analyse',
    oneTitle: 'Rapport unique',
    oneSubtitle: 'Vérifier une fois, corriger les trois pires.',
    onePrice: '$29',
    onePer: 'paiement unique',
    oneFeatures: ['Analyse du catalogue (jusqu\'à 200 produits)', '3 produits analysés en détail', 'Les 7 corrections par question d\'acheteur', 'Comparaison concurrentielle avec liens', 'Aucun renouvellement automatique'],
    oneCta: 'Obtenir le rapport — 29 $',
    subTitle: 'Suivi',
    subSubtitle: 'Rester à jour pendant que vous corrigez.',
    subPrice: '$49',
    subPer: '/ mois',
    subFeatures: ['Tout le rapport unique', '20 produits analysés par mois', 'Re-vérifications aux jours 2, 7, 14 et 30', 'Alerte e-mail en cas de changement', 'Annulable à tout moment'],
    subCta: 'Commencer — 49 $',
    popular: 'LE PLUS POPULAIRE',
    guarantee: 'Paiement sécurisé via Creem · Carte, Apple Pay, Google Pay · Garantie 7 jours · Annulable dans le portail Creem',
  },
  es: {
    barFree: 'Análisis gratis',
    barOneTime: 'Informe único $29',
    barSub: '$49/mes con revisiones',
    freeTitle: 'Análisis gratis',
    freeSubtitle: 'Mira dónde está tu tienda.',
    freePrice: '$0',
    freePer: '',
    freeFeatures: ['Análisis del catálogo (hasta 200 productos)', '1 producto analizado en detalle', '1 corrección completa para aplicar'],
    freeCta: 'Empezar gratis',
    oneTitle: 'Informe único',
    oneSubtitle: 'Revisa una vez, corrige los tres peores.',
    onePrice: '$29',
    onePer: 'pago único',
    oneFeatures: ['Análisis del catálogo (hasta 200 productos)', '3 productos analizados en detalle', 'Las 7 correcciones por pregunta de comprador', 'Comparación de competidores con enlaces', 'Sin renovación automática'],
    oneCta: 'Obtener el informe — $29',
    subTitle: 'Seguimiento',
    subSubtitle: 'Mantenlo al día mientras corriges.',
    subPrice: '$49',
    subPer: '/ mes',
    subFeatures: ['Todo lo del informe único', '20 productos al mes analizados en detalle', 'Revisiones en los días 2, 7, 14 y 30', 'Aviso por email si cambia la puntuación', 'Cancela cuando quieras'],
    subCta: 'Empezar por mes — $49',
    popular: 'MÁS POPULAR',
    guarantee: 'Pago seguro vía Creem · Tarjeta, Apple Pay, Google Pay · Garantía de 7 días · Cancela en el portal de Creem',
  },
  pt: {
    barFree: 'Análise grátis',
    barOneTime: 'Relatório único $29',
    barSub: '$49/mês com revisões',
    freeTitle: 'Análise grátis',
    freeSubtitle: 'Veja onde sua loja está.',
    freePrice: '$0',
    freePer: '',
    freeFeatures: ['Análise do catálogo (até 200 produtos)', '1 produto analisado em detalhe', '1 correção completa para aplicar'],
    freeCta: 'Começar grátis',
    oneTitle: 'Relatório único',
    oneSubtitle: 'Verifique uma vez, corrija os três piores.',
    onePrice: '$29',
    onePer: 'pagamento único',
    oneFeatures: ['Análise do catálogo (até 200 produtos)', '3 produtos analisados em detalhe', 'As 7 correções por pergunta do comprador', 'Comparação de concorrentes com links', 'Sem renovação automática'],
    oneCta: 'Obter o relatório — $29',
    subTitle: 'Monitoramento',
    subSubtitle: 'Manter atualizado enquanto você corrige.',
    subPrice: '$49',
    subPer: '/ mês',
    subFeatures: ['Tudo do relatório único', '20 produtos por mês analisados em detalhe', 'Revisões nos dias 2, 7, 14 e 30', 'Aviso por e-mail quando a nota muda', 'Cancele quando quiser'],
    subCta: 'Começar por mês — $49',
    popular: 'MAIS POPULAR',
    guarantee: 'Pagamento seguro via Creem · Cartão, Apple Pay, Google Pay · Garantia de 7 dias · Cancele no portal Creem',
  },
};

export default function PricingSection() {
  const lang = useLang();
  const c = COPY[lang] || COPY.en;

  const checkIcon = (
    <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  function FeatureList({ items }) {
    return (
      <ul className="space-y-2.5 mb-7">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
            {checkIcon}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 flex items-center justify-center gap-2 text-sm text-gray-600 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            {c.barFree}
          </span>
          <span className="text-gray-300">•</span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-primary-700" />
            {c.barOneTime}
          </span>
          <span className="text-gray-300">•</span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-accent-500" />
            {c.barSub}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-7 relative flex flex-col">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{c.freeTitle}</h3>
              <p className="text-gray-500 text-sm">{c.freeSubtitle}</p>
            </div>
            <div className="mb-5">
              <span className="text-4xl font-bold text-gray-900">{c.freePrice}</span>
              {c.freePer ? <span className="text-gray-500 ml-1 text-sm">{c.freePer}</span> : null}
            </div>
            <FeatureList items={c.freeFeatures} />
            <Link
              href="/check"
              className="mt-auto block w-full text-center py-2.5 px-5 rounded-lg border-2 border-primary-700 text-primary-700 font-semibold hover:bg-primary-700 hover:text-white transition-all duration-200 text-sm"
            >
              {c.freeCta}
            </Link>
          </div>

          {/* $29 one-off */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-7 relative flex flex-col">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{c.oneTitle}</h3>
              <p className="text-gray-500 text-sm">{c.oneSubtitle}</p>
            </div>
            <div className="mb-5">
              <span className="text-4xl font-bold text-gray-900">{c.onePrice}</span>
              <span className="text-gray-500 ml-1 text-sm">{c.onePer}</span>
            </div>
            <FeatureList items={c.oneFeatures} />
            <Link
              href="/check"
              className="mt-auto block w-full text-center py-2.5 px-5 rounded-lg border-2 border-primary-700 text-primary-700 font-semibold hover:bg-primary-700 hover:text-white transition-all duration-200 text-sm"
            >
              {c.oneCta}
            </Link>
          </div>

          {/* $49 / month */}
          <div className="bg-white rounded-2xl border-2 border-primary-700 p-7 relative flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary-700 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {c.popular}
              </span>
            </div>
            <div className="mb-5 mt-2">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{c.subTitle}</h3>
              <p className="text-gray-500 text-sm">{c.subSubtitle}</p>
            </div>
            <div className="mb-5">
              <span className="text-4xl font-bold text-gray-900">{c.subPrice}</span>
              <span className="text-gray-500 ml-1 text-sm">{c.subPer}</span>
            </div>
            <FeatureList items={c.subFeatures} />
            <Link
              href="/check"
              className="mt-auto block w-full text-center py-2.5 px-5 rounded-lg bg-primary-700 text-white font-semibold hover:bg-primary-800 transition-all duration-200 text-sm"
            >
              {c.subCta}
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500 max-w-3xl mx-auto leading-6">{c.guarantee}</p>
      </div>
    </section>
  );
}
