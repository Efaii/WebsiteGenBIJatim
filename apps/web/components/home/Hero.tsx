"use client";

import Image from "next/image";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { HeroVideo } from "@/components/home/HeroVideo";
import CountUp from "@/components/CountUp";
import { Container } from "@/components/Container";
import { homeContent } from "@/content/home";

/*
 * Lapisan visual hero.
 *
 * Nilainya sengaja ditulis sebagai konstanta bernama di sini, bukan token
 * global di globals.css: masing-masing hanya dipakai di satu tempat, jadi nama
 * global justru menambah kosakata token tanpa ada yang memakainya ulang.
 *
 * Pembagian tugasnya penting dan sengaja:
 * - HERO_TINT  memberi arah palet GenBI, jadi ia yang paling banyak dikurangi
 *              supaya warna asli foto (karpet merah) tidak mati menjadi mauve.
 * - HERO_SCRIM menjaga teks tetap terbaca. Ia justru dinaikkan DI PITA TEKS
 *              saja (28%-76%), dan diturunkan di luar pita itu, supaya langit
 *              dan karpet di tepi atas-bawah terlihat lebih hidup.
 *
 * Batasnya diukur, bukan diperkirakan: dengan teks putih, gabungan kedua lapis
 * di area teks tidak boleh turun di bawah ~65% opasitas, karena di situlah
 * kontras AA 4,5:1 mulai tembus. Rinciannya ada di laporan Fase 13.
 */
/** Tint biru di atas foto. Menyatukan warna foto kegiatan dengan palet GenBI. */
const HERO_TINT = "bg-gradient-to-br from-[#1674D1]/26 via-[#174AA8]/20 to-[#2DA9E6]/14";
/** Scrim legibilitas: pita vertikal yang menjaga teks putih tetap terbaca. */
const HERO_SCRIM = "bg-[linear-gradient(180deg,rgba(6,22,54,0.24)_0%,rgba(6,22,54,0.58)_28%,rgba(6,22,54,0.58)_76%,rgba(6,22,54,0.16)_100%)]";
/**
 * Peleburan tepi bawah hero ke section berikutnya.
 *
 * Diturunkan dari 70% ke 42%: lapisan ini tepat menutupi karpet merah di
 * bagian bawah foto, dan karena letaknya DI BAWAH area teks (teks berakhir di
 * y=653, lapisan ini mulai di y=772), menurunkannya tidak menyentuh kontras
 * teks sama sekali.
 */
const HERO_FLOOR = "bg-gradient-to-t from-[#0B2551]/42 to-transparent";
/*
 * Bayangan teks tipis. Ini TIDAK dihitung WCAG (kontras diukur dari warna teks
 * terhadap latar), tetapi menaikkan keterbacaan yang dirasakan di atas foto
 * yang tidak rata. Kontras terukurnya sendiri tetap dijaga oleh HERO_SCRIM.
 */
const HERO_TEXT_SHADOW = "[text-shadow:0_1px_14px_rgba(6,22,54,0.5)]";

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
        <div className={`absolute inset-0 ${HERO_TINT}`} />
        {/*
          Scrim legibilitas berbentuk pita vertikal, kali ini dipudarkan
          kembali: pita rata 30%-70% supaya kontras sama di semua lebar
          viewport, dengan tepi atas dan bawah lebih terang agar foto/video
          tetap terlihat.
        */}
        <div className={`absolute inset-0 ${HERO_SCRIM}`} />
        {/* Peleburan ke section berikutnya. */}
        <div className={`absolute inset-x-0 bottom-0 h-32 ${HERO_FLOOR}`} />
      </div>

      <Container className="relative z-20 flex flex-1 flex-col">
        {/* --- TUMPUKAN TEKS: JUDUL, SUBTEKS, STATISTIK --- */}
        <div className="flex flex-1 flex-col items-center justify-center pb-16 pt-28 text-center md:pt-24">
          <SlideUp delay={0.1} className="w-full">
            <h1 className={`font-heading text-[2.5rem] font-bold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem] ${HERO_TEXT_SHADOW}`}>
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
            <p className={`mx-auto max-w-[36rem] text-base leading-relaxed text-white/95 sm:text-base md:text-lg ${HERO_TEXT_SHADOW}`}>
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
            <ul className={`mx-auto mt-10 grid w-full max-w-3xl grid-cols-3 divide-x divide-white/15 md:mt-12 ${HERO_TEXT_SHADOW}`}>
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
