# 0013. Konten beranda dapat diedit dari CMS dengan batas statis yang disengaja

- Status: accepted
- Tanggal: 2026-09-30
- Konteks: permintaan pemilik produk agar gambar dan sebagian teks Beranda dapat diubah admin global tanpa deploy

## Konteks

Seluruh teks dan media Beranda dibaca dari konstanta `content/home.ts` dan berkas
statis `public/assets` (hasil integrasi ADR 0001); hanya Berita dan FAQ yang
sudah berasal dari database. Pemilik produk ingin konten Beranda dapat
diperbarui langsung dari CMS, termasuk melihat tampilan Beranda saat mengedit,
tetapi struktur dan judul section harus tetap agar tata letak tidak dapat
dirombak dari CMS. Audit menemukan pula bahwa sebagian gambar statis menumpang
berkas pipeline lain (mis. satu gambar Tentang GenBI memakai path unggahan
Program kerja) sehingga rapuh terhadap impor ulang.

## Keputusan

1. Yang dapat diedit admin global: judul dan subteks hero; poster dan video hero;
   tiga blok paragraf serta empat gambar Tentang GenBI; judul, deskripsi,
   sembilan poin, dan tiga gambar kartu Pilar GenBI; judul dan deskripsi empat
   milestone Sejarah Perjalanan; pemilihan sampai tiga Berita pada slot beranda;
   seluruh tanya-jawab FAQ (termasuk urutan dan aktif/nonaktif); galeri gambar
   Berita (satu utama + empat pendukung) di fitur berita. Setiap slot gambar
   menyimpan alt yang ikut dapat diedit.
2. Yang tetap statis di kode: struktur dan urutan section; judul, eyebrow, dan
   deskripsi pengantar setiap section; metrik hero beserta labelnya; tiga chip
   peran; tahun milestone; seluruh kartu "Akses Platform Digital"; judul dan teks
   section Berita/FAQ; serta aset brand (logo GenBI, Bank Indonesia, dan kampus).
3. Media disimpan sebagai berkas WebP di storage; database menyimpan catatan
   medianya (path, alt, dimensi, ukuran, pemilik slot, urutan). Binari tidak
   masuk database.
4. Saat unggah, gambar dikonversi ke WebP (sharp, kualitas ~80) dan sisi
   panjangnya dibatasi; berkas asli tidak disimpan. Video tidak ditranskodasi;
   batas 2 MB mengikuti anggaran ADR 0005.
5. Simpan berarti langsung tayang; tidak ada alur draft/publish per konten.
6. Konten yang ada sekarang di-seed sebagai nilai awal sehingga tampilan Beranda
   tidak berubah saat rilis; gambar yang menumpang folder pipeline lain ikut
   dipindahkan ke storage konten.
7. Aturan slot beranda dilengkapi di atas ADR 0012: hanya Berita terbit yang
   dapat menempati slot, satu Berita hanya menempati satu slot, dan slot yang
   kosong atau tidak lagi valid diisi otomatis oleh Berita terbit terbaru
   sementara CMS menandai pilihan yang tidak valid. `featuredOrder` menjadi
   bagian kontrak API v1.

## Alasan

- Perubahan konten tidak boleh menunggu deploy, tetapi wajah tata letak
  (struktur, judul section) adalah keputusan desain yang tidak boleh dirombak
  dari CMS.
- WebP di storage mengikuti pola yang sudah terbukti pada Berita, testimoni, dan
  dokumentasi Program kerja; menyimpan binari di database membuat backup,
  restore, dan serving jauh lebih berat (terutama video).
- Poster hero adalah elemen LCP dan video hanya lapisan opsional, jadi anggaran
  ukuran video dari ADR 0005 tetap relevan sebagai batas unggah.

## Konsekuensi

- Komponen Beranda menerima data dari props, tidak lagi membaca konstanta;
  `content/home.ts` menyusut menjadi nilai seed/default.
- "Konten statis disengaja" di `CONTEXT.md` dipersempit ke daftar keputusan #2;
  menambah, menghapus, atau mengurutkan section bukan pekerjaan CMS.
- ADR 0005 direvisi pada bagian pemilihan media hero (lihat penanda revisinya).
- Setiap slot media baru di luar daftar adalah perubahan desain, bukan
  konfigurasi.

## Alternatif yang ditolak

- **Seluruh konten Beranda dapat diedit, termasuk judul dan struktur section**:
  tata letak dirancang untuk struktur tetap; membebaskan admin berarti membuka
  kemungkinan merusak desain dan memperbesar matriks uji.
- **Konten tetap statis dan pergantian gambar lewat developer**: tidak memenuhi
  kebutuhan memperbarui konten langsung dari CMS.
- **Alur draft lalu publish per konten**: kompleksitasnya belum dibutuhkan;
  simpan langsung tayang cukup, dan dapat ditambahkan tanpa membongkar model.
- **Media disimpan sebagai binari di MySQL (BLOB)**: membebani backup,
  replikasi, dan serving; tidak sesuai pola repo.
