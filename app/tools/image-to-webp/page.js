'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function ImageToWebpPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(0.8);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState('');
  const inputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  function convert() {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const ext = file.name.split('.').pop();
        setResult({
          url: URL.createObjectURL(blob),
          originalSize: file.size,
          webpSize: blob.size,
          savings: ((1 - blob.size / file.size) * 100).toFixed(1),
          originalFormat: ext.toUpperCase(),
        });
      }, 'image/webp', quality);
    };
    img.src = URL.createObjectURL(file);
  }

  function formatSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(2) + ' MB';
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.imageWebpTitle}</h1>
            <p className="text-lg text-gray-600">{p.imageWebpSubtitle}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
              {preview ? <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" /> : (
                <div><p className="text-4xl mb-2">🖼️</p><p className="text-sm text-gray-500">{p.imageWebpDropText}</p></div>
              )}
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
            {file && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{p.imageWebpQualityLabel}: {Math.round(quality * 100)}%</label>
                  <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full" />
                </div>
                <button onClick={convert} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                  {p.imageWebpConvertBtn}
                </button>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.imageWebpResult}</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.imageWebpOriginal}</p>
                  <p className="text-lg font-bold text-gray-700">{result.originalFormat} · {formatSize(result.originalSize)}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.imageWebpConverted}</p>
                  <p className="text-lg font-bold text-emerald-600">{formatSize(result.webpSize)}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.imageWebpSavings}</p>
                  <p className="text-lg font-bold text-indigo-600">{result.savings}%</p>
                </div>
              </div>
              <a href={result.url} download={`converted-${file.name.replace(/\.[^.]+$/, '.webp')}`}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                {p.imageWebpDownloadBtn}
              </a>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.imageWebpCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.imageWebpCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.imageWebpUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.imageWebpUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
