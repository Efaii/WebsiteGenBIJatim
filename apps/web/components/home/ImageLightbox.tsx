"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { GalleryImage } from "@/types/news-gallery.types";

/**
 * Lightbox gambar berita.
 *
 * Sengaja TIDAK fullscreen: panel dibatasi `min(900px, 85vw)` dan tinggi
 * gambar 75vh. Menutup lewat tombol, klik backdrop, atau tombol Escape.
 * Fokus dipindah ke tombol tutup saat dibuka dan dikembalikan ke pemicunya
 * saat ditutup, dan scroll halaman dikunci selama terbuka.
 */
export function ImageLightbox({
  image,
  onClose,
}: {
  image: GalleryImage | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(image);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || "Pratinjau gambar"}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div aria-hidden="true" className="lightbox-backdrop absolute inset-0 bg-black/60" />

      <div
        className="lightbox-panel relative z-10 h-[75vh] w-[min(900px,85vw)] max-h-[80vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="85vw"
          className="rounded-media object-contain"
        />

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup pratinjau"
          className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:-top-12"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
