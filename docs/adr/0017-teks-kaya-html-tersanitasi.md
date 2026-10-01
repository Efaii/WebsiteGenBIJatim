# 0017. Teks kaya HTML tersanitasi untuk isi Berita dan jawaban FAQ

- Status: accepted
- Tanggal: 2026-10-01

## Konteks

Penulis Berita menempel konten dari Word dan butuh tebal, miring, daftar, dan
tautan yang ikut terbaca di editor maupun halaman publik. Jawaban FAQ
mengalami kebutuhan yang sama, sementara data lama berformat teks polos
(mis. penanda `**tebal**` pada FAQ) harus tetap tampil apa adanya. Sebelumnya
hanya isi Berita yang mendukung HTML, dengan sanitizer di API dan editor web
yang tinggal di folder berita — dua pemakai (Berita, FAQ) belum berbagi satu
modul.

## Keputusan

1. Satu modul teks kaya di API (`lib/rich-text.ts`) dengan satu fungsi
   `sanitizeRichText` sebagai satu-satunya penyaring HTML sebelum simpan —
   dipakai isi Berita dan jawaban FAQ. Allowlist tag: paragraf, `br`,
   `strong`, `em`, `u`, `s`, daftar, judul, kutipan, dan tautan; tautan
   dipaksa `rel="noopener noreferrer"`; skrip/iframe/gaya/atribut event
   dibuang.
2. Satu modul editor bersama di web: komponen editor di
   `app/admin/(protected)/rich-text/`, utilitas netral di `lib/rich-text.ts`
   (konversi konten lama, teks polos, tempelan Word, dan gerbang render
   `isSafeRichHtml`).
3. Halaman publik merender dua jalur: HTML tersanitasi dirender langsung;
   konten lama bertanda `**tebal**` + baris baru tetap lewat jalur lama.
4. Panjang jawaban FAQ (maks 5000 karakter) diukur setelah sanitasi, bukan
   sebelum.

## Alasan

- Satu sanitizer berarti satu tempat untuk diaudit dan diuji; dua pemanggil
  memberi leverage tanpa menambah seam atau port baru.
- Allowlist sempit menjaga konten penulis tetap aman dirender mentah tanpa
  memasang parser markdown penuh.
- Jalur ganda menjaga regresi nol untuk konten lama.

## Konsekuensi

- Konten baru tersimpan sebagai HTML; kebutuhan teks polos (mis. pencarian)
  harus lewat `plainTextOf`.
- Menambah tag yang diizinkan berarti mengubah satu allowlist di API dan
  mencerminkan gayanya di kedua permukaan render.
