'use client';

import { useState } from 'react';
import Header from '../../components/Header';

// 多语言文案
const TEXT = {
  en: {
    title: 'My Reports',
    subtitle: 'Enter your email to find all your GEO analysis reports',
    emailLabel: 'Email Address',
    emailPlaceholder: 'your@email.com',
    sendCode: 'Send Code',
    sending: 'Sending...',
    codeLabel: 'Verification Code',
    codePlaceholder: '6-digit code',
    viewReports: 'View Reports',
    viewing: 'Loading...',
    noReports: 'No reports found for this email. Have you run a GEO check yet?',
    reportFound: 'report(s) found',
    date: 'Date',
    product: 'Product',
    score: 'Score',
    status: 'Status',
    locked: 'Free',
    unlocked: 'Full Report',
    viewReport: 'View',
    resendCode: 'Resend code',
    success: 'Code sent! Check your email.',
    error: 'Something went wrong. Please try again.',
    codeSent: 'A 6-digit code has been sent to your email. It expires in 10 minutes.',
    backHome: 'Back to Home',
  },
  zh: {
    title: '我的报告',
    subtitle: '输入你的邮箱，查看所有 GEO 分析报告',
    emailLabel: '邮箱地址',
    emailPlaceholder: 'your@email.com',
    sendCode: '发送验证码',
    sending: '发送中...',
    codeLabel: '验证码',
    codePlaceholder: '6位验证码',
    viewReports: '查看报告',
    viewing: '加载中...',
    noReports: '该邮箱下没有找到报告，你还没有做过检测吗？',
    reportFound: '份报告',
    date: '日期',
    product: '产品',
    score: '评分',
    status: '状态',
    locked: '免费版',
    unlocked: '完整报告',
    viewReport: '查看',
    resendCode: '重新发送',
    success: '验证码已发送！请查看邮件。',
    error: '出错了，请重试。',
    codeSent: '6位验证码已发送到你的邮箱，10分钟内有效。',
    backHome: '返回首页',
  },
};

function getLang() {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('geo_lang');
  if (saved && TEXT[saved]) return saved;
  const browserLang = (navigator.language || 'en').toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  return 'en';
}

export default function MyReportsPage() {
  const [lang, setLang] = useState(() => getLang());
  const t = TEXT[lang] || TEXT.en;

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // email -> code -> reports
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [countdown, setCountdown] = useState(0);

  // 发送验证码
  async function handleSendCode() {
    if (!email.includes('@')) {
      setError(lang === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.error);
        return;
      }
      setStep('code');
      setMessage(t.success);
      // 60秒倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  // 查询报告
  async function handleViewReports() {
    if (code.length !== 6) {
      setError(lang === 'zh' ? '请输入6位验证码' : 'Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/my-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.error);
        return;
      }
      setReports(data.reports || []);
      setStep('reports');
    } catch (e) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    if (countdown > 0) return;
    setStep('email');
    handleSendCode();
  }

  function formatDate(dateStr) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  function scoreColor(score) {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>

        {/* 卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Step 1: 输入邮箱 */}
          {(step === 'email' || step === 'code') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                disabled={step === 'code'}
              />
            </div>
          )}

          {/* 发送验证码按钮 */}
          {step === 'email' && (
            <button
              onClick={handleSendCode}
              disabled={loading || !email.includes('@')}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.sending : t.sendCode}
            </button>
          )}

          {/* Step 2: 输入验证码 */}
          {step === 'code' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.codeLabel}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t.codePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-center text-lg tracking-[8px] font-mono"
                />
              </div>
              <button
                onClick={handleViewReports}
                disabled={loading || code.length !== 6}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {loading ? t.viewing : t.viewReports}
              </button>
              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className="w-full text-center text-sm text-gray-500 hover:text-green-600 disabled:opacity-50"
              >
                {countdown > 0 ? `${countdown}s` : t.resendCode}
              </button>
            </>
          )}

          {/* 消息提示 */}
          {message && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Step 3: 报告列表 */}
        {step === 'reports' && (
          <div className="mt-6">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {t.noReports}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">
                  {reports.length} {t.reportFound}
                </p>
                <div className="space-y-3">
                  {reports.map(r => (
                    <a
                      key={r.report_id}
                      href={`/report/${r.report_id}`}
                      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {r.product_name || r.domain || r.url}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(r.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          {r.score != null && (
                            <span className={`text-lg font-bold ${scoreColor(r.score)}`}>
                              {r.score}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            r.unlocked
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {r.unlocked ? t.unlocked : t.locked}
                          </span>
                          <span className="text-green-600 text-sm font-medium">
                            {t.viewReport} →
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* 重新查询 */}
            <button
              onClick={() => {
                setStep('email');
                setCode('');
                setMessage('');
                setError('');
                setReports([]);
              }}
              className="mt-6 w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {lang === 'zh' ? '查询其他邮箱' : 'Search Another Email'}
            </button>
          </div>
        )}

        {/* 返回首页 */}
        <div className="text-center mt-8">
          <a href="/" className="text-sm text-gray-400 hover:text-green-600">
            ← {t.backHome}
          </a>
        </div>
      </main>
    </div>
  );
}
