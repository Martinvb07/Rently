'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { City } from '@/types';
import Icon from '@/components/ui/Icon';
import OwlMark from '@/components/ui/OwlMark';
import CityGlyph from '@/components/ui/CityGlyph';

type Panel = 'destino' | 'fechas' | 'huespedes' | null;
interface DateSel { start: Date | null; end: Date | null; }
/* `expanded` = versión grande que baja del navbar (autoabre destino, calendario
   de dos meses y panel de fechas ancho). `onSearch` cierra ese overlay al buscar. */
interface HeroSearchProps { cities: City[]; embedded?: boolean; expanded?: boolean; onSearch?: () => void; }

const CITY_META: Record<string, { tagline: string; bg: string; color: string; icon: string }> = {
  acacias:       { tagline: 'Paz y piscina en el piedemonte llanero',    bg: '#e8f5e9', color: '#2e7d32', icon: 'leaf'     },
  villavicencio: { tagline: 'La puerta al llano colombiano',              bg: '#e3f2fd', color: '#1565c0', icon: 'mountain' },
  melgar:        { tagline: 'Tierra caliente y piscinas a 2h de Bogotá', bg: '#fff8e1', color: '#e65100', icon: 'sun'      },
  anapoima:      { tagline: 'El eterno verano de Cundinamarca',           bg: '#fce4ec', color: '#c62828', icon: 'star'     },
  santafe:       { tagline: 'Pueblo patrimonio y calor antioqueño',       bg: '#f3e5f5', color: '#6a1b9a', icon: 'home'     },
  salento:       { tagline: 'Cultura cafetera entre palmas y niebla',     bg: '#e8f5e9', color: '#1b5e20', icon: 'leaf'     },
};

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DOW   = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

function sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString(); }
function fmtShort(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}
/* YYYY-MM-DD en hora local — evita el corrimiento de día que da toISOString() en UTC */
function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* Celda de día — dos capas: una franja de fondo continua (conecta un día con el
   siguiente) y, encima, un círculo para el día exacto de inicio/fin. Así el
   rango se ve como una barra sólida con las puntas redondeadas, sin el
   "diente" que deja un círculo suelto pegado a un cuadrado. */
function DayCell({
  d, y, m, today, sel, previewEnd, onPick, onHover,
}: {
  d: number; y: number; m: number; today: Date; sel: DateSel; previewEnd: Date | null;
  onPick: (date: Date) => void; onHover: (date: Date | null) => void;
}) {
  const date      = new Date(y, m, d); date.setHours(0, 0, 0, 0);
  const isPast    = date < today;
  const isStart   = !!(sel.start && sameDay(date, sel.start));
  const isEnd     = !!(sel.end && sameDay(date, sel.end));
  const isMid     = !!(sel.start && sel.end && date > sel.start && date < sel.end);
  const isPreview = !!(previewEnd && sel.start && !sel.end && date > sel.start && date <= previewEnd);
  const isPreviewCap = isPreview && sameDay(date, previewEnd as Date);
  const isToday   = sameDay(date, today);
  const dow       = date.getDay();
  const isWeekend = dow === 0 || dow === 6;
  const inBand    = isStart || isEnd || isMid || isPreview;

  return (
    <div className="relative aspect-square" onMouseEnter={() => onHover(isPast ? null : date)}>
      {inBand && (
        <div
          className="absolute inset-y-[3px]"
          style={{
            left:       isStart ? '50%' : 0,
            right:      isEnd ? '50%' : 0,
            background: isMid || isStart || isEnd ? '#f0ebfe' : 'rgba(129,37,226,.07)',
          }}
        />
      )}
      <button
        type="button"
        disabled={isPast}
        onClick={() => onPick(date)}
        className={`relative z-10 w-full h-full grid place-items-center text-[13px] font-semibold rounded-full transition-all ${
          isPast ? 'text-gray-300 cursor-not-allowed'
          : isStart || isEnd ? 'text-white cal-pick'
          : 'cursor-pointer hover:bg-white/70'
        }`}
        style={{
          background: isStart || isEnd ? '#8125E2' : 'transparent',
          color:      !isPast && !isStart && !isEnd ? (isToday ? '#8125E2' : isWeekend ? '#a866ec' : '#374151') : undefined,
          border:     isToday && !isStart && !isEnd ? '1.5px solid #8125E2' : isPreviewCap ? '1.5px dashed #c0a0f1' : 'none',
        }}
      >
        {d}
      </button>
    </div>
  );
}

