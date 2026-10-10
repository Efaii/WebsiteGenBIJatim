"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Container } from "@/components/Container";
import type { ProfilHighlight } from "@/content/profil";

/*
 * "Apa saja yang telah kami lakukan": panel biru muda (mengikuti referensi
 * pemilik produk). Judul di kiri atas, accordion proker bernomor mulai dari
 * atas panel supaya sejajar dengan judul, dan dua foto portrait yang mengisi
 * separuh lebar panel (revisi atas permintaan pemilik produk). Item pertama
 * terbuka default supaya bagian ini tidak terlihat kosong saat pertama
 * dilihat.
 *
 * Garis pemisah accordion hanya muncul di bawah judul item yang sedang
 * terbuka; item tertutup dibiarkan tanpa garis (permintaan pemilik produk).
 *
 * Panel tiap item memuat deskripsi saja. Tautan dokumentasi sengaja tidak
 * ditampilkan di sini; dokumentasi menyeluruh akan tampil di section Cerita
 * Kami (keputusan pemilik produk).
 *
 * Blok kutipan biru menempel di bawah panel mengikuti gaya referensi: sisi
 * kanannya menyambung dengan tepi kanan panel di atasnya (overlap 32px, sama
 * dengan radius panel), tepi kirinya menjorok ke dalam dengan sudut kiri atas
 * siku, dan sudut bawah kiri-kanannya membulat.
 *
 * Animasi buka-tutup memakai trik grid-template-rows 0fr/1fr supaya tingginya
 * bisa dianimasikan murni dengan CSS, dan otomatis dimatikan saat pengunjung
 * memakai `prefers-reduced-motion`.
 */
export function ProfilHighlights({
  items,
  quote,
}: {
  items: ProfilHighlight[];
  quote: string;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="border-b border-genbi-line bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="relative">
          <div className="relative z-10 rounded-feature bg-genbi-light px-6 py-10 md:px-10 md:py-12 lg:px-14 lg:py-14">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Kiri: judul, lalu dua foto portrait yang mengisi kolom. */}
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Apa saja yang telah kami lakukan
                </h2>
                <div className="mt-8 grid w-full grid-cols-2 gap-4 md:mt-10">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-thumb bg-white">
                    <Image
                      src="/assets/images/pilar-frontliners.webp"
                      alt="Suasana kegiatan GenBI Jawa Timur"
                      fill
                      sizes="(max-width: 1024px) 45vw, 280px"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-thumb bg-white">
                    <Image
                      src="/assets/images/pilar-agent-of-change.webp"
                      alt="Kegiatan kolaborasi komisariat GenBI"
                      fill
                      sizes="(max-width: 1024px) 45vw, 280px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Kanan: accordion mulai dari atas panel, sejajar judul. */}
              <ul>
                {items.map((item, index) => {
                  const open = index === openIndex;
                  return (
                    <li key={item.title}>
                      <h3>
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={`profil-highlight-${index}`}
                          onClick={() => setOpenIndex(open ? -1 : index)}
                          className="flex w-full cursor-pointer items-center gap-4 py-4 text-left md:py-5"
                        >
                          <span className="w-8 shrink-0 font-heading text-sm font-bold tabular-nums text-genbi-blue-hover">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0 flex-1 font-heading text-base font-bold text-slate-900 md:text-lg">
                            {item.title}
                          </span>
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                              open
                                ? "border-genbi-blue bg-genbi-blue text-white"
                                : "border-genbi-line bg-white text-slate-600"
                            }`}
                          >
                            {open ? (
                              <Minus size={14} aria-hidden="true" />
                            ) : (
                              <Plus size={14} aria-hidden="true" />
                            )}
                          </span>
                        </button>
                      </h3>
                      <div
                        id={`profil-highlight-${index}`}
                        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        {/*
                          Garis bawah judul hanya tampil saat item terbuka.
                          Border ditaruh di paragraf, bukan di pembungkus:
                          paragraf ikut ter-clip penuh saat panel 0fr sehingga
                          tidak ada garis tersisa saat item tertutup.
                        */}
                        <div className="overflow-hidden">
                          <p className="border-t border-genbi-line/80 pt-4 pb-4 pl-12 pr-2 text-sm leading-relaxed text-slate-600 md:pt-5 md:pb-5 md:text-base">
                            {item.summary}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/*
            Blok kutipan: tuck di bawah panel (panel z-10 menutup bagian atas
            blok), tepi kanan sejajar panel, kiri menjorok ke dalam.
          */}
          <blockquote className="-mt-8 ml-6 rounded-b-media bg-genbi-blue px-6 pb-6 pt-12 text-white md:ml-16 md:px-10 md:pb-8 md:pt-14 lg:ml-24">
            <p className="font-heading text-base font-semibold leading-relaxed md:text-lg">
              {quote}
            </p>
          </blockquote>
        </div>
      </Container>
    </section>
  );
}
