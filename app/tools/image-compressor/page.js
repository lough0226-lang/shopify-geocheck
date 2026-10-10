'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function ImageCompressorPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.7);
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

  function compress() {
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
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          originalSize: file.size,
          compressedSize: blob.size,
          savings: ((1 - blob.size / file.size) * 100).toFixed(1),
        });
      }, format, quality);
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.imageCompressorTitle}</h1>
            <p className="text-lg text-gray-600">{p.imageCompressorSubtitle}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
              ) : (
                <div>
                  <p className="text-4xl mb-2">🖼️</p>
                  <p className="text-sm text-gray-500">{p.imageCompressorDropText}</p>
                </div>
              )}
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>

            {file && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{p.imageCompressorFormatLabel}</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/png">PNG</option>
                      <option value="image/webp">WebP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{p.imageCompressorQualityLabel}: {Math.round(quality * 100)}%</label>
                    <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full mt-2" />
                  </div>
                </div>
                <button onClick={compress} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                  {p.imageCompressorCompressBtn}
                </button>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.imageCompressorResult}</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.imageCompressorOriginal}</p>
                  <p className="text-lg font-bold text-gray-700">{formatSize(result.originalSize)}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.imageCompressorCompressed}</p>
                  <p className="text-lg font-bold text-emerald-600">{formatSize(result.compressedSize)}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{p.imageCompressorSavings}</p>
                  <p className="text-lg font-bold text-indigo-600">{result.savings}%</p>
                </div>
              </div>
              <a href={result.url} download={`compressed-${file.name}`}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                {p.imageCompressorDownloadBtn}
              </a>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.imageCompressorCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.imageCompressorCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.imageCompressorUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.imageCompressorUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