/* Una cuadrícula de mes (nombre + días de la semana + celdas) */
function MonthGrid({
  y, m, today, sel, previewEnd, onPick, onHover,
}: {
  y: number; m: number; today: Date; sel: DateSel; previewEnd: Date | null;
  onPick: (date: Date) => void; onHover: (date: Date | null) => void;
}) {
  const startDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const days     = new Date(y, m + 1, 0).getDate();
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startDow; i++) cells.push(<div key={`e${i}`} />);
  for (let d = 1; d <= days; d++) {
    cells.push(<DayCell key={d} d={d} y={y} m={m} today={today} sel={sel} previewEnd={previewEnd} onPick={onPick} onHover={onHover} />);
  }
  return (
    <div className="flex-1 min-w-0">
      <p className="text-center font-bold text-gray-800 text-[14px] capitalize mb-3">{MESES[m]} {y}</p>
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <div key={d} className={`text-center text-[11px] font-bold py-1 ${d === 'Sá' || d === 'Do' ? 'text-[#c0a0f1]' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">{cells}</div>
    </div>
  );
}

function MiniCalendar({ sel, setSel, dual = false }: { sel: DateSel; setSel: (s: DateSel) => void; dual?: boolean }) {
  const [view, setView]   = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [hover, setHover] = useState<Date | null>(null);
  const today = new Date(); today.setHours(0,0,0,0);
  const atCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth();
  const next = { y: view.m === 11 ? view.y + 1 : view.y, m: (view.m + 1) % 12 };

  const pick = (date: Date) => {
    if (date < today) return;
    if (!sel.start || (sel.start && sel.end)) { setSel({ start: date, end: null }); }
    else if (date > sel.start) { setSel({ start: sel.start, end: date }); }
    else { setSel({ start: date, end: null }); }
  };

  /* Vista previa: mientras solo hay fecha de llegada, el hover sobre un día
     posterior dibuja el rango tentativo antes de confirmarlo con el click */
  const previewEnd = sel.start && !sel.end && hover && hover > sel.start ? hover : null;

  const prevBtn = (
    <button
      disabled={atCurrentMonth}
      onClick={() => setView(v => ({ y: v.m===0 ? v.y-1 : v.y, m: (v.m+11)%12 }))}
      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent z-10"
    >
      <Icon name="chevL" size={16} />
    </button>
  );
  const nextBtn = (
    <button
      onClick={() => setView(v => ({ y: v.m===11 ? v.y+1 : v.y, m: (v.m+1)%12 }))}
      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 z-10"
    >
      <Icon name="chevR" size={16} />
    </button>
  );

  /* Dos meses lado a lado — solo en el buscador expandido del navbar */
  if (dual) {
    return (
      <div onMouseLeave={() => setHover(null)} className="relative">
        <div className="absolute left-0 top-0">{prevBtn}</div>
        <div className="absolute right-0 top-0">{nextBtn}</div>
        <div className="flex gap-6">
          <MonthGrid y={view.y} m={view.m} today={today} sel={sel} previewEnd={previewEnd} onPick={pick} onHover={setHover} />
          <div className="w-px bg-gray-100 flex-none" />
          <MonthGrid y={next.y} m={next.m} today={today} sel={sel} previewEnd={previewEnd} onPick={pick} onHover={setHover} />
        </div>
      </div>
    );
  }

  /* Un solo mes — buscador principal del home (sin cambios) */
  return (
    <div onMouseLeave={() => setHover(null)}>
      <div className="flex items-center justify-between mb-3">
        {prevBtn}
        <span className="font-bold text-gray-800 text-[14px] capitalize">{MESES[view.m]} {view.y}</span>
        {nextBtn}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <div key={d} className={`text-center text-[11px] font-bold py-1 ${d === 'Sá' || d === 'Do' ? 'text-[#c0a0f1]' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {(() => {
          const startDow = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
          const days = new Date(view.y, view.m + 1, 0).getDate();
          const cells: React.ReactNode[] = [];
          for (let i = 0; i < startDow; i++) cells.push(<div key={`e${i}`} />);
          for (let d = 1; d <= days; d++) {
            cells.push(<DayCell key={d} d={d} y={view.y} m={view.m} today={today} sel={sel} previewEnd={previewEnd} onPick={pick} onHover={setHover} />);
          }
          return cells;
        })()}
      </div>
    </div>
  );
}

function Counter({ label, sub, value, min = 0, onChange }: { label: string; sub: string; value: number; min?: number; onChange: (n: number) => void }) {
  const [flipping, setFlipping] = useState(false);
  const handle = (n: number) => { setFlipping(true); onChange(n); setTimeout(() => setFlipping(false), 250); };
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-semibold text-gray-900 text-[14px]">{label}</p>
        <p className="text-gray-400 text-[12px] mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button disabled={value <= min} onClick={() => handle(Math.max(min, value-1))}
          className="w-7 h-7 rounded-full grid place-items-center text-gray-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#8125E2] hover:border-[#8125E2]"
          style={{ border: '1.5px solid #d1d5db' }}>
          <Icon name="minus" size={12} />
        </button>
        <span key={value} className={`font-bold text-gray-900 text-[15px] min-w-[20px] text-center ${flipping ? 'num-flip' : ''}`}>{value}</span>
        <button onClick={() => handle(value+1)}
          className="w-7 h-7 rounded-full grid place-items-center text-gray-500 transition-all hover:text-[#8125E2] hover:border-[#8125E2]"
          style={{ border: '1.5px solid #d1d5db' }}>
          <Icon name="plus" size={12} />
        </button>
      </div>
    </div>
  );
}

