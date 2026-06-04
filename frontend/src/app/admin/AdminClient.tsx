'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Reserva, ReservaStatus } from '@/types';
import { fmtCOP } from '@/lib/data';
import OwlMark from '@/components/ui/OwlMark';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: 'grid'     },
  { name: 'Fincas',    icon: 'home'     },
  { name: 'Reservas',  icon: 'list'     },
  { name: 'Calendario',icon: 'calendar' },
  { name: 'Temporadas',icon: 'sun'      },
] as const;

const TABS = [
  { k: 'todas',     l: 'Todas'      },
  { k: 'pendiente', l: 'Pendientes' },
  { k: 'confirmada',l: 'Confirmadas'},
  { k: 'cancelada', l: 'Canceladas' },
];

export default function AdminClient({ initialReservas }: { initialReservas: Reserva[] }) {
  const [rows,    setRows]    = useState<Reserva[]>(initialReservas);
  const [tab,     setTab]     = useState('todas');
  const [q,       setQ]       = useState('');
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [navItem, setNavItem] = useState('Reservas');

  useEffect(() => {
    const close = () => setMenuFor(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const counts: Record<string, number> = {
    todas:     rows.length,
    pendiente: rows.filter((r) => r.status === 'pendiente').length,
    confirmada:rows.filter((r) => r.status === 'confirmada').length,
    cancelada: rows.filter((r) => r.status === 'cancelada').length,
  };

  let view = rows.filter((r) => tab === 'todas' || r.status === tab);
  if (q.trim()) {
    const s = q.toLowerCase();
    view = view.filter((r) =>
      r.guest.toLowerCase().includes(s) ||
      r.finca.toLowerCase().includes(s) ||
      r.id.toLowerCase().includes(s)
    );
  }

  const setStatus = (id: string, status: ReservaStatus) => {
    setRows((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
    setMenuFor(null);
  };

  const ingresos = rows
    .filter((r) => r.status === 'confirmada')
    .reduce((a, r) => a + r.total, 0);

  const stats = [
    { icon: 'calendar', bg: '#f0ebfe', color: '#8125E2', val: String(counts.todas),    label: 'Reservas activas',     delta: '+3 esta semana', up: true  },
    { icon: 'money',    bg: '#e8f8ef', color: '#1f9d57', val: fmtCOP(ingresos),         label: 'Ingresos confirmados', delta: '+18% vs. mayo',   up: true  },
    { icon: 'clock',    bg: '#fef6e4', color: '#d97706', val: String(counts.pendiente), label: 'Por confirmar',        delta: 'Requiere acción', up: false },
    { icon: 'trendUp',  bg: '#e8f4fd', color: '#2b86c5', val: '82%',                    label: 'Ocupación junio',      delta: '+6 pts',          up: true  },
  ];

  return (
    <div className="flex min-h-screen overflow-hidden" style={{ background: '#f8f9fb' }}>

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-[240px] flex-none flex-col sticky top-0 h-screen" style={{ background: '#8125E2' }}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-white/15">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <OwlMark size={28} head="white" cut="#8125E2" />
            <span className="text-white font-extrabold text-[20px] tracking-tight">Rently</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 flex flex-col gap-0.5 overflow-y-auto">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/35 px-3 pb-2 pt-1">Gestión</p>
          {NAV_ITEMS.map((n) => (
            <button
              key={n.name}
              onClick={() => setNavItem(n.name)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-[14px] w-full text-left transition-all ${
                navItem === n.name
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              <Icon name={n.icon} size={17} />
              {n.name}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 pb-5 border-t border-white/15 pt-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name="Carolina Díaz" size={36} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-[13px] truncate">Carolina Díaz</p>
              <p className="text-white/50 text-[11.5px]">Anfitriona</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/10 text-[13px] font-medium transition-all">
            <Icon name="arrowL" size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto p-5 md:p-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-5 mb-7">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">{navItem}</h1>
            <p className="text-gray-400 text-[14px] mt-0.5">Administra las reservas de tu plataforma.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <label className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 w-[260px] focus-within:border-[#8125E2] transition-colors">
              <Icon name="search" size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar reserva o huésped…"
                className="flex-1 text-[13.5px] font-medium text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
              />
            </label>
            <button className="inline-flex items-center gap-1.5 bg-[#8125E2] text-white px-4 py-2.5 rounded-xl text-[13.5px] font-bold hover:bg-[#7720d1] active:scale-[.98] transition-all">
              <Icon name="plus" size={15} /> Nueva reserva
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <div className="w-10 h-10 rounded-xl grid place-items-center mb-4 flex-none" style={{ background: s.bg, color: s.color }}>
                <Icon name={s.icon} size={20} />
              </div>
              <p className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-none mb-1">{s.val}</p>
              <p className="text-[13px] text-gray-400 font-medium mb-2">{s.label}</p>
              <p className="text-[12px] font-semibold inline-flex items-center gap-1" style={{ color: s.up ? '#1f9d57' : '#d97706' }}>
                {s.up && <Icon name="trendUp" size={12} />}{s.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>

          {/* Table toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4 flex-wrap">
            <div className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                    tab === t.k
                      ? 'bg-[#f0ebfe] text-[#8125E2]'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {t.l}
                  <span className="ml-1.5 text-[11.5px] opacity-60">{counts[t.k]}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-500">
              <Icon name="calendar" size={14} style={{ color: '#9ca3af' }} />
              <span>01/06/2024 — 30/06/2024</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID','Finca','Huéspedes','Check-in','Check-out','Total','Estado','Cliente','Fecha',''].map((h) => (
                    <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    <td className="px-5 py-3.5 font-bold text-gray-700 text-[13px]">{r.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800 text-[13.5px]">{r.finca}</p>
                      <p className="text-gray-400 text-[12px] flex items-center gap-1 mt-0.5"><Icon name="pin" size={10} />{r.city}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-[13.5px]">{r.people}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-[13.5px]">{r.inDate}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-[13.5px]">{r.outDate}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900 text-[13.5px]">{fmtCOP(r.total)}</td>
                    <td className="px-5 py-3.5">
                      <div className="relative inline-block">
                        <span
                          className="cursor-pointer inline-flex"
                          onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === r.id ? null : r.id); }}
                        >
                          <Badge status={r.status} />
                        </span>
                        {menuFor === r.id && (
                          <div
                            className="absolute top-[calc(100%+4px)] left-0 z-40 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 min-w-[160px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(['pendiente', 'confirmada', 'cancelada'] as ReservaStatus[]).map((s) => (
                              <button
                                key={s}
                                onClick={() => setStatus(r.id, s)}
                                className="flex w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Badge status={s} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800 text-[13px]">{r.guest}</p>
                      <p className="text-gray-400 text-[11.5px] mt-0.5">{r.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-[12px]">
                      {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="w-8 h-8 rounded-lg grid place-items-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all">
                        <Icon name="dots" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {view.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <OwlMark size={44} head="#dcc8f8" cut="white" />
              <p className="text-gray-700 font-bold mt-4">No hay reservas que coincidan</p>
              <p className="text-gray-400 text-[13px] mt-1">Prueba cambiando los filtros o el estado seleccionado.</p>
            </div>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-gray-400 text-[12px] mt-4">
          <Icon name="info" size={13} /> Clic en el estado de una reserva para cambiarlo en tiempo real.
        </p>
      </main>
    </div>
  );
}
