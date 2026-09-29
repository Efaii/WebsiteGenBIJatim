import Image from "next/image";
import { Container } from "@/components/Container";
import { homeContent } from "@/content/home";
import { CommissariatItem } from "@/types/home.types";

/**
 * MitraSection
 *
 * Sebelumnya menempel di dalam About. Sekarang berdiri sendiri karena punya
 * judul sendiri.
 *
 * Animasi marquee TIDAK diubah: list logo tetap diduplikasi lalu digeser
 * -50% dengan `animate-marquee-loop`. Yang berubah hanya ukuran logo dan
 * wrapper-nya. Card-nya sendiri tidak lagi beranimasi masuk.
 *
 * Salinan kedua daftar ditandai aria-hidden supaya pembaca layar tidak
 * membacakan sembilan nama kampus dua kali.
 */
export function Mitra({ commissariats }: { commissariats: CommissariatItem[] }) {
  const { heading, subheading } = homeContent.mitra;

  const logoRow = (duplicate: boolean) =>
    commissariats.map((comm, index) => (
      /*
       * Ukuran slot mengecil di mobile (160px -> 80px, logo 80px -> 56px)
       * supaya lebih banyak logo terlihat sekaligus: sebelumnya hanya 2-3 logo
       * dalam satu waktu, sekarang 4-5 pada layar ponsel. Mulai md semuanya
       * kembali ke ukuran semula (slot 224px, logo 96px), jadi tampilan tablet
       * dan desktop tidak berubah.
       *
       * Semua logo kampus berbentuk kotak (rasio 0,85-1,00), jadi logo 56px
       * masih muat dengan margin lega di dalam slot 80px tanpa saling geser.
       */
      <div
        key={`${duplicate ? "copy" : "base"}-${comm.id}-${index}`}
        className="relative flex w-20 shrink-0 items-center justify-center px-1 md:w-56 md:px-6"
        title={comm.name}
      >
        {/*
          TIDAK ada efek hover sama sekali pada logo: sebelumnya ada skala
          1.05 yang memaksa browser menggambar ulang SVG berat ini pada ukuran
          baru setiap kali kursor masuk, dan itu menambah lag. `title` tetap
          ada karena hanya itu yang memunculkan tooltip nama kampus (bukan
          animasi).
        */}
        <Image
          src={comm.logo}
          alt={comm.name}
          width={180}
          height={108}
          /*
           * `sizes` dipakai supaya Next memilih varian yang tepat: logo ini
           * hanya tampil 56 px di mobile dan 96 px di desktop. Tanpa `sizes`,
           * Next menganggapnya selebar viewport dan mengirim berkas yang jauh
           * lebih besar dari kebutuhan.
           */
          sizes="(max-width: 768px) 56px, 96px"
          className="h-14 w-auto object-contain md:h-24"
        />
      </div>
    ));

  return (
    <section
      data-section="mitra"
      className="relative overflow-hidden bg-white pb-24 pt-4 md:pb-28 md:pt-6 lg:pb-32 lg:pt-8"
    >
      <Container className="relative z-10">
        {/*
          Semua isi berada dalam SATU card: judul, subjudul, dan deretan logo.
          Tinggi card dinaikkan lewat padding vertikal supaya logo punya ruang
          atas-bawah yang lega, dan tipografinya diperkecil supaya tidak penuh.

          Marquee tidak disentuh: list tetap diduplikasi lalu digeser -50%
          dengan `animate-marquee-loop`, ukuran logo dan lebar slot tetap.

          Padding horizontal card sengaja NOL supaya area marquee memakai
          seluruh lebar card dan logo bisa bergerak sampai mentok ke tepinya.
          Padding horizontal dipindahkan ke blok judul saja.

          Tidak ada mask, gradient fade, atau pembatas di dalam card:
          satu-satunya yang memotong lintasan logo adalah `overflow-hidden`
          milik card ini, jadi card tetap menjadi batas terluar animasi.
        */}
        <div className="overflow-hidden rounded-card border border-genbi-line bg-genbi-soft py-10 md:py-12">
          {/* --- JUDUL & SUBJUDUL (di dalam card) --- */}
          <div className="mx-auto max-w-2xl px-4 text-center md:px-8">
            {/*
              Sumber teks tetap Title Case di content/home.ts, huruf besar
              dihasilkan CSS supaya pembaca layar tidak mengeja per huruf.
              Ukurannya sengaja lebih kecil dari judul section lain karena
              sekarang berada di dalam card.
            */}
            <h2 className="font-heading text-xl font-bold uppercase tracking-normal text-slate-900 md:text-2xl lg:text-[1.75rem]">
              {heading}
            </h2>
            <p className="mt-3 text-sm text-slate-600 md:mt-4 md:text-base">
              {subheading}
            </p>
          </div>

          {/* --- DERETAN LOGO --- */}
          {/*
            Marquee TIDAK dijeda saat kursor berada di atasnya; animasi terus
            berjalan sesuai permintaan pemilik produk. List tetap diduplikasi
            lalu digeser -50% supaya loop-nya mulus.
          */}
          {/* Area marquee selebar card; card sendiri yang memotong lintasan.
              `marquee-fade` melembutkan tepi kiri-kanan supaya logo tidak
              terlihat terbelah keras saat melewati batas card. */}
          <div className="marquee-fade mt-6 md:mt-8">
            {/*
              `optimize-gpu` (utilitas yang sudah ada di globals.css) menaikkan
              lintasan ini ke layer kompositornya sendiri. Tanpa itu browser
              menggambar ulang belasan logo SVG berat di setiap frame, dan di
              situlah sensasi lag muncul.
            */}
            <div className="optimize-gpu flex w-max animate-marquee-loop">
              <div className="flex shrink-0">{logoRow(false)}</div>
              <div className="flex shrink-0" aria-hidden="true">
                {logoRow(true)}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
