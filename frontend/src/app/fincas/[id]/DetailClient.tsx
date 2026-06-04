'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Finca, CalendarState, AmenityKey } from '@/types';
import { fmtCOP } from '@/lib/data';
import Icon from '@/components/ui/Icon';
import OwlMark from '@/components/ui/OwlMark';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import GalleryModal from '@/components/ui/GalleryModal';

/* ─── Calendar ─────────────────────────────────────────────── */
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DOW   = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];
const TODAY = new Date(2026, 5, 3);

function Calendar({ calState }: { calState: CalendarState }) {
  const [view, setView] = useState({ y: 2026, m: 5 });
  const first    = new Date(view.y, view.m, 1);
  const startDow = (first.getDay() + 6) % 7;
  const days     = new Date(view.y, view.m + 1, 0).getDate();
  const isJune   = view.y === 2026 && view.m === 5;

  const state = (d: number) => {
    const date = new Date(view.y, view.m, d);
    if (date < TODAY)                                return 'past';
    if (isJune && calState.reserved.includes(d))     return 'reserved';
    if (isJune && calState.blocked.includes(d))      return 'blocked';
    return 'avail';
  };

  const goPrev = () => setView((v) => v.y === 2026 && v.m === 5 ? v : { y: v.m === 0 ? v.y - 1 : v.y, m: (v.m + 11) % 12 });
  const goNext = () => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: (v.m + 1) % 12 }));

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startDow; i++) cells.push(<div key={`e${i}`} />);
  for (let d = 1; d <= days; d++) {
    const s = state(d);
    const base = 'aspect-square rounded-lg grid place-items-center text-[13.5px] font-semibold transition-colors';
    const cls =
      s === 'past'     ? `${base} text-gray-200 cursor-not-allowed` :
      s === 'reserved' ? `${base} bg-red-50 text-red-400 cursor-not-allowed` :
      s === 'blocked'  ? `${base} bg-gray-50 text-gray-300 cursor-not-allowed` :
                         `${base} text-gray-700 cursor-pointer hover:bg-[#f6f1fe] hover:text-[#8125E2]`;
    cells.push(<div key={d} className={cls}>{d}</div>);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={goPrev} disabled={isJune}
          className="w-9 h-9 rounded-xl border border-gray-200 grid place-items-center hover:border-[#8125E2] hover:text-[#8125E2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Icon name="chevL" size={17} />
        </button>
        <span className="font-bold text-gray-800 capitalize text-[15px]">{MESES[view.m]} {view.y}</span>
        <button
          onClick={goNext}
          className="w-9 h-9 rounded-xl border border-gray-200 grid place-items-center hover:border-[#8125E2] hover:text-[#8125E2] transition-colors"
        >
          <Icon name="chevR" size={17} />
        </button>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7,1fr)' }}>
        {DOW.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-gray-300 py-1 uppercase tracking-wide">{d}</div>
        ))}
        {cells}
      </div>

      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100">
        {[
          { color: 'bg-emerald-400', label: 'Disponible' },
          { color: 'bg-red-300',     label: 'Reservado'  },
          { color: 'bg-gray-200',    label: 'Bloqueado'  },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
            <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} /> {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Amenity meta ──────────────────────────────────────────── */
const AMENITY_META: Record<AmenityKey, { icon: string; label: string }> = {
  piscina:     { icon: 'pool',    label: 'Piscina'       },
  bbq:         { icon: 'bbq',     label: 'BBQ'           },
  parqueadero: { icon: 'parking', label: 'Parqueadero'   },
  wifi:        { icon: 'wifi',    label: 'WiFi'          },
  aire:        { icon: 'ac',      label: 'Aire acond.'   },
  rio:         { icon: 'river',   label: 'Acceso a río'  },
};

/* ─── Main ──────────────────────────────────────────────────── */
interface Props { finca: Finca; calState: CalendarState; }

export default function DetailClient({ finca, calState }: Props) {
  const [mainImg,    setMainImg]    = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [checkIn,    setCheckIn]    = useState('');
  const [checkOut,   setCheckOut]   = useState('');
  const [guests,   setGuests]   = useState('2');
  const [done,     setDone]     = useState(false);

  const gallery = finca.galleryUrls ?? [finca.imageUrl];
  const thumbs  = gallery.slice(0, 4);

  const nights   = checkIn && checkOut ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0;
  const subtotal = nights * finca.price;
  const limpieza = nights ? 90000 : 0;
  const servicio = Math.round(subtotal * 0.08);
  const total    = subtotal + limpieza + servicio;

  return (
    <div className="bg-white min-h-screen" style={{ paddingTop: 74 }}>
      <div className="max-w-[1200px] mx-auto px-8 py-8">

        {/* ── Top nav ── */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/fincas" className="inline-flex items-center gap-1.5 text-gray-500 text-[13.5px] font-semibold hover:text-[#8125E2] transition-colors">
            <Icon name="arrowL" size={15} /> Volver a fincas
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Mira esta finca en Rently: ${finca.name} en ${finca.city} — https://rently.co/fincas/${finca.id}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-gray-500 text-[13.5px] font-semibold hover:text-[#25D366] transition-colors px-3 py-1.5 rounded-lg hover:bg-green-50"
            >
              <Icon name="share" size={15} /> Compartir
            </a>
            <button className="inline-flex items-center gap-1.5 text-gray-500 text-[13.5px] font-semibold hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
              <Icon name="heart" size={15} /> Guardar
            </button>
          </div>
        </div>

        {/* ── Title area ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-[36px] font-extrabold text-gray-900 tracking-tight leading-tight">
              {finca.name}
            </h1>
            <Badge status={finca.status} />
          </div>
          <div className="flex items-center gap-5 text-gray-500 text-[14px]">
            <span className="flex items-center gap-1.5 font-medium">
              <Icon name="pin" size={14} /> {finca.sector}, {finca.city}, {finca.dept}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Icon name="users" size={14} /> Hasta {finca.capacity} personas
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Icon name="bed" size={14} /> {finca.bedrooms} alcobas · {finca.baths} baños
            </span>
          </div>
        </div>

        {/* ── Gallery ── */}
        <div className="mb-10">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-3 bg-gray-100">
            <Image
              src={gallery[mainImg] ?? finca.imageUrl}
              alt={finca.name}
              width={1200} height={675}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {thumbs.map((url, i) => (
              <div
                key={i}
                className={`aspect-[4/3] rounded-xl overflow-hidden cursor-pointer relative bg-gray-100 transition-opacity ${
                  i === mainImg ? 'ring-2 ring-[#8125E2] ring-offset-2' : 'hover:opacity-80'
                }`}
                onClick={() => setMainImg(i)}
              >
                <Image src={url} alt={`foto ${i + 1}`} fill className="object-cover" sizes="240px" />
                {i === thumbs.length - 1 && (
                  <button
                    className="absolute inset-0 bg-black/55 grid place-items-center text-white font-bold text-[14px] hover:bg-black/70 transition-colors w-full"
                    onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                    aria-label="Ver todas las fotos"
                  >
                    +12 fotos
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid gap-10 items-start grid-cols-1 lg:grid-cols-[1fr_360px]">

          {/* LEFT */}
          <div>
            {/* Tagline */}
            <p className="text-[17px] font-semibold text-[#8125E2] mb-3">{finca.tagline}</p>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-8 max-w-[65ch]">{finca.desc}</p>

            {/* Host */}
            <div className="flex items-center gap-4 py-5 border-y border-gray-100 mb-8">
              <Avatar name="Familia Rincón" size={48} />
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-[15px]">Anfitrión: Familia Rincón</p>
                <p className="text-gray-400 text-[13px] mt-0.5">Superanfitrión · Responde en ~1 hora</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-[#f6f1fe] text-[#8125E2] text-[12px] font-bold px-3 py-1.5 rounded-full">
                <Icon name="shield" size={13} /> Verificado
              </span>
            </div>

            {/* Amenities */}
            <div className="mb-10">
              <h2 className="text-[20px] font-extrabold text-gray-900 mb-5">Comodidades</h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {finca.amenities.map((a) => {
                  const m = AMENITY_META[a];
                  return (
                    <div key={a} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <span className="w-10 h-10 rounded-lg bg-[#f6f1fe] text-[#8125E2] grid place-items-center flex-none">
                        <Icon name={m.icon} size={20} />
                      </span>
                      <span className="text-[13.5px] font-semibold text-gray-700">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar */}
            <div>
              <h2 className="text-[20px] font-extrabold text-gray-900 mb-5">Disponibilidad</h2>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <Calendar calState={calState} />
              </div>

              {/* Owl tip */}
              <div className="flex items-start gap-3 bg-[#f6f1fe] rounded-xl p-4 mt-4">
                <span className="w-10 h-10 rounded-full bg-[#8125E2] grid place-items-center flex-none mt-0.5">
                  <OwlMark size={26} head="transparent" cut="#fff" />
                </span>
                <p className="text-[13.5px] text-gray-600 leading-relaxed">
                  <b className="text-gray-900">Tip:</b> las fincas con río y piscina se reservan rápido en temporada alta. Asegura tus fechas con anticipación.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Reservation card */}
          <div className="sticky" style={{ top: 'calc(74px + 16px)' }}>
            <div className="bg-white border border-gray-200 rounded-2xl p-6" style={{ boxShadow: '0 8px 32px rgba(0,0,0,.10)' }}>
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6 pb-5 border-b border-gray-100">
                <span className="text-[30px] font-extrabold text-gray-900 tracking-tight">{fmtCOP(finca.price)}</span>
                <span className="text-gray-400 text-[14px] font-normal">/ noche</span>
              </div>

              <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">Realiza tu reserva</h3>

              {/* Inputs */}
              <div className="flex flex-col gap-3 mb-5">
                {[
                  { label: 'Check-in',  val: checkIn,  set: setCheckIn,  min: new Date().toISOString().split('T')[0] },
                  { label: 'Check-out', val: checkOut, set: setCheckOut, min: checkIn || new Date().toISOString().split('T')[0] },
                ].map(({ label, val, set, min }) => (
                  <div key={label}>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3 focus-within:border-[#8125E2] hover:border-gray-300 transition-colors">
                      <input
                        type="date" value={val} min={min}
                        onChange={(e) => set(e.target.value)}
                        className="flex-1 text-[14px] font-semibold text-gray-800 outline-none bg-transparent"
                      />
                      <Icon name="calendar" size={16} style={{ color: '#d1d5db', flexShrink: 0 }} />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Huéspedes</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 py-3 focus-within:border-[#8125E2] hover:border-gray-300 transition-colors">
                    <Icon name="users" size={15} style={{ color: '#d1d5db', marginRight: 8, flexShrink: 0 }} />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="flex-1 text-[14px] font-semibold text-gray-800 outline-none bg-transparent cursor-pointer"
                    >
                      {Array.from({ length: finca.capacity }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              {nights > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                  {[
                    [`${fmtCOP(finca.price)} × ${nights} ${nights === 1 ? 'noche' : 'noches'}`, fmtCOP(subtotal)],
                    ['Aseo y entrega', fmtCOP(limpieza)],
                    ['Servicio Rently (8%)', fmtCOP(servicio)],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-[13.5px] text-gray-500">
                      <span>{l}</span><span>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[15px] font-extrabold text-gray-900 pt-2 border-t border-gray-200 mt-1">
                    <span>Total</span><span>{fmtCOP(total)}</span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => nights > 0 && setDone(true)}
                disabled={nights < 1}
                className="w-full py-3.5 rounded-xl bg-[#8125E2] text-white font-bold text-[15px] hover:bg-[#7720d1] active:scale-[.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8125E2]"
                style={{ boxShadow: nights > 0 ? '0 6px 20px rgba(129,37,226,.35)' : 'none' }}
              >
                {nights > 0 ? 'Reservar ahora' : 'Selecciona tus fechas'}
              </button>
              <p className="text-center text-gray-400 text-[12px] mt-3 font-medium">
                Cancelación gratis hasta 7 días antes · Sin cargos ocultos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation modal ── */}
      {done && (
        <div className="modal-scrim" onClick={() => setDone(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-[#8125E2] grid place-items-center mx-auto mb-5">
              <OwlMark size={40} head="transparent" cut="#fff" />
            </div>
            <h3 className="text-[22px] font-extrabold text-gray-900 mb-2">¡Solicitud enviada!</h3>
            <p className="text-gray-500 text-[14px] leading-relaxed">
              Tu reserva en <b className="text-gray-900">{finca.name}</b> por {nights} {nights === 1 ? 'noche' : 'noches'} fue enviada. El anfitrión confirmará en breve.
            </p>
            <div className="flex justify-between font-extrabold text-[15px] bg-[#f6f1fe] rounded-xl p-4 my-5">
              <span>Total</span><span>{fmtCOP(total)}</span>
            </div>
            <button
              onClick={() => setDone(false)}
              className="w-full py-3 rounded-xl bg-[#8125E2] text-white font-bold hover:bg-[#7720d1] transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ── Gallery lightbox ── */}
      {lightboxOpen && (
        <GalleryModal
          images={gallery}
          current={mainImg}
          fincaName={finca.name}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setMainImg((i) => (i - 1 + gallery.length) % gallery.length)}
          onNext={() => setMainImg((i) => (i + 1) % gallery.length)}
        />
      )}
    </div>
  );
}
