<div align="center">

# 🏡 Brently

**Plataforma web de reservas de fincas para Colombia**

_Desarrollado por [Llano Studio](https://llanostudio.co)_

---

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

**[🌐 Ver en producción](#)** · **[📋 Reportar un error](#)** · **[💬 Contacto](https://llanostudio.co)**

</div>

---

## ¿Qué es Brently?

Brently es una plataforma web completa para la **gestión y reserva de fincas de descanso en Colombia**. Permite a los administradores publicar múltiples propiedades, gestionar disponibilidad por temporadas y recibir reservas confirmadas por WhatsApp — todo desde un panel de control unificado.

Los huéspedes pueden explorar el catálogo, consultar disponibilidad en tiempo real y hacer su reserva en minutos, desde cualquier dispositivo. Brently se instala como aplicación en Android e iPhone directamente desde el navegador, sin necesidad de la App Store.

---

## ¿Qué hace la plataforma?

### Para los huéspedes

- 🔍 Explorar el catálogo de fincas con filtros por destino, capacidad y disponibilidad
- 📅 Consultar el calendario de disponibilidad en tiempo real
- 💰 Ver precios según la temporada del año
- 📲 Hacer una reserva y recibir confirmación por WhatsApp
- 📱 Instalar Brently como app en su celular (Android & iPhone, sin App Store)

### Para los administradores

- 🏡 Gestionar múltiples fincas desde un solo panel
- 🗓️ Bloquear fechas, crear temporadas y definir precios por periodo
- ✅ Confirmar, rechazar o cancelar reservas
- 📊 Ver estadísticas clave del negocio
- 📣 Tracking completo con GTM, Meta Pixel y Google Analytics 4

---

## ¿Para quién es?

| Perfil                        | Beneficio principal                                                     |
| ----------------------------- | ----------------------------------------------------------------------- |
| **Propietario de finca**      | Publica y gestiona su propiedad sin necesidad de conocimientos técnicos |
| **Administrador del negocio** | Control total de reservas, precios y disponibilidad desde el panel      |
| **Huésped / Turista**         | Reserva fácil, rápida y confirmada por WhatsApp desde el celular        |
| **Equipo de marketing**       | Medición precisa con GTM, Meta Pixel y GA4 desde el primer día          |

---

## Tecnologías

| Capa          | Tecnología                | Propósito                                     |
| ------------- | ------------------------- | --------------------------------------------- |
| Frontend      | Next.js 14 + Tailwind CSS | Interfaz pública e interna                    |
| PWA           | next-pwa                  | Instalación en Android e iPhone               |
| Backend       | Node.js + Express         | API REST y lógica de negocio                  |
| Base de datos | MongoDB                   | Almacenamiento de fincas, reservas y usuarios |
| Hosting       | VPS Hostinger             | Servidor propio, ahorra costos al cliente     |
| Analítica     | Google Tag Manager + GA4  | Medición de tráfico y conversiones            |
| Pixel         | Meta Pixel + Google Ads   | Remarketing y seguimiento de visitantes       |
| Mensajería    | WhatsApp (wa.me)          | Confirmación de reservas instantánea          |

---

## Estructura del proyecto

```
brently/
├── frontend/               # Aplicación Next.js (cliente + admin)
│   ├── public/             # Íconos, imágenes, manifest PWA
│   └── src/
│       ├── app/            # Páginas y layouts (App Router)
│       ├── components/     # Componentes reutilizables
│       │   ├── ui/         # Átomos: botones, badges, íconos
│       │   ├── layout/     # Nav, Footer, Shell
│       │   ├── fincas/     # Tarjetas y listado de fincas
│       │   ├── home/       # Secciones del homepage
│       │   └── admin/      # Panel administrativo
│       ├── hooks/          # Hooks personalizados (favoritos, etc.)
│       ├── lib/            # Datos, utilidades, cliente API
│       └── types/          # Tipos TypeScript compartidos
│
├── backend/                # API REST con Express
│   └── src/
│       ├── config/         # Conexión a base de datos
│       ├── controllers/    # Lógica de cada endpoint
│       ├── models/         # Modelos de Mongoose
│       ├── routes/         # Definición de rutas
│       ├── middlewares/    # Autenticación, errores
│       └── server.ts       # Entrada del servidor
│
├── .github/                # Plantillas de PR y flujos CI
├── .gitignore
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

## Roadmap

### ✅ Completado — v1.0

- [x] Catálogo de fincas con filtros por ciudad y capacidad
- [x] Página de detalle con galería, amenidades y calendario
- [x] Sistema de reservas con formulario y confirmación por WhatsApp
- [x] Panel de administración (fincas, reservas, fechas bloqueadas)
- [x] Gestión de temporadas y precios por periodo
- [x] Integración GTM + Meta Pixel + GA4
- [x] Instalación PWA (Android & iPhone sin App Store)
- [x] Footer, testimonios y sección "Cómo funciona"
- [x] SEO: sitemap.xml, robots.txt, meta tags por finca
- [x] Diseño responsive — mobile first

### 🔜 Próximamente — v1.1

- [ ] Autenticación de anfitriones (JWT + panel multi-cuenta)
- [ ] Integración de pasarela de pagos (PSE / tarjeta)
- [ ] Notificaciones push para nuevas reservas
- [ ] Galería de fotos reales por finca (S3 / Cloudinary)
- [ ] Reseñas y calificaciones de huéspedes
- [ ] Soporte multiidioma (español / inglés)

---

## Links útiles

| Recurso                    | URL                                      |
| -------------------------- | ---------------------------------------- |
| Plataforma en producción   | _(pendiente de despliegue)_              |
| Llano Studio               | [llanostudio.co](https://llanostudio.co) |
| Contacto del desarrollador | contacto@llanostudio.co                  |

---

<div align="center">

Desarrollado con ❤️ en Colombia por **[Llano Studio](https://llanostudio.co)**

_© 2026 Llano Studio. Todos los derechos reservados hasta recibir pago total por parte del cliente._

</div>
