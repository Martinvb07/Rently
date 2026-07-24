'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Finca } from '@/types';
import { fmtCOP } from '@/lib/data';
import Icon from '@/components/ui/Icon';

interface RecentlyViewedProps {
  allFincas: Finca[];
}

export default function RecentlyViewed({ allFincas }: RecentlyViewedProps) {
  const [recientes, setRecientes] = useState<Finca[]>([]);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('rently-recent') ?? '[]') as string[];
      const found = ids
        .map((id) => allFincas.find((f) => f.id === id))
        .filter(Boolean) as Finca[];
      setRecientes(found.slice(0, 3));
    } catch {}
  }, [allFincas]);

  if (recientes.length === 0) return null;

  const featured = recientes[0];

  return (
    <section className="max-w-[1200px] mx-auto px-5 md:px-8 py-16">
      {/* Banner "¿Sigues pensando?" */}
      <div
        className="relative rounded-2xl overflow-hidden flex items-end mb-8"
        style={{ minHeight: 200, background: '#120e1c' }}
      >
        <Image
          src={featured.imageUrl}
          alt={featured.name}
          fill
          className="object-cover opacity-50"
          sizes="1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative z-10 p-7 md:p-10 flex items-center justify-between gap-6 w-full">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#f0ebfe] text-[#8125E2] text-[11px] font-bold px-3 py-1 rounded-full mb-3">
              <Icon name="clock" size={12} /> La dejaste ir…
            </span>
            <h2 className="text-white font-extrabold text-[22px] md:text-[28px] tracking-tight leading-tight">
              ¿Sigues pensando en<br />{featured.name}?
            </h2>
            <p className="text-white/65 text-[14px] mt-1.5 flex items-center gap-1.5">
              <Icon name="pin" size={13} /> {featured.city}, {featured.dept}
            </p>
          </div>
          <div className="flex-none text-right">
            <p className="text-white/60 text-[13px] mb-1">Desde</p>
            <p className="text-white font-extrabold text-[22px]">
              {fmtCOP(featured.price)}<span className="text-[12px] text-white/50 font-normal"> /noche</span>
            </p>
            <Link
              href={`/fincas/${featured.id}`}
              className="inline-flex items-center gap-2 mt-3 bg-[#8125E2] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] hover:bg-[#7720d1] transition-colors"
              style={{ boxShadow: '0 4px 14px rgba(129,37,226,.4)' }}
            >
              Reservar ahora <Icon name="arrowR" size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Otras fincas vistas */}
      {recientes.length > 1 && (
        <div>
          <p className="text-[13px] font-bold text-gray-400 mb-3">También viste</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${recientes.length - 1}, 1fr)` }}>
            {recientes.slice(1).map((f) => (
              <Link key={f.id} href={`/fincas/${f.id}`}
                className="flex gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all group">
                <div className="relative w-16 h-14 rounded-lg overflow-hidden flex-none bg-gray-100">
                  <Image src={f.imageUrl} alt={f.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-[13px] leading-tight truncate">{f.name}</p>
                  <p className="text-gray-400 text-[11.5px] mt-0.5">{f.city}, {f.dept}</p>
                  <p className="text-[#8125E2] font-extrabold text-[13px] mt-1">
                    {fmtCOP(f.price)}<span className="text-[10px] text-gray-400 font-normal"> /noche</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
