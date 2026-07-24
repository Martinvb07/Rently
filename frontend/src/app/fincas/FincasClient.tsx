'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Finca, City, AmenityKey } from '@/types';
import { fmtCOP } from '@/lib/data';
import FarmCard from '@/components/fincas/FarmCard';
import FadeIn from '@/components/ui/FadeIn';
import SkeletonCard, { SkeletonList } from '@/components/fincas/SkeletonCard';
import Icon from '@/components/ui/Icon';
import OwlMark from '@/components/ui/OwlMark';
import DateRangePicker from '@/components/ui/DateRangePicker';

const MapView = dynamic(() => import('@/components/fincas/MapView'), { ssr: false });

/* ─── Metadatos ──────────────────────────────────── */
const CITY_META: Record<string, { bg: string; color: string; icon: string }> = {
  acacias:       { bg: '#e8f5e9', color: '#2e7d32', icon: 'leaf'     },
  villavicencio: { bg: '#e3f2fd', color: '#1565c0', icon: 'mountain' },
  melgar:        { bg: '#fff8e1', color: '#e65100', icon: 'sun'      },
  anapoima:      { bg: '#fce4ec', color: '#c62828', icon: 'star'     },
  santafe:       { bg: '#f3e5f5', color: '#6a1b9a', icon: 'home'     },
  salento:       { bg: '#e8f5e9', color: '#1b5e20', icon: 'leaf'     },
};

type FilterAmenity = string;
const FILTER_AMENITIES: { key: FilterAmenity; icon: string; label: string; dataKey?: AmenityKey }[] = [
  { key: 'piscina',     icon: 'pool',     label: 'Piscina',         dataKey: 'piscina'     },
  { key: 'jacuzzi',     icon: 'pool',     label: 'Jacuzzi'                                 },
  { key: 'bbq',         icon: 'bbq',      label: 'BBQ / Asador',    dataKey: 'bbq'         },
  { key: 'wifi',        icon: 'wifi',     label: 'WiFi',            dataKey: 'wifi'        },
  { key: 'parqueadero', icon: 'parking',  label: 'Parqueadero',     dataKey: 'parqueadero' },
  { key: 'aire',        icon: 'ac',       label: 'Aire acond.',     dataKey: 'aire'        },
  { key: 'rio',         icon: 'river',    label: 'Acceso a río',    dataKey: 'rio'         },
  { key: 'fogata',      icon: 'fire',     label: 'Zona de fogata'                          },
  { key: 'hamacas',     icon: 'hammock',  label: 'Hamacas'                                 },
  { key: 'caballos',    icon: 'horse',    label: 'Cabalgatas'                              },
  { key: 'cancha',      icon: 'sport',    label: 'Cancha deportiva'                        },
  { key: 'kiosko',      icon: 'gazebo',   label: 'Kiosko / Pérgola'                       },
  { key: 'salon',       icon: 'home',     label: 'Salón social'                            },
  { key: 'cocina',      icon: 'kitchen',  label: 'Cocina completa'                         },
  { key: 'tv',          icon: 'tv',       label: 'TV / Cable'                              },
  { key: 'chimenea',    icon: 'fire',     label: 'Chimenea'                                },
  { key: 'senderos',    icon: 'mountain', label: 'Senderos eco.'                           },
  { key: 'billar',      icon: 'billiard', label: 'Billar'                                  },
  { key: 'zona_ninos',  icon: 'users',    label: 'Zona infantil'                           },
  { key: 'seguridad',   icon: 'security', label: 'Seguridad 24h'                           },
];

const SORT_LABELS: Record<string, string> = {
  destacados: 'Destacados', 'precio-asc': 'Menor precio', 'precio-desc': 'Mayor precio',
  rating: 'Mejor valorados', distancia: 'Por distancia',
};
const SORT_ORDER = ['destacados', 'precio-asc', 'precio-desc', 'rating'];

const PRICE_MIN = 0;
const PRICE_MAX = 1500000;
const PRICE_STEP = 50000;

type ViewMode   = 'grid' | 'list' | 'mapa';
type FilterOpen = 'mas' | 'amenidades' | 'sort' | 'precio' | 'fechas' | null;

interface Props {
  fincas: Finca[]; cities: City[]; initialCity: string;
  initialCheckIn?: string; initialCheckOut?: string;
  initialAdults?: number; initialChildren?: number; initialBabies?: number;
}

const DROP      = 'search-drop absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-2xl';
const DROP_STYLE = { border: '1.5px solid #e2dcec', boxShadow: '0 20px 48px rgba(33,27,46,.14)' };

/* ─── Price Range Slider ─────────────────────────── */
function PriceSlider({ lo, hi, onLo, onHi }: { lo: number; hi: number; onLo: (v: number) => void; onHi: (v: number) => void }) {
  const pct = (v: number) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  return (
    <div className="relative h-6 flex items-center mx-1">
      <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
      <div className="absolute h-1.5 bg-[#8125E2] rounded-full"
        style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
      <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={lo}
        onChange={(e) => onLo(Math.min(+e.target.value, hi - PRICE_STEP))}
        className="price-thumb" style={{ zIndex: lo > PRICE_MAX * 0.7 ? 5 : 3 }} />
      <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={hi}
        onChange={(e) => onHi(Math.max(+e.target.value, lo + PRICE_STEP))}
        className="price-thumb" style={{ zIndex: 4 }} />
    </div>
  );
}

