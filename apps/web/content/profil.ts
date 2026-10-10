/**
 * Konten halaman Profil tingkat Korwil Jawa Timur, fokus periode 2025/2026.
 *
 * Kenapa statis:
 * Hasil pengecekan database/API (Oktober 2026) menunjukkan struktur tingkat
 * korwil (koordinator, empat divisi korwil, foto anggota) belum punya sumber
 * data sama sekali. Tabel `commissariat` hanya berisi 9 kampus, dan struktur
 * yang tersedia lewat API selalu per-komisariat. Jadi bagian-bagian itu
 * ditulis sebagai konten terkurasi di file ini.
 *
 * Yang perlu diisi pemilik produk:
 * - `profilKoorkom.name` dan `profilKoorkom.image` (foto portrait koordinator).
 * - `profilKoorkom.caption` boleh dibiarkan kosong.
 * - Foto struktur divisi sudah tersedia di `public/assets/struktur/`
 *   (file tanpa angka = cover, berangka = slide anggota berurutan).
 *
 * Catatan penulisan: seluruh string di file ini tampil di halaman publik.
 * Jangan memakai em-dash, dan gunakan ejaan "GenBI" yang konsisten.
 */

export type ProfilDivision = {
  title: string;
  /**
   * Daftar foto carousel: elemen pertama cover kelompok (file tanpa angka),
   * lalu foto anggota berurutan sesuai nomor file.
   */
  images: string[];
};

export type ProfilHighlight = {
  title: string;
  summary: string;
};

/** Periode yang jadi fokus konten statis ini. */
export const profilPeriode = "2025/2026";

export const profilKoorkom = {
  name: "", // TODO: isi nama koordinator komisariat.
  caption: "Koordinator Komisariat GenBI Jawa Timur",
  image: "/assets/images/individu.jpg", // TODO: ganti dengan foto portrait asli.
};

export const profilVisi =
  "Mewujudkan GenBI Jawa Timur sebagai wadah kolaborasi sinergis antar komisariat yang berdampak nyata bagi masyarakat dan lingkungan.";

export const profilMisi: string[] = [
  "Memperkuat solidaritas dan komunikasi lintas komisariat melalui kegiatan kolaboratif",
  "Menghadirkan program berdampak yang selaras dengan pilar utama Bank Indonesia (Pendidikan, Sosial, Lingkungan, dan Ekonomi)",
  "Mempererat hubungan serta membangun jejaring strategis antara anggota aktif dan alumni",
  "Mewujudkan sistem dokumentasi dan pelaporan kinerja yang terukur, transparan, dan berkelanjutan",
];

/**
 * Program kerja Korkom periode 2025/2026, dikirim langsung oleh pemilik
 * produk (Oktober 2026). Sesuai keputusannya: divisi tidak ditampilkan di
 * halaman; tiap panel accordion memuat deskripsi singkat saja, dan tautan
 * dokumentasi menyusul di section Cerita Kami.
 */
export const profilHighlights: ProfilHighlight[] = [
  {
    title: "GenBI Mancing",
    summary:
      "Program GenBI Jatim bertema \"Together We Reel, Together We Heal\" yang dilaksanakan melalui aksi bersih-bersih Pantai Dalegan, pendistribusian tempat sampah, serta edukasi QRIS, CBP Rupiah, dan literasi keuangan kepada UMKM dan pengunjung pantai.",
  },
  {
    title: "GenBI Sowan",
    summary:
      "Kunjungan koordinatif ke komisariat untuk membahas progres proker, inovasi, kendala, serta memperkuat komunikasi antara Sinerkom dan masing-masing komisariat.",
  },
  {
    title: "Database Proker Komisariat",
    summary:
      "Pendataan ini bertujuan mengumpulkan laporan proker tiap komisariat secara terstruktur sebagai dasar monitoring, evaluasi, dan pelaporan resmi ke pembina dan Bank Indonesia.",
  },
  {
    title: "GenBI PKOMS",
    summary:
      "GenBI PKOMS merupakan sistem penilaian kontribusi anggota yang dilakukan secara berkala untuk mengukur keaktifan, partisipasi, dan kinerja selama satu periode melalui absensi, tugas tambahan, serta data kontribusi anggota.",
  },
  {
    title: "GenBI Performance Radar",
    summary:
      "GenBI Performance Radar merupakan sistem penilaian kinerja internal untuk mengukur kontribusi pengurus GenBI Korkom selama satu periode melalui pengumpulan data kontribusi dan pengolahan poin keaktifan.",
  },
  {
    title: "Website GenBI Jatim",
    summary:
      "Pengembangan Website Resmi GenBI Jatim sebagai pusat informasi dan sentralisasi data digital untuk memudahkan akses data, meningkatkan efisiensi, serta mendukung transparansi dan akuntabilitas organisasi.",
  },
  {
    title: "GenBI Ambasador",
    summary:
      "Program Divisi PR-Medkom GenBI Jatim yang memberdayakan anggota komisariat untuk membuat konten informatif mengenai kebijakan dan kegiatan Bank Indonesia sekaligus meningkatkan kualitas konten, jangkauan informasi, serta keterampilan anggota dalam pembuatan konten dan storytelling.",
  },
  {
    title: "GenBI Networking of Inspiring Success (GENIUS)",
    summary:
      "Program apresiasi rutin bulanan GenBI Korkom Jawa Timur sebagai bentuk penghargaan atas capaian dan kontribusi anggota di bidang akademik maupun nonakademik melalui publikasi prestasi pada media sosial resmi GenBI Jatim.",
  },
];

