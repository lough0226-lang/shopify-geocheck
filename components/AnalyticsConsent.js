'use client';

// Cookie 同意 + GA4 门控
//
// 为什么改：原来 GA4 的 <script> 直接写在 layout 里，任何人一进站就被跟踪，
// 欧盟/英国用户没有同意环节 —— 这是 GDPR / PECR 的硬性要求，不是可选项。
//
// 做法：layout 里不再直接加载 GA，由本组件在"用户点了同意"之后才注入。
// 未做选择 = 不加载 = 不发送任何数据（这是合规的关键：同意前的默认必须是拒绝）。

import { useEffect, useState } from 'react';
import { useLang } from '../lib/i18n';

const GA_ID = 'G-30ZHNHCX4Q';
const KEY = 'geo_cookie_consent';

let gaLoaded = false;

function loadGA() {
  if (gaLoaded || typeof window === 'undefined') return;
  gaLoaded = true;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // anonymize_ip：不记录完整 IP，降低被认定为"个人数据"的强度
  window.gtag('config', GA_ID, { anonymize_ip: true });
}

const T = {
  en: {
    body: 'We use analytics cookies to see which pages help merchants and where the check flow breaks. No advertising cookies, no cross-site tracking.',
    accept: 'Accept analytics',
    decline: 'Decline',
    more: 'Privacy policy',
  },
  zh: {
    body: '我们使用分析 Cookie 了解哪些页面对商家有帮助、检查流程在哪里中断。不使用广告 Cookie，也不做跨站跟踪。',
    accept: '接受分析',
    decline: '拒绝',
    more: '隐私政策',
  },
  de: {
    body: 'Wir nutzen Analyse-Cookies, um zu sehen, welche Seiten helfen und wo der Check abbricht. Keine Werbe-Cookies, kein websiteübergreifendes Tracking.',
    accept: 'Analyse akzeptieren',
    decline: 'Ablehnen',
    more: 'Datenschutz',
  },
  fr: {
    body: "Nous utilisons des cookies d'analyse pour voir quelles pages aident les marchands et où le diagnostic s'interrompt. Aucun cookie publicitaire, aucun suivi entre sites.",
    accept: "Accepter l'analyse",
    decline: 'Refuser',
    more: 'Confidentialité',
  },
  es: {
    body: 'Usamos cookies de analítica para ver qué páginas ayudan a los comerciantes y dónde se rompe el diagnóstico. Sin cookies publicitarias ni seguimiento entre sitios.',
    accept: 'Aceptar analítica',
    decline: 'Rechazar',
    more: 'Privacidad',
  },
  pt: {
    body: 'Usamos cookies de análise para ver quais páginas ajudam os lojistas e onde o diagnóstico falha. Sem cookies de publicidade e sem rastreamento entre sites.',
    accept: 'Aceitar análise',
    decline: 'Recusar',
    more: 'Privacidade',
  },
};

export default function AnalyticsConsent() {
  const lang = useLang();
  const t = T[lang] || T.en;
  const [choice, setChoice] = useState(undefined); // undefined=还没读，null=未决定

  useEffect(() => {
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch { /* 隐私模式 */ }
    setChoice(stored);
    if (stored === 'granted') loadGA();
  }, []);

  function decide(v) {
    try { localStorage.setItem(KEY, v); } catch { /* 存不了就只对本次有效 */ }
    setChoice(v);
    if (v === 'granted') loadGA();
    if (v === 'denied') {
      // 拒绝时清掉可能已存在的 GA cookie（上一次同意留下的）
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (name.startsWith('_ga')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.mygeocheck.com`;
        }
      });
    }
  }

  // 还没读完 localStorage 时不渲染，避免闪一下；已决定过也不渲染
  if (choice === undefined || choice) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-sm leading-6 text-gray-600">
          {t.body}{' '}
          <a href="/privacy" className="text-primary-700 underline underline-offset-2">
            {t.more}
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide('denied')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => decide('granted')}
            className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
