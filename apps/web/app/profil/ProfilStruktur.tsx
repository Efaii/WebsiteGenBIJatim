"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/Container";
import type { ProfilDivision } from "@/content/profil";

/*
 * Struktur organisasi tingkat korwil dengan carousel ala feed Instagram.
 *
 * Revisi terakhir (Oktober 2026): nama dan jabatan sudah tercetak di dalam
 * foto kiriman pemilik produk, sehingga tidak ada lagi caption di bawah
 * gambar; yang tersisa di bawah gambar hanya kontrol slider. Semua slide
 * berupa gambar dari `public/assets/struktur/`: cover kelompok (file tanpa
 * angka) lalu foto anggota bernomor.
 */

function DivisionCard({ division }: { division: ProfilDivision }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slideCount = division.images.length;

  function goTo(target: number) {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.min(Math.max(target, 0), slideCount - 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({
      left: next * el.clientWidth,
      behavior: reduce ? "auto" : "smooth",
    });
    setIndex(next);
  }

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== index) setIndex(next);
  }

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 font-heading text-lg font-bold text-slate-900 md:min-h-[3.5rem] md:text-xl">
        {division.title}
      </h3>
      <div className="flex-1 overflow-hidden rounded-thumb border border-genbi-line bg-white">
        {/* Jalur slide: tanpa scrollbar, geser per satu kartu. */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {division.images.map((src, imageIndex) => (
            <div key={src} className="w-full shrink-0 snap-center">
              <div className="relative aspect-[4/5] w-full bg-genbi-light">
                <Image
                  src={src}
                  alt={
                    imageIndex === 0
                      ? `Foto kelompok divisi ${division.title}`
                      : `Foto anggota divisi ${division.title} ${imageIndex}`
                  }
                  fill
                  sizes="(max-width: 768px) 80vw, 24vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Kontrol slider: panah dan titik, tepat di bawah gambar. */}
        <div className="flex items-center justify-between border-t border-genbi-line px-4 py-3">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Slide sebelumnya"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-genbi-soft hover:text-genbi-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <div className="flex items-center gap-1.5">
            {division.images.map((src, dotIndex) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(dotIndex)}
                aria-label={`Ke slide ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                className={`h-1.5 rounded-full transition-all ${
                  dotIndex === index ? "w-5 bg-genbi-blue" : "w-1.5 bg-genbi-line"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === slideCount - 1}
            aria-label="Slide berikutnya"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-genbi-soft hover:text-genbi-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfilStruktur({ divisions }: { divisions: ProfilDivision[] }) {
  return (
    <section className="border-b border-genbi-line bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <h2 className="text-center font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Struktur Organisasi
        </h2>
        <p className="mx-auto mt-3 max-w-[60ch] text-center text-sm leading-relaxed text-slate-600 md:text-base">
          Susunan pengurus Koordinator Komisariat GenBI Jawa Timur periode
          2025/2026.
        </p>

        {/*
          Satu tingkat, urut dari kiri: BPH lalu tiga divisi lain (revisi
          pemilik produk). Di layar besar keempat kartu muat sebaris; di
          tablet menjadi 2x2 dan di mobile satu kolom.
        */}
        {divisions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-8 md:mt-10 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6">
            {divisions.map((division) => (
              <DivisionCard key={division.title} division={division} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
