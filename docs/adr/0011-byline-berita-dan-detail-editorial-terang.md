# 0011. Byline berita dari data, halaman detail bertata editorial terang

- Status: accepted
- Tanggal: 2026-09-29
- Konteks: redesain halaman detail berita sesuai referensi editorial

## Konteks

Halaman detail berita masih memakai tema gelap warisan dan byline "GenBI Jatim"
yang ditulis tetap di proyeksi API, padahal penulis dan penerbit berbeda per
berita. Redesain diminta mengikuti pola media (judul, penulis - penerbit,
galeri dokumentasi, isi, sidebar berita lain) dengan margin konsisten dengan
Beranda.

## Keputusan

1. `News` mendapat kolom `publisher` (teks, nullable); `author` yang sudah ada
   menyimpan nama penulis. Byline dibentuk dari data: `author - publisher`.
2. Proyeksi publik `/v1/news` mengembalikan `author` dan `publisher`; field
   `byline` yang ditulis tetap dihapus.
3. Empat berita pertama memakai penulis "Fathir Ainur Rochim" dan penerbit
   "GenBI Jatim"; skrip impor menerima `author`/`publisher` per artikel untuk
   berita berikutnya.
4. Halaman detail `/news/[slug]` didesain ulang: tema terang, `Container` yang
   sama dengan Beranda, dua kolom 8/4. Kolom kiri: kategori, judul, meta
   penulis, galeri gambar yang digeser kiri-kanan (ditempatkan sebelum isi),
   lalu isi dengan dateline kota dibold pada paragraf pertama. Kolom kanan:
   "Berita Lainnya" (gambar, penerbit, judul) dan CTA "Lihat Semua Berita".
5. Halaman daftar `/news` belum diubah dan masih bertema gelap; penyelarasan
   menyusul supaya kedua halaman sepenanggungan.

## Alasan

- Penulis dan penerbit adalah data editorial, bukan konstanta tampilan;
  menaruhnya di database membuat perubahan tidak perlu deploy.
- Tema terang dan `Container` menyatukan halaman detail dengan Beranda serta
  referensi; galeri sebelum isi meniru penempatan gambar utama media.
- `publisher` disimpan sebagai teks (bukan relasi) karena penerbit dapat berupa
  Korkom ("GenBI Jatim") atau komisariat kampus; relasi ke tabel `Commissariat`
  tidak selalu berlaku.

## Konsekuensi

- Konsumen tidak lagi menerima `byline`; halaman detail merender `author` dan
  `publisher` dari data.
- Dateline dibold hanya bila paragraf pertama berpola "Kota — ..."; teks sumber
  tidak diubah.
- Menyelaraskan halaman daftar `/news` ke tema terang menjadi pekerjaan
  lanjutan yang tercatat di sini.
