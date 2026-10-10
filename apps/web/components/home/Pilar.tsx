import Image from "next/image";
import { Container } from "@/components/Container";

export interface PilarItem {
  title: string;
  description: string;
  points: string[];
  image: string;
  imageAlt: string;
}

export interface PilarContent {
  heading: string;
  description: string;
  items: PilarItem[];
}

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
 * - HOVER: latar kartu berubah menjadi biru solid `--genbi-blue` (aksen yang
 *   sama dengan seluruh halaman) dan SELURUH teks di dalamnya menjadi putih
 *   (judul, deskripsi, teks bullet). Penanda bullet berbalik menjadi putih
 *   supaya tetap terlihat di atas biru.
 * - JUDUL kartu memakai aksen `--genbi-blue`, disamakan dengan highlight
 *   "Tapi Transformasi Diri" pada judul section About (permintaan pemilik
 *   produk). Saat kartu di-hover, judul berbalik putih lewat
 *   `group-hover:text-white` yang sudah ada, jadi tidak ada warna yang
 *   bertabrakan dengan latar biru.
 * - DESKRIPSI kartu memakai near-black `text-slate-900`, sama dengan teks
 *   bullet, supaya tidak lagi terbaca pudar (permintaan pemilik produk;
 *   sebelumnya `text-slate-600`).
 * - Transisi 250ms. Foto TIDAK ikut berubah dan tidak punya efek skala.
 * - FOTO tampil seperti cetakan yang menempel di kartu (permintaan pemilik
 *   produk, direvisi dua kali): percobaan sebelumnya memakai bayangan jatuh
 *   ber-offset besar (`0 18px 34px -20px`, alpha 0,45) dan justru membuat
 *   foto terlihat melayang DI ATAS kartu. Sekarang bayangan itu diganti
 *   garis tepi hairline (`ring-1` warna `--genbi-line`, sama dengan garis
 *   kartu) plus bayangan kontak dua lapis yang rapat ke tepi bawah
 *   (`0 1px 2px` alpha 0,10 dan `0 10px 20px -14px` alpha 0,35, keluarga
 *   biru-ink yang sama), jadi foto terbaca duduk menempel di permukaan
 *   kartu. Tata letak foto tidak diubah. Tinggi foto tetap dipatok (`h-56`)
 *   supaya ketiganya sama tinggi dan dasar kartu sejajar; tinggi kartu
 *   mengikuti tinggi foto.
 * - Tidak ada lagi animasi masuk: judul dan ketiga kartu langsung ter-render.
 *   Grid-nya tetap grid yang sama, jadi tata letak tidak bergeser.
 *
 * Tiga kartu sejajar adalah permintaan eksplisit brief, jadi pola "tiga kartu
 * identik" di sini disengaja dan dicatat sebagai pengecualian.
 */
export function Pilar({ content }: { content: PilarContent }) {
  const { heading, description, items } = content;

  return (
    <section
      data-section="pilar"
      className="relative overflow-hidden bg-genbi-soft py-24 md:py-28 lg:py-32"
    >
      <Container className="relative z-10">
        {/* --- JUDUL SECTION --- */}
        {/* Label "Kenali Peran GenBI" dihapus atas permintaan pemilik produk;
            judul naik mengisi posisinya dan ukurannya disamakan dengan judul
            section Mitra. */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[2rem] font-bold tracking-tight text-slate-900 md:text-[2.5rem] lg:text-[2.75rem]">
            {heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:mt-5 md:text-[17px]">
            {description}
          </p>
        </div>

        {/* --- KARTU --- */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {items.map((item) => (
            <div key={item.title} className="h-full">
              {/*
                Hover hanya berlaku pada kartu yang disorot (kelas `hover:`
                pada elemen ini), bukan pada ketiga kartu sekaligus.
                `duration-[250ms]` dipakai seragam untuk latar, border, bayangan,
                dan pergeseran naik 4px yang halus.
              */}
              <article className="group flex h-full flex-col rounded-feature border border-genbi-line bg-white p-8 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:border-genbi-blue hover:bg-genbi-blue hover:shadow-[0_24px_44px_-28px_rgba(16,42,92,0.35)] md:p-9">
                <h3 className="font-heading text-xl font-bold text-genbi-blue transition-colors duration-[250ms] group-hover:text-white md:text-[22px]">
                  {item.title}
                </h3>

                <p className="mt-4 text-[15px] leading-relaxed text-slate-900 transition-colors duration-[250ms] group-hover:text-white">
                  {item.description}
                </p>

                <ul className="mt-5 space-y-3">
                  {item.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-[15px] leading-snug text-slate-900 transition-colors duration-[250ms] group-hover:text-white"
                    >
                      {/*
                        Penanda memakai aksen biru yang sama dengan seluruh
                        halaman. Sebelumnya kuning `--genbi-yellow` di atas
                        kartu putih, tetapi kontrasnya hanya 1,45:1 sementara
                        WCAG 1.4.11 meminta 3:1 untuk penanda daftar. Saat
                        kartu di-hover dan latarnya ikut membiru, penandanya
                        berbalik jadi putih supaya tetap terlihat.
                      */}
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-2 w-2 shrink-0 rounded-[2px] bg-genbi-blue transition-colors duration-[250ms] group-hover:bg-white"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {/*
                  Foto tampil seperti cetakan yang menempel di kartu: sudutnya
                  membulat (`rounded-media` 24px), tepinya digaris hairline
                  `--genbi-line`, dan bayangan kontaknya rapat ke tepi bawah
                  supaya foto tidak terlihat mengambang (permintaan pemilik
                  produk). Tata letak foto tidak diubah: tinggi (`h-56`),
                  lebar, dan jarak padding kartu tetap sama.

                  `mt-auto` mendorongnya ke dasar, tingginya dipatok tetap
                  (`h-56` = 224px, setara rasio 3:2 pada lebar foto di desktop)
                  supaya ketiga foto sama tinggi dan dasar ketiga kartu sejajar.
                  Tinggi kartu tidak dipatok: ia ikut tumbuh sendiri mengikuti
                  tinggi foto. Hover tidak menyentuh foto.
                */}
                <div className="mt-auto pt-7">
                  <div className="relative h-56 overflow-hidden rounded-media bg-genbi-light ring-1 ring-genbi-line shadow-[0_1px_2px_rgba(16,42,92,0.10),0_10px_20px_-14px_rgba(16,42,92,0.35)]">
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
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
