# 0009. Rentang pelaksanaan memakai tanggal selesai sebagai tanggal kalender

- Status: accepted
- Tanggal: 2026-09-29
- Konteks: 26 program kerja publik berjadwal rentang/rangkaian sesi yang sebelumnya hanya punya jadwal teks

## Konteks

Dari 139 program kerja publik, 26 membawa jadwal teks berbentuk rentang
("28-30 Januari 2026", "Oktober 2025 - Maret 2026") atau rangkaian sesi
("15 Oktober 2025, 19 November 2025, ...") sehingga tidak punya tanggal
kalender dan tidak terbaca di kronologi mana pun. ADR 0008 mengecualikan
mereka dari umpan "Kegiatan Terakhir"; keputusan ini menggantikan bagian itu.

## Keputusan

1. Parser rekonsiliasi (`extractScheduleRange`) menurunkan tanggal mulai dan
   selesai dari jadwal teks saat pola tanggalnya jelas. Parsing terjadi saat
   rekonsiliasi, bukan saat runtime.
2. Tanggal selesai dipakai sebagai tanggal kalender program (`tanggalProker`),
   sehingga rentang ikut terbaca di umpan setelah kegiatan selesai.
3. Tanggal mulai dan selesai disimpan di `startDate`/`endDate`; label teks
   sumber tetap disimpan dan tetap ditampilkan utuh di kartu serta detail.
4. Rentang bulanan dan rentang minggu ("Oktober 2025 - Maret 2026",
   "Minggu ke-4 November 2025") memakai batas periode sebagai perkiraan:
   hari pertama bulan awal sampai hari terakhir bulan akhir, dan minggu penuh
   ke-N untuk "Minggu ke-N".
5. Rentang terbalik ("Oktober 2025 - Maret 2025") tidak diturunkan; sumbernya
   harus dikoreksi lebih dulu.
6. Jadwal berkala/kondisional/relatif ("Setiap hari Senin", "Berkala",
   "Menyusul") tetap tanpa tanggal kalender.

## Alasan

- Sumber hanya punya satu kolom tanggal bebas teks; menurunkan rentang saat
  rekonsiliasi membuat 26 program terbaca tanpa mengubah format workbook tim.
- Untuk kegiatan multi-hari, "terakhir dilakukan" paling tepat diwakili
  tanggal selesai; tanggal mulai tetap tersimpan untuk konteks.
- Label teks dipertahankan supaya rentang tidak diganti satu tanggal di layar;
  informasi hari pelaksanaan tidak hilang.

## Konsekuensi

- `dateLabel` pada payload publik kini juga terisi saat tanggal ada. Konsumen
  yang menampilkan `dateLabel || date` otomatis menampilkan rentang, bukan
  hanya tanggal selesai.
- Umpan "Kegiatan Terakhir" memuat kegiatan rentang/rangkaian setelah tanggal
  selesainya lewat; jadwal berkala/kondisional/relatif tetap di luar umpan.
- `CONTEXT.md` diperbarui: istilah "Jadwal teks", "Rentang pelaksanaan", dan
  "Umpan kegiatan terakhir" mengikuti aturan ini.
