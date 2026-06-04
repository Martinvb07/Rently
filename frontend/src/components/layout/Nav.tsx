'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OwlMark from '@/components/ui/OwlMark';
import Icon from '@/components/ui/Icon';

const LINKS = [
  { href: '/fincas',    label: 'Fincas'       },
  { href: '/fincas',    label: 'Mis reservas'  },
  { href: '/#contacto', label: 'Contacto'      },
];

export default function Nav() {
  const pathname     = usePathname();
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const isHome = pathname === '/';
  const onDark = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const navBg = onDark
    ? 'bg-transparent border-transparent'
    : 'bg-white/95 backdrop-blur-md border-gray-100 shadow-sm';

  const linkCls = (active: boolean) =>
    `px-4 py-2 rounded-full text-[14px] font-semibold transition-all ${
      active
        ? 'bg-[#f0ebfe] text-[#8125E2]'
        : onDark
          ? 'text-white/85 hover:bg-white/15 hover:text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center border-b transition-all duration-200 ${navBg}`}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 w-full flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <OwlMark size={30} head={onDark ? 'white' : '#8125E2'} cut={onDark ? 'transparent' : '#fff'} />
            <span className={`font-extrabold text-[20px] tracking-tight ${onDark ? 'text-white' : 'text-gray-900'}`}>
              Rently
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map((l, i) => (
              <Link key={i} href={l.href} className={linkCls(pathname === l.href && i === 0)}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin" className={linkCls(pathname === '/admin')}>
              <span className="flex items-center gap-1.5"><Icon name="grid" size={14} /> Anfitriones</span>
            </Link>
            <Link
              href="/fincas"
              className="inline-flex items-center gap-1.5 bg-[#8125E2] text-white px-4 py-2 rounded-full text-[14px] font-bold hover:bg-[#7720d1] active:scale-[.97] transition-all"
              style={{ boxShadow: '0 3px 12px rgba(129,37,226,.35)' }}
            >
              Reservar ahora
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl transition-colors hover:bg-gray-100"
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
          <div className="relative bg-white border-b border-gray-100 shadow-xl px-5 py-6 flex flex-col gap-2">
            {LINKS.map((l, i) => (
              <Link
                key={i} href={l.href}
                className="py-3 px-4 rounded-xl text-[16px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#8125E2] transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/admin" className="py-3 px-4 rounded-xl text-[16px] font-semibold text-gray-700 hover:bg-gray-50">
              Anfitriones
            </Link>
            <Link
              href="/fincas"
              className="mt-2 py-3.5 rounded-xl bg-[#8125E2] text-white text-[15px] font-bold text-center hover:bg-[#7720d1] transition-colors"
            >
              Reservar ahora
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
