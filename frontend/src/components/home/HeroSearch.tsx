'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { City } from '@/types';
import Icon from '@/components/ui/Icon';

interface HeroSearchProps {
  cities: City[];
  embedded?: boolean;
}

export default function HeroSearch({ cities, embedded = false }: HeroSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dest, setDest] = useState<City | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const search = () => {
    if (dest) router.push(`/fincas?ciudad=${dest.key}`);
    else router.push('/fincas');
  };

  const inner = (
    <div className={`flex items-center gap-1 ${embedded ? '' : 'p-2'}`}>
      {/* Destination */}
      <div
        className="flex-1 px-5 py-3 rounded-xl transition-colors hover:bg-[#f6f1fe] cursor-pointer relative"
        ref={ref}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <p className="text-[10.5px] font-extrabold tracking-[.08em] uppercase text-[#8125E2]">Destino</p>
        <p className={`text-[14.5px] font-semibold mt-0.5 ${dest ? 'text-gray-800' : 'text-gray-400'}`}>
          {dest ? `${dest.name}, ${dest.dept}` : '¿A dónde vas?'}
        </p>
        {open && (
          <div
            className="absolute top-[calc(100%+10px)] left-0 z-30 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 min-w-[280px]"
            onClick={(e) => e.stopPropagation()}
          >
            {cities.map((c) => (
              <button
                key={c.key}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left hover:bg-[#f6f1fe] transition-colors"
                onClick={() => { setDest(c); setOpen(false); }}
              >
                <Icon name="pin" size={15} style={{ color: '#8125E2', flexShrink: 0 }} />
                <span className="flex flex-col leading-tight">
                  <b className="text-[14px] font-bold text-gray-900">{c.name}</b>
                  <small className="text-[12px] text-gray-400 font-medium">{c.dept} · {c.count} fincas</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-9 bg-gray-200 flex-none" />

      {/* Dates */}
      <div
        className="flex-1 px-5 py-3 rounded-xl transition-colors hover:bg-[#f6f1fe] cursor-pointer"
        onClick={search}
      >
        <p className="text-[10.5px] font-extrabold tracking-[.08em] uppercase text-[#8125E2]">Fechas</p>
        <p className="text-[14.5px] font-semibold mt-0.5 text-gray-400">¿Cuándo viajas?</p>
      </div>

      <div className="w-px h-9 bg-gray-200 flex-none" />

      {/* Guests */}
      <div
        className="flex-1 px-5 py-3 rounded-xl transition-colors hover:bg-[#f6f1fe] cursor-pointer"
        onClick={search}
      >
        <p className="text-[10.5px] font-extrabold tracking-[.08em] uppercase text-[#8125E2]">Huéspedes</p>
        <p className="text-[14.5px] font-semibold mt-0.5 text-gray-400">¿Cuántos van?</p>
      </div>

      {/* Search button */}
      <button
        className="w-12 h-12 rounded-full bg-[#8125E2] text-white grid place-items-center flex-none hover:bg-[#7720d1] hover:scale-105 active:scale-95 transition-all"
        style={{ boxShadow: '0 8px 20px rgba(129,37,226,.35)' }}
        onClick={search}
        aria-label="Buscar fincas"
      >
        <Icon name="search" size={20} />
      </button>
    </div>
  );

  if (embedded) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-visible" style={{ boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
        {inner}
      </div>
    );
  }

  // Legacy floating mode (unused now, kept for compatibility)
  return (
    <div className="hidden md:block absolute left-0 right-0 bottom-[-44px] z-10 max-w-[1200px] mx-auto px-8">
      <div className="bg-white rounded-[30px] p-2" style={{ boxShadow: '0 18px 48px rgba(33,27,46,.14)' }}>
        {inner}
      </div>
    </div>
  );
}