/* ─── Animated count con dirección ─────────────────── */
function AnimCount({ n }: { n: number }) {
  const [prev, setPrev] = useState(n);
  const dir = n > prev ? 'up' : n < prev ? 'down' : null;
  useEffect(() => { setPrev(n); }, [n]);
  return (
    <b key={n} className="text-gray-700 inline-block"
      style={{ animation: dir ? `${dir === 'up' ? 'countUp' : 'countDown'} .25s cubic-bezier(.2,.8,.3,1) both` : undefined }}>
      {n}
    </b>
  );
}

/* ─── Skeleton Finca del Mes ─────────────────────── */
function SkeletonFincaDelMes() {
  return (
    <div className="rounded-2xl overflow-hidden mb-10 bg-gray-200 animate-pulse" style={{ minHeight: 240 }} />
  );
}

/* ─── Distancia entre coordenadas ───────────────── */
const CITY_COORDS: Record<string, [number, number]> = {
  'Acacías':               [3.9876, -73.7534],
  'Villavicencio':         [4.1420, -73.6266],
  'Melgar':                [4.2053, -74.6450],
  'Anapoima':              [4.5500, -74.5419],
  'Santa Fe de Antioquia': [6.5566, -75.8257],
  'Salento':               [4.6388, -75.5714],
};
function haversine([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ─── Main ───────────────────────────────────────── */
export default function FincasClient({ fincas, cities, initialCity, initialCheckIn, initialCheckOut, initialAdults, initialChildren, initialBabies }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const filterRef       = useRef<HTMLDivElement>(null);
  const [filterSheet, setFilterSheet] = useState(false);

  const [city,       setCity]       = useState(initialCity);
  const [adults,     setAdultsF]    = useState(initialAdults ?? 0);
  const [children,   setChildrenF]  = useState(initialChildren ?? 0);
  const [babies,     setBabiesF]    = useState(initialBabies ?? 0);
  const minCap = adults + children + babies;
  const [amenFilter, setAmenFilter] = useState<Set<FilterAmenity>>(new Set());
  const [sort,       setSort]       = useState('destacados');
  const [view,       setView]       = useState<ViewMode>('grid');
  const [openFilter, setOpenFilter] = useState<FilterOpen>(null);
  const [query,      setQuery]      = useState('');
  const [minPrice,   setMinPrice]   = useState(PRICE_MIN);
  const [maxPrice,   setMaxPrice]   = useState(PRICE_MAX);
  const [compare,    setCompare]    = useState<Set<string>>(new Set());
  const [loading,    setLoading]    = useState(false);
  const [checkIn,    setCheckIn]    = useState(initialCheckIn ?? '');
  const [checkOut,   setCheckOut]   = useState(initialCheckOut ?? '');
  const [userCoords, setUserCoords] = useState<[number,number]|null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  /* Close dropdown on outside click */
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setOpenFilter(null);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  /* Sync URL when filters change — conserva checkin/checkout/huéspedes para que
     "volver" desde el detalle de una finca no borre la búsqueda activa */
  const syncURL = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams();
    if (updates.ciudad && updates.ciudad !== 'todas') params.set('ciudad', updates.ciudad);
    if (updates.q)       params.set('q',       updates.q);
    if (updates.sort && updates.sort !== 'destacados') params.set('sort', updates.sort);
    if (checkIn)  params.set('checkin',  checkIn);
    if (checkOut) params.set('checkout', checkOut);
    if (adults)   params.set('adultos', String(adults));
    if (children) params.set('ninos',   String(children));
    if (babies)   params.set('bebes',   String(babies));
    const qs = params.toString();
    router.push(`${pathname}${qs ? '?' + qs : ''}`, { scroll: false });
  }, [router, pathname, checkIn, checkOut, adults, children, babies]);

  const cityData   = cities.find((c) => c.key === city);
  const cityName   = (k: string) => cities.find((c) => c.key === k)?.name ?? '';
  const activeName = city !== 'todas' ? cityName(city) : null;

  const scrollTop  = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const changeCity = (k: string) => {
    setCity(k); scrollTop();
    syncURL({ ciudad: k, q: query, sort });
  };

  const toggleAmen = (key: FilterAmenity) => {
    setAmenFilter((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };
  const toggleCompare = (id: string) => {
    setCompare((prev) => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); return n; }
      if (n.size >= 3) return prev;
      n.add(id); return n;
    });
  };

  const activeDataAmenities = [...amenFilter]
    .map((k) => FILTER_AMENITIES.find((a) => a.key === k)?.dataKey)
    .filter(Boolean) as AmenityKey[];

  /* Una finca ocupada no es un resultado válido de búsqueda — se excluye siempre,
     no solo cuando el usuario activa un filtro extra */
  let list = useMemo(() => fincas
    .filter((f) => f.status === 'disponible')
    .filter((f) => city === 'todas' || f.city === cityName(city))
    .filter((f) => !minCap || f.capacity >= minCap)
    .filter((f) => f.price >= minPrice && f.price <= maxPrice)
    .filter((f) => activeDataAmenities.length === 0 || activeDataAmenities.every((a) => f.amenities.includes(a)))
    .filter((f) => !query.trim() || f.name.toLowerCase().includes(query.toLowerCase()) || f.city.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'precio-asc')  return a.price - b.price;
      if (sort === 'precio-desc') return b.price - a.price;
      if (sort === 'rating')      return b.rating - a.rating;
      if (sort === 'distancia' && userCoords) {
        const coordA = CITY_COORDS[a.city], coordB = CITY_COORDS[b.city];
        if (!coordA || !coordB) return 0;
        return haversine(userCoords, coordA) - haversine(userCoords, coordB);
      }
      return 0;
    }), [fincas, city, minCap, minPrice, maxPrice, sort, query, amenFilter, userCoords]);

  /* Simulate loading when filters change */
  const [displayList, setDisplayList] = useState(list);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => { setDisplayList(list); setLoading(false); }, 280);
    return () => clearTimeout(t);
  }, [list]);

  const activeFilters = (minCap ? 1 : 0) + amenFilter.size
    + (sort !== 'destacados' && sort !== 'distancia' ? 1 : 0)
    + (minPrice > PRICE_MIN || maxPrice < PRICE_MAX ? 1 : 0)
    + (query ? 1 : 0)
    + (checkIn ? 1 : 0);

  /* Geolocation handler */
  const requestGeo = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserCoords([pos.coords.latitude, pos.coords.longitude]); setSort('distancia'); setGeoLoading(false); },
      () => setGeoLoading(false),
    );
  };

  /* "Finca del mes" = best rating not already shown */
  const fincaDelMes = useMemo(() => [...fincas].sort((a, b) => b.rating - a.rating)[0], [fincas]);

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-all cursor-pointer whitespace-nowrap flex-none ${
      active ? 'chip-active' : 'bg-white border-gray-200 text-gray-600 hover:border-[#8125E2] hover:text-[#8125E2]'
    }`;
  const filterBtn = (active: boolean) =>
    `relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-all cursor-pointer whitespace-nowrap flex-none ${
      active ? 'chip-active' : 'bg-white border-gray-200 text-gray-600 hover:border-[#8125E2] hover:text-[#8125E2]'
    }`;

  const clearAll = () => {
    setCity('todas'); setAdultsF(0); setChildrenF(0);
    setAmenFilter(new Set()); setSort('destacados'); setQuery('');
    setMinPrice(PRICE_MIN); setMaxPrice(PRICE_MAX);
    setCheckIn(''); setCheckOut(''); setUserCoords(null);
    setBabiesF(0);
  };

  /* Empty state — sugerencias fuzzy por ciudad */
  const suggestions = useMemo(() => {
    if (displayList.length > 0 || !query) return [];
    return cities.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase().slice(0, 4))
      && c.name.toLowerCase() !== query.toLowerCase()
    ).slice(0, 3);
  }, [displayList.length, query, cities]);

  return (
    <div className="bg-white min-h-screen">

      {/* ── Page header ── */}
      <div style={{ paddingTop: 68 }}>
        {activeName && cityData?.imageUrl ? (
          <div className="relative h-52 overflow-hidden">
            <Image src={cityData.imageUrl} alt={activeName} fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
            <div className="absolute inset-0 flex flex-col justify-end">
              <div className="max-w-[1200px] mx-auto px-5 md:px-8 pb-8 w-full">
                <nav className="flex items-center gap-2 text-[13px] text-white/65 font-medium mb-3">
                  <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
                  <Icon name="chevR" size={13} />
                  <button className="hover:text-white transition-colors" onClick={() => changeCity('todas')}>Fincas</button>
                  <Icon name="chevR" size={13} />
                  <span className="text-white font-semibold">{activeName}</span>
                </nav>
                <h1 className="text-white font-extrabold tracking-tight" style={{ fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.1 }}>
                  Fincas en {activeName}
                </h1>
                <p className="text-white/75 text-[15px] mt-1.5">{cityData.dept} · {displayList.length} {displayList.length === 1 ? 'finca' : 'fincas'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b border-gray-100">
            <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-10 pb-7">
              <nav className="flex items-center gap-2 text-[13px] text-gray-400 font-medium mb-5">
                <Link href="/" className="hover:text-[#8125E2] transition-colors">Inicio</Link>
                <Icon name="chevR" size={13} />
                <span className="text-gray-700 font-semibold">Fincas</span>
              </nav>
              <h1 className="text-[38px] font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
                Encuentra tu finca ideal
              </h1>
              <p className="text-gray-400 text-[15px] max-w-[520px]">
                Del piedemonte llanero al Eje Cafetero — disponibilidad verificada, reserva inmediata.
              </p>
            </div>
          </div>
        )}

        {/* ── City chips ── */}
        <div className={activeName ? 'bg-white border-b border-gray-100' : ''}>
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar" style={{ flexWrap: 'nowrap' }}>
            <button className={chip(city === 'todas')} onClick={() => changeCity('todas')}>
              Todos los destinos
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${city === 'todas' ? 'bg-white text-[#8125E2]' : 'bg-gray-100 text-gray-500'}`}>{fincas.length}</span>
            </button>
            {cities.map((c) => {
              const meta = CITY_META[c.key] ?? { bg: '#f0ebfe', color: '#8125E2', icon: 'pin' };
              const isActive = city === c.key;
              return (
                <button key={c.key} className={chip(isActive)} onClick={() => changeCity(c.key)}>
                  <span className="w-5 h-5 rounded-full grid place-items-center flex-none"
                    style={isActive ? { background: 'rgba(255,255,255,.25)', color: '#fff' } : { background: meta.bg, color: meta.color }}>
                    <Icon name={meta.icon} size={11} />
                  </span>
                  {c.name}
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-[#8125E2]' : 'bg-gray-100 text-gray-500'}`}>{c.count}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100" style={{ overflow: 'visible' }}>

        {/* MOBILE: barra simplificada */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 gap-3">
          <label className="flex items-center gap-2 flex-1 px-3.5 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-[13px] focus-within:border-[#8125E2] transition-all">
            <Icon name="search" size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar finca…"
              className="outline-none bg-transparent w-full text-[13px] font-medium text-gray-700 placeholder:text-gray-400 min-w-0" />
          </label>
          <button
            onClick={() => setFilterSheet(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 hover:border-[#8125E2] whitespace-nowrap flex-none transition-all"
            style={activeFilters > 0 ? { background: '#8125E2', borderColor: '#8125E2', color: '#fff' } : {}}
          >
            <Icon name="filter" size={14} />
            Filtros {activeFilters > 0 && `(${activeFilters})`}
          </button>
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white flex-none">
            {([['grid','grid'],['list','list'],['mapa','pin']] as const).map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)} aria-label={v}
                className="px-2.5 py-1.5 transition-colors"
                style={view === v ? { background: '#8125E2', color: '#fff' } : { color: '#6b7280' }}>
                <Icon name={icon} size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* DESKTOP: barra completa */}
        <div ref={filterRef} className="hidden md:flex max-w-[1200px] mx-auto px-8 items-center gap-2" style={{ height: 60 }}>

          {/* IZQUIERDA — sin overflow, sin wrap */}
          <div className="flex items-center gap-2 flex-1 min-w-0" style={{ flexWrap: 'nowrap', overflow: 'visible' }}>

            {/* 🔍 Búsqueda por texto */}
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-[13px] focus-within:border-[#8125E2] transition-all flex-none" style={{ width: 172 }}>
              <Icon name="search" size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar finca…"
                className="outline-none bg-transparent w-full text-[13px] font-medium text-gray-700 placeholder:text-gray-400 min-w-0"
              />
              {query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={13} /></button>}
            </label>

            {/* Filtro por fechas — mismo estilo que HeroSearch */}
            <div className="relative">
              <button className={filterBtn(!!(checkIn || checkOut))}
                onClick={(e) => { e.stopPropagation(); setOpenFilter(openFilter === 'fechas' ? null : 'fechas'); }}>
                <Icon name="calendar" size={14} />
                {(checkIn || checkOut) ? <><span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />Fechas</> : 'Fechas'}
                <Icon name="chevD" size={12} />
              </button>
              {openFilter === 'fechas' && (
                <div className={`search-drop ${DROP} w-[320px]`} style={DROP_STYLE} onClick={(e) => e.stopPropagation()}>
                  <DateRangePicker
                    sel={{
                      start: checkIn ? new Date(checkIn + 'T00:00:00') : null,
                      end:   checkOut ? new Date(checkOut + 'T00:00:00') : null,
                    }}
                    setSel={(s) => {
                      setCheckIn(s.start ? s.start.toISOString().split('T')[0] : '');
                      setCheckOut(s.end   ? s.end.toISOString().split('T')[0]   : '');
                    }}
                    onApply={() => setOpenFilter(null)}
                    onClear={() => { setCheckIn(''); setCheckOut(''); }}
                    applyLabel="Aplicar fechas"
                  />
                </div>
              )}
            </div>

            {/* Rango de precio */}
            <div className="relative">
              <button className={filterBtn(minPrice > PRICE_MIN || maxPrice < PRICE_MAX)}
                onClick={(e) => { e.stopPropagation(); setOpenFilter(openFilter === 'precio' ? null : 'precio'); }}>
                <Icon name="money" size={14} />
                {(minPrice > PRICE_MIN || maxPrice < PRICE_MAX)
                  ? <><span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />Precio</>
                  : 'Precio'}
                <Icon name="chevD" size={12} />
              </button>
              {openFilter === 'precio' && (
                <div className={`${DROP} w-[360px]`} style={DROP_STYLE} onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    <p className="text-[15px] font-extrabold text-gray-900 mb-1">Rango de precio</p>
                    <p className="text-[13px] text-gray-400 mb-6">Precio por noche en COP</p>

                    {/* Precios actuales destacados */}
                    <div className="flex justify-between mb-2">
                      <div className="text-center">
                        <p className="text-[11px] text-gray-400 font-medium mb-1">Mínimo</p>
                        <p className="text-[18px] font-extrabold text-[#8125E2]">{fmtCOP(minPrice)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-gray-400 font-medium mb-1">Máximo</p>
                        <p className="text-[18px] font-extrabold text-[#8125E2]">{fmtCOP(maxPrice)}</p>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="py-4">
                      <PriceSlider lo={minPrice} hi={maxPrice} onLo={setMinPrice} onHi={setMaxPrice} />
                    </div>

                    {/* Quick picks — 2×2 grid, más cómodo */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {[
                        [0, PRICE_MAX,  'Cualquier precio'],
                        [0, 600000,     'Hasta $600.000'],
                        [600000, 900000,'$600K – $900K'],
                        [900000, PRICE_MAX, 'Más de $900.000'],
                      ].map(([mn, mx, lbl]) => {
                        const act = mn === minPrice && mx === maxPrice;
                        return (
                          <button key={String(lbl)}
                            onClick={() => { setMinPrice(Number(mn)); setMaxPrice(Number(mx)); }}
                            className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all text-center ${act ? 'chip-active' : 'bg-gray-50 text-gray-600 hover:bg-[#f0ebfe] hover:text-[#8125E2]'}`}>
                            {String(lbl)}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      className="w-full mt-5 py-3 rounded-xl font-bold text-[14px] text-white hover:opacity-90 active:scale-[.98] transition-all"
                      style={{ background: '#8125E2', boxShadow: '0 4px 14px rgba(129,37,226,.35)' }}
                      onClick={() => setOpenFilter(null)}
                    >
                      Aplicar filtro
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Capacidad */}
            <div className="relative">
              <button className={filterBtn(minCap > 0)}
                onClick={(e) => { e.stopPropagation(); setOpenFilter(openFilter === 'mas' ? null : 'mas'); }}>
                <Icon name="users" size={14} />
                {minCap > 0 ? <><span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />Capacidad</> : 'Capacidad'}
                <Icon name="chevD" size={12} />
              </button>
              {openFilter === 'mas' && (
                <div className={`search-drop ${DROP} w-[300px]`} style={DROP_STYLE} onClick={(e) => e.stopPropagation()}>
                  <div className="px-5 pt-5 pb-4">
                    <p className="text-[13px] font-extrabold text-gray-800 mb-1">¿Quiénes van?</p>
                    <p className="text-[12px] text-gray-400 mb-4">Selecciona adultos, niños y bebés</p>
                    {[
                      { label: 'Adultos', sub: 'Mayores de 15 años', val: adults,   set: setAdultsF,   min: 0 },
                      { label: 'Niños',   sub: 'De 3 a 14 años',    val: children, set: setChildrenF, min: 0 },
                      { label: 'Bebés',   sub: 'De 0 a 2 años',     val: babies,   set: setBabiesF,   min: 0 },
                    ].map(({ label, sub, val, set, min }) => (
                      <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-semibold text-gray-900 text-[14px]">{label}</p>
                          <p className="text-gray-400 text-[12px] mt-0.5">{sub}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button disabled={val <= min} onClick={() => set(Math.max(min, val - 1))}
                            className="w-8 h-8 rounded-full grid place-items-center text-gray-500 transition-all disabled:opacity-30 hover:text-[#8125E2]"
                            style={{ border: '1.5px solid #d1d5db' }}>
                            <Icon name="minus" size={13} />
                          </button>
                          <span className="font-bold text-gray-900 text-[16px] min-w-[20px] text-center">{val}</span>
                          <button onClick={() => set(val + 1)}
                            className="w-8 h-8 rounded-full grid place-items-center text-gray-500 transition-all hover:text-[#8125E2]"
                            style={{ border: '1.5px solid #d1d5db' }}>
                            <Icon name="plus" size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full mt-4 py-3 rounded-xl font-bold text-[14px] text-white hover:opacity-90 active:scale-[.97] transition-all"
                      style={{ background: '#8125E2', boxShadow: '0 4px 14px rgba(129,37,226,.3)' }}
                      onClick={() => setOpenFilter(null)}>
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Amenidades */}
            <div className="relative">
              <button className={filterBtn(amenFilter.size > 0)}
                onClick={(e) => { e.stopPropagation(); setOpenFilter(openFilter === 'amenidades' ? null : 'amenidades' as FilterOpen); }}>
                <Icon name="sparkle" size={14} />
                {amenFilter.size ? <><span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />Amenidades</> : 'Amenidades'}
                <Icon name="chevD" size={12} />
              </button>
              {openFilter === ('amenidades' as FilterOpen) && (
                <div className={`search-drop ${DROP} w-[480px]`} style={DROP_STYLE} onClick={(e) => e.stopPropagation()}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[13px] font-extrabold text-gray-800">Comodidades</p>
                      {amenFilter.size > 0 && <button className="text-[12px] font-bold text-[#8125E2] hover:underline" onClick={() => setAmenFilter(new Set())}>Limpiar ({amenFilter.size})</button>}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {FILTER_AMENITIES.map((a) => {
                        const active = amenFilter.has(a.key);
                        return (
                          <button key={a.key} onClick={() => toggleAmen(a.key)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border text-center ${active ? 'chip-active border-transparent' : 'bg-gray-50 border-transparent text-gray-700 hover:bg-[#f0ebfe] hover:text-[#8125E2]'}`}>
                            <span className={`w-10 h-10 rounded-xl grid place-items-center ${active ? 'bg-white/20' : 'bg-white'}`}>
                              <Icon name={a.icon} size={20} style={{ color: active ? '#fff' : '#8125E2' }} />
                            </span>
                            <span className="text-[11px] font-semibold leading-tight">{a.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DERECHA — controles fijos */}
          <div className="flex items-center gap-2 flex-none border-l border-gray-100 pl-3 ml-1">
            {activeFilters > 0 && (
              <button onClick={clearAll}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] font-bold bg-[#f0ebfe] text-[#8125E2] border border-[#c0a0f1] hover:bg-[#ece1fb] transition-all whitespace-nowrap flex-none">
                {activeFilters} <Icon name="x" size={11} />
              </button>
            )}
            <span className="text-gray-400 text-[13px] whitespace-nowrap hidden sm:flex items-center gap-1">
              <AnimCount n={displayList.length} /> {displayList.length === 1 ? 'finca' : 'fincas'}
            </span>

            {/* Sort + Cerca de mí en un solo dropdown */}
            <div className="relative">
              <button className={filterBtn(sort !== 'destacados')}
                onClick={(e) => { e.stopPropagation(); setOpenFilter(openFilter === 'sort' ? null : 'sort'); }}>
                <Icon name="filter" size={14} />
                <span className="hidden sm:inline">{SORT_LABELS[sort] ?? 'Ordenar'}</span>
                <Icon name="chevD" size={12} />
              </button>
              {openFilter === 'sort' && (
                <div className={`${DROP} right-0 left-auto w-[230px]`} style={DROP_STYLE} onClick={(e) => e.stopPropagation()}>
                  <div className="p-2">
                    <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide px-3 pt-1 pb-2">Ordenar por</p>
                    {SORT_ORDER.map((s) => (
                      <button key={s} onClick={() => { setSort(s); setOpenFilter(null); }}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${sort === s ? 'bg-[#f0ebfe] text-[#8125E2]' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {SORT_LABELS[s]}{sort === s && <Icon name="check" size={14} style={{ color: '#8125E2' }} />}
                      </button>
                    ))}
                    {/* Cerca de mí — solo sin filtros */}
                    {activeFilters === 0 && (
                      <>
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={() => { requestGeo(); setOpenFilter(null); }}
                          disabled={geoLoading}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${sort === 'distancia' ? 'bg-[#f0ebfe] text-[#8125E2]' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon name="pin" size={14} />
                            {geoLoading ? 'Buscando ubicación…' : 'Cerca de mí'}
                          </span>
                          {sort === 'distancia' && <Icon name="check" size={14} style={{ color: '#8125E2' }} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* View toggle — sliding switch */}
            {(() => {
              const opts = [
                { v: 'grid' as ViewMode, icon: 'grid'  },
                { v: 'list' as ViewMode, icon: 'list'  },
                { v: 'mapa' as ViewMode, icon: 'pin'   },
              ];
              const idx = opts.findIndex((o) => o.v === view);
              return (
                <div
                  className="relative flex items-center bg-white rounded-full"
                  style={{ border: '1.5px solid #e2dcec', padding: 3 }}
                >
                  {/* Sliding purple pill */}
                  <span
                    className="absolute rounded-full transition-all duration-200"
                    style={{
                      background: '#8125E2',
                      boxShadow: '0 2px 8px rgba(129,37,226,.35)',
                      width:  'calc((100% - 6px) / 3)',
                      height: 'calc(100% - 6px)',
                      top: 3,
                      left: `calc(3px + ${idx} * (100% - 6px) / 3)`,
                    }}
                  />
                  {opts.map(({ v, icon }) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      aria-label={v}
                      className="relative z-10 px-3 py-2 transition-colors duration-150"
                      style={{ color: view === v ? '#fff' : '#9ca3af' }}
                    >
                      <Icon name={icon} size={15} />
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Mobile filter bottom sheet ── */}
      {filterSheet && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[88vh] overflow-y-auto"
            style={{ animation: 'pop .3s cubic-bezier(.2,.8,.3,1.1)' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="text-[16px] font-extrabold text-gray-900">Filtros</p>
              {activeFilters > 0 && (
                <button onClick={() => { clearAll(); }} className="text-[13px] font-bold text-[#8125E2] hover:underline">
                  Limpiar todo
                </button>
              )}
            </div>
            <div className="px-5 py-4 space-y-6">

              {/* Fechas */}
              <div>
                <p className="text-[14px] font-extrabold text-gray-800 mb-3">Fechas</p>
                <DateRangePicker
                  sel={{ start: checkIn ? new Date(checkIn+'T00:00:00') : null, end: checkOut ? new Date(checkOut+'T00:00:00') : null }}
                  setSel={(s) => { setCheckIn(s.start ? s.start.toISOString().split('T')[0] : ''); setCheckOut(s.end ? s.end.toISOString().split('T')[0] : ''); }}
                  applyLabel="Aplicar fechas"
                />
              </div>

              {/* Precio */}
              <div>
                <p className="text-[14px] font-extrabold text-gray-800 mb-2">Precio por noche</p>
                <div className="flex justify-between text-[13px] font-bold text-[#8125E2] mb-3">
                  <span>{fmtCOP(minPrice)}</span><span>{fmtCOP(maxPrice)}</span>
                </div>
                <PriceSlider lo={minPrice} hi={maxPrice} onLo={setMinPrice} onHi={setMaxPrice} />
              </div>

              {/* Capacidad */}
              <div>
                <p className="text-[14px] font-extrabold text-gray-800 mb-3">¿Quiénes van?</p>
                {[
                  { label: 'Adultos', sub: 'Mayores de 15 años', val: adults,   set: setAdultsF,   min: 0 },
                  { label: 'Niños',   sub: 'De 3 a 14 años',    val: children, set: setChildrenF, min: 0 },
                  { label: 'Bebés',   sub: 'De 0 a 2 años',     val: babies,   set: setBabiesF,   min: 0 },
                ].map(({ label, sub, val, set, min }) => (
                  <div key={label} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                    <div><p className="font-semibold text-gray-900">{label}</p><p className="text-gray-400 text-[12px]">{sub}</p></div>
                    <div className="flex items-center gap-4">
                      <button disabled={val <= min} onClick={() => set(Math.max(min, val-1))}
                        className="w-9 h-9 rounded-full grid place-items-center text-gray-600 disabled:opacity-30 hover:text-[#8125E2]"
                        style={{ border: '1.5px solid #d1d5db' }}><Icon name="minus" size={14} /></button>
                      <span className="font-extrabold text-gray-900 text-[18px] min-w-[24px] text-center">{val}</span>
                      <button onClick={() => set(val+1)}
                        className="w-9 h-9 rounded-full grid place-items-center text-gray-600 hover:text-[#8125E2]"
                        style={{ border: '1.5px solid #d1d5db' }}><Icon name="plus" size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Amenidades */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[14px] font-extrabold text-gray-800">Comodidades</p>
                  {amenFilter.size > 0 && <button className="text-[13px] font-bold text-[#8125E2]" onClick={() => setAmenFilter(new Set())}>Limpiar</button>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {FILTER_AMENITIES.map((a) => {
                    const active = amenFilter.has(a.key);
                    return (
                      <button key={a.key} onClick={() => toggleAmen(a.key)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all ${active ? 'chip-active border-transparent' : 'bg-gray-50 border-transparent text-gray-700'}`}>
                        <span className={`w-10 h-10 rounded-xl grid place-items-center ${active ? 'bg-white/20' : 'bg-white'}`}>
                          <Icon name={a.icon} size={20} style={{ color: active ? '#fff' : '#8125E2' }} />
                        </span>
                        <span className="text-[11px] font-semibold leading-tight">{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Apply */}
            <div className="px-5 pb-8 pt-3 border-t border-gray-100">
              <button
                className="w-full py-4 rounded-2xl font-bold text-[15px] text-white hover:opacity-90 active:scale-[.98] transition-all"
                style={{ background: '#8125E2', boxShadow: '0 4px 16px rgba(129,37,226,.35)' }}
                onClick={() => setFilterSheet(false)}
              >
                Ver {displayList.length} {displayList.length === 1 ? 'finca' : 'fincas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Resultados ── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 pb-24">

        {/* ── Finca del mes con skeleton ── */}
        {view === 'grid' && activeFilters === 0 && city === 'todas' && (
          loading ? <SkeletonFincaDelMes /> : <FadeIn>
            <div className="relative rounded-2xl overflow-hidden mb-10 flex items-end" style={{ minHeight: 240, background: '#120e1c' }}>
              <Image src={fincaDelMes.imageUrl} alt={fincaDelMes.name} fill className="object-cover opacity-60" sizes="1200px" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-5 md:p-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 w-full">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-[#8125E2] text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3">
                    <Icon name="trophy" size={12} /> Finca del mes
                  </span>
                  <h2 className="text-white font-extrabold text-[22px] md:text-[32px] tracking-tight leading-tight">{fincaDelMes.name}</h2>
                  <p className="text-white/70 text-[13px] mt-1 flex items-center gap-1.5">
                    <Icon name="pin" size={12} /> {fincaDelMes.city}, {fincaDelMes.dept}
                  </p>
                  <p className="text-white/60 text-[12px] mt-1 max-w-[320px] line-clamp-1 hidden sm:block">{fincaDelMes.tagline}</p>
                </div>
                <div className="flex items-center gap-3 sm:block sm:text-right">
                  <div>
                    <p className="text-white/60 text-[12px] font-medium hidden sm:block">Desde</p>
                    <p className="text-white font-extrabold text-[20px] md:text-[24px]">{fmtCOP(fincaDelMes.price)}<span className="text-[12px] font-normal text-white/60"> /noche</span></p>
                  </div>
                  <Link href={`/fincas/${fincaDelMes.id}`}
                    className="inline-flex items-center gap-2 sm:mt-3 bg-white text-[#8125E2] px-4 py-2.5 rounded-xl font-bold text-[13px] hover:bg-purple-50 transition-colors whitespace-nowrap">
                    Ver finca <Icon name="arrowR" size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ── Vista mapa — stack en mobile, lado a lado en desktop ── */}
        {view === 'mapa' && (
          <div className="flex flex-col md:flex-row gap-5" style={{ height: 'auto' }}>
            <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100" style={{ height: 400, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
              <MapView fincas={displayList} />
            </div>
            <div className="md:w-[300px] flex-none flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 400 }}>
              {displayList.map((f) => (
                <Link key={f.id} href={`/fincas/${f.id}`} className="flex gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all group">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-none bg-gray-100">
                    <Image src={f.imageUrl} alt={f.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-[13px] leading-tight truncate">{f.name}</p>
                    <p className="text-gray-400 text-[11.5px] mt-0.5 flex items-center gap-1"><Icon name="pin" size={10} />{f.city}</p>
                    <p className="text-[#8125E2] font-extrabold text-[13px] mt-1">{fmtCOP(f.price)}<span className="text-[10px] text-gray-400 font-normal">/noche</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Vista grid / lista ── */}
        {view !== 'mapa' && (
          <>
            {loading ? (
              <div className={view === 'grid' ? 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}>
                {Array.from({ length: 6 }).map((_, i) =>
                  view === 'grid' ? <SkeletonCard key={i} /> : <SkeletonList key={i} />
                )}
              </div>
            ) : displayList.length > 0 ? (
              view === 'grid' ? (
                <div key={`g-${city}-${sort}-${activeFilters}`} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {displayList.map((f, i) => (
                    <FadeIn key={f.id} delay={Math.min(i * 60, 300)}>
                      <div className="relative">
                        <FarmCard finca={f} ciudad={city} checkIn={checkIn} checkOut={checkOut} adultos={adults} ninos={children} bebes={babies} />
                        {/* Compare checkbox */}
                        <button
                          onClick={() => toggleCompare(f.id)}
                          className={`absolute top-3 left-3 w-6 h-6 rounded-md border-2 grid place-items-center transition-all z-10 ${
                            compare.has(f.id) ? 'bg-[#8125E2] border-[#8125E2]' : 'bg-white/90 border-gray-300 hover:border-[#8125E2]'
                          }`}
                          aria-label="Comparar finca"
                          style={{ top: 52 }}
                        >
                          {compare.has(f.id) && <Icon name="check" size={12} style={{ color: '#fff' }} />}
                        </button>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              ) : (
                <div key={`l-${city}-${sort}`} className="flex flex-col gap-4">
                  {displayList.map((f, i) => (
                    <FadeIn key={f.id} delay={Math.min(i * 40, 200)}>
                      <ListCard finca={f} ciudad={city} checkIn={checkIn} checkOut={checkOut} adultos={adults} ninos={children} bebes={babies} />
                    </FadeIn>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <OwlMark size={52} head="#dcc8f8" cut="white" />
                <p className="text-gray-700 font-bold text-[18px] mt-5">
                  Sin resultados{query ? ` para "${query}"` : ''}
                </p>
                <p className="text-gray-400 text-[14px] mt-2">Prueba ajustando los filtros o explora otro destino.</p>

                {/* Sugerencias de ciudad */}
                {suggestions.length > 0 && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <p className="text-[13px] text-gray-400 font-medium">¿Quisiste decir...?</p>
                    <div className="flex gap-2">
                      {suggestions.map((s) => (
                        <button key={s.key} onClick={() => changeCity(s.key)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c0a0f1] bg-[#f6f1fe] text-[#8125E2] text-[13px] font-bold hover:bg-[#ece1fb] transition-colors">
                          <Icon name="pin" size={13} /> {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={clearAll} className="mt-6 inline-flex items-center gap-2 bg-[#8125E2] text-white px-6 py-3 rounded-xl font-bold text-[14px] hover:bg-[#7720d1] transition-colors">
                  <Icon name="x" size={15} /> Limpiar filtros
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Comparador flotante ── */}
        {compare.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#120e1c] text-white rounded-2xl px-6 py-4 flex items-center gap-5" style={{ boxShadow: '0 20px 48px rgba(0,0,0,.35)' }}>
            <span className="text-[13px] font-semibold text-white/70">{compare.size} de 3 seleccionadas</span>
            <div className="flex gap-2">
              {[...compare].map((id) => {
                const f = fincas.find((x) => x.id === id);
                return f ? <span key={id} className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold">
                  {f.name}
                  <button onClick={() => toggleCompare(id)} className="text-white/50 hover:text-white"><Icon name="x" size={11} /></button>
                </span> : null;
              })}
            </div>
            <Link href={`/fincas/comparar?ids=${[...compare].join(',')}`}
              className="inline-flex items-center gap-2 bg-[#8125E2] text-white px-5 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#7720d1] transition-colors">
              Comparar <Icon name="arrowR" size={14} />
            </Link>
            <button onClick={() => setCompare(new Set())} className="text-white/50 hover:text-white"><Icon name="x" size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Vista lista card con hover de fotos ─────────── */
function ListCard({ finca, ciudad, checkIn, checkOut, adultos, ninos, bebes }: { finca: Finca; ciudad?: string; checkIn?: string; checkOut?: string; adultos?: number; ninos?: number; bebes?: number }) {
  const [hoverImg, setHoverImg] = useState(0);
  const [hovering, setHovering] = useState(false);
  const thumbs = finca.galleryUrls?.slice(0, 4) ?? [finca.imageUrl];

  const detailQS = new URLSearchParams();
  if (ciudad && ciudad !== 'todas') detailQS.set('ciudad', ciudad);
  if (checkIn)  detailQS.set('checkin', checkIn);
  if (checkOut) detailQS.set('checkout', checkOut);
  if (adultos)  detailQS.set('adultos', String(adultos));
  if (ninos)    detailQS.set('ninos',   String(ninos));
  if (bebes)    detailQS.set('bebes',   String(bebes));
  const detailHref = `/fincas/${finca.id}${detailQS.toString() ? '?' + detailQS.toString() : ''}`;

  const discountedPrice = finca.discount ? Math.round(finca.price * (1 - finca.discount / 100)) : null;
  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0;
  const stayTotal = nights > 0 ? nights * (discountedPrice ?? finca.price) : null;

  return (
    <Link href={detailHref}
      className="flex flex-col sm:flex-row gap-0 sm:gap-5 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
      {/* Imagen — full width en mobile, 208px en desktop */}
      <div className="relative w-full sm:w-52 sm:flex-none overflow-hidden bg-gray-100" style={{ minHeight: 180 }}
        onMouseEnter={() => setHovering(true)} onMouseLeave={() => { setHovering(false); setHoverImg(0); }}>
        <Image src={thumbs[hoverImg]} alt={finca.name} fill
          className="object-cover transition-all duration-300" sizes="208px" />
        {hovering && thumbs.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-0.5">
            {thumbs.map((_, i) => (
              <button key={i} className="flex-1 h-1.5 transition-colors"
                style={{ background: i === hoverImg ? '#8125E2' : 'rgba(255,255,255,.55)' }}
                onMouseEnter={(e) => { e.preventDefault(); e.stopPropagation(); setHoverImg(i); }} />
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 p-4 sm:py-5 sm:pr-5 sm:pl-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-[18px] font-extrabold text-gray-900 tracking-tight">{finca.name}</h3>
            <span className="flex items-center gap-1 text-[13px] font-semibold text-gray-700 flex-none">
              <Icon name="star" size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} stroke={0} />
              {finca.rating} <span className="text-gray-400 font-normal">({finca.reviews})</span>
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium mt-1"><Icon name="pin" size={13} /> {finca.sector}, {finca.city}, {finca.dept}</p>
          <p className="text-gray-500 text-[13.5px] mt-2 line-clamp-2 leading-relaxed max-w-[55ch]">{finca.tagline}</p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-[13px] text-gray-400 font-medium">
            <span className="flex items-center gap-1"><Icon name="users" size={13} /> {finca.capacity} personas</span>
            <span className="flex items-center gap-1"><Icon name="bed" size={13} /> {finca.bedrooms} alcobas</span>
            <span className="flex items-center gap-1"><Icon name="bath" size={13} /> {finca.baths} baños</span>
          </div>
          {stayTotal !== null ? (
            <p className="text-[19px] font-bold text-gray-900">{fmtCOP(stayTotal)}<span className="text-[12px] text-gray-400 font-normal"> por {nights} {nights === 1 ? 'noche' : 'noches'}</span></p>
          ) : (
            <p className="text-[19px] font-bold text-gray-900">{fmtCOP(discountedPrice ?? finca.price)}<span className="text-[12px] text-gray-400 font-normal"> /noche</span></p>
          )}
        </div>
      </div>
    </Link>
  );
}
