'use client';

import { useState, useEffect } from 'react';

// Shared language detection hook for client components
// Reads from localStorage and listens for the 'languagechange' custom event dispatched by Header
export function useLanguage() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Initial detection
    try {
      const saved = localStorage.getItem('geo_lang');
      if (saved) setLang(saved);
    } catch (e) {
      // localStorage unavailable
    }

    // Listen for language changes from Header
    function handleChange(e) {
      if (e.detail && e.detail.lang) {
        setLang(e.detail.lang);
      }
    }

    window.addEventListener('languagechange', handleChange);
    return () => window.removeEventListener('languagechange', handleChange);
  }, []);

  return lang;
}
