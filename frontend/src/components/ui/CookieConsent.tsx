'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('rently-cookies');
    if (!accepted) setTimeout(() => setVisible(true), 1500);
  }, []);

  const accept = () => {
    localStorage.setItem('rently-cookies', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1424] text-white border-t border-white/10"
      style={{ animation: 'pop .3s cubic-bezier(.2,.8,.3,1.1)' }}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-[13.5px] text-white/75 leading-relaxed max-w-[600px]">
          Usamos cookies propias y de terceros (Google Analytics, Meta Pixel) para mejorar tu experiencia y mostrarte anuncios relevantes.{' '}
          <Link href="/" className="text-[#c0a0f1] hover:text-white underline transition-colors">
            Política de privacidad
          </Link>
        </p>
        <div className="flex items-center gap-3 flex-none">
          <button
            onClick={() => setVisible(false)}
            className="text-[13px] font-semibold text-white/50 hover:text-white/80 transition-colors px-4 py-2"
          >
            Solo esenciales
          </button>
          <button
            onClick={accept}
            className="bg-[#8125E2] text-white text-[13.5px] font-bold px-5 py-2.5 rounded-xl hover:bg-[#7720d1] active:scale-[.97] transition-all"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
