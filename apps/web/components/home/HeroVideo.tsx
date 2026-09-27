"use client";

import { useEffect, useState } from "react";

type HeroVideoProps = {
  src: string;
  type: string;
  poster: string;
};

/**
 * Latar video untuk hero.
 *
 * Guardrail performa (video autoplay 5 MB adalah pembunuh LCP nomor satu):
 * - gambar poster di belakang komponen ini tetap menjadi elemen LCP;
 * - <video> baru dipasang setelah mount + jeda singkat, jadi tidak berebut
 *   bandwidth dengan poster;
 * - `preload="none"` menjauhkan file dari jalur kritis sampai browser memutuskan
 *   memutar;
 * - dilewati total saat `prefers-reduced-motion` atau koneksi hemat data / 2G;
 * - di-fade setelah event `playing`, jadi frame setengah buffer tidak terlihat.
 */
export function HeroVideo({ src, type, poster }: HeroVideoProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /^(slow-)?2g$/.test(connection.effectiveType)) {
      return;
    }

    const timer = window.setTimeout(() => setActive(true), 500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-700 data-playing:opacity-100"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={(event) => {
        event.currentTarget.dataset.playing = "true";
      }}
    >
      <source src={src} type={type} />
    </video>
  );
}
