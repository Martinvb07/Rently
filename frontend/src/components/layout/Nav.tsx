'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OwlMark from '@/components/ui/OwlMark';
import Icon from '@/components/ui/Icon';
import HeroSearch from '@/components/home/HeroSearch';
import { cities } from '@/lib/data';

const LINKS = [
  { href: '/fincas',    label: 'Fincas'    },
  { href: '/#como',     label: 'Nosotros'  },
  { href: '/#contacto', label: 'Contacto'  },
];

/* Menú del engranaje — configuración / ayuda */
const GEAR_MENU = [
  { icon: 'help',     label: 'Centro de ayuda',   href: '/#contacto' },
  { icon: 'settings', label: 'Configuración',     href: '#' },
  { icon: 'globe',    label: 'Idioma y moneda',   href: '#' },
  { icon: 'home',     label: 'Conviértete en anfitrión', href: '/admin', divide: true },
  { icon: 'logout',   label: 'Términos y privacidad',    href: '#' },
] as const;

export default function Nav() {
  const pathname   = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [docked,   setDocked]   = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gearOpen, setGearOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const gearRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';
  const onDark = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      /* "docked": el buscador embebido del home ya pasó por encima del navbar.
         Cuando eso ocurre, los links centrales se ocultan y aparece el buscador
         compacto dentro del navbar (comportamiento tipo Airbnb). */
      const anchor = document.getElementById('hero-search-anchor');
      setDocked(!!anchor && anchor.getBoundingClientRect().bottom <= 74);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [pathname]);

  useEffect(() => { setMenuOpen(false); setGearOpen(false); setSearchExpanded(false); }, [pathname]);

  /* Cerrar el buscador expandido con Escape */
  useEffect(() => {
    if (!searchExpanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchExpanded(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchExpanded]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (gearRef.current && !gearRef.current.contains(e.target as Node)) setGearOpen(false);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const navBg = searchExpanded
    ? 'bg-white border-transparent'                        /* header blanco sólido al expandir el buscador */
    : onDark
      ? 'bg-black/20 backdrop-blur-sm border-transparent'
      : 'bg-white/95 backdrop-blur-md border-gray-100 shadow-sm';

  const linkCls = (active: boolean) =>
    `px-4 py-2 rounded-full text-[14px] font-semibold transition-all ${
      active
        ? 'bg-[#f0ebfe] text-[#8125E2]'
        : onDark
          ? 'text-white hover:bg-white/15 hover:text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  /* Sombra de texto solo sobre el hero, para que el blanco se lea igual sobre
     las zonas claras (atardecer) y oscuras de la imagen */
  const overText = onDark ? { textShadow: '0 1px 6px rgba(0,0,0,.45)' } : undefined;

  /* El buscador compacto solo aparece en el home, una vez el buscador grande se
     ocultó al hacer scroll. Al hacer clic se expande al buscador completo. */
  const showCompactSearch = isHome && docked && !searchExpanded;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center border-b transition-all duration-200 ${navBg}`}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 w-full flex items-center justify-between gap-4" style={overText}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-none">
            <OwlMark
              size={32}
              head={onDark ? 'white' : '#8125E2'}
              cut={onDark ? '#1a1424' : '#fff'}
            />
            <span className={`font-extrabold text-[21px] tracking-tight ${onDark ? 'text-white' : 'text-gray-900'}`}>
              Rently
            </span>
          </Link>

          {/* Centro — links, buscador compacto, o vacío mientras está expandido */}
          <div className="hidden md:flex flex-1 justify-center min-w-0">
            {searchExpanded ? (
              <span aria-hidden />
            ) : showCompactSearch ? (
              <button
                onClick={() => setSearchExpanded(true)}
                className="nav-search-in group flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-5 pr-2 py-2 hover:shadow-md transition-shadow max-w-full"
                style={{ boxShadow: '0 2px 10px rgba(33,27,46,.08)' }}
                aria-label="Abrir búsqueda"
              >
                <span className="text-[13.5px] font-bold text-gray-800 whitespace-nowrap">Explora destinos</span>
                <span className="w-px h-4 bg-gray-200 mx-2.5" />
                <span className="text-[13.5px] text-gray-500 whitespace-nowrap">Fechas</span>
                <span className="w-px h-4 bg-gray-200 mx-2.5" />
                <span className="text-[13.5px] text-gray-500 whitespace-nowrap hidden lg:inline">Huéspedes</span>
                <span className="ml-1.5 w-8 h-8 rounded-full grid place-items-center flex-none text-white transition-transform group-hover:scale-105"
                  style={{ background: '#8125E2' }}>
                  <Icon name="search" size={15} />
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                {LINKS.map((l, i) => (
                  <Link key={i} href={l.href} className={linkCls(pathname === l.href && i === 0)}>
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Derecha — Anfitriones + engranaje */}
          <div className="hidden md:flex items-center gap-2 flex-none">
            <Link href="/admin" className={linkCls(pathname === '/admin')}>
              <span className="flex items-center gap-1.5"><Icon name="grid" size={14} /> Anfitriones</span>
            </Link>

            {/* Engranaje → menú de configuración / ayuda */}
            <div className="relative" ref={gearRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setGearOpen(o => !o); }}
                aria-label="Configuración y ayuda"
                className={`w-10 h-10 rounded-full grid place-items-center transition-all ${
                  gearOpen
                    ? 'bg-[#f0ebfe] text-[#8125E2]'
                    : onDark
                      ? 'text-white hover:bg-white/15'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon name="settings" size={19} style={{ transition: 'transform .3s', transform: gearOpen ? 'rotate(60deg)' : 'none' }} />
              </button>

              {gearOpen && (
                <div
                  className="search-drop absolute top-[calc(100%+8px)] right-0 z-50 bg-white rounded-2xl w-[248px] py-2"
                  style={{ border: '1.5px solid #e2dcec', boxShadow: '0 20px 48px rgba(33,27,46,.16)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {GEAR_MENU.map((m) => (
                    <div key={m.label}>
                      {'divide' in m && m.divide && <div className="h-px bg-gray-100 my-2" />}
                      <Link
                        href={m.href}
                        onClick={() => setGearOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold text-gray-700 hover:bg-[#f6f1fe] hover:text-[#8125E2] transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-50 grid place-items-center text-gray-400 flex-none">
                          <Icon name={m.icon} size={16} />
                        </span>
                        {m.label}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl transition-colors hover:bg-gray-100 flex-none"
            style={{ color: onDark ? 'white' : '#374151' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <Icon name={menuOpen ? 'x' : 'list'} size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ paddingTop: 68 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="relative bg-white border-b border-gray-100 shadow-xl px-5 py-6 flex flex-col gap-1">
            {LINKS.map((l, i) => (
              <Link
                key={i} href={l.href}
                className="py-3 px-4 rounded-xl text-[16px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#8125E2] transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            {GEAR_MENU.map((m) => (
              <Link
                key={m.label} href={m.href}
                className="flex items-center gap-3 py-3 px-4 rounded-xl text-[15px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#8125E2] transition-colors"
              >
                <Icon name={m.icon} size={17} style={{ color: '#9ca3af' }} /> {m.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Buscador expandido desde el navbar (estilo Airbnb) — banda blanca arriba,
          scrim oscuro debajo, y el mismo buscador con calendario de dos meses */}
      {searchExpanded && (
        <div className="hidden md:block fixed inset-0 z-40">
          <div
            className="absolute inset-x-0 top-0 bg-white nav-scrim-in"
            style={{ height: 176, boxShadow: '0 6px 16px rgba(33,27,46,.06)' }}
            onClick={() => setSearchExpanded(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 nav-scrim-in"
            style={{ top: 176, background: 'rgba(26,20,36,.28)' }}
            onClick={() => setSearchExpanded(false)}
          />
          <div className="absolute inset-x-0 flex justify-center px-4" style={{ top: 86 }}>
            <div className="w-full max-w-[980px] nav-search-expand" onClick={(e) => e.stopPropagation()}>
              <HeroSearch cities={cities} expanded onSearch={() => setSearchExpanded(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
