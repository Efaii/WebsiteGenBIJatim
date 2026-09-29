# 0005. Navbar mengambang digerbangi rute beranda, dipicu ambang scroll kecil

- Status: accepted
- Tanggal: 2026-09-28
- Konteks: redesain landing page GenBI Jawa Timur

## Revisi (keputusan terbaru, menggantikan mekanisme di bawah)

Perpindahan navbar dari mengambang ke full-width **tidak lagi memakai
IntersectionObserver pada ambang hero**. Sekarang memakai ambang jarak scroll
dari puncak halaman: `useScrollPosition(56)`.

Alasan revisi:

- Perilaku yang diminta adalah "baru scroll sedikit, navbar langsung melebar",
  seperti referensi. Ambang berbasis posisi hero membuat navbar baru berubah
  setelah pengguna cukup jauh turun, yang terasa terlambat.
- Ambang 56px ada di dalam rentang 40-80px yang diminta pemilik produk: cukup
  kecil supaya terasa langsung, cukup besar supaya tidak berkedip karena
  pantulan scroll.
- Menggunakan hook `useScrollPosition` yang sudah ada di repo (listener
  `passive` + boolean yang hanya berubah saat nilainya berubah), jadi tidak ada
  pola baru yang diperkenalkan.
- Mekanisme lama juga tidak dapat diverifikasi di lingkungan headless, karena
  callback IntersectionObserver butuh frame render yang tidak diproduksi saat
  JavaScript berjalan.

Konsekuensi: file `hooks/useHeroEnd.ts` dihapus, dan atribut `data-hero` tidak
lagi menjadi kontrak antara Hero dan Navbar (dipertahankan hanya sebagai penanda
region, sama seperti `data-section` di section lain).

## Konteks (mekanisme awal, disimpan sebagai catatan sejarah)

Landing page memakai hero setinggi satu layar dengan video/gambar sebagai latar.
Navbar lama selalu berupa bar putih selebar viewport dengan garis bawah, jadi ia
memotong hero dan terasa seperti kerangka terpisah dari halaman.

Permintaannya: navbar mengambang berupa kapsul bersudut membulat saat pengguna
berada di hero, lalu berubah menjadi bar selebar viewport begitu pengguna keluar
dari hero.

Navbar dirender oleh setiap halaman, bukan oleh layout bersama, sehingga keadaan
mengambang harus dibatasi ke rute beranda saja. Halaman lain tidak punya hero,
jadi kapsul mengambang di sana tidak punya latar untuk "mengambang di atas".

## Keputusan

1. Keadaan mengambang hanya aktif ketika `pathname === "/"`.
2. Perpindahan keadaan dipicu `IntersectionObserver` pada elemen hero
   (`[data-hero]`) dengan `rootMargin` negatif sebesar tinggi navbar, bukan oleh
   listener `scroll` atau ambang jarak piksel.
3. Tepi kapsul mengambang disejajarkan dengan tepi `Container` halaman, supaya
   logo tidak bergeser horizontal saat keadaan berubah.

## Alasan

- `IntersectionObserver` hanya melapor ketika ambang benar-benar terlewati,
  sehingga tidak ada pekerjaan per frame scroll. Ini sekaligus menghapus
  pelanggaran lama berupa `window.addEventListener("scroll")` di navbar.
- Ambang berbasis posisi hero mengikuti maksud desainnya ("selama di hero"),
  sedangkan ambang jarak piksel (mis. 8px) akan melepas keadaan mengambang
  hampir seketika dan bertentangan dengan maksud itu.
- Membatasi ke rute beranda menjaga halaman lain tetap persis seperti sebelumnya,
  dan tidak ada halaman lain yang perlu diuji ulang.

## Konsekuensi

- Elemen hero wajib mempertahankan atribut `data-hero`; itu satu-satunya kontrak
  antara Hero dan Navbar.
- Transisi menganimasikan padding, radius, latar, dan bayangan pada satu elemen
  navbar. Ini animasi properti layout pada satu elemen kecil, disengaja karena
  permintaan desainnya memang menyebut perpindahan lebar, margin, dan radius.
  Tidak ada elemen lain yang dianimasikan dengan cara ini.
- `useScrollPosition` tetap dipakai untuk halaman selain beranda.

## Alternatif yang ditolak

- **Ambang `scrollY > 8px`** seperti sebelumnya: bertentangan dengan maksud
  "mengambang selama di hero".
- **Navbar mengambang di semua rute**: halaman tanpa hero tidak punya apa pun di
  belakang navbar, sehingga kapsul terlihat seperti kesalahan.
- **Navbar berwarna seperti referensi eksternal (biru pekat)**: ditolak pemilik
  produk; navbar tetap putih, hanya bentuknya yang berubah.

## Keputusan kedua: media hero menerima gambar ATAU video

Hero memakai satu lapisan media yang menerima poster gambar atau video, dipilih
lewat satu boolean di `content/home.ts` (`hero.video.enabled`). Saat ini boolean
itu `false` dan file videonya belum ada, jadi poster `/assets/images/raker.jpg`
yang tampil dan tata letaknya sudah final.

### Alasan

- Kode bisa disiapkan sekarang tanpa menunggu aset video: menyalakan video hanya
  mengubah satu nilai, tidak ada perubahan komponen.
- Poster tetap menjadi elemen LCP karena dirender dengan `next/image priority`,
  sedangkan `<video>` baru dipasang setelah mount, dilewati saat
  `prefers-reduced-motion`, koneksi hemat data, atau 2G, dan memakai
  `preload="none"`. Video autoplay karena itu tidak pernah berebut bandwidth
  dengan elemen LCP.
- Tidak ada pergeseran tata letak: tinggi hero ditentukan `min-h-[100svh]`, bukan
  oleh rasio media, dan video memakai `object-fit: cover`.

### Konsekuensi

- Anggaran aset video: 1280x720, H.264, tanpa audio, 8 detik, `-crf 26`,
  `-movflags +faststart`, target <= 2 MB. Perintah encode lengkap ada sebagai
  komentar di `content/home.ts`.
- Overlay biru wajib tetap tembus pandang. Overlay dibuat dari gradien tipis plus
  satu pendar legibilitas di area teks saja, bukan lagi lapisan 65% rata, supaya
  video benar-benar terlihat.
- Bila kelak video diganti-ganti, jangan menaikkan resolusi berkas tanpa meninjau
  ulang anggaran di atas.

## Revisi: media hero menjadi slot CMS (ADR 0013)

Pemilihan poster dan video hero tidak lagi ditentukan boolean
`hero.video.enabled` di `content/home.ts`; keduanya menjadi slot media yang
dikelola admin global dari CMS. Aturan yang tetap berlaku: poster adalah elemen
LCP, video hanya lapisan opsional yang dipasang setelah mount, dan anggaran
berkas video (1280x720, H.264, tanpa audio, <= 2 MB) menjadi batas unggah.
