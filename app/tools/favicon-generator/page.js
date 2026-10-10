'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];

export default function FaviconGeneratorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [preview, setPreview] = useState('');
  const inputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults([]);
  }

  function generate() {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const generated = SIZES.map(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        return { size, url: canvas.toDataURL('image/png') };
      });
      setResults(generated);
    };
    img.src = URL.createObjectURL(file);
  }

  function downloadAll() {
    results.forEach(r => {
      const a = document.createElement('a');
      a.href = r.url;
      a.download = `favicon-${r.size}x${r.size}.png`;
      a.click();
    });
  }

  return (
    <>
            <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.faviconTitle}</h1>
            <p className="text-lg text-gray-600">{p.faviconSubtitle}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
              {preview ? <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" /> : (
                <div><p className="text-4xl mb-2">🖼️</p><p className="text-sm text-gray-500">{p.faviconDropText}</p></div>
              )}
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
            {file && (
              <button onClick={generate} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                {p.faviconGenerateBtn}
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{p.faviconSizes}</h2>
                <button onClick={downloadAll} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors">
                  {p.faviconDownloadBtn}
                </button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {results.map((r, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-2 flex items-center justify-center h-20">
                      <img src={r.url} alt={`${r.size}px`} style={{ maxWidth: Math.min(r.size, 64), maxHeight: Math.min(r.size, 64) }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{r.size}px</p>
                    <a href={r.url} download={`favicon-${r.size}.png`} className="text-xs text-indigo-600 hover:underline">Save</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.faviconCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.faviconCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.faviconUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.faviconUsageDesc}</p>
          </div>
        </div>
      </main>
          </>
  );
}
