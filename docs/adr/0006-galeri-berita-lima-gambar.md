# 0006. Galeri Berita memakai bentuk lima gambar per berita, dijembatani data contoh

- Status: accepted
- Tanggal: 2026-09-28
- Konteks: redesain landing page GenBI Jawa Timur

## Konteks

Section Berita diminta tampil sebagai galeri: setiap berita membawa lima gambar,
yaitu satu gambar utama besar ditambah empat thumbnail persegi. Thumbnail membuka
modal pratinjau, sedangkan gambar utama menampilkan ajakan "Lihat Detail" saat
hover.

Kenyataannya, model data berita hanya menyimpan satu gambar per berita
(`News.image` plus `NewsCoverAsset`). Tidak ada tabel galeri per berita.

Pada saat yang sama, redesign ini dibatasi pada frontend: struktur backend, API,
dan data tidak diubah demi kebutuhan visual.

## Keputusan

1. Komponen galeri dibangun terhadap bentuk data FINAL
   (`GalleryItem` dengan `images[]`), bukan terhadap bentuk API hari ini.
2. Berita asli dipetakan ke bentuk itu apa adanya: satu gambar menjadi galeri
   satu gambar (gambar utama saja, tanpa thumbnail). Brief memang mensyaratkan
   jumlah gambar dinamis harus aman.
3. Bentuk lima gambar hari ini disuplai fixture `content/news.preview.ts`:
   aktif di `next dev`, MATI di build produksi, dan bisa dipaksa dengan
   `NEXT_PUBLIC_NEWS_PREVIEW=1` untuk keperluan demo.
4. Saat API belum bisa dihubungi tetapi fixture aktif, galeri tetap dirender
   supaya strukturnya bisa ditinjau. Di produksi, kegagalan API tetap
   menampilkan state gagal yang jujur.

## Alasan

- Mengubah backend (tabel galeri, unggah multi-gambar di admin, perubahan API
  publik) adalah pekerjaan terpisah yang jauh lebih besar daripada sebuah
  redesign tampilan, dan dilarang oleh batasan brief.
- Menghindari mock senyap: fixture diberi label tegas di nama file, di komentar
  kepala berkas, dan di ADR ini, serta mati secara default di produksi. Kebijakan
  "tidak ada fallback mock senyap" di CONTEXT.md tetap dipegang.
- Alternatif "satu gambar utama di level section plus empat thumbnail berita
  lain" pernah diusulkan dan ditolak setelah screenshot referensi diperiksa:
  referensi jelas menempatkan lima gambar di dalam SATU kartu berita.

## Konsekuensi

- Metadata memakai aturan penurunan yang jujur: tanggal selalu ada bila tersedia,
  lalu lokasi bila sumbernya punya kolom itu, jika tidak maka kategori. Data asli
  tidak akan pernah menampilkan lokasi karangan.
- Fixture memakai stok foto kegiatan nyata yang disalin ke
  `public/assets/images/news/` agar tidak ikut terhapus saat data proker diimpor
  ulang. Karena stoknya terbatas, sebagian foto dipakai ulang antar item; ini
  dicatat di berkas fixture.
- Ketika API kelak menyediakan galeri per berita, yang berubah hanya adapter di
  `components/home/News.tsx`; komponen galeri, kartu, dan modal tidak perlu
  disentuh. Fixture dan adaptornya bisa dihapus.

## Pekerjaan lanjutan yang tercatat

- Tabel galeri berita (mis. `NewsImage`) plus unggah multi-gambar di CMS, lalu
  sertakan `images[]` pada endpoint publik `/v1/news`.
- Opsi lokasi berita bila memang ingin ditampilkan.
