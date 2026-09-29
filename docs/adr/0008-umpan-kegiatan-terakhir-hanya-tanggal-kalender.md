# 0008. Umpan kegiatan terakhir hanya memakai tanggal kalender tunggal

- Status: diterima; ketentuan umpan untuk rentang/rangkaian digantikan ADR 0009
- Tanggal: 2026-09-29
- Konteks: panel "Kegiatan Terakhir" di halaman Komisariat dan jadwal program kerja hasil rekonsiliasi 2025/2026

## Konteks

Panel "Kegiatan Terakhir" di halaman Komisariat perlu urutan waktu yang bisa
dipercaya. Dari 139 program kerja publik hasil rekonsiliasi, 87 punya tanggal
kalender (`tanggalProker`); 52 lainnya tidak punya dan membawa jadwal teks:
rentang ("28-30 Januari 2026"), rangkaian sesi ("15 Oktober 2025, 19 November
2025, ..."), berkala ("Setiap hari Senin"), kondisional, atau relatif
("Selama masa kepengurusan"). Sumber data hanya menyediakan satu kolom tanggal
bebas teks; tidak ada kolom rentang.

## Keputusan

1. Umpan hanya memuat program bertanggal kalender tunggal yang sudah
   berlangsung, urut dari yang paling baru.
2. Jadwal teks tidak diparsing untuk kronologi; ia ditampilkan apa adanya di
   kartu daftar Program kerja dan halaman detail, tanpa dipecah seperti tanggal.
3. Parser rekonsiliasi (`excelDate`) hanya mengenali satu tanggal, dengan
   toleransi awalan nama hari ("Sabtu, 9 Mei 2026"); rentang dan daftar tanggal
   tetap tidak dianggap tanggal tunggal.
4. Tanggal yang belum berlangsung diperlakukan sebagai kesalahan data di
   sumber, bukan bahan fitur "akan datang".

## Alasan

- Teks sumber bebas ("Minggu ke-4 November 2025", "Kondisional") sehingga
  parsing runtime mudah salah dan melanggar aturan "tidak mengarang tanggal".
- Kolom tanggal di workbook sumber hanya satu; rentang terstruktur butuh kolom
  baru, perubahan skrip rekonsiliasi, proyeksi API, dan aturan umpan. Itu tidak
  sepadan untuk fase ini dan dicatat sebagai kandidat proyek lanjutan.
- Dua baris bertanggal masa depan ternyata program 2025 yang salah tahun
  (Biventure 2025 dan POBIA), dan sudah dikoreksi di sumber (termasuk catatan
  audit di workbook); memperlakukan `tanggal > hari ini` sebagai "akan datang"
  akan menampilkan typo seperti itu sebagai acara mendatang.

## Konsekuensi

- Panel tidak menampilkan program berjadwal rentang, rangkaian, atau berkala.
  Itu disengaja; halaman Program kerja tetap memuat semuanya.
- Jadwal teks harus dirender utuh di kartu daftar (lihat `ProkerCard`) supaya
  tidak tampak seperti data hilang.
- `CONTEXT.md` memuat istilah "Jadwal teks" dan "Umpan kegiatan terakhir".
- Kalau kelak rentang ingin masuk umpan, dasar penalarannya adalah tanggal
  selesai dan memerlukan pekerjaan struktur di sumber + proyeksi API.
