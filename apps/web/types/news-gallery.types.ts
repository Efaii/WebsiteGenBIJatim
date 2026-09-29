/**
 * Bentuk data galeri berita.
 *
 * `GalleryItem` adalah bentuk FINAL yang dipakai komponen galeri: satu berita
 * membawa sampai lima gambar (satu utama + empat thumbnail).
 *
 * Saat ini API publik hanya menyimpan SATU gambar per berita
 * (`News.image` + `NewsCoverAsset`), jadi adapter di
 * `components/home/News.tsx` memetakan berita nyata menjadi galeri satu gambar.
 * Selama data asli belum punya galeri, fixture di `content/news.preview.ts`
 * yang menyuplai bentuk lima gambar. Lihat ADR 0006.
 */

export type GalleryImage = {
  src: string;
  alt: string;
};

export type GalleryItem = {
  id: string;
  slug: string;
  title: string;
  /** Sudah diformat, mis. "Februari 2026". Null bila tanggal tidak tersedia. */
  date: string | null;
  /** Diisi hanya bila sumber data punya kolom lokasi. */
  location: string | null;
  category: string | null;
  excerpt: string;
  /** Minimal satu gambar untuk tampil sebagai gambar utama. */
  images: GalleryImage[];
};
