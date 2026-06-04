'use client';
import { useState, useEffect } from 'react';
import Icon from './Icon';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      className="fixed bottom-24 right-6 z-40 w-11 h-11 rounded-full bg-white border border-gray-200 grid place-items-center text-gray-600 hover:border-[#8125E2] hover:text-[#8125E2] hover:scale-105 active:scale-95 transition-all"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}
    >
      <Icon name="chevL" size={18} style={{ transform: 'rotate(90deg)' }} />
    </button>
  );
}
