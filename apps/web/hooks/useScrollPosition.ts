"use client";

import { useEffect, useState } from "react";

/**
 * True ketika halaman sudah discroll melewati ambang kecil (dipakai navbar
 * untuk mengganti gaya setelah scroll).
 *
 * Dulu hook ini menyimpan `window.scrollY` di state sehingga navbar re-render
 * setiap frame scroll. Sekarang state hanya berisi boolean dan hanya berubah
 * ketika nilainya benar-benar berubah, dibaca lewat requestAnimationFrame
 * dengan listener `passive`.
 *
 * `enabled: false` membuat hook ini tidak memasang listener sama sekali.
 * Dipakai halaman beranda, yang navbar-nya memakai IntersectionObserver pada
 * hero, sehingga tidak perlu membaca posisi scroll.
 */
export function useScrollPosition(threshold = 8, enabled = true) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;

    const read = () => {
      frame = 0;
      setScrolled((previous) => {
        const next = window.scrollY > threshold;
        return next === previous ? previous : next;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    read();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold, enabled]);

  return enabled ? scrolled : false;
}
