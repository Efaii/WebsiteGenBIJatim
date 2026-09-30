# 0015. Satu area admin kanonik di /admin, tampilannya menyatu dengan situs publik

- Status: accepted
- Tanggal: 2026-09-30
- Konteks: permintaan pemilik produk untuk menyatukan permukaan CMS ke satu alamat, membatasinya untuk admin global, dan menyelaraskan tampilannya dengan halaman publik

## Konteks

ADR 0014 memindahkan pengelolaan konten ke jalur kanonik di bawah `/cms`,
sementara `/admin` lama (mock, tanpa peran) dipensiunkan dan dialihkan ke
`/cms`. Pemilik produk menemukan dua kesulitan: mengira ada dua area yang
terpisah antara "admin" dan "cms", dan tampilan CMS fungsional seadanya tidak
selaras dengan bahasa visual halaman publik (satu aksen `genbi-blue`, radius
`rounded-card`, tombol pill, latar `genbi-soft`).

## Keputusan

1. Seluruh permukaan pengelolaan konten (login, ringkasan, editor Beranda,
   Berita, FAQ) hidup di satu alamat kanonik: `/admin`. Alamat `/cms` beserta
   seluruh path di dalamnya dialihkan permanen ke `/admin`.
2. Hanya peran `ADMIN_GLOBAL` yang melihat halaman admin. Peran lain yang
   berhasil login melihat panel tolakan tanpa menu pengelolaan dan hanya bisa
   keluar.
3. Tampilan admin memakai token desain halaman publik dari `app/globals.css`
   (aksen tunggal `genbi-blue`, skala radius, tombol pill, latar `genbi-soft`,
   ikon lucide), bukan sistem desain baru dan bukan aturan landing page.
4. Seluruh halaman admin ditandai `noindex, nofollow` di layout `app/admin`.

## Alasan

- Satu alamat menghilangkan kebingungan "admin vs cms" dan mengembalikan istilah
  yang sudah dipakai `CONTEXT.md` ("seluruh route `/admin/*`") sebagai permukaan
  operator.
- Pengalihan menjaga bookmark dan tautan lama; tidak ada pengguna yang
  kehilangan akses.
- Memakai token yang sama tidak menambah sistem baru dan membuat halaman admin
  terasa satu keluarga dengan situs publik tanpa menyalin komponen landing yang
  tidak relevan untuk formulir dan tabel.

## Konsekuensi

- Halaman dan komponen dipindah dari `app/cms/**` ke `app/admin/**`; semua
  tautan internal, pengalihan guard, dan judul halaman diperbarui.
- Nama internal layanan (`lib/cms-*.ts`) tetap memakai istilah CMS karena
  merujuk subsistem pengelolaan konten, bukan alamat halaman.
- Halaman admin tidak diindeks mesin pencari.

## Alternatif yang ditolak

- **Mempertahankan dua alamat (/cms dan /admin)**: tetap membingungkan dan
  menduplikasi permukaan yang sama.
- **Mengadopsi sistem desain admin pihak ketiga (mis. Fluent/Polaris)**: satu
  sistem per project; menambah sistem kedua justru menjauh dari permintaan
  "selaras dengan halaman lain".
- **Menyembunyikan menu untuk peran non-global tetapi tetap menampilkan
  halamannya**: melawan permintaan "kalau admin sekretaris tidak muncul".
