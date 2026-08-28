'use client';

import { useState, useEffect } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('geo_lang');
      if (saved) setLang(saved);
    } catch (e) {}
    function handleChange(e) {
      if (e.detail && e.detail.lang) setLang(e.detail.lang);
    }
    window.addEventListener('languagechange', handleChange);
    return () => window.removeEventListener('languagechange', handleChange);
  }, []);

  const isZh = lang === 'zh';

  const text = isZh
    ? {
        title: '喜欢这篇文章？',
        desc: '发布新的 GEO 和 AI 搜索洞察时第一时间通知你。',
        btn: '订阅',
        loading: '...',
        success: '✅ 感谢订阅！请检查邮箱确认。',
        errorGeneric: '出错了，请重试。',
        errorNetwork: '网络错误，请重试。',
      }
    : {
        title: 'Enjoyed this article?',
        desc: 'Get notified when I publish new GEO and AI search insights for Shopify stores.',
        btn: 'Subscribe',
        loading: '...',
        success: 'Thanks for subscribing! Check your inbox.',
        errorGeneric: 'Something went wrong. Please try again.',
        errorNetwork: 'Network error. Please try again.',
      };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || text.success);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || text.errorGeneric);
      }
    } catch {
      setStatus('error');
      setMessage(text.errorNetwork);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-1">{text.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{text.desc}</p>
      {status === 'success' ? (
        <p className="text-accent-600 font-medium text-sm">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            {status === 'loading' ? text.loading : text.btn}
          </button>
        </form>
      )}
      {status === 'error' && <p className="text-red-600 text-xs mt-2">{message}</p>}
    </div>
  );
}
