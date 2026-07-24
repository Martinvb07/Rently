'use client';
import { useState } from 'react';
import Icon from './Icon';

export interface DateSel { start: Date | null; end: Date | null; }

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DOW   = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

function sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString(); }

export function fmt(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

interface Props {
  sel: DateSel;
  setSel: (s: DateSel) => void;
  onApply?: () => void;
  onClear?: () => void;
  applyLabel?: string;
}

export default function DateRangePicker({ sel, setSel, onApply, onClear, applyLabel = 'Continuar →' }: Props) {
  const [view, setView] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const today    = new Date(); today.setHours(0,0,0,0);
  const first    = new Date(view.y, view.m, 1);
  const startDow = (first.getDay() + 6) % 7;
  const days     = new Date(view.y, view.m + 1, 0).getDate();

  const pick = (d: number) => {
    const date = new Date(view.y, view.m, d); date.setHours(0,0,0,0);
    if (date < today) return;
    if (!sel.start || (sel.start && sel.end)) { setSel({ start: date, end: null }); }
    else if (date > sel.start) { setSel({ start: sel.start, end: date }); }
    else { setSel({ start: date, end: null }); }
  };

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startDow; i++) cells.push(<div key={`e${i}`} />);
  for (let d = 1; d <= days; d++) {
    const date    = new Date(view.y, view.m, d); date.setHours(0,0,0,0);
    const isPast  = date < today;
    const isStart = !!(sel.start && sameDay(date, sel.start));
    const isEnd   = !!(sel.end   && sameDay(date, sel.end));
    const inRange = !!(sel.start && sel.end && date > sel.start && date < sel.end);
    const isToday = sameDay(date, today);
    let cls = 'aspect-square grid place-items-center text-[13px] font-semibold rounded-full transition-all ';
    if (isPast)              cls += 'text-gray-300 cursor-not-allowed';
    else if (isStart||isEnd) cls += 'bg-[#8125E2] text-white cursor-pointer cal-pick';
    else if (inRange)        cls += 'bg-[#f0ebfe] text-[#8125E2] rounded-none';
    else if (isToday)        cls += 'border-2 border-[#8125E2] text-[#8125E2] cursor-pointer hover:bg-[#f0ebfe]';
    else                     cls += 'text-gray-700 cursor-pointer hover:bg-[#f0ebfe] hover:text-[#8125E2]';
    cells.push(<div key={d} className={cls} onClick={() => !isPast && pick(d)}>{d}</div>);
  }

  return (
    <div className="p-4">
      {/* Cuando llegas / Cuando te vas — estilo HeroSearch */}
      <div className="flex gap-2 mb-4">
        <div
          className="flex-1 rounded-xl px-3 py-2 transition-all"
          style={{
            background: sel.start ? '#f0ebfe' : '#f9fafb',
            border: `1.5px solid ${sel.start ? '#c0a0f1' : '#e5e7eb'}`,
          }}
        >
          <p className="text-[10px] font-extrabold tracking-[.1em] uppercase text-[#8125E2]">Cuando llegas</p>
          <p className={`text-[13px] font-semibold mt-0.5 ${sel.start ? 'text-gray-900' : 'text-gray-400'}`}>
            {fmt(sel.start) ?? 'Agrega una fecha'}
          </p>
        </div>
        <div
          className="flex-1 rounded-xl px-3 py-2 transition-all"
          style={{
            background: sel.end ? '#f0ebfe' : '#f9fafb',
            border: `1.5px solid ${sel.end ? '#c0a0f1' : '#e5e7eb'}`,
          }}
        >
          <p className="text-[10px] font-extrabold tracking-[.1em] uppercase text-[#8125E2]">Cuando te vas</p>
          <p className={`text-[13px] font-semibold mt-0.5 ${sel.end ? 'text-gray-900' : 'text-gray-400'}`}>
            {fmt(sel.end) ?? 'Agrega una fecha'}
          </p>
        </div>
      </div>

      {/* Navegación del mes */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setView(v => ({ y: v.m===0 ? v.y-1 : v.y, m: (v.m+11)%12 }))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <Icon name="chevL" size={16} />
        </button>
        <span className="font-bold text-gray-800 text-[14px] capitalize">{MESES[view.m]} {view.y}</span>
        <button
          onClick={() => setView(v => ({ y: v.m===11 ? v.y+1 : v.y, m: (v.m+1)%12 }))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <Icon name="chevR" size={16} />
        </button>
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">{cells}</div>

      {/* Acciones */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          className="px-4 py-2.5 rounded-xl text-gray-500 font-semibold text-[13px] hover:bg-gray-50 transition-colors"
          onClick={() => { setSel({ start: null, end: null }); onClear?.(); }}
        >
          Limpiar
        </button>
        <button
          className="flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white hover:opacity-90 transition-all"
          style={{ background: '#8125E2' }}
          onClick={onApply}
        >
          {applyLabel}
        </button>
      </div>
    </div>
  );
}
