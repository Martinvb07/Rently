'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Finca } from '@/types';
import { fmtCOP } from '@/lib/data';
import Icon from '@/components/ui/Icon';
import { useFavorites } from '@/hooks/useFavorites';

const BLUR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAAGklEQVQI12N48ODBfwYGBgaG//8ZGBgYGAAA8wMD/3iBHwAAAABJRU5ErkJggg==';

export default function FarmCard({ finca }: { finca: Finca }) {
  const { isFav, toggle } = useFavorites();
  const [popping, setPopping] = useState(false);
  const disponible = finca.status === 'disponible';
  const faved = isFav(finca.id);

  const handleFav = () => {
    toggle(finca.id);
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
  };

  return (
    <div className="farm-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col group transition-all duration-300 hover:-translate-y-1">
      {/* Photo */}
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '16/11' }}>
        <Image
          src={finca.imageUrl}
          alt={finca.name}
          fill
          placeholder="blur"
          blurDataURL={BLUR}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11.5px] font-bold ${
          disponible ? 'bg-white/95 text-emerald-700' : 'bg-white/95 text-red-600'
        }`}>
          {disponible ? 'Disponible' : 'Ocupado'}
        </span>
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 grid place-items-center transition-all hover:scale-110 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8125E2]"
          onClick={handleFav}
          aria-label={faved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <span className={popping ? 'heart-pop' : ''} style={{ display: 'grid', placeItems: 'center' }}>
            <Icon
              name="heart" size={16}
              style={{ color: faved ? '#ef4444' : '#9ca3af', fill: faved ? '#ef4444' : 'none' }}
              stroke={1.8}
            />
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <h3 className="text-[17px] font-extrabold text-gray-900 leading-snug tracking-tight">{finca.name}</h3>

        <p className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium">
          <Icon name="pin" size={13} /> {finca.city}, {finca.dept}
        </p>

        <div className="flex items-center justify-between text-[13px]">
          <span className="flex items-center gap-1.5 text-gray-400 font-medium">
            <Icon name="users" size={13} /> {finca.capacity} personas
          </span>
          <span className="flex items-center gap-1 font-semibold text-gray-700">
            <Icon name="star" size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} stroke={0} />
            {finca.rating}
            <span className="text-gray-400 font-normal ml-0.5">({finca.reviews})</span>
          </span>
        </div>

        <div className="mt-auto pt-3.5 border-t border-gray-100">
          <p className="text-[20px] font-bold text-gray-900 mb-3">
            {fmtCOP(finca.price)}<span className="text-[12.5px] text-gray-400 font-normal"> / noche</span>
          </p>
          <Link
            href={`/fincas/${finca.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#8125E2] text-white text-[14px] font-bold hover:bg-[#7720d1] active:scale-[.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8125E2]"
            style={{ boxShadow: '0 4px 14px rgba(129,37,226,.28)' }}
          >
            Ver detalles <Icon name="arrowR" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
