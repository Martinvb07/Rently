'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import type { Finca, CalendarState, AmenityKey } from '@/types';
import { fmtCOP, fincas as allFincas } from '@/lib/data';
import Icon from '@/components/ui/Icon';
import OwlMark from '@/components/ui/OwlMark';
import Avatar from '@/components/ui/Avatar';
import Stars from '@/components/ui/Stars';
import FarmCard from '@/components/fincas/FarmCard';
import FadeIn from '@/components/ui/FadeIn';
import GalleryModal from '@/components/ui/GalleryModal';
import DateRangePicker, { type DateSel, fmt } from '@/components/ui/DateRangePicker';
import { useFavorites } from '@/hooks/useFavorites';

const MapView = dynamic(() => import('@/components/fincas/MapView'), { ssr: false });

/* ─── Viewing count (seeded, stable) ─── */
function viewingCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return (h % 7) + 2;
}

/* ─── Calendario interactivo de selección de fechas ─── */
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DOW   = ['L','M','X','J','V','S','D'];
const TODAY_D = new Date(2026, 5, 3); TODAY_D.setHours(0,0,0,0);

function sameDay(a:Date,b:Date){return a.toDateString()===b.toDateString();}

/* Parsea "YYYY-MM-DD" (como llega en la URL) a fecha local, sin corrimiento de huso horario */
function parseISODate(s: string | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function MonthGrid({
  y, m, sel, onPick, calState,
}: {
  y:number; m:number; sel:DateSel; onPick:(d:Date)=>void; calState:CalendarState;
}) {
  const first    = new Date(y,m,1);
  const startDow = (first.getDay()+6)%7;
  const days     = new Date(y,m+1,0).getDate();
  const isJune   = y===2026&&m===5;

  const dayState=(d:number)=>{
    const date=new Date(y,m,d); date.setHours(0,0,0,0);
    if(date<TODAY_D) return 'past';
    if(isJune&&calState.reserved.includes(d)) return 'reserved';
    if(isJune&&calState.blocked.includes(d))  return 'blocked';
    return 'avail';
  };

  const cells:React.ReactNode[]=[];
  for(let i=0;i<startDow;i++) cells.push(<div key={`e${i}`}/>);
  for(let d=1;d<=days;d++){
    const date     = new Date(y,m,d); date.setHours(0,0,0,0);
    const s        = dayState(d);
    const isStart  = !!(sel.start&&sameDay(date,sel.start));
    const isEnd    = !!(sel.end  &&sameDay(date,sel.end));
    const inRange  = !!(sel.start&&sel.end&&date>sel.start&&date<sel.end);
    const isToday  = sameDay(date,TODAY_D);
    const clickable= s==='avail';
    const inBand   = isStart||isEnd||inRange;

    /* Misma técnica de dos capas que el calendario del buscador: una banda
       continua detrás conecta los días, y un círculo sólido cubre solo el
       día exacto de inicio/fin — sin el corte entre círculo y cuadrado */
    cells.push(
      <div key={d} className="relative aspect-square">
        {inBand && (
          <div
            className="absolute inset-y-[3px]"
            style={{ left: isStart ? '50%' : 0, right: isEnd ? '50%' : 0, background: '#f0ebfe' }}
          />
        )}
        <button
          type="button"
          disabled={!clickable}
          onClick={()=>clickable&&onPick(date)}
          className={`relative z-10 w-full h-full grid place-items-center text-[14px] font-semibold rounded-full transition-all select-none ${
            s==='past'       ? 'text-gray-300 cursor-not-allowed'
            : s==='reserved' ? 'text-red-300 cursor-not-allowed line-through'
            : s==='blocked'  ? 'text-gray-200 cursor-not-allowed'
            : isStart||isEnd ? 'text-white cursor-pointer shadow-lg cal-pick'
            : 'cursor-pointer hover:bg-white/70'
          }`}
          style={{
            background: isStart||isEnd ? '#8125E2' : 'transparent',
            color:      clickable && !isStart && !isEnd ? (isToday ? '#8125E2' : '#1f2937') : undefined,
            border:     isToday && !isStart && !isEnd ? '2px solid #8125E2' : 'none',
          }}
        >
          {d}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[260px]">
      <p className="text-center font-bold text-gray-800 text-[16px] mb-4 capitalize">
        {MESES[m]} {y}
      </p>
      <div className="grid" style={{gridTemplateColumns:'repeat(7,1fr)'}}>
        {DOW.map(d=><div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1 uppercase">{d}</div>)}
        {cells}
      </div>
    </div>
  );
}

/* Selector de fechas integrado — conectado a dateSel del padre */
function InteractiveCalendar({
  sel, setSel, calState, city,
}: {
  sel:DateSel; setSel:(s:DateSel)=>void; calState:CalendarState; city:string;
}) {
  /* Si ya llega una fecha de llegada preseleccionada (desde el buscador), abre el calendario en ese mes */
  const [view,setView]=useState(() => sel.start ? { y: sel.start.getFullYear(), m: sel.start.getMonth() } : { y:2026, m:5 });

  const pick=(date:Date)=>{
    if(!sel.start||(sel.start&&sel.end)){
      setSel({start:date,end:null});
    } else if(date>sel.start){
      setSel({start:sel.start,end:date});
    } else {
      setSel({start:date,end:null});
    }
  };

  const next={y:view.m===11?view.y+1:view.y, m:(view.m+1)%12};

  const nights=sel.start&&sel.end
    ?Math.round((sel.end.getTime()-sel.start.getTime())/86400000):0;

  const fmtD=(d:Date)=>d.toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'});

  return (
    <div>
      {/* Header dinámico */}
      <div className="mb-6">
        {sel.start&&sel.end ? (
          <>
            <h2 className="text-[22px] font-extrabold text-gray-900">
              {nights} {nights===1?'noche':'noches'} en {city}
            </h2>
            <p className="text-gray-400 text-[14px] mt-1">
              {fmtD(sel.start)} — {fmtD(sel.end)}
            </p>
          </>
        ) : sel.start ? (
          <>
            <h2 className="text-[22px] font-extrabold text-gray-900">Selecciona la fecha de salida</h2>
            <p className="text-gray-400 text-[14px] mt-1">Llegada: {fmtD(sel.start)}</p>
          </>
        ) : (
          <>
            <h2 className="text-[22px] font-extrabold text-gray-900">Selecciona tus fechas</h2>
            <p className="text-gray-400 text-[14px] mt-1">Elige llegada y salida para ver el precio exacto</p>
          </>
        )}
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={()=>setView(v=>v.y===2026&&v.m===5?v:{y:v.m===0?v.y-1:v.y,m:(v.m+11)%12})}
          disabled={view.y===2026&&view.m===5}
          className="w-9 h-9 rounded-full border border-gray-200 grid place-items-center hover:border-[#8125E2] hover:text-[#8125E2] transition-colors disabled:opacity-25">
          <Icon name="chevL" size={16}/>
        </button>
        <button onClick={()=>setView(v=>({y:v.m===11?v.y+1:v.y,m:(v.m+1)%12}))}
          className="w-9 h-9 rounded-full border border-gray-200 grid place-items-center hover:border-[#8125E2] hover:text-[#8125E2] transition-colors">
          <Icon name="chevR" size={16}/>
        </button>
      </div>

      {/* Dos meses en desktop, uno en mobile */}
      <div className="flex gap-8">
        <MonthGrid y={view.y} m={view.m} sel={sel} onPick={pick} calState={calState}/>
        <div className="hidden md:block w-px bg-gray-100 flex-none"/>
        <div className="hidden md:block">
          <MonthGrid y={next.y} m={next.m} sel={sel} onPick={pick} calState={calState}/>
        </div>
      </div>

      {/* Leyenda + borrar fechas */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {[
            {color:'bg-[#8125E2]', label:'Seleccionado'},
            {color:'bg-red-200',   label:'No disponible'},
          ].map(l=>(
            <span key={l.label} className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${l.color}`}/>{l.label}
            </span>
          ))}
        </div>
        {(sel.start||sel.end) && (
          <button onClick={()=>setSel({start:null,end:null})}
            className="text-[13px] font-bold text-gray-500 underline hover:text-gray-800 transition-colors">
            Borrar fechas
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Amenity meta ─── */
const AMENITY_META: Record<AmenityKey,{icon:string;label:string}> = {
  piscina:     {icon:'pool',    label:'Piscina'},
  bbq:         {icon:'bbq',     label:'BBQ'},
  parqueadero: {icon:'parking', label:'Parqueadero'},
  wifi:        {icon:'wifi',    label:'WiFi'},
  aire:        {icon:'ac',      label:'Aire acond.'},
  rio:         {icon:'river',   label:'Acceso a río'},
};

/* ─── Fila de contador +/- (mismo patrón que el buscador del inicio) ─── */
function GuestCounterRow({ label, sub, value, min = 0, max, onChange }: { label:string; sub:string; value:number; min?:number; max:number; onChange:(n:number)=>void }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-semibold text-gray-900 text-[14px]">{label}</p>
        <p className="text-gray-400 text-[12px] mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button disabled={value<=min} onClick={()=>onChange(Math.max(min,value-1))}
          className="w-7 h-7 rounded-full grid place-items-center text-gray-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#8125E2] hover:border-[#8125E2]"
          style={{border:'1.5px solid #d1d5db'}}>
          <Icon name="minus" size={12}/>
        </button>
        <span className="font-bold text-gray-900 text-[15px] min-w-[20px] text-center">{value}</span>
        <button disabled={value>=max} onClick={()=>onChange(value+1)}
          className="w-7 h-7 rounded-full grid place-items-center text-gray-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#8125E2] hover:border-[#8125E2]"
          style={{border:'1.5px solid #d1d5db'}}>
          <Icon name="plus" size={12}/>
        </button>
      </div>
    </div>
  );
}

/* ─── Dropdown custom de huéspedes — mismo picker de Adultos/Niños/Bebés del buscador del inicio ─── */
function GuestsDropdown({
  adults, children, babies, setAdults, setChildren, setBabies, max,
}: {
  adults:number; children:number; babies:number;
  setAdults:(n:number)=>void; setChildren:(n:number)=>void; setBabies:(n:number)=>void;
  max:number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = adults + children + babies;
  const remaining = max - total;

  useEffect(()=>{
    const close=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('click',close);
    return ()=>window.removeEventListener('click',close);
  },[]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e=>{e.stopPropagation();setOpen(!open);}}
        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 hover:border-[#8125E2] transition-colors bg-white"
        style={open?{borderColor:'#8125E2',boxShadow:'0 0 0 2px rgba(129,37,226,.12)'}:{}}
      >
        <span className="flex items-center gap-2 text-[14px] font-semibold text-gray-800">
          <Icon name="users" size={15} style={{color:'#9ca3af'}}/>
          {total} {total===1?'persona':'personas'}
        </span>
        <Icon name="chevD" size={14} style={{color:'#9ca3af',transition:'transform .2s',transform:open?'rotate(180deg)':'rotate(0deg)'}}/>
      </button>

      {open && (
        <div
          className="search-drop absolute bottom-[calc(100%+6px)] left-0 right-0 z-50 bg-white rounded-2xl"
          style={{border:'1.5px solid #e2dcec',boxShadow:'0 -12px 32px rgba(33,27,46,.12)'}}
          onClick={e=>e.stopPropagation()}
        >
          <div className="px-5 pt-4 pb-1">
            <p className="text-[13px] font-extrabold text-gray-800">¿Quiénes van?</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Hasta {max} personas en esta finca</p>
          </div>
          <div className="px-5 pb-3">
            <GuestCounterRow label="Adultos" sub="Mayores de 15 años" value={adults}   min={1} max={adults + remaining}   onChange={setAdults}/>
            <GuestCounterRow label="Niños"   sub="De 3 a 14 años"     value={children} min={0} max={children + remaining} onChange={setChildren}/>
            <GuestCounterRow label="Bebés"   sub="De 0 a 2 años"      value={babies}   min={0} max={babies + remaining}   onChange={setBabies}/>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reservation form — sin DateRangePicker (el calendario del left lo maneja) ─── */
function ReservationForm({
  finca, dateSel, adultsG, childrenG, babiesG, setAdultsG, setChildrenG, setBabiesG, onReserve, nights, total, subtotal, limpieza, servicio,
}: {
  finca: Finca; dateSel: DateSel;
  adultsG:number; childrenG:number; babiesG:number;
  setAdultsG:(n:number)=>void; setChildrenG:(n:number)=>void; setBabiesG:(n:number)=>void;
  onReserve:()=>void;
  nights:number; total:number; subtotal:number; limpieza:number; servicio:number;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      {/* Llegada / Salida — bloque dividido con más respiración */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: `1.5px solid ${(dateSel.start||dateSel.end)?'#c0a0f1':'#e2dcec'}` }}>
        <div className="grid grid-cols-2">
          {/* Llegada */}
          <div className="px-5 py-4 border-r border-[#e2dcec]">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name="calendar" size={12} style={{color:'#8125E2'}}/>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8125E2]">Llegada</p>
            </div>
            <p className={`text-[15px] font-bold leading-tight ${dateSel.start?'text-gray-900':'text-gray-400'}`}>
              {dateSel.start
                ? dateSel.start.toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})
                : 'Agrega fecha'}
            </p>
          </div>
          {/* Salida */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name="calendar" size={12} style={{color:'#8125E2'}}/>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8125E2]">Salida</p>
            </div>
            <p className={`text-[15px] font-bold leading-tight ${dateSel.end?'text-gray-900':'text-gray-400'}`}>
              {dateSel.end
                ? dateSel.end.toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})
                : 'Agrega fecha'}
            </p>
          </div>
        </div>
        {/* Strip de noches */}
        {dateSel.start && dateSel.end && nights > 0 && (
          <div className="px-5 py-2.5 border-t border-[#e2dcec] bg-[#f6f1fe] flex items-center justify-between">
            <span className="text-[12.5px] font-bold text-[#8125E2]">
              {nights} {nights===1?'noche':'noches'}
            </span>
            <span className="text-[12px] text-[#8125E2]/60 font-medium">
              {dateSel.start.toLocaleDateString('es-CO',{day:'numeric',month:'short'})} → {dateSel.end.toLocaleDateString('es-CO',{day:'numeric',month:'short'})}
            </span>
          </div>
        )}
      </div>

      {/* Huéspedes */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-2">Huéspedes</p>
        <GuestsDropdown
          adults={adultsG} children={childrenG} babies={babiesG}
          setAdults={setAdultsG} setChildren={setChildrenG} setBabies={setBabiesG}
          max={finca.capacity}
        />
      </div>

      {/* Mensaje cuando aún no hay fechas */}
      {nights < 1 && (
        <p className="text-[13px] text-gray-400 text-center py-2">
          Selecciona las fechas en el calendario para ver el precio exacto
        </p>
      )}

      {/* CTA */}
      <div>
        <button
          onClick={onReserve} disabled={nights<1}
          className="mx-auto block px-10 py-3 rounded-2xl text-white font-bold text-[15px] active:scale-[.98] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          style={{
            background: nights > 0 ? '#8125E2' : '#b89ee0',
            boxShadow: nights > 0 ? '0 8px 24px rgba(129,37,226,.4)' : 'none',
          }}
        >
          <OwlMark size={20} head="white" cut={nights > 0 ? '#8125E2' : '#b89ee0'} />
          {nights > 0 ? 'Reservar ahora' : 'Revisa la disponibilidad'}
        </button>

        {/* Desglose — oculto por defecto, se expande con animación al pedirlo */}
        {nights > 0 && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setShowBreakdown(v => !v)}
              className="text-[13px] font-bold text-gray-500 underline hover:text-[#8125E2] transition-colors"
            >
              ¿De dónde sale el total?
            </button>
            <div
              className="grid text-left"
              style={{ gridTemplateRows: showBreakdown ? '1fr' : '0fr', transition: 'grid-template-rows .38s cubic-bezier(.2,.8,.3,1)' }}
            >
              <div className="overflow-hidden">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 mt-3">
                  {[
                    [`${fmtCOP(finca.discount ? Math.round(finca.price*(1-finca.discount/100)) : finca.price)} × ${nights} ${nights===1?'noche':'noches'}`, fmtCOP(subtotal)],
                    ['Aseo y entrega', fmtCOP(limpieza)],
                    ['Servicio Rently (8%)', fmtCOP(servicio)],
                  ].map(([l,v])=>(
                    <div key={l} className="flex justify-between text-[13.5px] text-gray-500"><span>{l}</span><span>{v}</span></div>
                  ))}
                  <div className="flex justify-between text-[15px] font-extrabold text-gray-900 pt-2 border-t border-gray-200 mt-1">
                    <span>Total</span><span>{fmtCOP(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-gray-400 text-[12.5px] mt-5 font-medium">
          No se te cobrará nada todavía
        </p>
      </div>
    </div>
  );
}

/* ─── Mock reviews seeded by finca id ─── */
function seedReviews(id: string) {
  const names = [
    { name: 'María Camila R.', city: 'Bogotá, Colombia',    text: 'Fue una experiencia increíble. La finca supera todas las expectativas — piscina espectacular, anfitrión atento y muy bien ubicada. Volvemos pronto.' },
    { name: 'Andrés Gómez',    city: 'Medellín, Colombia',  text: 'Todo perfectamente organizado. La reserva fue rápida y sin complicaciones. El lugar estaba impecable y el asador llanero es de otro nivel.' },
    { name: 'Laura Vanegas',   city: 'Cali, Colombia',      text: 'Pasamos un fin de semana espectacular con la familia. Las instalaciones están muy bien cuidadas y el entorno es hermoso. 100% recomendada.' },
    { name: 'Juan D. Pérez',   city: 'Bucaramanga, Col.',   text: 'La finca tiene todo lo que buscábamos: piscina grande, zona BBQ y mucho espacio. El anfitrión respondió inmediatamente. Volveríamos sin dudarlo.' },
    { name: 'Valentina S.',    city: 'Barranquilla, Col.',  text: 'Reservé para una despedida de soltera y fue perfecta. Todo funcionó igual a las fotos, el grupo quedó encantado. La recomiendo de corazón.' },
    { name: 'Sebastián Mora',  city: 'Pereira, Colombia',   text: 'Excelente relación calidad-precio. Llegamos a una finca limpia, acogedora y con todo listo. El rio cerca es un plus enorme para los niños.' },
  ];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  const start = h % names.length;
  return [
    names[start % names.length],
    names[(start + 1) % names.length],
    names[(start + 2) % names.length],
    names[(start + 3) % names.length],
  ];
}

/* ─── Reviews — tipografía como elemento visual, estilo SaaS moderno ─── */
function ReviewsSection({ finca }: { finca: Finca }) {
  const reviews = useMemo(() => seedReviews(finca.id), [finca.id]);
  const dates   = ['hace 3 sem.', 'hace 1 sem.', 'hace 2 meses', 'hace 1 mes'];

  return (
    <section className="mt-14 pt-12 border-t border-gray-100">

      {/* Header minimalista */}
      <div className="flex items-center gap-2 mb-10">
        <div className="flex gap-0.5">
          {Array.from({length:5}).map((_,s) => (
            <Icon key={s} name="star" size={16} style={{color:'#f59e0b',fill:'#f59e0b'}} stroke={0}/>
          ))}
        </div>
        <span className="text-[18px] font-extrabold text-gray-900 ml-1">{finca.rating}</span>
        <span className="text-gray-300 mx-1">·</span>
        <span className="text-[15px] text-gray-400 font-medium">{finca.reviews} reseñas verificadas</span>
      </div>

      {/* Layout: 1 grande + 3 pequeñas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Card grande — quote enorme como elemento tipográfico */}
        <div className="relative rounded-3xl bg-[#f6f1fe] p-8 flex flex-col justify-between min-h-[280px] overflow-hidden">
          {/* Comilla como gráfico, no decoración */}
          <span
            className="absolute -top-4 -left-1 font-extrabold leading-none text-[#8125E2] select-none pointer-events-none"
            style={{ fontSize: 180, opacity: 0.08, lineHeight: 1 }}
          >&ldquo;</span>

          <div className="relative z-10">
            <p className="text-[17px] text-gray-800 font-semibold leading-[1.65] mb-8">
              {reviews[0].text}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={reviews[0].name} size={40}/>
              <div>
                <p className="font-bold text-gray-900 text-[14px]">{reviews[0].name}</p>
                <p className="text-gray-400 text-[12.5px]">{reviews[0].city}</p>
              </div>
            </div>
            <span className="text-[12px] text-[#8125E2] font-bold bg-white px-3 py-1.5 rounded-full">
              {dates[0]}
            </span>
          </div>
        </div>

        {/* Columna de 3 cards pequeñas */}
        <div className="flex flex-col gap-4">
          {reviews.slice(1).map((r, i) => (
            <div key={i}
              className="flex gap-4 items-start p-5 rounded-2xl bg-white border border-gray-100 transition-shadow hover:shadow-md"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}
            >
              <Avatar name={r.name} size={38}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div>
                    <span className="font-bold text-gray-900 text-[13.5px]">{r.name}</span>
                    <span className="text-gray-300 mx-1.5">·</span>
                    <span className="text-gray-400 text-[12.5px]">{r.city}</span>
                  </div>
                  <div className="flex gap-0.5 flex-none">
                    {Array.from({length:5}).map((_,s) => (
                      <Icon key={s} name="star" size={11} style={{color:'#f59e0b',fill:'#f59e0b'}} stroke={0}/>
                    ))}
                  </div>
                </div>
                <p className="text-gray-500 text-[13.5px] leading-relaxed line-clamp-2">
                  {r.text}
                </p>
                <p className="text-gray-300 text-[11.5px] font-medium mt-2">{dates[i + 1]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Lo que debes saber — acordeón, configurable por admin ─── */
const INFO_ITEMS = [
  {
    icon: 'calendar',
    title: 'Política de cancelación',
    color: '#e8f5e9',
    iconColor: '#2e7d32',
    content: [
      { label: 'Hasta 7 días antes', desc: 'Cancelación gratuita — reembolso completo.' },
      { label: 'Entre 3 y 7 días',   desc: 'Reembolso del 50% del valor de la reserva.' },
      { label: 'Menos de 3 días',    desc: 'Sin reembolso. La reserva no es reembolsable.' },
    ],
  },
  {
    icon: 'home',
    title: 'Reglas de la finca',
    color: '#e3f2fd',
    iconColor: '#1565c0',
    content: [
      { label: 'Check-in',          desc: 'A partir de las 2:00 p.m.' },
      { label: 'Check-out',         desc: 'Antes de las 12:00 m. (mediodía).' },
      { label: 'Mascotas',          desc: 'No se permiten mascotas.' },
      { label: 'Zonas de no fumar', desc: 'Prohibido fumar en áreas cerradas.' },
    ],
  },
  {
    icon: 'shield',
    title: 'Seguridad y propiedad',
    color: '#f3e5f5',
    iconColor: '#6a1b9a',
    content: [
      { label: 'Cámaras',           desc: 'Sistema de seguridad en exteriores.' },
      { label: 'Detectores',        desc: 'Detector de humo en todas las habitaciones.' },
      { label: 'Extintor',          desc: 'Disponible en la cocina y zonas comunes.' },
      { label: 'Anfitrión',         desc: 'Vive en las cercanías de la propiedad.' },
    ],
  },
] as const;

function InfoSection({ finca }: { finca: Finca }) {
  void finca;
  const [open, setOpen] = useState<number|null>(0);

  return (
    <section className="mt-12 pt-10 border-t border-gray-100">
      <h2 className="text-[22px] font-extrabold text-gray-900" style={{marginBottom:32}}>Lo que debes saber</h2>

      <div className="flex flex-col gap-3">
        {INFO_ITEMS.map((item, i)=>{
          const isOpen = open === i;
          return (
            <div key={item.title}
              className="rounded-2xl border border-gray-100 overflow-hidden transition-all"
              style={{boxShadow:isOpen?'0 4px 16px rgba(0,0,0,.06)':undefined}}>
              {/* Cabecera */}
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={()=>setOpen(isOpen?null:i)}
              >
                <span className="w-9 h-9 rounded-xl grid place-items-center flex-none"
                  style={{background:item.color, color:item.iconColor}}>
                  <Icon name={item.icon} size={18}/>
                </span>
                <span className="flex-1 font-bold text-gray-900 text-[15px]">{item.title}</span>
                <Icon name="chevD" size={16} style={{
                  color:'#9ca3af',
                  transition:'transform .2s',
                  transform:isOpen?'rotate(180deg)':'rotate(0)',
                  flexShrink:0,
                }}/>
              </button>

              {/* Contenido expandido */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-100">
                  {item.content.map(c=>(
                    <div key={c.label} className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <span className="font-semibold text-gray-900 text-[14px] w-36 flex-none">{c.label}</span>
                      <span className="text-gray-500 text-[14px]">{c.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Reservation stepper ─── */
type ResStep = 'info' | 'payment' | 'done';
const PAY_OPTS = [
  { id: 'nequi',     label: 'Nequi',     icon: 'sparkle', color: '#6D28D9', bg: '#f5f3ff' },
  { id: 'daviplata', label: 'Daviplata', icon: 'heart',   color: '#BE123C', bg: '#fff1f2' },
  { id: 'pse',       label: 'PSE',       icon: 'home',    color: '#1E40AF', bg: '#eff6ff' },
  { id: 'card',      label: 'Tarjeta',   icon: 'money',   color: '#8125E2', bg: '#f0ebfe' },
] as const;
type PayId = typeof PAY_OPTS[number]['id'];

const STEP_LABELS = [
  { n: 1, label: 'Fechas' },
  { n: 2, label: 'Tu info' },
  { n: 3, label: 'Pago'   },
];

/* ─── Main ─── */
interface Props { finca: Finca; calState: CalendarState; }

export default function DetailClient({ finca, calState }: Props) {
  const { isFav, toggle } = useFavorites();
  const searchParams = useSearchParams();

  const [mainImg,       setMainImg]       = useState(0);
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  /* Fechas/huéspedes ya elegidos en el buscador (home o listado) llegan por la URL
     y prellenan el widget de reserva en vez de arrancar en blanco */
  const [dateSel,       setDateSel]       = useState<DateSel>(() => ({
    start: parseISODate(searchParams.get('checkin')),
    end:   parseISODate(searchParams.get('checkout')),
  }));
  const [adultsG,       setAdultsG]       = useState(() => {
    /* Se respeta el desglose que llega por la URL; si solo viene "huespedes" (total), se toma como adultos */
    const a = Number(searchParams.get('adultos')) || Number(searchParams.get('huespedes'));
    return a > 0 ? Math.min(a, finca.capacity) : Math.min(2, finca.capacity);
  });
  const [childrenG,     setChildrenG]     = useState(() => Number(searchParams.get('ninos')) || 0);
  const [babiesG,       setBabiesG]       = useState(() => Number(searchParams.get('bebes')) || 0);
  const guests = adultsG + childrenG + babiesG;

  /* "Volver a fincas" debe regresar al mismo listado filtrado, no a uno en blanco */
  const backToFincasHref = useMemo(() => {
    const qs = new URLSearchParams();
    for (const key of ['ciudad', 'checkin', 'checkout', 'huespedes', 'adultos', 'ninos', 'bebes']) {
      const v = searchParams.get(key);
      if (v) qs.set(key, v);
    }
    const s = qs.toString();
    return `/fincas${s ? '?' + s : ''}`;
  }, [searchParams]);
  const [resStep,    setResStep]   = useState<ResStep | null>(null);
  const [slideDir,   setSlideDir]  = useState<'fwd' | 'bwd'>('fwd');
  const [resName,    setResName]   = useState('');
  const [resEmail,   setResEmail]  = useState('');
  const [resPhone,   setResPhone]  = useState('');
  const [resNotes,   setResNotes]  = useState('');
  const [payMethod,  setPayMethod] = useState<PayId>('nequi');
  const [cardNum,    setCardNum]   = useState('');
  const [cardHolder, setCardHolder]= useState('');
  const [cardExp,    setCardExp]   = useState('');
  const [cardCvv,    setCardCvv]   = useState('');
  const [mobileResOpen, setMobileResOpen] = useState(false);
  const [copied,        setCopied]        = useState(false);

  const viewing   = viewingCount(finca.id);
  const gallery   = finca.galleryUrls ?? [finca.imageUrl];
  const faved     = isFav(finca.id);

  const discountedPrice = finca.discount ? Math.round(finca.price*(1-finca.discount/100)) : null;

  const nights       = dateSel.start && dateSel.end
    ? Math.max(0, Math.round((dateSel.end.getTime()-dateSel.start.getTime())/86400000)) : 0;
  const subtotal     = nights * (discountedPrice ?? finca.price);
  const fullSubtotal = nights * finca.price;
  const limpieza     = nights ? 90000 : 0;
  const servicio     = Math.round(subtotal * 0.08);
  const total        = subtotal + limpieza + servicio;
  const fullTotal    = fullSubtotal + limpieza + Math.round(fullSubtotal * 0.08);

  /* Fincas similares — misma ciudad o precio cercano */
  const similares = useMemo(()=>
    allFincas.filter(f=>f.id!==finca.id&&(f.city===finca.city||Math.abs(f.price-finca.price)<200000)).slice(0,3)
  ,[finca]);

  /* Tracking recientemente vistas */
  useEffect(()=>{
    try{
      const key='rently-recent';
      const prev=JSON.parse(localStorage.getItem(key)??'[]') as string[];
      localStorage.setItem(key,JSON.stringify([finca.id,...prev.filter(id=>id!==finca.id)].slice(0,5)));
    }catch{}
  },[finca.id]);

  const stepFwd = (to: ResStep) => { setSlideDir('fwd'); setResStep(to); };
  const stepBwd = () => {
    setSlideDir('bwd');
    if (resStep === 'payment') setResStep('info');
    else setResStep(null);
  };
  const handleReserve = () => { if (nights > 0) stepFwd('info'); };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://rently.co/fincas/${finca.id}`).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div className="bg-white min-h-screen" style={{paddingTop:68}}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8">

        {/* ── Top nav ── */}
        <div className="flex items-center justify-between mb-5">
          <Link href={backToFincasHref} className="inline-flex items-center gap-1.5 text-gray-500 text-[13px] font-semibold hover:text-[#8125E2] transition-colors">
            <Icon name="arrowL" size={15}/> Volver a fincas
          </Link>
          <div className="flex items-center gap-1">
            <a href={`https://wa.me/?text=${encodeURIComponent(`Mira esta finca: ${finca.name} — https://rently.co/fincas/${finca.id}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-gray-500 text-[13px] font-semibold hover:text-[#25D366] transition-colors px-3 py-1.5 rounded-lg hover:bg-green-50">
              <Icon name="share" size={14}/> Compartir
            </a>
            <button onClick={copyLink}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all px-3 py-1.5 rounded-lg hover:bg-gray-100"
              style={{color: copied ? '#8125E2' : '#6b7280'}}>
              <Icon name={copied ? 'check' : 'link'} size={14}
                style={{color: copied ? '#8125E2' : '#9ca3af'}}/>
              {copied ? '¡Copiado!' : 'Copiar link'}
            </button>
            <button onClick={()=>toggle(finca.id)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all px-3 py-1.5 rounded-lg"
              style={{
                color: faved ? '#8125E2' : '#6b7280',
                background: faved ? '#f0ebfe' : 'transparent',
              }}>
              <span className={faved ? 'heart-pop' : ''} style={{display:'grid',placeItems:'center'}}>
                <Icon name="heart" size={16}
                  style={{fill: faved ? '#8125E2' : 'none', color: faved ? '#8125E2' : '#9ca3af'}}
                  stroke={1.8}/>
              </span>
              {faved ? 'Guardada' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* ── Gallery — Airbnb style ── */}
        <div className="mb-6">
          {/* Desktop: 1 grande izquierda + 4 en 2×2 derecha */}
          <div className="hidden md:grid gap-2 rounded-2xl overflow-hidden" style={{gridTemplateColumns:'1fr 1fr',height:480}}>
            {/* Imagen principal grande */}
            <div className="relative cursor-pointer group" onClick={()=>setLightboxOpen(true)}>
              <Image src={gallery[0]} alt={finca.name} fill className="object-cover group-hover:brightness-90 transition-all" priority sizes="600px"/>
              {finca.discount && (
                <span className="absolute top-4 left-4 bg-[#8125E2] text-white text-[12px] font-bold px-3 py-1.5 rounded-full"
                  style={{boxShadow:'0 2px 8px rgba(129,37,226,.5)'}}>
                  −{finca.discount}% temporada
                </span>
              )}
            </div>
            {/* 2×2 grid */}
            <div className="grid grid-cols-2 gap-2">
              {[1,2,3,4].map((i)=>(
                <div key={i} className="relative cursor-pointer group overflow-hidden"
                  onClick={()=>{ if(i===4){setLightboxOpen(true);}else{setMainImg(i);setLightboxOpen(true);} }}>
                  <Image src={gallery[i]??gallery[0]} alt={`foto ${i+1}`} fill
                    className="object-cover group-hover:brightness-90 transition-all" sizes="300px"/>
                  {i===4 && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                      <Icon name="grid" size={22}/>
                      <span className="font-bold text-[14px] mt-1.5">Ver todas</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: scroll horizontal de fotos */}
          <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar rounded-2xl" style={{height:260}}>
            {gallery.slice(0,5).map((url,i)=>(
              <div key={i} className="relative flex-none rounded-xl overflow-hidden cursor-pointer" style={{width:260}}
                onClick={()=>{ setMainImg(i); setLightboxOpen(true); }}>
                <Image src={url} alt={`foto ${i+1}`} fill className="object-cover" sizes="260px"/>
                {i===4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-[14px]">+12 fotos</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Title area ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              {finca.discount && (
                <span className="inline-flex items-center gap-1 text-[#8125E2] text-[12px] font-bold mb-2">
                  <Icon name="sparkle" size={12}/> Precio con descuento de temporada
                </span>
              )}
              <h1 className="text-[28px] md:text-[36px] font-extrabold text-gray-900 tracking-tight leading-tight">
                {finca.name}
              </h1>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-gray-500 text-[13.5px]">
            <Stars value={finca.rating} reviews={finca.reviews} />
            <span className="flex items-center gap-1.5 font-medium">
              <Icon name="pin" size={13}/> {finca.sector}, {finca.city}, {finca.dept}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Icon name="users" size={13}/> Hasta {finca.capacity} personas
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Icon name="bed" size={13}/> {finca.bedrooms} alcobas · {finca.baths} baños
            </span>
            {/* Viewing counter */}
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-[12.5px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
              {viewing} personas viendo ahora
            </span>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid gap-10 items-start grid-cols-1 lg:grid-cols-[1fr_360px]">

          {/* LEFT */}
          <div>
            {/* Tagline + descripción */}
            <p className="text-[17px] font-semibold text-[#8125E2] mb-3">{finca.tagline}</p>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-8 max-w-[65ch]">{finca.desc}</p>

            {/* Host */}
            <div className="flex items-center gap-4 py-5 border-y border-gray-100 mb-8">
              <Avatar name="Familia Rincón" size={48}/>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-[15px]">Anfitrión: Familia Rincón</p>
                <p className="text-gray-400 text-[13px] mt-0.5">Superanfitrión · Responde en ~1 hora</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-[#f6f1fe] text-[#8125E2] text-[12px] font-bold px-3 py-1.5 rounded-full flex-none">
                <Icon name="shield" size={13}/> Verificado
              </span>
            </div>

            {/* Amenidades */}
            <div className="mb-10">
              <h2 className="text-[20px] font-extrabold text-gray-900" style={{marginBottom:32}}>Amenidades</h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {finca.amenities.map((a)=>{
                  const m=AMENITY_META[a];
                  return (
                    <div key={a} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <span className="w-10 h-10 rounded-lg bg-[#f0ebfe] text-[#8125E2] grid place-items-center flex-none">
                        <Icon name={m.icon} size={20}/>
                      </span>
                      <span className="text-[13.5px] font-semibold text-gray-700">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendario interactivo — selecciona fechas aquí */}
            <div className="mb-8">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-7 shadow-sm">
                <InteractiveCalendar
                  sel={dateSel}
                  setSel={setDateSel}
                  calState={calState}
                  city={finca.city}
                />
              </div>
              <div className="flex items-start gap-3 bg-[#f6f1fe] rounded-xl p-4 mt-4">
                <span className="w-10 h-10 rounded-full bg-[#8125E2] grid place-items-center flex-none">
                  <OwlMark size={26} head="transparent" cut="#fff"/>
                </span>
                <p className="text-[13.5px] text-gray-600 leading-relaxed">
                  <b className="text-gray-900">Tip Rently:</b> las fincas con río y piscina se reservan rápido en temporada alta. Asegura tus fechas con anticipación.
                </p>
              </div>
            </div>

            {/* Mapa aproximado */}
            <div className="mb-8">
              <h2 className="text-[20px] font-extrabold text-gray-900" style={{marginBottom:20}}>Ubicación</h2>
              <p className="text-gray-400 text-[13.5px] mb-5">{finca.sector}, {finca.city}, {finca.dept} — ubicación aproximada</p>
              <div className="rounded-2xl overflow-hidden border border-gray-100" style={{height:240}}>
                <MapView fincas={[finca]} noPopup />
              </div>
            </div>

          </div>

          {/* RIGHT — Reservation card (solo desktop) ── */}
          <div className="hidden lg:block sticky" style={{top:'calc(68px + 16px)'}}>
            <div className="bg-white border border-gray-200 rounded-2xl p-7" style={{boxShadow:'0 8px 32px rgba(0,0,0,.10)'}}>
              {/* Precio — total de la estadía si ya hay fechas, precio por noche si no */}
              {nights > 0 ? (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  {finca.discount && (
                    <p className="text-gray-400 text-[15px] line-through leading-none mb-1">{fmtCOP(fullTotal)}</p>
                  )}
                  <span className="text-[30px] font-extrabold text-gray-900 tracking-tight">{fmtCOP(total)}</span>
                  <p className="text-gray-400 text-[13px] mt-1.5">por {nights} {nights===1?'noche':'noches'}</p>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 mb-5 pb-5 border-b border-gray-100">
                  <span className="text-[30px] font-extrabold text-gray-900 tracking-tight">
                    {fmtCOP(discountedPrice ?? finca.price)}
                  </span>
                  <span className="text-gray-400 text-[14px] font-normal">/ noche</span>
                  {discountedPrice && (
                    <span className="text-gray-400 text-[13px] line-through ml-1">{fmtCOP(finca.price)}</span>
                  )}
                </div>
              )}
              <h3 className="text-[15px] font-extrabold text-gray-900 mb-5 pb-5 border-b border-gray-100">Realiza tu reserva</h3>
              <ReservationForm
                finca={finca} dateSel={dateSel}
                adultsG={adultsG} childrenG={childrenG} babiesG={babiesG}
                setAdultsG={setAdultsG} setChildrenG={setChildrenG} setBabiesG={setBabiesG}
                onReserve={handleReserve}
                nights={nights} total={total} subtotal={subtotal} limpieza={limpieza} servicio={servicio}
              />
            </div>
          </div>
        </div>

        {/* ── Reseñas ── */}
        <ReviewsSection finca={finca} />

        {/* ── Lo que debes saber ── */}
        <InfoSection finca={finca} />

        {/* ── Fincas similares ── */}
        {similares.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-[24px] font-extrabold text-gray-900 tracking-tight" style={{marginBottom:40}}>
              También te puede interesar
            </h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {similares.map((f,i)=>(
                <FadeIn key={f.id} delay={i*80}>
                  <FarmCard finca={f}/>
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100"
        style={{boxShadow:'0 -4px 20px rgba(0,0,0,.08)'}}>
        <div className="flex items-center justify-between px-4 py-3 max-w-[1200px] mx-auto">
          <div>
            {nights > 0 ? (
              <>
                <span className="text-[22px] font-extrabold text-gray-900">{fmtCOP(total)}</span>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {fmt(dateSel.start)} → {fmt(dateSel.end)} · {nights} {nights===1?'noche':'noches'}
                </p>
              </>
            ) : (
              <>
                <span className="text-[22px] font-extrabold text-gray-900">{fmtCOP(discountedPrice??finca.price)}</span>
                <span className="text-gray-400 text-[13px] font-normal"> / noche</span>
              </>
            )}
          </div>
          <button
            onClick={()=>setMobileResOpen(true)}
            className="flex items-center gap-2 bg-[#8125E2] text-white px-6 py-3 rounded-xl font-bold text-[15px] hover:bg-[#7720d1] active:scale-[.97] transition-all"
            style={{boxShadow:'0 4px 16px rgba(129,37,226,.4)'}}>
            Reservar ahora <Icon name="arrowR" size={16}/>
          </button>
        </div>
      </div>
      {/* Spacer para el bottom bar en mobile */}
      <div className="lg:hidden h-20"/>

      {/* ── Mobile reservation bottom sheet ── */}
      {mobileResOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setMobileResOpen(false)}/>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[92vh] overflow-y-auto"
            style={{animation:'pop .3s cubic-bezier(.2,.8,.3,1.1)'}}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200"/>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                {nights > 0 ? (
                  <p className="text-[22px] font-extrabold text-gray-900">{fmtCOP(total)}<span className="text-gray-400 text-[13px] font-normal"> por {nights} {nights===1?'noche':'noches'}</span></p>
                ) : (
                  <p className="text-[22px] font-extrabold text-gray-900">{fmtCOP(discountedPrice??finca.price)}<span className="text-gray-400 text-[13px] font-normal"> /noche</span></p>
                )}
              </div>
              <button onClick={()=>setMobileResOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-600 hover:bg-gray-200">
                <Icon name="x" size={18}/>
              </button>
            </div>
            <div className="px-5 py-4">
              <h3 className="text-[16px] font-extrabold text-gray-900 mb-4">Realiza tu reserva</h3>
              <ReservationForm
                finca={finca} dateSel={dateSel}
                adultsG={adultsG} childrenG={childrenG} babiesG={babiesG}
                setAdultsG={setAdultsG} setChildrenG={setChildrenG} setBabiesG={setBabiesG}
                onReserve={()=>{ if(nights>0){handleReserve(); setMobileResOpen(false);} }}
                nights={nights} total={total} subtotal={subtotal} limpieza={limpieza} servicio={servicio}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Multi-step reservation modal ── */}
      {resStep && (
        <div className="modal-scrim" onClick={() => resStep !== 'done' ? stepBwd() : setResStep(null)}>
          <div
            className="bg-white w-[92vw] max-w-[460px] overflow-hidden"
            style={{ borderRadius: 24, boxShadow: '0 28px 72px rgba(33,27,46,.24)', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >

            {resStep !== 'done' ? (<>

              {/* ── Header ── */}
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1.5px solid #f3f0f8' }}>
                <button onClick={stepBwd}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors text-[13px] font-semibold">
                  <Icon name="chevL" size={15}/> Volver
                </button>
                <span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-gray-400">
                  Paso {resStep === 'info' ? 2 : 3} de 3
                </span>
                <button onClick={() => setResStep(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <Icon name="x" size={14}/>
                </button>
              </div>

              {/* ── Stepper visual ── */}
              <div className="flex items-center px-8 pt-5 pb-2">
                {STEP_LABELS.map(({ n, label }, i) => {
                  const cur  = resStep === 'info' ? 2 : 3;
                  const done = n < cur;
                  const act  = n === cur;
                  return (
                    <React.Fragment key={n}>
                      <div className="flex flex-col items-center gap-1.5 flex-none">
                        <div
                          className="w-8 h-8 rounded-full grid place-items-center text-[12px] font-extrabold transition-all duration-300"
                          style={{
                            background: done || act ? '#8125E2' : '#f3f0f8',
                            color:      done || act ? '#fff'    : '#b0a8c0',
                            boxShadow:  act ? '0 0 0 5px rgba(129,37,226,.18)' : 'none',
                          }}
                        >
                          {done ? <Icon name="check" size={13}/> : n}
                        </div>
                        <span className="text-[10.5px] font-bold whitespace-nowrap"
                          style={{ color: act ? '#8125E2' : done ? '#b09ad4' : '#c0b8cc' }}>
                          {label}
                        </span>
                      </div>
                      {i < STEP_LABELS.length - 1 && (
                        <div className="flex-1 h-[2px] mx-2 mb-4 rounded-full transition-all duration-500"
                          style={{ background: n < cur ? '#8125E2' : '#e8e2f0' }}/>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* ── Step content ── */}
              <div key={resStep} className={`px-6 pb-7 pt-2 ${slideDir === 'fwd' ? 'slide-fwd' : 'slide-bwd'}`}>

                {/* ── Paso 2: Tu información ── */}
                {resStep === 'info' && (
                  <div className="flex flex-col gap-4">
                    <div className="mb-1">
                      <h2 className="text-[20px] font-extrabold text-gray-900 mb-0.5">Tu información</h2>
                      <p className="text-[13px] text-gray-400">Datos para confirmar tu reserva en {finca.name}</p>
                    </div>

                    {/* Booking summary pill */}
                    <div className="flex items-center justify-between bg-[#f6f1fe] rounded-2xl px-5 py-3.5">
                      <div>
                        <p className="font-bold text-gray-900 text-[14px] leading-tight">{finca.name}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                          {nights} {nights===1?'noche':'noches'} · {guests} {guests===1?'persona':'personas'}
                          {dateSel.start && dateSel.end && (
                            <> · {dateSel.start.toLocaleDateString('es-CO',{day:'numeric',month:'short'})} → {dateSel.end.toLocaleDateString('es-CO',{day:'numeric',month:'short'})}</>
                          )}
                        </p>
                      </div>
                      <span className="text-[15px] font-extrabold text-[#8125E2] ml-4 whitespace-nowrap">{fmtCOP(total)}</span>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">Nombre completo</label>
                      <input className="res-input" type="text" value={resName} onChange={e=>setResName(e.target.value)} placeholder="Ej. Carlos Rodríguez"/>
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">Correo</label>
                        <input className="res-input" type="email" value={resEmail} onChange={e=>setResEmail(e.target.value)} placeholder="correo@ejemplo.com"/>
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">Celular</label>
                        <input className="res-input" type="tel" value={resPhone} onChange={e=>setResPhone(e.target.value)} placeholder="300 000 0000"/>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">
                        Solicitudes especiales
                        <span className="text-gray-300 normal-case font-normal ml-1">(opcional)</span>
                      </label>
                      <textarea className="res-input resize-none" rows={3} value={resNotes} onChange={e=>setResNotes(e.target.value)}
                        placeholder="Llegamos tarde, necesitamos cuna para bebé..."/>
                    </div>

                    <button
                      onClick={() => stepFwd('payment')}
                      disabled={!resName.trim() || !resEmail.trim() || !resPhone.trim()}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                      style={{ background: '#8125E2', boxShadow: '0 6px 20px rgba(129,37,226,.32)' }}
                    >
                      Continuar al pago <Icon name="arrowR" size={16}/>
                    </button>
                  </div>
                )}

                {/* ── Paso 3: Método de pago ── */}
                {resStep === 'payment' && (
                  <div className="flex flex-col gap-4">
                    <div className="mb-1">
                      <h2 className="text-[20px] font-extrabold text-gray-900 mb-0.5">Método de pago</h2>
                      <p className="text-[13px] text-gray-400">Elige cómo quieres pagar tu estancia</p>
                    </div>

                    {/* Payment method grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {PAY_OPTS.map(opt => {
                        const sel = payMethod === opt.id;
                        return (
                          <button key={opt.id} onClick={() => setPayMethod(opt.id)}
                            className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-left transition-all"
                            style={{
                              border:     `2px solid ${sel ? opt.color : '#e8e2f0'}`,
                              background: sel ? opt.bg : 'white',
                            }}>
                            <div className="w-8 h-8 rounded-xl grid place-items-center flex-none transition-all"
                              style={{ background: sel ? opt.color : '#f3f0f8' }}>
                              <Icon name={opt.icon} size={15} style={{ color: sel ? 'white' : '#b0a8c0' }}/>
                            </div>
                            <span className="font-bold text-[13px] transition-colors"
                              style={{ color: sel ? opt.color : '#4b4558' }}>
                              {opt.label}
                            </span>
                            {sel && <Icon name="check" size={12} style={{ color: opt.color, marginLeft: 'auto' }}/>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Conditional form */}
                    <div key={payMethod} className="slide-fwd">
                      {(payMethod === 'nequi' || payMethod === 'daviplata') && (
                        <div>
                          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">
                            Número {payMethod === 'nequi' ? 'Nequi' : 'Daviplata'}
                          </label>
                          <input className="res-input" type="tel" placeholder="300 000 0000"/>
                        </div>
                      )}

                      {payMethod === 'pse' && (
                        <div>
                          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">Banco</label>
                          <select className="res-input cursor-pointer" defaultValue="">
                            <option value="" disabled>Selecciona tu banco</option>
                            {['Bancolombia','Banco de Bogotá','Davivienda','BBVA','Banco Popular','Itaú','Scotiabank Colpatria','AV Villas'].map(b=>(
                              <option key={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {payMethod === 'card' && (
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">Número de tarjeta</label>
                            <input className="res-input" type="text" value={cardNum}
                              onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())}
                              placeholder="0000 0000 0000 0000" maxLength={19}/>
                          </div>
                          <div>
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">Titular</label>
                            <input className="res-input" type="text" value={cardHolder}
                              onChange={e => setCardHolder(e.target.value.toUpperCase())}
                              placeholder="NOMBRE APELLIDO"/>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">Vencimiento</label>
                              <input className="res-input" type="text" value={cardExp}
                                onChange={e => {
                                  const d = e.target.value.replace(/\D/g,'').slice(0,4);
                                  setCardExp(d.length > 2 ? d.slice(0,2) + '/' + d.slice(2) : d);
                                }}
                                placeholder="MM/AA" maxLength={5}/>
                            </div>
                            <div>
                              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8125E2] mb-1.5">CVV</label>
                              <input className="res-input" type="text" value={cardCvv}
                                onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                                placeholder="•••" maxLength={4}/>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center py-3.5 border-t border-gray-100 mt-1">
                      <span className="text-[13px] font-bold text-gray-400">Total a pagar</span>
                      <span className="text-[19px] font-extrabold text-gray-900">{fmtCOP(total)}</span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => stepFwd('done')}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[.98]"
                      style={{ background: '#8125E2', boxShadow: '0 6px 20px rgba(129,37,226,.32)' }}
                    >
                      <Icon name="shield" size={16}/> Confirmar reserva
                    </button>
                    <p className="text-center text-[11.5px] text-gray-400 font-medium -mt-1.5">
                      No se te cobrará nada todavía · Pago 100% seguro
                    </p>
                  </div>
                )}
              </div>

            </>) : (

              /* ── Done ── */
              <div className="px-8 py-10 text-center slide-fwd">
                <div className="w-16 h-16 rounded-full bg-[#8125E2] grid place-items-center mx-auto mb-5"
                  style={{ boxShadow: '0 8px 28px rgba(129,37,226,.4)' }}>
                  <OwlMark size={36} head="white" cut="#8125E2"/>
                </div>
                <h3 className="text-[22px] font-extrabold text-gray-900 mb-2">¡Solicitud enviada!</h3>
                <p className="text-gray-500 text-[14px] leading-relaxed">
                  Tu reserva en <b className="text-gray-900">{finca.name}</b> por {nights} {nights===1?'noche':'noches'} fue enviada. El anfitrión confirmará en breve.
                </p>
                <div className="flex justify-between font-extrabold text-[15px] bg-[#f0ebfe] rounded-xl px-5 py-4 my-5 text-[#8125E2]">
                  <span className="text-gray-900">Total</span>
                  <span>{fmtCOP(total)}</span>
                </div>
                <button onClick={() => setResStep(null)}
                  className="w-full py-3 rounded-xl bg-[#8125E2] text-white font-bold hover:bg-[#7720d1] transition-colors">
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Gallery lightbox ── */}
      {lightboxOpen && (
        <GalleryModal
          images={gallery} current={mainImg} fincaName={finca.name}
          onClose={()=>setLightboxOpen(false)}
          onPrev={()=>setMainImg(i=>(i-1+gallery.length)%gallery.length)}
          onNext={()=>setMainImg(i=>(i+1)%gallery.length)}
        />
      )}
    </div>
  );
}
