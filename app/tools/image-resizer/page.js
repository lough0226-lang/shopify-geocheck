'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

const PRESETS = [
  { label: 'Shopify Product (2048×2048)', w: 2048, h: 2048 },
  { label: 'Collection (1024×1024)', w: 1024, h: 1024 },
  { label: 'Blog (1200×630)', w: 1200, h: 630 },
  { label: 'Favicon (32×32)', w: 32, h: 32 },
];

export default function ImageResizerPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [file, setFile] = useState(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState('');
  const inputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    const img = new Image();
    img.onload = () => { setWidth(img.naturalWidth); setHeight(img.naturalHeight); };
    img.src = URL.createObjectURL(f);
  }

  function setPreset(w, h) { setWidth(w); setHeight(h); }

  function resize() {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        setResult({ url: URL.createObjectURL(blob), size: blob.size });
      }, 'image/png');
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
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.imageResizerTitle}</h1>
            <p className="text-lg text-gray-600">{p.imageResizerSubtitle}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
              {preview ? <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" /> : (
                <div><p className="text-4xl mb-2">🖼️</p><p className="text-sm text-gray-500">{p.imageResizerDropText}</p></div>
              )}
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>

            {file && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">{p.imageResizerPresets}</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((pr, i) => (
                    <button key={i} onClick={() => setPreset(pr.w, pr.h)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                      {pr.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{p.imageResizerWidthLabel}</label>
                    <input type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 0)} min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{p.imageResizerHeightLabel}</label>
                    <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 0)} min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <button onClick={resize} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                  {p.imageResizerResizeBtn}
                </button>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.imageResizerResult}</h2>
              <img src={result.url} alt="Resized" className="max-h-48 mx-auto rounded-lg mb-4" />
              <p className="text-sm text-gray-600 text-center mb-4">{width}×{height}px · {formatSize(result.size)}</p>
              <a href={result.url} download={`resized-${width}x${height}.png`}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                {p.imageResizerDownloadBtn}
              </a>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.imageResizerCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.imageResizerCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.imageResizerUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.imageResizerUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
