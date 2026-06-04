import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import PublicShell from '@/components/layout/PublicShell';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import BackToTop from '@/components/ui/BackToTop';
import CookieConsent from '@/components/ui/CookieConsent';
import Script from 'next/script';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Rently — Fincas en arriendo en Colombia', template: '%s | Rently' },
  description: 'Reserva fincas de descanso en Acacías, Melgar, Anapoima, Salento y más. Disponibilidad en tiempo real.',
  keywords: ['fincas arriendo Colombia', 'fincas descanso', 'alquiler fincas', 'turismo rural Colombia'],
  openGraph: {
    title: 'Rently — Fincas en arriendo en Colombia',
    description: 'Reserva fincas de descanso con piscina, asador y naturaleza. Disponibilidad en tiempo real.',
    type: 'website',
    locale: 'es_CO',
    siteName: 'Rently',
  },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-RENTLY';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={jakarta.className}>
      <head>
        {/* Google Tag Manager */}
        {GTM_ID && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
        {/* Meta Pixel */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
      </head>
      <body className="min-h-screen flex flex-col" style={{ background: '#FBFAF6' }} suppressHydrationWarning>
        {/* GTM noscript fallback */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0" width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <PublicShell>{children}</PublicShell>
        <WhatsAppButton />
        <BackToTop />
        <CookieConsent />
      </body>
    </html>
  );
}
