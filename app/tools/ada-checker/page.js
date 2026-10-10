'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function AdaCheckerPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [html, setHtml] = useState('');
  const [result, setResult] = useState(null);

  function analyze(e) {
    e.preventDefault();
    if (!html.trim()) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const issues = [];
    let passed = 0;
    let total = 0;

    // Images without alt
    const imgs = doc.querySelectorAll('img');
    total += imgs.length;
    const noAlt = Array.from(imgs).filter(img => !img.hasAttribute('alt'));
    if (noAlt.length > 0) {
      issues.push({ severity: 'critical', text: `${noAlt.length} image(s) missing alt attribute` });
    } else if (imgs.length > 0) {
      passed += imgs.length;
    }

    // Form labels
    const inputs = doc.querySelectorAll('input:not([type="hidden"]), select, textarea');
    total += inputs.length;
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const hasLabel = id ? doc.querySelector(`label[for="${id}"]`) : null;
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      const isWrapped = input.closest('label');
      if (!hasLabel && !hasAriaLabel && !isWrapped) {
        issues.push({ severity: 'critical', text: `Form input (type="${input.type || 'text'}") missing associated label` });
      } else {
        passed++;
      }
    });

    // Heading structure
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    total += 1;
    const h1s = doc.querySelectorAll('h1');
    if (h1s.length === 0) { issues.push({ severity: 'warning', text: 'No H1 heading found — every page should have one H1' }); }
    else if (h1s.length > 1) { issues.push({ severity: 'warning', text: `${h1s.length} H1 headings found — pages should have exactly one H1` }); }
    else { passed++; }

    // Check heading hierarchy
    let lastLevel = 0;
    headings.forEach(h => {
      const level = parseInt(h.tagName[1]);
      if (level > lastLevel + 1 && lastLevel > 0) {
        issues.push({ severity: 'warning', text: `Heading hierarchy skipped: H${lastLevel} followed by H${level}` });
      }
      lastLevel = level;
    });

    // Buttons without text
    const buttons = doc.querySelectorAll('button');
    total += buttons.length;
    buttons.forEach(btn => {
      if (!btn.textContent.trim() && !btn.hasAttribute('aria-label')) {
        issues.push({ severity: 'critical', text: 'Button has no text or aria-label' });
      } else { passed++; }
    });

    // Links without text
    const links = doc.querySelectorAll('a');
    total += links.length;
    links.forEach(link => {
      if (!link.textContent.trim() && !link.hasAttribute('aria-label')) {
        const img = link.querySelector('img');
        if (!img || !img.hasAttribute('alt')) {
          issues.push({ severity: 'critical', text: 'Link has no text, aria-label, or image alt text' });
        } else { passed++; }
      } else { passed++; }
    });

    // Color contrast hint
    total += 1;
    const inlineStyles = doc.querySelectorAll('[style*="color"]');
    if (inlineStyles.length > 3) {
      issues.push({ severity: 'info', text: 'Multiple inline color styles detected — verify color contrast ratios meet WCAG 2.1 AA (4.5:1)' });
    } else { passed++; }

    // tabindex
    const tabindexNeg = doc.querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])');
    if (tabindexNeg.length > 0) {
      issues.push({ severity: 'warning', text: `${tabindexNeg.length} element(s) with positive tabindex — this disrupts natural tab order` });
    }

    // lang attribute
    total += 1;
    if (!doc.documentElement.hasAttribute('lang')) {
      issues.push({ severity: 'warning', text: 'HTML element missing lang attribute' });
    } else { passed++; }

    const score = total > 0 ? Math.round((passed / total) * 100) : 0;

    const tips = [
      'Add descriptive alt text to all images (or alt="" for decorative images)',
      'Associate every form input with a label element',
      'Use exactly one H1 per page and maintain heading hierarchy',
      'Ensure buttons and links have accessible text or aria-labels',
      'Verify color contrast ratios meet WCAG 2.1 AA standards',
      'Avoid positive tabindex values — use natural document order',
      'Add the lang attribute to the HTML element',
      'Test with keyboard navigation — all interactive elements should be reachable',
    ];

    setResult({ score, issues, tips, total, passed });
  }

  function severityColor(s) {
    if (s === 'critical') return 'text-red-600';
    if (s === 'warning') return 'text-amber-600';
    return 'text-blue-600';
  }
  function severityIcon(s) {
    if (s === 'critical') return '✕';
    if (s === 'warning') return '⚠';
    return 'ℹ';
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.adaTitle}</h1>
            <p className="text-lg text-gray-600">{p.adaSubtitle}</p>
          </div>

          <form onSubmit={analyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.adaInputLabel}</label>
            <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={8}
              placeholder="<html lang='en'>..." className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 font-mono resize-y" />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.adaAnalyzeBtn}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{p.adaResult}</h2>
                  <span className={`text-3xl font-bold ${result.score >= 80 ? 'text-emerald-600' : result.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{result.score}/100</span>
                </div>
                <p className="text-sm text-gray-500">{result.passed} of {result.total} checks passed</p>
              </div>

              {result.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.adaIssues}</h2>
                  <ul className="space-y-2">
                    {result.issues.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className={`${severityColor(item.severity)} mt-0.5 flex-shrink-0`}>{severityIcon(item.severity)}</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Improvement Tips</h2>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span><span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.adaCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.adaCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.adaUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.adaUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