const DROP_STYLE = { border: '1.5px solid #e2dcec', boxShadow: '0 20px 48px rgba(33,27,46,.14)' };

export default function HeroSearch({ cities, expanded = false, onSearch }: HeroSearchProps) {
  const router  = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [panel,    setPanel]    = useState<Panel>(expanded ? 'destino' : null);
  const [dest,     setDest]     = useState<City | null>(null);
  const [fechas,   setFechas]   = useState<DateSel>({ start: null, end: null });
  const [adults,   setAdults]   = useState(2);
  const [children, setChildren] = useState(0);
  const [babies,   setBabies]   = useState(0);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setPanel(null);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const toggle = (p: Panel) => setPanel(cur => cur === p ? null : p);
  const isReady = !!dest;

  /* El botón de buscar se expande (icono → icono + texto) mientras el usuario
     está interactuando con algún campo, o cuando ya completó los 3 datos */
  const hasAllData = !!(dest && fechas.start && fechas.end);
  const btnExpanded = panel !== null || hasAllData;

  const search = () => {
    const params = new URLSearchParams();
    if (dest) params.set('ciudad', dest.key);
    if (fechas.start) params.set('checkin', toISODate(fechas.start));
    if (fechas.end)   params.set('checkout', toISODate(fechas.end));
    /* Se pasa el desglose completo para no perder cuántos son adultos/niños/bebés */
    if (adults)   params.set('adultos', String(adults));
    if (children) params.set('ninos',   String(children));
    if (babies)   params.set('bebes',   String(babies));
    router.push(`/fincas${params.toString() ? '?' + params.toString() : ''}`);
    setPanel(null);
    onSearch?.();
  };

  const guestLabel = () => {
    const parts = [`${adults} ${adults===1?'adulto':'adultos'}`];
    if (children > 0) parts.push(`${children} ${children===1?'niño':'niños'}`);
    if (babies  > 0) parts.push(`${babies} ${babies===1?'bebé':'bebés'}`);
    return parts.join(' · ');
  };

  const fechasLabel = () => {
    if (fechas.start && fechas.end) return `${fmtShort(fechas.start)} → ${fmtShort(fechas.end)}`;
    if (fechas.start) return `Desde ${fmtShort(fechas.start)}`;
    return '¿Cuándo viajas?';
  };

  /* Clase base del campo — sin rounded propio para que el border del bar lo gestione */
  const fieldActive = (p: Panel) => panel === p ? 'bg-[#f0ebfe]' : 'hover:bg-gray-50';

  return (
    <div ref={wrapRef}>
      {/* ── Search bar ── */}
      <div
        className="bg-white rounded-2xl flex items-stretch"
        style={{
          border: `1.5px solid ${panel ? '#c0a0f1' : '#e2dcec'}`,
          boxShadow: panel ? '0 0 0 3px rgba(129,37,226,.08)' : '0 6px 28px rgba(129,37,226,.10)',
          transition: 'border-color .15s, box-shadow .15s',
          overflow: 'visible',  /* cada campo maneja su propio dropdown */
        }}
      >
        {/* ── DÓNDE ── */}
        <div className="relative flex-1">
          <div
            className={`px-5 py-4 h-full cursor-pointer transition-colors rounded-l-2xl ${fieldActive('destino')}`}
            onClick={e => { e.stopPropagation(); toggle('destino'); }}
          >
            <p className="text-[10px] font-extrabold tracking-[.1em] uppercase text-[#8125E2] mb-1">Dónde</p>
            <p className={`text-[14px] font-semibold leading-snug ${dest ? 'text-gray-900' : 'text-gray-400'}`}>
              {dest ? `${dest.name}, ${dest.dept}` : 'Explora destinos'}
            </p>
          </div>

          {/* Dropdown alineado exactamente al ancho del campo */}
          {panel === 'destino' && (
            <div
              className="search-drop absolute top-[calc(100%+6px)] left-0 z-50 bg-white rounded-2xl min-w-[320px]"
              style={DROP_STYLE}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-[11px] font-bold text-gray-400 tracking-wide px-4 pt-4 pb-2">Destinaciones sugeridas</p>
              <div className="px-2 pb-3">
                {cities.map((c, idx) => {
                  const meta = CITY_META[c.key] ?? { tagline: `${c.dept} · ${c.count} fincas`, bg: '#f0ebfe', color: '#8125E2', icon: 'pin' };
                  const active = dest?.key === c.key;
                  return (
                    <button key={c.key}
                      className={`search-item flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-left transition-colors ${active ? 'bg-[#f0ebfe]' : 'hover:bg-gray-50'}`}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      onClick={() => { setDest(c); setPanel('fechas'); }}
                    >
                      <span className="w-12 h-12 rounded-xl grid place-items-center flex-none" style={{ background: meta.bg, color: meta.color }}>
                        <CityGlyph city={c.key} color={meta.color} size={30} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <b className="text-[14px] font-bold text-gray-900 block leading-tight">{c.name}</b>
                        <span className="text-[12.5px] text-gray-400 line-clamp-1">{meta.tagline}</span>
                      </span>
                      {active && <span className="check-in"><Icon name="check" size={15} style={{ color: '#8125E2' }} /></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-[#e2dcec] my-3 flex-none" />

        {/* ── FECHAS ── */}
        <div className="relative flex-1">
          <div
            className={`px-5 py-4 h-full cursor-pointer transition-colors ${fieldActive('fechas')}`}
            onClick={e => { e.stopPropagation(); toggle('fechas'); }}
          >
            <p className="text-[10px] font-extrabold tracking-[.1em] uppercase text-[#8125E2] mb-1">Fechas</p>
            <p className={`text-[14px] font-semibold leading-snug ${fechas.start ? 'text-gray-900' : 'text-gray-400'}`}>
              {fechasLabel()}
            </p>
          </div>

          {/* Dropdown alineado al campo FECHAS — mismo ancho que el campo */}
          {panel === 'fechas' && (
            <div
              className="search-drop absolute top-[calc(100%+6px)] z-50 bg-white rounded-2xl"
              style={expanded
                ? { ...DROP_STYLE, width: 600, left: '50%', marginLeft: -300 }
                : { ...DROP_STYLE, minWidth: '100%', left: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={expanded ? 'p-5' : 'p-4'}>
                {/* Cuando llegas / Cuando te vas — el campo que falta se resalta como siguiente paso */}
                <div className="flex gap-2 mb-4 p-1 rounded-2xl" style={{ background: '#f6f3fb' }}>
                  {(() => {
                    const nextField = !fechas.start ? 'start' : !fechas.end ? 'end' : null;
                    return (
                      <>
                        <div
                          className="flex-1 rounded-full px-4 py-2.5 transition-all"
                          style={{
                            background: '#fff',
                            boxShadow: nextField === 'start' ? '0 0 0 2px #8125E2, 0 6px 16px rgba(129,37,226,.22)' : '0 1px 2px rgba(33,27,46,.05)',
                          }}
                        >
                          <p className="text-[9.5px] font-extrabold tracking-[.1em] uppercase text-[#8125E2]">Llegada</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className={`text-[13.5px] font-bold ${fechas.start ? 'text-gray-900' : 'text-gray-400 font-semibold'}`}>
                              {fmtShort(fechas.start) ?? 'Agrega fecha'}
                            </p>
                            {fechas.start && <Icon name="check" size={13} style={{ color: '#1f9d57' }} />}
                          </div>
                        </div>
                        <div className="grid place-items-center px-0.5 text-gray-300">
                          <Icon name="arrowR" size={14} />
                        </div>
                        <div
                          className="flex-1 rounded-full px-4 py-2.5 transition-all"
                          style={{
                            background: '#fff',
                            boxShadow: nextField === 'end' ? '0 0 0 2px #8125E2, 0 6px 16px rgba(129,37,226,.22)' : '0 1px 2px rgba(33,27,46,.05)',
                          }}
                        >
                          <p className="text-[9.5px] font-extrabold tracking-[.1em] uppercase text-[#8125E2]">Salida</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className={`text-[13.5px] font-bold ${fechas.end ? 'text-gray-900' : 'text-gray-400 font-semibold'}`}>
                              {fmtShort(fechas.end) ?? 'Agrega fecha'}
                            </p>
                            {fechas.end && <Icon name="check" size={13} style={{ color: '#1f9d57' }} />}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <MiniCalendar sel={fechas} setSel={setFechas} dual={expanded} />

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    className="px-4 py-2.5 rounded-full text-gray-500 font-semibold text-[13px] hover:bg-gray-50 transition-colors"
                    onClick={() => setFechas({ start: null, end: null })}
                  >
                    Limpiar
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full font-bold text-[13.5px] text-white hover:opacity-90 active:scale-[.98] transition-all"
                    style={{ background: '#8125E2', boxShadow: '0 6px 18px rgba(129,37,226,.32)' }}
                    onClick={() => setPanel('huespedes')}
                  >
                    Continuar <Icon name="arrowR" size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-[#e2dcec] my-3 flex-none" />

        {/* ── HUÉSPEDES ── */}
        <div className="relative flex-1">
          <div
            className={`px-5 py-4 h-full cursor-pointer transition-colors ${fieldActive('huespedes')}`}
            onClick={e => { e.stopPropagation(); toggle('huespedes'); }}
          >
            <p className="text-[10px] font-extrabold tracking-[.1em] uppercase text-[#8125E2] mb-1">Huéspedes</p>
            <p className="text-[14px] font-semibold leading-snug text-gray-900">{guestLabel()}</p>
          </div>

          {/* Dropdown alineado al campo HUÉSPEDES */}
          {panel === 'huespedes' && (
            <div
              className="search-drop absolute top-[calc(100%+6px)] left-0 z-50 bg-white rounded-2xl"
              style={{ ...DROP_STYLE, minWidth: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 pt-5 pb-4">
                <p className="text-[13px] font-extrabold text-gray-800 mb-1">¿Quiénes van?</p>
                <p className="text-[12px] text-gray-400 mb-4">Selecciona adultos, niños y bebés</p>
                <Counter label="Adultos"  sub="Mayores de 15 años" value={adults}   min={1} onChange={setAdults}   />
                <Counter label="Niños"    sub="De 3 a 14 años"     value={children} min={0} onChange={setChildren} />
                <Counter label="Bebés"    sub="De 0 a 2 años"      value={babies}   min={0} onChange={setBabies}   />
                <button
                  className="w-full mt-4 py-3 rounded-xl text-white font-bold text-[14px] hover:opacity-90 active:scale-[.97] transition-all"
                  style={{ background: '#8125E2', boxShadow: '0 4px 14px rgba(129,37,226,.3)' }}
                  onClick={search}
                >
                  Buscar fincas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTÓN BUSCAR — círculo con el búho por defecto, se expande a píldora con texto al interactuar ── */}
        <div className="flex items-center px-3 flex-none">
          <button
            onClick={e => { e.stopPropagation(); search(); }}
            className={`flex items-center justify-center text-white rounded-full font-bold text-[14px] hover:opacity-90 active:scale-[.97] transition-[padding,gap] duration-300 ease-out ${isReady ? 'search-ready' : ''}`}
            style={{
              background: '#8125E2',
              boxShadow: '0 4px 16px rgba(129,37,226,.45)',
              padding: btnExpanded ? '12px 22px' : '12px',
              gap: btnExpanded ? 8 : 0,
            }}
            aria-label="Buscar fincas"
          >
            <OwlMark size={22} head="white" cut="#8125E2" />
            <span
              className="overflow-hidden whitespace-nowrap transition-all duration-300 ease-out"
              style={{ maxWidth: btnExpanded ? 70 : 0, opacity: btnExpanded ? 1 : 0 }}
            >
              Buscar
            </span>
          </button>
        </div>
      </div>

      {/* ── Indicador de progreso ── */}
      <div className="flex items-center gap-1.5 mt-2 justify-center">
        {[!!dest, !!fechas.start, adults > 0].map((done, i) => (
          <div key={i} className="h-1 rounded-full transition-all duration-300"
            style={{ width: done ? 24 : 8, background: done ? '#8125E2' : '#e2dcec' }} />
        ))}
      </div>
    </div>
  );
}
