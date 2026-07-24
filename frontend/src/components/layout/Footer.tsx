import Link from 'next/link';
import OwlMark from '@/components/ui/OwlMark';

const NAV_COLS = [
  {
    heading: 'Destinos',
    links: [
      { label: 'Fincas en Acacías',         href: '/fincas?ciudad=acacias'      },
      { label: 'Fincas en Melgar',           href: '/fincas?ciudad=melgar'       },
      { label: 'Fincas en Anapoima',         href: '/fincas?ciudad=anapoima'     },
      { label: 'Fincas en Salento',          href: '/fincas?ciudad=salento'      },
      { label: 'Villavicencio',              href: '/fincas?ciudad=villavicencio'},
      { label: 'Santa Fe de Antioquia',      href: '/fincas?ciudad=santafe'      },
    ],
  },
  {
    heading: 'Anfitriones',
    links: [
      { label: 'Publicar mi finca',        href: '/admin'   },
      { label: 'Panel de gestión',         href: '/admin'   },
      { label: 'Gestión de temporadas',    href: '/admin'   },
      { label: 'Preguntas frecuentes',     href: '/'        },
    ],
  },
  {
    heading: 'Soporte',
    links: [
      { label: 'Centro de ayuda',         href: '/' },
      { label: 'Política de cancelación', href: '/' },
      { label: 'Términos de uso',         href: '/' },
      { label: 'Privacidad',              href: '/' },
    ],
  },
];

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="w-9 h-9 rounded-xl bg-white/10 grid place-items-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: '#120e1c' }} className="text-white">

      {/* Main grid */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <OwlMark size={28} head="white" cut="#120e1c" />
              <span className="font-extrabold text-[20px] tracking-tight">Rently</span>
            </Link>
            <p className="text-white/50 text-[13.5px] leading-relaxed mb-5">
              Fincas de descanso en toda Colombia. Del piedemonte llanero al Eje Cafetero.
            </p>
            <div className="flex flex-col gap-1.5 text-[13px] text-white/45 mb-6">
              <span>hola@rently.co</span>
              <span>+57 320 000 0000</span>
              <span>Bogotá · Villavicencio</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <SocialIcon href="https://instagram.com/rently.co" label="Instagram">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://wa.me/573200000000" label="WhatsApp">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="https://tiktok.com/@rently.co" label="TikTok">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/>
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.heading}>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30 mb-4">{col.heading}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[14px] text-white/65 hover:text-white transition-colors duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[12.5px] text-white/35">
          <span>© 2024 Rently S.A.S. · Hecho en Colombia 🇨🇴</span>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-white/70 transition-colors">Privacidad</Link>
            <Link href="/" className="hover:text-white/70 transition-colors">Términos</Link>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/25">
              <span className="gtm-live" /> GTM-RENTLY · pixel activo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
