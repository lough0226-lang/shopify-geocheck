'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLang, PAGE_CONTENT } from '../../../lib/i18n';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function BgRemoverPage() {
  const lang = useLang();
  const p = PAGE_CONTENT[lang] || PAGE_CONTENT.en;

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState('');
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  function removeBg() {
    if (!file) return;
    setProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const corners = [
        [0, 0],
        [(canvas.width - 1) * 4, 0],
        [0, (canvas.height - 1) * canvas.width * 4],
        [(canvas.width - 1) * 4 + (canvas.height - 1) * canvas.width * 4, 0]
      ];

      const bgR = data[0], bgG = data[1], bgB = data[2];
      const threshold = 60;

      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - bgR;
        const dg = data[i + 1] - bgG;
        const db = data[i + 2] - bgB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist < threshold) {
          data[i + 3] = 0;
        } else if (dist < threshold + 20) {
          data[i + 3] = Math.round(((dist - threshold) / 20) * 255);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        setResult({ url: URL.createObjectURL(blob), size: blob.size });
        setProcessing(false);
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
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{p.bgRemoverTitle}</h1>
            <p className="text-lg text-gray-600">{p.bgRemoverSubtitle}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
              {preview ? <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" /> : (
                <div><p className="text-4xl mb-2">🖼️</p><p className="text-sm text-gray-500">{p.bgRemoverDropText}</p></div>
              )}
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
            {file && (
              <button onClick={removeBg} disabled={processing} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                {processing ? 'Processing...' : p.bgRemoverProcessBtn}
              </button>
            )}
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{p.bgRemoverResult}</h2>
              <div className="bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23eee%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23eee%22/></svg>')] rounded-xl p-2 mb-4">
                <img src={result.url} alt="No background" className="max-h-64 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">PNG · {formatSize(result.size)}</p>
              <a href={result.url} download={`nobg-${file.name}`}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                {p.bgRemoverDownloadBtn}
              </a>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-10">
            <p className="text-gray-700 mb-4">{p.bgRemoverCta}</p>
            <Link href="/check" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">{p.bgRemoverCtaBtn}</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.bgRemoverUsageTitle}</h2>
            <p className="text-sm text-gray-600">{p.bgRemoverUsageDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
