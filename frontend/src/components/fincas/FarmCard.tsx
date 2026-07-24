'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Finca, AmenityKey } from '@/types';
import { fmtCOP } from '@/lib/data';
import Icon from '@/components/ui/Icon';
import { useFavorites } from '@/hooks/useFavorites';

const BLUR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAAGklEQVQI12N48ODBfwYGBgaG//8ZGBgYGAAA8wMD/3iBHwAAAABJRU5ErkJggg==';

/* Íconos de amenidades visibles en la card */
const AMEN_ICON: Partial<Record<AmenityKey, string>> = {
  piscina: 'pool', bbq: 'bbq', wifi: 'wifi', rio: 'river', aire: 'ac', parqueadero: 'parking',
};

/* Viewing count — número pseudoaleatorio estable por finca */
function viewingCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return (h % 7) + 2; // 2 a 8
}

interface FarmCardProps {
  finca: Finca;
  /** Ciudad/fechas/huéspedes de la búsqueda activa — se propagan al detalle para no perder el contexto */
  ciudad?: string; checkIn?: string; checkOut?: string;
  adultos?: number; ninos?: number; bebes?: number;
}

export default function FarmCard({ finca, ciudad, checkIn, checkOut, adultos, ninos, bebes }: FarmCardProps) {
  const router = useRouter();
  const { isFav, toggle } = useFavorites();
  const [popping, setPopping] = useState(false);
  const faved      = isFav(finca.id);
  const viewing    = viewingCount(finca.id);
  const disponible = finca.status === 'disponible';

  const detailQS = new URLSearchParams();
  if (ciudad && ciudad !== 'todas') detailQS.set('ciudad', ciudad);
  if (checkIn)  detailQS.set('checkin', checkIn);
  if (checkOut) detailQS.set('checkout', checkOut);
  if (adultos)  detailQS.set('adultos', String(adultos));
  if (ninos)    detailQS.set('ninos',   String(ninos));
  if (bebes)    detailQS.set('bebes',   String(bebes));
  const detailHref = `/fincas/${finca.id}${detailQS.toString() ? '?' + detailQS.toString() : ''}`;

  /* Prefetch on mount/hover */
  useEffect(() => {
    router.prefetch(detailHref);
  }, [detailHref, router]);

  const handleFav = () => {
    toggle(finca.id);
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
  };

  /* Amenidades a mostrar (máx 4) */
  const visibleAmen = finca.amenities
    .filter((a) => AMEN_ICON[a])
    .slice(0, 4);

  const discountedPrice = finca.discount
    ? Math.round(finca.price * (1 - finca.discount / 100))
    : null;

  /* Si ya hay fechas de búsqueda activas, se muestra el total de la estadía, no el precio por noche */
  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0;
  const stayTotal = nights > 0 ? nights * (discountedPrice ?? finca.price) : null;

  return (
    <div className="farm-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col group transition-all duration-300 hover:-translate-y-1">
      {/* Photo */}
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '16/11' }}>
        <Image
          src={finca.imageUrl} alt={finca.name} fill
          placeholder="blur" blurDataURL={BLUR}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Discount badge */}
        {finca.discount && (
          <span className="absolute top-3 left-[50%] -translate-x-1/2 bg-[#8125E2] text-white text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ boxShadow: '0 2px 8px rgba(129,37,226,.4)' }}>
            −{finca.discount}% temporada
          </span>
        )}

        {/* Favorite button */}
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 grid place-items-center transition-all hover:scale-110 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8125E2]"
          onClick={handleFav}
          aria-label={faved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <span className={popping ? 'heart-pop' : ''} style={{ display: 'grid', placeItems: 'center' }}>
            <Icon name="heart" size={16} style={{ color: faved ? '#ef4444' : '#9ca3af', fill: faved ? '#ef4444' : 'none' }} stroke={1.8} />
          </span>
        </button>

        {/* Viewing indicator */}
        {disponible && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {viewing} {viewing === 1 ? 'persona viendo' : 'personas viendo'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <h3 className="text-[17px] font-extrabold text-gray-900 leading-snug tracking-tight">{finca.name}</h3>

        <p className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium">
          <Icon name="pin" size={13} /> {finca.city}, {finca.dept}
        </p>

        {/* Rating + capacity */}
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

        {/* Amenidades icons */}
        {visibleAmen.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            {visibleAmen.map((a) => (
              <span key={a} title={a}
                className="w-7 h-7 rounded-lg bg-[#f6f1fe] text-[#8125E2] grid place-items-center flex-none"
              >
                <Icon name={AMEN_ICON[a]!} size={14} />
              </span>
            ))}
            {finca.amenities.length > 4 && (
              <span className="text-[11px] font-semibold text-gray-400">+{finca.amenities.length - 4}</span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-3.5 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-3">
            {stayTotal !== null ? (
              <p className="text-[20px] font-bold text-gray-900">
                {fmtCOP(stayTotal)}
                <span className="text-[12.5px] text-gray-400 font-normal"> por {nights} {nights === 1 ? 'noche' : 'noches'}</span>
              </p>
            ) : (
              <>
                <p className="text-[20px] font-bold text-gray-900">
                  {fmtCOP(discountedPrice ?? finca.price)}
                  <span className="text-[12.5px] text-gray-400 font-normal"> / noche</span>
                </p>
                {discountedPrice && (
                  <p className="text-[12px] text-gray-400 line-through">{fmtCOP(finca.price)}</p>
                )}
              </>
            )}
          </div>
          <Link
            href={detailHref}
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
