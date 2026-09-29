# 0012. Beranda menampilkan pilihan admin, bukan berita terbaru otomatis

- Status: accepted
- Tanggal: 2026-09-30
- Konteks: berita baru tidak boleh menggeser pilihan beranda tanpa persetujuan admin

## Konteks

Sebelumnya beranda memuat tiga berita terbaru secara otomatis
(`getRecentNews(3)`), sehingga setiap berita baru langsung menggeser pilihan
yang sudah disetujui. Admin global ingin menentukan sendiri berita mana yang
tampil di beranda.

## Keputusan

1. `News.featuredOrder` (1-3, nullable): slot beranda yang dikurasi; null
   berarti tidak tampil.
2. API publik `/v1/news?featured=1` mengembalikan hanya berita berslot, urut
   `featuredOrder`; field `featuredOrder` ikut di proyeksi publik.
3. Beranda memakai pilihan itu; bila belum ada slot sama sekali, jatuh ke tiga
   berita terbaru supaya beranda tidak kosong.
4. Admin mengubah slot lewat CMS: endpoint `PUT /api/news/:id/featured`
   (token admin) dan kolom "Beranda" (Tidak / 1 / 2 / 3) di tabel kelola
   berita. Satu slot hanya diisi satu berita; slot yang sama dilepas otomatis
   dari berita lain.
5. Sidebar "Berita Lainnya" di halaman detail tetap otomatis: selalu berita
   terbaru lebih dulu (di luar artikel yang sedang dibaca).

## Alasan

- Beranda adalah etalase kurasi, bukan feed; admin perlu kendali penuh tanpa
  deploy.
- Empat berita pertama kini mengisi slot 1-3; berita baru tidak menggeser
  sampai admin memilihnya.
- Fallback terbaru menjaga beranda tetap terisi pada instalasi baru yang belum
  punya kurasi.

## Konsekuensi

- Menambah berita baru tidak mengubah beranda; admin harus mengatur slotnya.
- Halaman daftar `/news` dan sidebar tetap kronologis (terbaru dulu), jadi dua
  perilaku ini sengaja berbeda.
