import Image from "next/image";
import { Container } from "@/components/Container";
import { homeContent } from "@/content/home";
import { CommissariatItem } from "@/types/home.types";

/**
 * MitraSection
 *
 * Section statis berisi sembilan logo kampus mitra, menempel tepat di bawah
 * About (latar putih yang sama, padding atas kecil).
 *
 * Animasi marquee DIHAPUS atas permintaan pemilik produk: daftar logo hanya
 * dirender sekali dan tidak digeser lagi, jadi tidak ada salinan kedua yang
 * perlu ditandai aria-hidden.
 *
 * Keterangan "Suramadu-Bojonegoro" juga DIHAPUS atas permintaan yang sama
 * karena jarak vertikalnya terasa terlalu jauh.
 *
 * Revisi lanjutan menyesuaikan tampilan dengan masukan pemilik produk:
 * logo dan label diperbesar (logo tampil dua tingkatan di md ke atas,
 * 5 di atas dan 4 di bawah; label lebih besar dan berwarna hitam), lalu
 * jarak antar elemen diperlebar bertahap sesuai permintaan supaya section
 * terasa lebih legah.
 *
 * Warna logo TIDAK disentuh: tanpa filter grayscale, overlay, atau ubah
 * opacity. Garis bawah section adalah pembatas dengan section Pilar yang
 * berlatar bg-genbi-soft.
 */
export function Mitra({ commissariats }: { commissariats: CommissariatItem[] }) {
  const { heading } = homeContent.mitra;

  return (
    <section
      data-section="mitra"
      aria-labelledby="mitra-heading"
      className="border-b border-genbi-line bg-white pb-24 pt-10 md:pb-28 md:pt-12 lg:pb-32 lg:pt-14"
    >
      <Container>
        {/*
          Teks sumber tetap Title Case di content/home.ts dan diubah menjadi
          huruf besar oleh CSS supaya pembaca layar tidak mengeja per huruf.

          Ukuran dinaikkan dan warna memakai slate-900 (hitam) atas permintaan
          pemilik produk supaya label lebih terbaca; tracking lebar tetap
          dipertahankan seperti referensi.
        */}
        <h2
          id="mitra-heading"
          className="text-center font-heading text-base font-bold uppercase tracking-[0.25em] text-slate-900 md:text-xl"
        >
          {heading}
        </h2>

        {/*
          Dua mode layout dalam satu daftar:
          - mobile: grid 3 kolom, sembilan logo mengisi 3 baris penuh;
          - md ke atas: flex wrap dengan justify-center, logo tampil dua
            tingkatan (5 di atas, 4 di bawah) sesuai permintaan pemilik produk.

          `max-w-[44rem]` di md ke atas menjaga tepat 5 logo per baris supaya
          baris kedua berisi 4 logo dan otomatis berada di tengah.

          Jarak diperlebar lagi atas permintaan pemilik produk: label ke
          baris logo 64 px (80 px di md ke atas), antar baris logo 64 px di
          mobile dan 80 px di md ke atas, dan antar kolom mobile 40 px.
          Mulai lg, `max-w-[48rem]` dengan `lg:gap-x-16` membuat deretan
          lebih menyebar. Di md, `max-w-[44rem]` + `md:gap-x-12` tetap
          dipertahankan karena itu kunci formasi 5 + 4 (lima muat, enam
          tidak).

          `title` tetap dipakai supaya nama lengkap kampus muncul sebagai
          tooltip. Tidak ada efek hover dan tidak ada animasi pada logo.
        */}
        <ul className="mx-auto mt-16 grid max-w-[44rem] grid-cols-3 place-items-center gap-x-10 gap-y-16 md:mt-20 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-12 md:gap-y-20 lg:max-w-[48rem] lg:gap-x-16">
          {commissariats.map((comm) => (
            <li
              key={comm.id}
              className="flex items-center justify-center"
              title={comm.name}
            >
              {/*
                `sizes` mengikuti ukuran tampil logo (56 px di mobile, 96 px
                mulai md) supaya Next memilih varian berkas yang tepat; tanpa
                itu Next menganggap logo selebar viewport dan mengirim gambar
                yang jauh lebih besar dari kebutuhan.
              */}
              <Image
                src={comm.logo}
                alt={comm.name}
                width={180}
                height={108}
                sizes="(max-width: 768px) 56px, 96px"
                className="h-14 w-auto object-contain md:h-24"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
