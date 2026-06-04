'use client';
import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import Icon from './Icon';

interface GalleryModalProps {
  images: string[];
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  fincaName: string;
}

export default function GalleryModal({ images, current, onClose, onPrev, onNext, fincaName }: GalleryModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft')  onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
      onClick={onClose}
      style={{ animation: 'fade .2s ease' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-none" onClick={(e) => e.stopPropagation()}>
        <p className="text-white font-semibold text-[15px]">{fincaName}</p>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-[13px]">{current + 1} / {images.length}</span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 grid place-items-center text-white hover:bg-white/20 transition-colors"
            aria-label="Cerrar galería"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center px-16 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 grid place-items-center text-white hover:bg-white/30 transition-colors"
          aria-label="Foto anterior"
        >
          <Icon name="chevL" size={22} />
        </button>

        <div className="relative w-full max-w-[900px] aspect-[16/9] rounded-xl overflow-hidden">
          <Image
            src={images[current]}
            alt={`${fincaName} — foto ${current + 1}`}
            fill
            className="object-cover"
            sizes="900px"
            priority
          />
        </div>

        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 grid place-items-center text-white hover:bg-white/30 transition-colors"
          aria-label="Foto siguiente"
        >
          <Icon name="chevR" size={22} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex-none px-6 py-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2 justify-center overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => i !== current && (i < current ? onPrev() : onNext())}
              className={`flex-none w-14 h-10 rounded-lg overflow-hidden transition-all ${
                i === current ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <Image src={url} alt={`miniatura ${i + 1}`} width={56} height={40} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
