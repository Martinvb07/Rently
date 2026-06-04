import type { MetadataRoute } from 'next';
import { fincas, cities } from '@/lib/data';

const BASE = 'https://rently.co';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE,           lastModified: now, changeFrequency: 'weekly',  priority: 1    },
    { url: `${BASE}/fincas`, lastModified: now, changeFrequency: 'daily',   priority: 0.9  },
    ...fincas.map((f) => ({
      url:             `${BASE}/fincas/${f.id}`,
      lastModified:    now,
      changeFrequency: 'weekly' as const,
      priority:        0.8,
    })),
    ...cities.map((c) => ({
      url:             `${BASE}/fincas?ciudad=${c.key}`,
      lastModified:    now,
      changeFrequency: 'weekly' as const,
      priority:        0.7,
    })),
  ];
}
