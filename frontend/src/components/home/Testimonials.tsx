import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';

interface Testimonial {
  quote: string;
  name: string;
  context: string;
  finca: string;
}

const FEATURED: Testimonial = {
  quote:
    'Reservamos Finca El Piedemonte para el cumpleaños de mi mamá. Doce personas, tres noches, y todo funcionó perfecto desde la reserva hasta la llegada. El calendario en tiempo real fue clave — sabíamos exactamente qué estaba disponible sin llamar a nadie. Volvemos en diciembre.',
  name: 'María Camila Rojas',
  context: '12 huéspedes · Acacías, Meta',
  finca: 'Finca El Piedemonte',
};

const SECONDARY: Testimonial[] = [
  {
    quote:
      'Finca Café & Niebla fue exactamente como en las fotos. El proceso de reserva tardó menos de 5 minutos y el anfitrión respondió en media hora. Experiencia 10/10.',
    name: 'Valentina Suárez',
    context: '8 huéspedes · Salento, Quindío',
    finca: 'Finca Café & Niebla',
  },
  {
    quote:
      'Llevamos tres grupos grandes a Melgar este año y siempre usamos Rently. La Quinta El Tamarindo es perfecta para despedidas de solteros — piscina enorme y todo organizado.',
    name: 'Sebastián Mora',
    context: '14 huéspedes · Melgar, Tolima',
    finca: 'Quinta El Tamarindo',
  },
];

function FincaTag({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#8125E2] text-[12.5px] font-bold">
      <Icon name="pin" size={12} />
      {name}
    </span>
  );
}

export default function Testimonials() {
  return (
    <section className="max-w-[1200px] mx-auto px-8 py-24">
      {/* Heading — left-aligned, no eyebrow */}
      <div className="mb-14">
        <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Lo que dicen<br />nuestros huéspedes
        </h2>
        <p className="text-gray-400 mt-3 text-[16px] max-w-[400px]">
          Más de 500 reservas completadas. Aquí, algunos de quienes ya vivieron la experiencia.
        </p>
      </div>

      {/* Asymmetric layout: featured (wider) + two stacked */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2" style={{ gridTemplateColumns: undefined }}>

        {/* ── Featured testimonial ── */}
        <div
          className="rounded-2xl p-10 flex flex-col justify-between"
          style={{ background: '#f6f1fe' }}
        >
          {/* Large quote mark as visual anchor */}
          <div>
            <span
              className="block font-extrabold leading-none select-none mb-4"
              style={{ fontSize: 48, color: '#8125E2', opacity: 0.4, lineHeight: 1 }}
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="text-[17px] text-gray-800 leading-relaxed font-semibold max-w-[52ch]">
              {FEATURED.quote}
            </p>
          </div>

          <div className="flex items-center justify-between mt-10 pt-8 border-t border-purple-100">
            <div className="flex items-center gap-3">
              <Avatar name={FEATURED.name} size={44} />
              <div>
                <p className="font-extrabold text-gray-900 text-[15px] leading-tight">{FEATURED.name}</p>
                <p className="text-gray-400 text-[13px] mt-0.5">{FEATURED.context}</p>
              </div>
            </div>
            <FincaTag name={FEATURED.finca} />
          </div>
        </div>

        {/* ── Two stacked secondary testimonials ── */}
        <div className="flex flex-col gap-6">
          {SECONDARY.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-7 flex flex-col justify-between flex-1"
              style={{ border: '1px solid #ece7f2', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}
            >
              <div>
                <span
                  className="block font-extrabold leading-none select-none mb-3"
                  style={{ fontSize: 36, color: '#8125E2', opacity: 0.3, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="text-[16px] text-gray-700 leading-relaxed font-medium">
                  {t.quote}
                </p>
              </div>

              <div className="flex items-center justify-between mt-7 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Avatar name={t.name} size={36} />
                  <div>
                    <p className="font-bold text-gray-900 text-[14px] leading-tight">{t.name}</p>
                    <p className="text-gray-400 text-[12px] mt-0.5">{t.context}</p>
                  </div>
                </div>
                <FincaTag name={t.finca} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom social proof bar */}
      <div className="flex items-center justify-center gap-8 mt-14 pt-10 border-t border-gray-100">
        {[
          { val: '+500', label: 'reservas completadas' },
          { val: '4.9★', label: 'calificación promedio' },
          { val: '98%', label: 'recomendarían Rently' },
        ].map((stat) => (
          <div key={stat.val} className="text-center">
            <p className="text-[22px] font-extrabold text-[#8125E2]">{stat.val}</p>
            <p className="text-gray-400 text-[13px] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
