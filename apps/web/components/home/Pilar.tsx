"use client";

import Image from "next/image";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import { Container } from "@/components/Container";
import { homeContent } from "@/content/home";

/**
 * PilarSection (Peran Utama GenBI)
 *
 * Tiga kartu peran GenBI. Setiap kartu: judul, deskripsi, tiga poin dengan
 * penanda kotak kuning, lalu foto di bagian bawah. Tinggi kartu konsisten
 * karena grid meregangkan barisnya dan foto didorong ke dasar kartu dengan
 * `mt-auto`.
 *
 * Revisi terakhir:
 * - ICON dihapus, judul sekarang jadi elemen pertama kartu.
 * - Radius kartu naik ke `rounded-feature` (32px), dicatat di skala radius
 *   pada globals.css.
 * - HOVER: latar kartu berubah menjadi biru solid #2E80D9 dan SELURUH teks di
 *   dalamnya menjadi putih (judul, deskripsi, teks bullet). Penanda bullet
 *   tetap kuning BI sebagai aksen di atas biru.
 * - Transisi 250ms. Foto TIDAK ikut berubah dan tidak punya efek skala.
 * - FOTO di dasar kartu (permintaan pemilik produk): padding BAWAH kartu
 *   dihapus (`pb-0`) supaya foto menempel tepat di dasar kartu tanpa sisa
 *   ruang, sementara jarak kiri-kanannya tetap mengikuti padding kartu. Tinggi
 *   foto dipatok tetap (`h-56`) supaya ketiganya sama tinggi dan dasar kartu
 *   sejajar; tinggi kartu mengikuti tinggi foto. Hanya sudut ATAS foto yang
 *   dibulatkan (`rounded-t-media` 24px); dua sudut bawahnya siku agar bertemu
 *   border bawah kartu tanpa lekukan.
 *
 * Tiga kartu sejajar adalah permintaan eksplisit brief, jadi pola "tiga kartu
 * identik" di sini disengaja dan dicatat sebagai pengecualian.
 */
export function Pilar() {
  const { heading, description, items } = homeContent.pilar;

  return (
    <section data-section="pilar" className="relative overflow-hidden bg-genbi-soft py-24 md:py-28 lg:py-32">
      <Container className="relative z-10">
        {/* --- JUDUL SECTION --- */}
        {/* Label "Kenali Peran GenBI" dihapus atas permintaan pemilik produk;
            judul naik mengisi posisinya dan ukurannya disamakan dengan judul
            section Mitra. */}
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-[2rem] font-bold tracking-tight text-slate-900 md:text-[2.5rem] lg:text-[2.75rem]">
              {heading}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 md:mt-5 md:text-[17px]">
              {description}
            </p>
          </div>
        </FadeIn>

        {/* --- KARTU --- */}
        <StaggerContainer
          delay={0.1}
          staggerDelay={0.12}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {items.map((item) => (
            <StaggerItem key={item.title} className="h-full">
              {/*
                Hover hanya berlaku pada kartu yang disorot (kelas `hover:`
                pada elemen ini), bukan pada ketiga kartu sekaligus.
                `duration-[250ms]` dipakai seragam untuk latar, border, bayangan,
                dan pergeseran naik 4px yang halus.
              */}
              <article className="group flex h-full flex-col rounded-feature border border-genbi-line bg-white p-8 pb-0 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:border-[#2E80D9] hover:bg-[#2E80D9] hover:shadow-[0_24px_44px_-28px_rgba(16,42,92,0.35)] md:p-9 md:pb-0">
                <h3 className="font-heading text-xl font-bold text-slate-900 transition-colors duration-[250ms] group-hover:text-white md:text-[22px]">
                  {item.title}
                </h3>

                <p className="mt-4 text-[15px] leading-relaxed text-slate-600 transition-colors duration-[250ms] group-hover:text-white">
                  {item.description}
                </p>

                <ul className="mt-5 space-y-3">
                  {item.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-[15px] leading-snug text-slate-900 transition-colors duration-[250ms] group-hover:text-white"
                    >
                      {/* Penanda tetap kuning BI: aksen yang menonjol di atas biru. */}
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-2 w-2 shrink-0 rounded-[2px] bg-genbi-yellow"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {/*
                  Foto: jarak kiri-kanannya mengikuti padding kartu, sementara
                  padding BAWAH kartu dihapus lewat `pb-0`, sehingga foto
                  menempel tepat di dasar kartu tanpa sisa ruang dan batas bawah
                  kartu sekaligus menjadi batas bawah foto.

                  Sudutnya hanya dibulatkan di ATAS (`rounded-t-media` 24px).
                  Dua sudut bawah sengaja dibiarkan siku supaya fotonya bertemu
                  border bawah kartu tanpa lekukan di kiri-bawah dan kanan-bawah.

                  `mt-auto` mendorongnya ke dasar, tingginya dipatok tetap
                  (`h-56` = 224px, setara rasio 3:2 pada lebar foto di desktop)
                  supaya ketiga foto sama tinggi dan dasar ketiga kartu sejajar.
                  Tinggi kartu tidak dipatok: ia ikut tumbuh sendiri mengikuti
                  tinggi foto. Hover tidak menyentuh foto.
                */}
                <div className="mt-auto pt-7">
                  <div className="relative h-56 overflow-hidden rounded-t-media bg-genbi-light">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  );
}
