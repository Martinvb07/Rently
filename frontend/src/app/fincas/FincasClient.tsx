'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Finca, City } from '@/types';
import FarmCard from '@/components/fincas/FarmCard';
import Icon from '@/components/ui/Icon';
import OwlMark from '@/components/ui/OwlMark';

interface Props {
  fincas: Finca[];
  cities: City[];
  initialCity: string;
}

const SORT_LABELS: Record<string, string> = {
  destacados:   'Destacados',
  'precio-asc': 'Menor precio',
  'precio-desc':'Mayor precio',
  rating:       'Mejor valorados',
};
const SORT_ORDER   = ['destacados', 'precio-asc', 'precio-desc', 'rating'];
const GUEST_OPTIONS = [0, 4, 8, 12, 16];

export default function FincasClient({ fincas, cities, initialCity }: Props) {
  const [city,      setCity]      = useState(initialCity);
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [guests,    setGuests]    = useState(0);
  const [sort,      setSort]      = useState('destacados');

  const cityName = (k: string) => cities.find((c) => c.key === k)?.name ?? '';

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const changeCity = (k: string) => { setCity(k); scrollTop(); };

  const cycleGuests = () => {
    const i = GUEST_OPTIONS.indexOf(guests);
    setGuests(GUEST_OPTIONS[(i + 1) % GUEST_OPTIONS.length]);
  };
  const cycleSort = () =>
    setSort((s) => SORT_ORDER[(SORT_ORDER.indexOf(s) + 1) % SORT_ORDER.length]);

  let list = fincas
    .filter((f) => city === 'todas' || f.city === cityName(city))
    .filter((f) => !onlyAvail || f.status === 'disponible')
    .filter((f) => !guests || f.capacity >= guests);

  list = [...list].sort((a, b) => {
    if (sort === 'precio-asc')  return a.price  - b.price;
    if (sort === 'precio-desc') return b.price  - a.price;
    if (sort === 'rating')      return b.rating - a.rating;
    return 0;
  });

  const chip = (active: boolean) =>
    `inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13.5px] font-semibold border transition-all cursor-pointer ${
      active
        ? 'bg-[#8125E2] border-[#8125E2] text-white'
        : 'bg-white border-gray-200 text-gray-600 hover:border-[#8125E2] hover:text-[#8125E2]'
    }`;

  const filterBtn =
    'inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13.5px] font-semibold border border-gray-200 bg-white text-gray-600 hover:border-[#8125E2] hover:text-[#8125E2] transition-all';

  const activeName = city !== 'todas' ? cityName(city) : null;

  return (
    <div className="bg-white min-h-screen">

      {/* ── Page header ── */}
      <div className="border-b border-gray-100" style={{ paddingTop: 74 }}>
        <div className="max-w-[1200px] mx-auto px-8 pt-10 pb-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] text-gray-400 font-medium mb-6">
            <Link href="/" className="hover:text-[#8125E2] transition-colors">Inicio</Link>
            <Icon name="chevR" size={13} />
            <span className={activeName ? 'hover:text-[#8125E2] cursor-pointer transition-colors' : 'text-gray-700 font-semibold'}
              onClick={() => activeName && setCity('todas')}>
              Fincas
            </span>
            {activeName && (
              <>
                <Icon name="chevR" size={13} />
                <span className="text-gray-700 font-semibold">{activeName}</span>
              </>
            )}
          </nav>

          {/* Title */}
          <h1 className="text-[40px] font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
            {activeName ? `Fincas en ${activeName}` : 'Encuentra tu finca ideal'}
          </h1>
          <p className="text-gray-400 text-[16px] mb-8 max-w-[560px]">
            {activeName
              ? `${list.length} fincas disponibles en ${activeName} — disponibilidad verificada y reserva inmediata.`
              : 'Del piedemonte llanero al Eje Cafetero — disponibilidad verificada y reserva inmediata.'}
          </p>

          {/* City filter chips */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button className={chip(city === 'todas')} onClick={() => changeCity('todas')}>
              Todos los destinos
            </button>
            {cities.map((c) => (
              <button key={c.key} className={chip(city === c.key)} onClick={() => changeCity(c.key)}>
                <Icon name="pin" size={13} /> {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter bar — sticky ── */}
      <div className="sticky top-[68px] z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button className={chip(onlyAvail)} onClick={() => setOnlyAvail(!onlyAvail)}>
            <span className="w-2 h-2 rounded-full" style={{ background: onlyAvail ? '#fff' : '#1f9d57' }} />
            Solo disponibles
          </button>
          <button className={filterBtn} onClick={cycleGuests}>
            <Icon name="users" size={15} />
            {guests ? `${guests}+ personas` : 'Capacidad'}
            <Icon name="chevD" size={13} />
          </button>
          <button className={filterBtn}>
            <Icon name="sparkle" size={15} /> Amenidades <Icon name="chevD" size={13} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-[13.5px]">
            <b className="text-gray-700">{list.length}</b> {list.length === 1 ? 'finca' : 'fincas'}
          </span>
          <button className={filterBtn} onClick={cycleSort}>
            <Icon name="filter" size={15} /> {SORT_LABELS[sort]} <Icon name="chevD" size={13} />
          </button>
        </div>
      </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-8 pb-24">
        {list.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((f) => <FarmCard key={f.id} finca={f} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <OwlMark size={52} head="#dcc8f8" cut="white" />
            <p className="text-gray-700 font-bold text-[17px] mt-5">
              Ninguna finca coincide con tu búsqueda
            </p>
            <p className="text-gray-400 text-[14px] mt-2 mb-6">
              Prueba ajustando los filtros o explora otro destino.
            </p>
            <button
              className="inline-flex items-center gap-2 bg-[#8125E2] text-white px-6 py-3 rounded-xl font-bold text-[14px] hover:bg-[#7720d1] transition-colors"
              onClick={() => { setCity('todas'); setOnlyAvail(false); setGuests(0); }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
