'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

export default function TitleAnalyzerPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  function analyzeTitle(text) {
    const title = text.trim();
    if (!title) return null;
    const len = title.length;
    const issues = [];
    let score = 100;

    if (len < 30) { score -= 30; issues.push('Title is too short (under 30 characters)'); }
    else if (len < 50) { score -= 15; issues.push('Title is shorter than ideal (50-60 characters recommended)'); }
    else if (len > 70) { score -= 15; issues.push('Title is too long and may be truncated in search results'); }
    else if (len > 60) { score -= 5; issues.push('Title is slightly long (over 60 characters)'); }

    const words = title.split(/\s+/);
    const firstWord = words[0]?.toLowerCase() || '';
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'of', 'for', 'to', 'in', 'with'];
    if (stopWords.includes(firstWord)) {
      score -= 10;
      issues.push('Title starts with a stop word — consider starting with the main keyword');
    }

    const powerWords = ['best', 'top', 'premium', 'ultimate', 'pro', 'exclusive', 'limited', 'free', 'new', 'sale', 'official', 'guaranteed', 'authentic'];
    const lower = title.toLowerCase();
    const hasPower = powerWords.some(w => lower.includes(w));
    if (!hasPower) {
      score -= 10;
      issues.push('No power words found (e.g. Best, Premium, Exclusive)');
    }

    if (title === title.toUpperCase()) {
      score -= 10;
      issues.push('Title is ALL CAPS — use title case instead');
    }

    const hasNumbers = /\d/.test(title);
    if (hasNumbers) { score += 5; }

    const separators = ['|', '-', '–', '—'];
    const hasSep = separators.some(s => title.includes(s));
    if (hasSep) { score += 5; }
    else { issues.push('Consider adding a separator (| or -) to organize title sections'); }

    score = Math.max(0, Math.min(100, score));

    const tips = [];
    if (len >= 50 && len <= 60) tips.push('Title length is in the ideal range');
    if (hasPower) tips.push('Power words help increase click-through rates');
    if (hasNumbers) tips.push('Numbers in titles can improve visibility');
    if (hasSep) tips.push('Separators help structure the title for readability');
    if (!stopWords.includes(firstWord)) tips.push('Good: title does not start with a stop word');
    tips.push('Include your primary keyword near the beginning of the title');
    tips.push('Make the title unique for each product page');

    return { score, length: len, issues, tips, title };
  }

  function handleAnalyze(e) {
    e.preventDefault();
    const r = analyzeTitle(input);
    setResult(r);
  }

  function scoreColor(s) {
    if (s >= 80) return 'text-emerald-600';
    if (s >= 50) return 'text-amber-600';
    return 'text-red-600';
  }

  function scoreBg(s) {
    if (s >= 80) return 'bg-emerald-50 border-emerald-200';
    if (s >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.titleAnalyzerTitle}</h1>
            <p className="text-lg text-gray-600">{p.titleAnalyzerSubtitle}</p>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto mt-2">{p.titleAnalyzerOneLiner}</p>
          </div>

          <form onSubmit={handleAnalyze} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">{p.titleAnalyzerInputLabel}</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={p.titleAnalyzerInputPlaceholder}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
            />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {p.titleAnalyzerAnalyzeBtn}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{p.titleAnalyzerScore}</h2>
                  <span className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}/100</span>
                </div>
                <div className={`${scoreBg(result.score)} border rounded-xl p-4`}>
                  <p className="text-gray-800 text-sm mb-1">{result.title}</p>
                  <span className="text-xs text-gray-500">{p.titleAnalyzerLength}: {result.length} {p.titleAnalyzerChars}</span>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.titleAnalyzerIssues}</h2>
                  <ul className="space-y-2">
                    {result.issues.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.titleAnalyzerTips}</h2>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.titleAnalyzerUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.titleAnalyzerUsageDesc}</p>
          </div>
          {/* Educational Content Sections */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.titleAnalyzerWhatIsTitle}</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{p.titleAnalyzerWhatIsText}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.titleAnalyzerHowToTitle}</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{p.titleAnalyzerHowToText}</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.titleAnalyzerWhoForTitle}</h2>
            <ul className="space-y-2">
              {p.titleAnalyzerWhoForItems.split('|||').map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">{"•"}</span>
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.titleAnalyzerBestTitle}</h2>
            <ul className="space-y-2">
              {p.titleAnalyzerBestItems.split('|||').map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">{"✓"}</span>
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.titleAnalyzerMistakesTitle}</h2>
            <ul className="space-y-2">
              {p.titleAnalyzerMistakesItems.split('|||').map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">{"✗"}</span>
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.titleAnalyzerFaqTitle}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.titleAnalyzerFaq1Q}</h3>
                <p className="text-sm text-gray-700">{p.titleAnalyzerFaq1A}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.titleAnalyzerFaq2Q}</h3>
                <p className="text-sm text-gray-700">{p.titleAnalyzerFaq2A}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.titleAnalyzerFaq3Q}</h3>
                <p className="text-sm text-gray-700">{p.titleAnalyzerFaq3A}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.titleAnalyzerFaq4Q}</h3>
                <p className="text-sm text-gray-700">{p.titleAnalyzerFaq4A}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{p.titleAnalyzerNextStepTitle}</h2>
            <p className="text-sm text-gray-700 mb-4">{p.titleAnalyzerNextStepText}</p>
            <div className="flex gap-3">
              <Link href="/tools" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View all tools {"→"}</Link>
              <Link href="/tools/schema-tester" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Schema Tester {"→"}</Link>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.titleAnalyzerCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              {p.titleAnalyzerCtaBtn}
            </Link>
          </div>
        </div>
      </main>
          </>
  );
}
