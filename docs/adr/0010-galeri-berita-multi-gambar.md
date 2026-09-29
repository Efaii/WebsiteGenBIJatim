# 0010. Galeri berita multi-gambar: peran cover + urutan

- Status: accepted
- Tanggal: 2026-09-29
- Konteks: impor 4 berita pertama dengan 6 dokumentasi per berita

## Konteks

Model berita hanya mendukung satu gambar publik (`NewsCoverAsset` tunggal, API
hanya mengembalikan `coverImage`), sedangkan data berita membawa enam
dokumentasi per artikel dan halaman detail perlu menampilkannya. ADR 0006 sudah
mencatat pekerjaan lanjutan ini; galeri lima gambar di Beranda saat itu berasal
dari fixture dev.

## Keputusan

1. `NewsCoverAsset` diperluas dengan `role` (`COVER`/`GALLERY`) dan `sortOrder`:
   satu tabel untuk semua gambar berita (migrasi `news_gallery_multi_image`).
2. API publik `/v1/news` mengembalikan `images[]` urut: COVER lebih dulu, lalu
   GALLERY menurut `sortOrder`/`createdAt`. `coverImage` tetap ada sebagai
   turunan `images[0]` supaya konsumen lama tidak putus.
3. Beranda tetap bentuk lima gambar (1 utama + maks 4 thumbnail, ADR 0006);
   halaman detail menampilkan semua gambar sebagai galeri geser kiri-kanan.
4. Fixture `news.preview.ts` tidak lagi menimpa berita asli: ia hanya menjadi
   pratinjau bentuk galeri saat database berita kosong (dev); produksi tetap
   mati.
5. Impor berita memakai skrip `import_news.ts` (dry-run default, `--apply`
   untuk menulis; `--mirror-to` menyalin baris ke database kedua tanpa
   menggandakan file): JPG sumber dikonversi WebP maksimal 1600px, gambar
   pertama menjadi COVER, status `PUBLISHED`, `publishedAt` dari data.
6. Alur CMS belum diubah (masih satu cover per unggahan); unggah multi-gambar
   di CMS menyusul.

## Alasan

- Satu tabel aset dengan peran dan urutan menghindari tabel galeri kedua dan
  tetap memakai siklus `STAGED`/`PUBLIC`/`SUPERSEDED` yang sudah ada.
- `coverImage` dipertahankan demi kartu daftar berita dan OG image yang sudah
  memakainya.
- Impor menulis `PUBLIC` karena berita sudah dikurasi manual; alur review penuh
  lewat CMS tetap tersedia untuk berita berikutnya.

## Konsekuensi

- Memilih thumbnail = mengubah aset ber-role `COVER` (skrip kecil atau CMS
  menyusul). Sementara ini gambar pertama tiap artikel yang dipakai.
- `next.config.ts` menyalakan `dangerouslyAllowLocalIP` HANYA saat host API
  lokal, karena Next 16 memblokir localhost di optimizer gambar; staging dan
  produksi tetap ketat.
- Gambar berita disimpan WebP di `apps/api/public/uploads/news/` dan ikut
  di-track git seperti media berita yang sudah ada.
