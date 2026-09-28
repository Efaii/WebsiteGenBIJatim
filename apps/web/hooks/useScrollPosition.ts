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
 */
export function useScrollPosition(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
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
  }, [threshold]);

  return scrolled;
}
