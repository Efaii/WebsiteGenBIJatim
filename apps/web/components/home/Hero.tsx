"use client";

import Image from "next/image";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { HeroVideo } from "@/components/home/HeroVideo";
import CountUp from "@/components/CountUp";
import { Container } from "@/components/Container";
import { homeContent } from "@/content/home";

/**
 * Hero beranda.
 *
 * Revisi terakhir (lihat ADR 0005):
 * - DUA CTA hero dihapus atas keputusan pemilik produk. Jangan ditambahkan lagi.
 * - Tumpukan teks jadi tiga bagian: judul, subteks, lalu blok statistik yang
 *   menyatu dengan konten utama. Statistik TIDAK lagi menempel di tepi bawah
 *   hero, dan tidak memakai kapsul putih.
 * - Baris kedua judul memakai token biru yang sama dengan tombol yang dulu ada
 *   (`genbi-blue`), bukan cyan.
 * - Overlay dinaikkan sedikit kepekatannya agar lebih sinematik tanpa membuat
 *   media latar hilang.
 *
 * Lapisan media menerima gambar poster ATAU video: selama
 * `homeContent.hero.video.enabled` masih false, poster yang tampil dan
 * tampilannya sudah final. Menyalakan video hanya mengubah satu boolean.
 */
export function Hero() {
  const { heading, description, highlights, video } = homeContent.hero;
  const [first, second, third] = highlights;

  return (
    <section
      data-hero
      data-section="hero"
      className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-genbi-ink"
    >
      {/* --- LAPISAN MEDIA --- */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/hero.JPG"
          alt="Ratusan peserta berpose bersama di dalam aula"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {video.enabled && (
          <HeroVideo src={video.src} type={video.type} poster={video.poster} />
        )}

        {/* Tint biru: warna dasar tetap memakai arah palet GenBI. */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1674D1]/46 via-[#174AA8]/38 to-[#2DA9E6]/28" />
        {/*
          Scrim legibilitas berbentuk pita vertikal, kali ini dipudarkan
          kembali: pita rata 30%-70% supaya kontras sama di semua lebar
          viewport, dengan tepi atas dan bawah lebih terang agar foto/video
          tetap terlihat.
        */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,22,54,0.36)_0%,rgba(6,22,54,0.48)_30%,rgba(6,22,54,0.48)_70%,rgba(6,22,54,0.28)_100%)]" />
        {/* Peleburan ke section berikutnya. */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B2551]/70 to-transparent" />
      </div>

      <Container className="relative z-20 flex flex-1 flex-col">
        {/* --- TUMPUKAN TEKS: JUDUL, SUBTEKS, STATISTIK --- */}
        <div className="flex flex-1 flex-col items-center justify-center pb-16 pt-28 text-center md:pt-24">
          <SlideUp delay={0.1} className="w-full">
            <h1 className="font-heading text-[2.5rem] font-bold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              {heading.line1}
              <br />
              {/*
                Baris kedua sekarang PUTIH, sama seperti baris pertama, atas
                permintaan pemilik produk.

                Sebelumnya baris ini memakai token biru tombol hero
                (`genbi-blue` / #1E63FF). Kontrasnya diukur langsung dari
                piksel halaman hasil render: hanya ~2.2:1 di posisi baris ini,
                di bawah ambang AA 3:1 untuk teks besar, karena itu warna itu
                sulit dibaca di atas foto yang bertint biru gelap. Dengan putih,
                kontrasnya menjadi ~11:1, setara baris pertama.

                Biru `genbi-blue` tetap dipakai sebagai aksen brand di tempat
                lain (judul section, tombol, bullet, tahun timeline), jadi
                identitas warnanya tidak hilang. Kalau baris ini ingin
                dikembalikan ke biru, cukup ganti kelasnya.
              */}
              <span className="text-white">{heading.line2}</span>
            </h1>
          </SlideUp>

          <FadeIn delay={0.25} className="mt-5 w-full md:mt-6">
            <p className="mx-auto max-w-[36rem] text-base leading-relaxed text-white/95 sm:text-base md:text-lg">
              {description}{" "}
              <span className="font-semibold text-white">{first}</span>,{" "}
              <span className="font-semibold text-white">{second}</span>
              {third && (
                <>
                  {" "}
                  dan <span className="font-semibold text-white">{third}</span>
                </>
              )}
              .
            </p>
          </FadeIn>

          {/* --- STATISTIK: MENYATU DENGAN KONTEN UTAMA --- */}
          <FadeIn delay={0.4} className="w-full">
            <ul className="mx-auto mt-10 grid w-full max-w-3xl grid-cols-3 divide-x divide-white/15 md:mt-12">
              {homeContent.stats.map((stat) => (
                <li
                  key={stat.label}
                  className="flex flex-col items-center gap-1 px-2 sm:px-6"
                >
                  <span className="font-heading text-2xl font-bold tabular-nums text-white sm:text-3xl md:text-[40px]">
                    <CountUp to={stat.number} suffix={stat.suffix} />
                  </span>
                  <span className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75 md:text-[11px]">
                    {stat.label}
                  </span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