/**
 * Kutipan singkat tentang cara kerja Korkom untuk blok biru di section
 * kegiatan. Draf agen; menunggu persetujuan pemilik produk.
 */
export const profilQuote =
  "“Kolaborasi lintas sembilan komisariat adalah napas kami: merawat kebersamaan pengurus, mendampingi anggota, dan menghadirkan program yang berdampak bagi kampus dan masyarakat.”";

/**
 * Struktur organisasi tingkat korwil. Empat divisi sesuai arahan pemilik
 * produk; BPH tampil di barisnya sendiri di atas tiga divisi lain. Nama dan
 * jabatan sudah tercetak di dalam foto, jadi tiap divisi cukup berupa
 * rangkaian gambar: cover (file tanpa angka) lalu slide anggota.
 */
export const profilDivisions: ProfilDivision[] = [
  {
    title: "Badan Pengurus Harian",
    images: [
      "/assets/struktur/bph.png",
      "/assets/struktur/bph-1.png",
      "/assets/struktur/bph-2.png",
      "/assets/struktur/bph-3.png",
    ],
  },
  {
    title: "Pengembangan & Pendidikan",
    images: [
      "/assets/struktur/pengembangan-pendidikan.png",
      "/assets/struktur/pengembangan-pendidikan-1.png",
      "/assets/struktur/pengembangan-pendidikan-2.png",
    ],
  },
  {
    title: "Sinergi Komisariat",
    images: [
      "/assets/struktur/sinerkom.png",
      "/assets/struktur/sinerkom-1.png",
      "/assets/struktur/sinerkom-2.png",
    ],
  },
  {
    title: "Public Relation & Media Komunikasi",
    images: [
      "/assets/struktur/pr-media-komunikasi.png",
      "/assets/struktur/pr-media-komunikasi-1.png",
      "/assets/struktur/pr-media-komunikasi-2.png",
    ],
  },
];

/**
 * Cerita penutup + kolase foto. Foto memakai dokumentasi kegiatan asli dari
 * unggahan /uploads/proker supaya kolase terasa nyata, bukan aset generik.
 */
export const profilCerita = {
  title: "Cerita Kami",
  paragraphs: [
    "Sepanjang periode 2025/2026, pengurus GenBI Jawa Timur bergerak bersama sembilan komisariat mitra untuk memperkuat solidaritas dan menghadirkan program yang berdampak.",
    "Dari sosialisasi beasiswa, bakti sosial, sampai malam keakraban pengurus, setiap kegiatan dirancang untuk membawa manfaat nyata bagi kampus dan masyarakat sekitar.",
  ],
  collage: [
    "/uploads/proker/pens/dfbab638-96f7-434d-b026-62ecb4bd954c/d627d01aaba929a2f727053f2793c864fb8c13ccdd2c5649aab7165dd1f234e4.webp",
    "/uploads/proker/pens/dfbab638-96f7-434d-b026-62ecb4bd954c/9092e228b4e6e71b8841aea378b411bc78af0a3a360a0ff80167a8b2d7ea5f82.webp",
    "/uploads/proker/pens/dfbab638-96f7-434d-b026-62ecb4bd954c/6b8d52a899ed368474722551d29fbcdca3d68ead5a22934ddf53371b7d173226.webp",
    "/uploads/proker/pens/747caf32-4116-4a59-a934-419b64def412/be9c25c286ab47b68c91dfa6879f77601b580f78a9038d80f3fd281e85d9bfd8.webp",
    "/uploads/proker/uin-madura/fa5c0a82-b75f-465f-96b7-a8260debfb41/a7e613128d29b8b3052f74c37beaa80bf3be3f6949d92ecbe6856efb7a07d689.webp",
    "/uploads/proker/uin-madura/fa5c0a82-b75f-465f-96b7-a8260debfb41/91cfdb442c1a8c3688648b7a000f2e8242d20427937a2162b1444d2720999ed0.webp",
    "/uploads/proker/uin-madura/edea9e73-b1b9-43e3-8131-2a7e53c48f7d/adfc05b6a80830168177554c5b2270655a89662ffb5281484957f811dce69a11.webp",
    "/uploads/proker/uin-madura/edea9e73-b1b9-43e3-8131-2a7e53c48f7d/4c63a3995c96563db0b777808d4cb363ad5c4d99002d3ba8d98d60deb7288b75.webp",
    "/uploads/proker/uin-madura/de379c96-408a-4bae-ba78-4a7d5d9cccaa/dd999c2c886f93f4b16e9026b22fa41db1d8bfaed6dd68c1e084c863be7c36eb.webp",
    "/uploads/proker/uin-madura/d34c93be-6993-4e67-804f-2d0e03139572/cce9db1def7d64633bb131804c20a20eb02b1261bbbbd19fac57b17a9dbaaba0.webp",
  ],
};
