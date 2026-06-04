import Link from 'next/link';
import Image from 'next/image';
import { fincas, cities } from '@/lib/data';
import Icon from '@/components/ui/Icon';
import OwlMark from '@/components/ui/OwlMark';
import FarmCard from '@/components/fincas/FarmCard';
import HeroSearch from '@/components/home/HeroSearch';
import CityCard from '@/components/home/CityCard';
import Testimonials from '@/components/home/Testimonials';
import FadeIn from '@/components/ui/FadeIn';

export default function HomePage() {
  const featured = fincas.slice(0, 3);
  const HERO_IMG = 'https://picsum.photos/seed/colombia-campo/1440/700';

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section
        className="relative flex items-center"
        style={{ minHeight: 'clamp(500px,80vh,680px)', paddingTop: 68 }}
      >
        <div className="absolute inset-0">
          <Image src={HERO_IMG} alt="Finca colombiana" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-14 md:py-24 w-full">
          <div className="max-w-[620px]">
            <h1
              className="text-white font-extrabold tracking-tight"
              style={{ fontSize: 'clamp(34px,7vw,78px)', lineHeight: 1.0 }}
            >
              Descansa.<br />Conecta.<br />Vive el campo.
            </h1>
            <p className="text-white/80 mt-6 text-[17px] leading-relaxed font-normal max-w-[460px]">
              Fincas exclusivas en toda Colombia para momentos inolvidables.
            </p>
            <div className="flex items-center gap-5 mt-8">
              <Link
                href="/fincas"
                className="inline-flex items-center gap-2 bg-[#8125E2] text-white px-7 py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#7720d1] active:scale-[.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{ boxShadow: '0 10px 30px rgba(129,37,226,.5)' }}
              >
                Reservar ahora <Icon name="arrowR" size={17} />
              </Link>
              <span className="inline-flex items-center gap-2 text-white/65 text-[13.5px] font-medium">
                <Icon name="shield" size={14} /> Cancelación flexible
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HERO SEARCH — flujo normal, entre hero y trust strip ── */}
      <div className="hidden md:block relative z-20 bg-white" style={{ marginTop: -1 }}>
        <div className="max-w-[1200px] mx-auto px-8 py-5">
          <HeroSearch cities={cities} embedded />
        </div>
      </div>

      {/* ── TRUST STRIP — 2×2 on mobile, 4 cols on desktop ── */}
      <section style={{ background: '#8125E2' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { icon: 'pin',         val: `${cities.length} destinos`, sub: 'De los llanos al café' },
              { icon: 'shield',      val: '+50 fincas',                sub: 'Verificadas por Rently' },
              { icon: 'star',        val: '4.9 / 5',                   sub: 'Calificación promedio' },
              { icon: 'checkCircle', val: '100% seguro',               sub: 'Pago protegido' },
            ].map((ti, i) => (
              <div key={ti.val} className="flex items-center gap-3 py-5 px-2 md:px-0">
                <span className="w-9 h-9 rounded-lg bg-white/15 text-white grid place-items-center flex-none">
                  <Icon name={ti.icon} size={17} />
                </span>
                <div>
                  <p className="font-extrabold text-white text-[14px] md:text-[15px] leading-tight">{ti.val}</p>
                  <p className="text-white/75 text-[12px] md:text-[13px] mt-0.5">{ti.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINCAS DESTACADAS ── */}
      <section className="max-w-[1200px] mx-auto px-8 pt-24 pb-24">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Fincas destacadas
            </h2>
            <p className="text-gray-400 mt-3 text-[16px]">Las más reservadas en todo el país</p>
          </div>
          <Link href="/fincas" className="inline-flex items-center gap-1.5 border-2 border-[#8125E2] text-[#8125E2] px-5 py-2.5 rounded-xl font-bold text-[14px] hover:bg-[#8125E2] hover:text-white active:scale-[.98] transition-all">
            Ver todas las fincas <Icon name="arrowR" size={15} />
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((f, i) => (
            <FadeIn key={f.id} delay={i * 100}>
              <FarmCard finca={f} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── DESTINOS ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-24">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                Explora por destino
              </h2>
              <p className="text-gray-400 mt-3 text-[16px]">Del piedemonte llanero al Eje Cafetero</p>
            </div>
            <Link href="/fincas" className="text-[#8125E2] font-bold flex items-center gap-1.5 text-[14px] hover:underline focus-visible:underline">
              Ver todos los destinos <Icon name="arrowR" size={16} />
            </Link>
          </div>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c, i) => (
              <FadeIn key={c.key} delay={i * 80}>
                <CityCard city={c} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como" className="py-20 md:py-24 border-y border-gray-100">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Reservar toma 5 minutos
              </h2>
              <p className="text-gray-400 mt-3 text-[16px]">Sin llamadas, sin intermediarios</p>
            </div>
          </FadeIn>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            {[
              { n: '01', icon: 'search',      t: 'Elige tu destino',        d: 'Explora fincas en Acacías, Melgar, Anapoima y más. Filtra por capacidad, precio y amenidades.' },
              { n: '02', icon: 'calendar',    t: 'Revisa disponibilidad',   d: 'Calendario en tiempo real. Elige tus fechas y el número de huéspedes sin sorpresas.' },
              { n: '03', icon: 'checkCircle', t: 'Reserva y disfruta',      d: 'Confirma tu reserva de forma segura y recibe los detalles de llegada directamente.' },
            ].map((s, i) => (
              <FadeIn key={s.n} delay={i * 120}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-black text-[#8125E2] opacity-50 font-mono">{s.n}</span>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#f0ebfe] text-[#8125E2] grid place-items-center">
                    <Icon name={s.icon} size={22} />
                  </div>
                  <h3 className="text-[19px] font-extrabold text-gray-900">{s.t}</h3>
                  <p className="text-gray-500 text-[15px] leading-relaxed">{s.d}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <Testimonials />

      {/* ── CTA ANFITRIÓN ── */}
      <section className="max-w-[1200px] mx-auto px-8 py-24">
        <div
          className="relative rounded-2xl overflow-hidden flex items-center gap-10"
          style={{ background: '#8125E2', padding: '72px 80px' }}
        >
          <div className="relative z-10 max-w-[540px]">
            <h2 className="text-[48px] font-extrabold text-white leading-tight tracking-tight">
              ¿Tienes una finca<br />para arrendar?
            </h2>
            <p className="text-white/75 mt-5 text-[17px] leading-relaxed">
              Publica tu finca, gestiona tu calendario y recibe reservas de huéspedes verificados en todo el país.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 mt-10 bg-white text-[#8125E2] px-8 py-4 rounded-xl font-bold text-[15px] hover:bg-purple-50 active:scale-[.98] transition-all"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}
            >
              Conviértete en anfitrión <Icon name="arrowR" size={16} />
            </Link>
          </div>
          <div className="absolute right-0 inset-y-0 flex items-center pr-16 opacity-[.08]">
            <OwlMark size={280} head="white" cut="rgba(255,255,255,0)" />
          </div>
        </div>
      </section>

    </div>
  );
}
