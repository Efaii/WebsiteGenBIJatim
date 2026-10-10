/**
 * Homepage Content Dictionary
 *
 * Semua konten statis halaman beranda ada di sini. Untuk mengubah teks,
 * cukup edit file ini, tidak perlu menyentuh komponen.
 *
 * Catatan redesain: blok `about`, `mitra`, `pilar`, dan `story` ditambahkan
 * supaya seluruh copy landing benar-benar terkumpul di satu tempat seperti
 * yang sudah jadi konvensi file ini.
 */

export const homeContent = {
  hero: {
    heading: {
      line1: "Generasi Baru",
      line2: "untuk Indonesia",
    },
    /**
     * Subteks hero dipangkas menjadi tepat 20 kata (aturan hero: maksimal
     * 20 kata dan maksimal 4 baris). Ketiga peran tetap disebut lengkap.
     */
    description:
      "Komunitas penerima Beasiswa Bank Indonesia di Jawa Timur, garda terdepan transformasi bangsa sebagai",
    highlights: ["Front-liner", "Agent of Change", "Future Leaders"],
    /**
     * Poster hero: lapisan media dasar saat video belum aktif. Gambar ini dulu
     * dipatok langsung di komponen Hero; sekarang ikut dialirkan lewat konten
     * supaya path dan alt-nya satu sumber. Berkasnya sengaja sama dengan
     * `video.poster`, yang dipakai sebagai poster elemen video.
     */
    poster: {
      src: "/assets/images/hero.JPG",
      alt: "Ratusan peserta berpose bersama di dalam aula",
    },
    /**
     * Catatan: CTA hero ("Profil Lengkap" dan "Data Komisariat") DIHAPUS atas
     * keputusan pemilik produk pada revisi hero. Jangan ditambahkan kembali
     * hanya karena disebut di brief lama.
     */
    /**
     * Latar video hero (opsional).
     *
     * Status: AKTIF. Berkas ada di `apps/web/public/assets/videos/hero.mp4`,
     * dan `enabled` bernilai true supaya fallback statis ini memutar video saat
     * konten CMS tidak tersedia. Di CMS (ADR 0013), slot `hero.video` menunjuk
     * path yang sama; poster `/assets/images/hero.JPG` tetap menjadi lapisan
     * LCP dan video hanya lapisan kedua yang dipasang setelah mount (lihat
     * HeroVideo).
     *
     * Berkas final: 1920x1080, 30 fps, H.264 High/yuv420p, tanpa audio, 2-pass
     * ~2650 kbps, `+faststart`, durasi penuh ~17 detik, 5,4 MB.
     *
     * Perintah encode:
     * ffmpeg -i sumber.mp4 -vf "fps=30" -an -c:v libx264 -preset slow \
     *   -b:v 2650k -pass 1 -passlogfile log -pix_fmt yuv420p \
     *   -profile:v high -level 4.1 -f mp4 NUL
     * ffmpeg -i sumber.mp4 -vf "fps=30" -an -c:v libx264 -preset slow \
     *   -b:v 2650k -pass 2 -passlogfile log -pix_fmt yuv420p \
     *   -profile:v high -level 4.1 -movflags +faststart hero.mp4
     *
     * Anggaran <= 2 MB (ADR 0005/0013) dinaikkan menjadi 5-6 MB atas
     * permintaan pemilik produk; batas unggah CMS di API belum ikut berubah.
     */
    video: {
      enabled: true,
      src: "/assets/videos/hero.mp4",
      type: "video/mp4",
      poster: "/assets/images/hero.JPG",
    },
  },
  /**
   * Metrik Beranda.
   *
   * MENGGANTIKAN metrik ADR 0001 (9 Komisariat / 619 Anggota / 139 Program
   * Kerja / 12+ Tahun Berkarya) atas permintaan pemilik produk pada revisi
   * hero. Hanya tiga informasi ini yang boleh tampil; metrik lama tidak
   * dipertahankan sebagai fallback visual.
   *
   * Angkanya disajikan sebagai batas bawah yang tetap benar terhadap data:
   * - Awardee 500+       : jumlah awardee terbit (623) dibulatkan ke bawah
   * - Program Kerja 100+ : program kerja terbit (139) dibulatkan ke bawah
   * - Tahun Berkarya 15  : dihitung dari inisiasi nasional 2011, bukan 2014
   *
   * ADR 0001 belum diperbarui untuk keputusan ini. Kalau nanti angkanya
   * disamakan kembali dengan hitungan persis dari API, perbarui komentar ini
   * dan catat di ADR.
   */
  stats: [
    { label: "Awardee", number: 500, suffix: "+" },
    { label: "Program Kerja", number: 100, suffix: "+" },
    { label: "Tahun Berkarya", number: 15, suffix: "" },
  ],
  about: {
    eyebrow: "Kenali GenBI Lebih Dekat",
    heading: {
      line1: "Bukan Sekadar Beasiswa,",
      line2: "Tapi Transformasi Diri",
    },
    /**
     * Frasa pembuka ditebalkan seperti pada referensi desain: ia menjadi
     * "lead-in" yang menandai subjek paragraf sebelum penjelasannya. Seluruh
     * paragraf kini memakai near-black yang sama dengan judul; sisa paragraf
     * dulu abu kebiruan dan diganti atas permintaan pemilik produk karena
     * kurang terlihat. Pembedanya sekarang tinggal bobot bold.
     */
    paragraphLead: "GenBI Jawa Timur",
    paragraph:
      "hadir sebagai wadah bagi penerima Beasiswa Bank Indonesia untuk berkembang, berjejaring, dan berkontribusi. Kami menjembatani mahasiswa dari berbagai latar belakang kampus untuk bergerak bersama dalam semangat Energi Untuk Negeri.",
    emphasis:
      "Bukan hanya tempat untuk belajar dan berkembang, GenBI juga menjadi ruang untuk membangun kepedulian, menciptakan perubahan, dan memberikan kontribusi nyata bagi masyarakat.",
    images: [
      { src: "/assets/images/raker.jpg", alt: "Rapat kerja GenBI Jawa Timur" },
      /*
       * Sebelumnya berkas ini berisi gambar karakter game yang tidak
       * berhubungan dengan GenBI. Untuk sementara diganti foto dokumentasi
       * program kerja, sampai pemilik produk mengganti seluruh foto beranda.
       */
      {
        src: "/uploads/proker/upnvjt/1ea05c84-2f55-45da-ab83-8932099598e9/foto6.webp",
        alt: "Aktivitas anggota GenBI",
      },
      {
        src: "/assets/images/bnsp.JPG",
        alt: "Pelatihan peningkatan kapasitas anggota",
      },
      {
        src: "/assets/images/background.jpg",
        alt: "Kolaborasi GenBI Jawa Timur",
      },
    ],
  },
  mitra: {
    /**
     * Keterangan cakupan "Suramadu-Bojonegoro" DIHAPUS atas permintaan
     * pemilik produk karena jarak vertikalnya terasa terlalu jauh. Section
     * kini hanya berisi satu label dan deretan logo statis.
     *
     * Heading ditulis Title Case di sini dan diubah menjadi huruf besar oleh
     * CSS di komponen, supaya pembaca layar tidak mengejanya per huruf.
     */
    heading: "9 Kampus Mitra GenBI",
  },
  pilar: {
    /**
     * Label "Kenali Peran GenBI" dihapus atas permintaan pemilik produk, jadi
     * section ini langsung dibuka judul.
     */
    heading: "Peran Utama GenBI",
    description:
      "Tiga pilar peran utama GenBI sebagai komunitas awardee Beasiswa Bank Indonesia untuk berkembang dan berkontribusi.",
    items: [
      {
        title: "Front-liners",
        description:
          "Menjadi garda terdepan dalam menyampaikan informasi dan edukasi Bank Indonesia kepada masyarakat secara komunikatif dan mudah dipahami.",
        points: [
          "Edukasi kebijakan dan informasi Bank Indonesia",
          "Menjembatani informasi dengan masyarakat dan lingkungan kampus",
          "Mendorong literasi ekonomi dan keuangan",
        ],
        image: "/assets/images/pilar-frontliners.webp",
        imageAlt: "Anggota GenBI menyampaikan informasi kepada masyarakat",
      },
      {
        title: "Agent of Change",
        description:
          "Menjadi agen perubahan yang menghadirkan gagasan, inovasi, dan aksi nyata untuk menjawab berbagai tantangan sosial di sekitar.",
        points: [
          "Menginisiasi program yang berdampak bagi masyarakat",
          "Mendorong inovasi dan kolaborasi lintas komunitas",
          "Mengubah ide menjadi aksi dan solusi nyata",
        ],
        image: "/assets/images/pilar-agent-of-change.webp",
        imageAlt: "Program sosial anggota GenBI di masyarakat",
      },
      {
        title: "Future Leaders",
        description:
          "Mempersiapkan generasi muda yang memiliki integritas, kapasitas, dan semangat kolaborasi untuk memberikan kontribusi bagi negeri.",
        points: [
          "Mengembangkan kemampuan kepemimpinan dan profesionalitas",
          "Membangun jejaring lintas kampus dan bidang",
          "Mempersiapkan diri untuk berkontribusi di masa depan",
        ],
        image: "/assets/images/pilar-future-leaders.webp",
        imageAlt: "Peningkatan kapasitas kepemimpinan anggota GenBI",
      },
    ],
  },
  story: {
    heading: "Sejarah Perjalanan",
    description: "Rekam jejak GenBI Jawa Timur dari masa ke masa.",
    milestones: [
      {
        year: "2011",
        title: "Inisiasi Nasional",
        description:
          "Program Beasiswa Bank Indonesia resmi diluncurkan secara nasional sebagai wujud dedikasi untuk negeri.",
      },
      {
        year: "2022",
        title: "GenBI Surabaya",
        description:
          "GenBI Surabaya mulai terorganisir dan menyatukan visi mahasiswa dari berbagai kampus mitra.",
      },
      {
        year: "2023",
        title: "GenBI Koordinator Komisariat Suramadu-Bojonegoro",
        description:
          "GenBI Surabaya berubah nama menjadi GenBI Korkom Suramadu-Bojonegoro.",
      },
      {
        year: "2024",
        title: "GenBI Koordinator Komisariat Jawa Timur",
        description:
          "GenBI Korkom Suramadu-Bojonegoro berkembang menjadi GenBI Korkom Jawa Timur.",
      },
    ],
  },
  portalGrid: {
    title: "Akses Platform Digital",
    description: "Semua fitur dan informasi yang Anda butuhkan, ada di sini.",
    items: [
      {
        title: "Profil Komisariat",
        desc: "Pantau profil dan kinerja 9 Komisariat.",
        link: "/commissariat",
        color: "from-blue-600 to-indigo-700",
        iconName: "LayoutDashboard" as const,
      },
      {
        title: "Database Program Kerja",
        desc: "Jelajahi program kerja GenBI se-Jatim.",
        link: "/commissariat",
        color: "from-slate-600 to-slate-800",
        iconName: "FileText" as const,
      },
      {
        title: "Database Awardee",
        desc: "Cari data penerima beasiswa se-Jatim.",
        link: "/awardee",
        color: "from-sky-500 to-blue-600",
        iconName: "GraduationCap" as const,
      },
      {
        title: "Pengumuman & Berita",
        desc: "Informasi kegiatan terbaru GenBI Jatim.",
        link: "/news",
        color: "from-blue-800 to-indigo-900",
        iconName: "Newspaper" as const,
      },
    ],
  },
  newsPreview: {
    title: "Berita Kegiatan",
    description:
      "Ikuti jejak langkah dan kegiatan inspiratif dari GenBI Jawa Timur dalam membangun negeri.",
    emptyState: "Belum ada berita terbit. Nantikan kabar terbaru dari kami.",
  },
};
