"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import type { GalleryImage } from "@/types/news-gallery.types";

// Deteksi klien-saja untuk portal tanpa `setState` di dalam effect
// (aturan react-hooks/set-state-in-effect): snapshot server `false`,
// snapshot klien `true`, React menangani perbedaan saat hydration.
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Lightbox gambar berita.
 *
 * Sengaja TIDAK fullscreen: panel dibatasi `min(900px, 85vw)` dan tinggi
 * gambar 75vh. Menutup lewat tombol, klik backdrop, atau tombol Escape.
 * Fokus dipindah ke tombol tutup saat dibuka dan dikembalikan ke pemicunya
 * saat ditutup, dan scroll halaman dikunci selama terbuka.
 *
 * Dialog dirender lewat portal ke `document.body`: kalau dibiarkan di tempatnya,
 * ia bisa terperangkap stacking context milik ancestor (mis. `main` ber-`z-10`
 * atau wrapper ber-transform), sehingga navbar fixed tetap di atas backdrop dan
 * tombol tutup ikut tertutup. Portal memastikan `z-[200]` berlaku di akar
 * halaman, di halaman mana pun komponen ini dipakai.
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
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

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

  if (!image || !mounted) return null;

  return createPortal(
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
    </div>,
    document.body,
  );
}
