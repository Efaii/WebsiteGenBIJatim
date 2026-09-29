"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  separator?: string;
  suffix?: string;
}

/**
 * Angka yang berjalan naik saat masuk viewport.
 *
 * Memakai tween berdurasi tetap, bukan spring. Spring punya ekor asimtotik:
 * angkanya mendekati nilai akhir dengan sangat lambat sehingga terasa berat
 * di ujung animasi. Dengan tween, durasinya pasti, angkanya mendarat tepat di
 * nilai akhir, dan `easeOutExpo` membuat gerakannya cepat di awal lalu halus
 * berhenti.
 *
 * Perilaku lain yang dipertahankan:
 * - nilai akhir sudah dirender sejak awal (SSR / tanpa JS / sebelum masuk
 *   viewport tidak menampilkan angka kosong);
 * - `prefers-reduced-motion` langsung menampilkan nilai akhir tanpa animasi;
 * - animasi dihentikan saat unmount.
 */
export default function CountUp({
  to,
  from = 0,
  delay = 0,
  duration = 1.1,
  className = "",
  separator = ",",
  suffix = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  const format = (value: number) =>
    Math.floor(value).toLocaleString("en-US").replace(/,/g, separator) + suffix;

  useEffect(() => {
    if (!isInView || reduce) return;
    if (!ref.current) return;

    const node = ref.current;
    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => {
        node.textContent = format(value);
      },
      onComplete: () => {
        node.textContent = format(to);
      },
    });

    return () => controls.stop();
    // format() sengaja tidak masuk dependency: nilainya turunan dari
    // separator/suffix yang sudah tercakup di bawah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, reduce, from, to, delay, duration, separator, suffix]);

  return (
    <span className={className} ref={ref}>
      {format(to)}
    </span>
  );
}
