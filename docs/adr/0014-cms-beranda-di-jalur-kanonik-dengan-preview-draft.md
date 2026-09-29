# 0014. CMS konten beranda dibangun di jalur kanonik v1 dengan preview draft

- Status: accepted
- Tanggal: 2026-09-30
- Konteks: dua jalur CMS yang hidup berdampingan dan permintaan preview Beranda saat mengedit

## Konteks

Repo memiliki dua jalur CMS: jalur lama (JWT di `localStorage`, tanpa cek peran,
dipakai halaman `/admin` saat ini) dan jalur kanonik v1 (cookie sesi, peran
`ADMIN_GLOBAL`/`SEKRETARIS_UMUM`/`SEKRETARIS_DIVISI`, audit, serta workflow
DRAFT menuju PUBLISHED). Workflow publikasi Berita hanya ada di jalur kanonik,
sehingga Berita yang dibuat lewat halaman admin lama tidak pernah tayang di
situs publik. Audit media Beranda menemukan hero, Tentang GenBI, dan Pilar GenBI
masih konstanta/berkas statis, tanpa tabel konten Beranda dan tanpa mekanisme
preview.

## Keputusan

1. Modul konten Beranda baru dan perbaikan jalur Berita (publish, galeri, dan
   slot beranda; lihat ADR 0012) dibangun di API kanonik v1; hanya peran
   `ADMIN_GLOBAL` yang dapat mengubah konten Beranda.
2. Login CMS dipindahkan ke sesi cookie kanonik. Halaman admin lama (FAQ,
   testimoni) ikut dimigrasikan menyusul, lalu jalur lama dipensiunkan.
3. Editor konten Beranda berupa panel formulir per bagian ditambah preview
   Beranda yang memakai komponen Beranda asli dengan state draft: perubahan yang
   belum disimpan terlihat di preview, tombol Simpan menerbitkannya (ADR 0013).
4. Preview hanya dapat diakses admin global di balik sesi CMS.
5. Temuan audit dirapikan dalam alur yang sama: menu admin yang menuju 404,
   halaman `/admin` mock, URL `localhost:5000` hardcoded di beberapa layanan
   admin, dan fallback secret JWT di jalur lama.

## Alasan

- Syarat "hanya admin global" tidak dapat ditegakkan di jalur lama karena tidak
  ada cek peran; jalur kanonik sudah membawa peran, scope, dan audit.
- Jalur publikasi Berita hanya ada di kanonik; memperbaiki alur
  input menuju publish menuju slot beranda berarti memakai jalur itu, bukan
  menyalinnya.
- Preview dengan komponen asli tidak memerlukan renderer kedua sehingga dijamin
  1:1; formulir panel lebih murah, ramah perangkat kecil, dan lebih mudah
  divalidasi daripada edit-inline, dengan fondasi state draft yang sama bila
  edit-inline ingin ditambahkan kemudian.

## Konsekuensi

- Selama migrasi berjalan, CMS memiliki dua cara login; ini kondisi sementara
  yang harus selesai sebelum jalur lama dihapus.
- Komponen Beranda direfaktor agar menerima data dari props supaya dapat
  dirender di editor dengan data draft.
- Berita yang diterbitkan lewat CMS menjadi syarat slot beranda berfungsi;
  validasi slot hanya menerima Berita terbit.
- Halaman admin lama yang belum dimigrasikan tetap berfungsi sampai migrasinya
  selesai.

## Alternatif yang ditolak

- **Melanjutkan jalur lama lalu menambah cek peran**: tetap tanpa audit dan
  tanpa workflow publikasi; pekerjaan tetap harus dipindahkan ke kanonik nanti.
- **Edit-inline di dalam preview sejak awal**: pengalaman lebih mewah tetapi
  lebih mahal dan berisiko; fondasi state draft yang sama memungkinkan
  penambahannya di fase lanjutan.
- **Halaman preview terpisah tanpa state draft**: tidak memenuhi kebutuhan
  "melihat Beranda saat mengedit".
