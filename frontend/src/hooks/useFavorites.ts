'use client';
import { useState, useEffect } from 'react';

const KEY = 'rently-favorites';

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setFavs(JSON.parse(stored));
    } catch {}
    setReady(true);
  }, []);

  const toggle = (id: string) => {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const isFav = (id: string) => ready && favs.includes(id);

  return { favs, toggle, isFav };
}
