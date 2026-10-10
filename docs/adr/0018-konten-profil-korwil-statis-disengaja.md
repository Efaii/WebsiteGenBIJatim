# 0018. Konten halaman Profil tingkat korwil sebagai konten statis disengaja

- Status: accepted
- Tanggal: 2026-10-08

## Konteks

Halaman Profil menampilkan konten tingkat korwil (koordinator komisariat, visi
dan misi, program kerja lintas komisariat, struktur empat divisi, dan cerita
penutup) per periode kepengurusan. Seluruh sumber data yang ada bersifat
per-komisariat: tabel `commissariat` berisi sembilan kampus, struktur hanya
tersedia lewat endpoint per-komisariat, dan tidak ada entitas maupun endpoint
tingkat korwil (diverifikasi langsung ke database dan API pada Oktober 2026).
Halaman lain, seperti Beranda, Program, dan Komisariat, menarik datanya dari
API.

## Keputusan

Konten tingkat korwil ditulis sebagai konten statis disengaja di
`apps/web/content/profil.ts`, mengikuti pola "Konten statis disengaja" yang
sudah dipakai halaman lain. Daftar periode dan penanda ketersediaan data tetap
diambil dari API. Identitas dan foto yang belum tersedia memakai placeholder
yang ditandai TODO pada file yang sama.

## Alasan

- Tidak ada sumber datanya; menambah model dan API korwil adalah proyek
  tersendiri di luar lingkup halaman ini.
- Nilainya stabil dan disetujui pemilik produk: visi, misi, struktur pengurus,
  dan cerita berubah paling banyak sekali per periode.
- Satu file konten memudahkan peninjauan dan pembaruan manual tanpa menyentuh
  API, sekaligus menghindari data karangan di jalur API.

## Konsekuensi

- Pembaruan konten korwil dilakukan lewat perubahan `content/profil.ts`, bukan
  lewat CMS. Foto dan nama final harus diisi pemilik produk sebelum rilis.
- Jika kelak korwil dimodelkan di database, halaman ini bermigrasi ke API dan
  ADR ini ditandai superseded.
