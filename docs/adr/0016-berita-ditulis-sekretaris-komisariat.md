# 0016. Berita dapat ditulis sekretaris komisariat, diterbitkan admin global

- Status: accepted
- Tanggal: 2026-09-30
- Konteks: meninjau keputusan "Berita hanya admin global" (#11) untuk membuka konten komisariat

## Konteks

Keputusan sebelumnya (#11, 21 Sep 2026) membatasi Berita hanya untuk akun
`ADMIN_GLOBAL` agar alur persetujuan dan sanitasi konten tetap pendek. Dalam
praktiknya, setiap komisariat memiliki kegiatan dan dokumentasi sendiri yang
layak terbit di GenBI Jatim News, tetapi anggota dan sekretaris komisariat
tidak punya pintu masuk. Model data sudah siap: `News.author` menyimpan nama,
dan `News.publisher` (ADR 0011) menyimpan penerbit sebagai teks yang dapat
berisi "GenBI Jatim" maupun nama komisariat.

## Keputusan

1. Sekretaris umum dan sekretaris divisi dapat menulis dan mengajukan Berita
   dalam scope komisariatnya; admin global tetap dapat menulis dan
   menerbitkannya langsung.
2. Penerbitan hanya dilakukan admin global: sekretaris mengajukan
   (`SUBMITTED`), admin global menyetujui lalu menerbitkan (`APPROVED` lalu
   `PUBLISHED`). Tidak ada approval berjenjang (selaras #7: four-eyes tidak
   diperlukan pada fase ini).
3. Atribusi Berita menampilkan nama penerbit (nama orang), asal komisariat, dan
   tanggal terbit; divisi tidak ditampilkan. Pemetaan field: `author`
   menyimpan nama penerbit dan `publisher` menyimpan asal komisariat.
4. Daftar Berita pada sisi sekretaris menampilkan Berita komisariatnya beserta
   statusnya, tanpa aksi approval.
5. Keputusan ini merevisi butir "Berita hanya admin global" pada #11; lifecycle
   dan kewajiban alasan saat menolak tetap berlaku.

## Alasan

- Konten lokal adalah kebutuhan nyata; satu admin global tidak dapat meliput
  sembilan komisariat sendiri.
- Alur approval yang sudah ada (pengajuan diterima admin global) cukup
  mengontrol kualitas tanpa menambah jenjang.
- Skema sudah mengantisipasi penerbit komisariat (ADR 0011), sehingga perubahan
  terutama berada di izin dan permukaan UI.

## Konsekuensi

- Transisi status Berita dibuka untuk pengajuan oleh sekretaris; approve dan
  publish tetap `ADMIN_GLOBAL`.
- Permukaan admin sekretaris menampilkan editor Berita ber-scope yang baru.
- Berita lama dan pemetaan atribusinya (author/publisher) dipertahankan.

## Alternatif yang ditolak

- **Tetap admin global saja**: konten komisariat tidak akan terliput dan
  permukaan admin sekretaris tetap kosong.
- **Sekretaris langsung menerbitkan**: kualitas dan konsistensi redaksi tidak
  terkontrol.
- **Approval berjenjang (sekretaris umum menyetujui divisi lebih dulu)**:
  menambah panjang alur tanpa manfaat yang jelas pada fase ini (#7).
