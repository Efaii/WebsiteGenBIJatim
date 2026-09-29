import type { GalleryItem } from "@/types/news-gallery.types";

/**
 * ⚠️ DATA CONTOH. BUKAN BERITA ASLI.
 *
 * Fixture ini ada karena tabel `News` di API hanya menyimpan SATU gambar per
 * berita, sedangkan galeri Beranda memerlukan lima gambar per berita
 * (satu utama + empat thumbnail). Lihat ADR 0006.
 *
 * Cara kerjanya:
 * - pada `next dev`, fixture ini yang tampil supaya struktur final galeri bisa
 *   ditinjau sekarang;
 * - pada build produksi fixture ini MATI, sehingga tidak pernah ada berita
 *   karangan yang tayang ke publik;
 * - untuk menyalakannya paksa di produksi (mis. demo), set
 *   `NEXT_PUBLIC_NEWS_PREVIEW=1`.
 *
 * Begitu API menyediakan galeri per berita, hapus file ini dan adapter di
 * `components/home/News.tsx` akan memakai data asli tanpa perubahan komponen.
 *
 * Judul, tanggal, dan lokasi di bawah ini hanya contoh. Foto-fotonya adalah
 * foto kegiatan GenBI yang sudah ada di repo, disalin ke
 * `public/assets/images/news/` supaya tidak ikut terhapus saat data proker
 * diimpor ulang. Karena stok foto nyata terbatas, sebagian foto dipakai ulang
 * antar item. Susunan ini sengaja: setiap gambar utama sudah dicocokkan dengan
 * tema beritanya.
 */

/** Pemetaan stok foto contoh. Ringkas supaya susunan tiap item mudah dibaca. */
const S = {
  /** Auditorium: peserta menyimak materi. */
  peserta: { src: "/assets/images/news/sample-1.webp", alt: "Peserta menyimak materi di auditorium" },
  /** Seminar: narasumber memaparkan materi di depan banner acara. */
  narasumber: { src: "/assets/images/news/sample-2.webp", alt: "Narasumber memaparkan materi" },
  /** Sesi edukasi indoor bersama peserta. */
  edukasi: { src: "/assets/images/news/sample-3.webp", alt: "Sesi edukasi bersama peserta" },
  /** Kunjungan ke sekolah mitra. */
  sekolah: { src: "/assets/images/news/sample-4.webp", alt: "Kunjungan GenBI ke sekolah mitra" },
  /** Meja pendaftaran dan pelayanan peserta. */
  pendaftaran: { src: "/assets/images/news/sample-5.webp", alt: "Anggota GenBI melayani pendaftaran peserta" },
  /** Kegiatan bersama anak-anak sekolah. */
  anakanak: { src: "/assets/images/news/sample-6.webp", alt: "Kegiatan bersama anak-anak sekolah" },
  /** Foto bersama seusai kegiatan. */
  bersama: { src: "/assets/images/news/sample-7.webp", alt: "Foto bersama peserta kegiatan" },
} as const;

export const newsGalleryPreview: GalleryItem[] = [
  {
    id: "preview-1",
    slug: "rapat-kerja-wilayah-genbi-jawa-timur",
    title: "Rapat Kerja Wilayah GenBI Jawa Timur",
    date: "Februari 2026",
    location: "Surabaya",
    category: "Kegiatan",
    excerpt:
      "Pengurus dari sembilan komisariat berkumpul untuk menyusun arah program kerja dan menyelaraskan agenda tahunan GenBI Jawa Timur.",
    images: [
      S.peserta,
      S.pendaftaran,
      S.bersama,
      S.edukasi,
      S.narasumber,
    ],
  },
  {
    id: "preview-2",
    slug: "genbi-mengajar-literasi-keuangan",
    title: "GenBI Mengajar: Literasi Keuangan untuk Pelajar",
    date: "Januari 2026",
    location: "Sidoarjo",
    category: "Pengabdian",
    excerpt:
      "Anggota GenBI turun langsung ke sekolah untuk mengenalkan kebijakan Bank Indonesia dan dasar pengelolaan keuangan sejak dini.",
    images: [
      S.edukasi,
      S.anakanak,
      S.sekolah,
      S.pendaftaran,
      S.bersama,
    ],
  },
  {
    id: "preview-3",
    slug: "upgrading-kepemimpinan-anggota-genbi",
    title: "Upgrading Kepemimpinan Anggota GenBI",
    date: "Desember 2025",
    location: "Bangkalan",
    category: "Pengembangan",
    excerpt:
      "Pelatihan kepemimpinan dan manajemen organisasi untuk menyiapkan anggota mengambil peran yang lebih besar di kampus dan masyarakat.",
    images: [
      S.narasumber,
      S.peserta,
      S.edukasi,
      S.pendaftaran,
      S.bersama,
    ],
  },
];

/** Fixture hidup di dev, mati di produksi kecuali dipaksa lewat env. */
export const newsPreviewEnabled =
  process.env.NEXT_PUBLIC_NEWS_PREVIEW === "1" ||
  process.env.NODE_ENV !== "production";
