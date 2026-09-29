# 0007. Palet GenBI 2026 ditambahkan berdampingan, dan landing page tetap terang

- Status: accepted
- Tanggal: 2026-09-28
- Konteks: redesain landing page GenBI Jawa Timur

## Konteks

Redesign memakai palet yang diminta pemilik produk: biru `#1E63FF`, navy
`#102A5C`, biru terang `#2E8BFF`, cyan `#35C7F3`, kuning BI `#FFD21A`, serta
permukaan `#F8FAFF`, `#EEF5FF`, `#DCEAFF`, dan garis `#DCE6EF`.

Situs sudah punya token yang berbeda dan sudah dipakai halaman lain:
`--primary #3B82F6`, `--genbi-royal #1E40AF`, `--genbi-navy #172554`,
`--genbi-gold`, `--genbi-red`, latar body `#0A1628`, dan section Sejarah
`#203866`.

## Keputusan

1. Token baru ditambahkan sebagai `--genbi-blue`, `--genbi-ink`,
   `--genbi-bright`, `--genbi-cyan`, `--genbi-yellow`, `--genbi-soft`,
   `--genbi-light`, `--genbi-haze`, dan `--genbi-line`, lalu dipetakan ke
   namespace `--color-*` supaya menjadi utility Tailwind.
2. Token lama TIDAK diubah nilainya dan tidak diarahkan ulang.
3. Section landing yang di-redesign memakai token baru; halaman lain tetap dengan
   token lamanya.
4. Landing page tetap terang saja. Tidak ada mode gelap.

## Alasan

- Mengarahkan ulang token bersama akan menggeser warna halaman yang tidak diminta
  di-redesign (profil, program, awardee, berita, admin) tanpa ada yang memeriksa
  setiap halaman. Risikonya tidak sepadan untuk redesign satu halaman.
- Mode gelap tidak diminta brief, dan identitas GenBI di sini terang serta
  institusional. Aturan desain yang dipakai memang mewajibkan mode gelap kecuali
  diminta lain, jadi pengecualian ini dicatat di sini supaya tidak terlihat
  seperti kelalaian.
- Satu-satunya blok gelap di halaman adalah section Sejarah. Itu perangkat
  "Color Block Story" yang dipakai tepat sekali dan sengaja, bukan mode gelap.

## Konsekuensi

- Landing page akan terasa sedikit berbeda tone dari halaman lain sampai ada
  pekerjaan penyelarasan terpisah. Itu diterima.
- Radius juga dikunci sebagai bagian bahasa bentuk: thumbnail dan chip 12px,
  gambar di dalam kartu 24px, navbar 24px, kartu dan wrapper section 28px,
  kartu fitur besar yang memuat gambar 32px, tombol penuh bulat.
  Pemetaannya menjadi token `--radius-thumb`, `--radius-media`,
  `--radius-nav`, `--radius-card`, dan `--radius-feature`.
- Nilai radius lama (`--radius` turunan sm/md/lg/xl) tetap ada demi halaman lain,
  tetapi section landing hanya boleh memakai empat token di atas.
