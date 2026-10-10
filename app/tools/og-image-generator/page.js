'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function OgImageGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [title, setTitle] = useState('My Awesome Product');
  const [desc, setDesc] = useState('High quality product for your needs');
  const [color, setColor] = useState('#4f46e5');
  const [dataUrl, setDataUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    generate();
  }, []);

  function generate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 630);

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1200, 8);
    ctx.fillRect(0, 622, 1200, 8);

    ctx.fillStyle = color;
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
    const maxWidth = 1000;
    const words = title.split(' ');
    let lines = [];
    let line = '';
    for (const w of words) {
      const test = line + (line ? ' ' : '') + w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);

    const startY = 200;
    ctx.fillStyle = '#111827';
    lines.forEach((l, i) => {
      ctx.fillText(l, 100, startY + i * 72);
    });

    ctx.fillStyle = '#6b7280';
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    const descLines = [];
    const dWords = desc.split(' ');
    let dLine = '';
    for (const w of dWords) {
      const test = dLine + (dLine ? ' ' : '') + w;
      if (ctx.measureText(test).width > maxWidth && dLine) {
        descLines.push(dLine);
        dLine = w;
      } else {
        dLine = test;
      }
    }
    if (dLine) descLines.push(dLine);
    descLines.slice(0, 2).forEach((l, i) => {
      ctx.fillText(l, 100, startY + lines.length * 72 + 40 + i * 44);
    });

    ctx.fillStyle = color;
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillText('yourstore.com', 100, 570);

    setDataUrl(canvas.toDataURL('image/png'));
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.ogImageTitle}</h1>
            <p className="text-lg text-gray-600">{p.ogImageSubtitle}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.ogImageTitleLabel}</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.ogImageDescLabel}</label>
                <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{p.ogImageColorLabel}</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <span className="text-sm text-gray-500">{color}</span>
                </div>
              </div>
              <button onClick={generate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                {p.ogImageGenerateBtn}
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {dataUrl && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.ogImageResult}</h2>
              <img src={dataUrl} alt="OG Preview" className="w-full rounded-xl border border-gray-200 mb-4" />
              <a href={dataUrl} download="og-image.png"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                {p.ogImageDownloadBtn}
              </a>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.ogImageCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.ogImageCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.ogImageUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.ogImageUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
