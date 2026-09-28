/**
 * Homepage Content Dictionary
 *
 * All static content for the landing page is centralized here.
 * To update copy, edit this file only — no component changes needed.
 */

export const homeContent = {
  hero: {
    badge: "GenBI Jawa Timur",
    heading: {
      line1: "Generasi Baru",
      line2: "untuk Indonesia",
    },
    description:
      "Komunitas penerima Beasiswa Bank Indonesia di Jawa Timur. Menjadi garda terdepan transformasi bangsa sebagai",
    highlights: ["Front-liner, Agent of Change,", "Future Leaders."],
    cta: {
      primary: { label: "Profil Lengkap", href: "/profil" },
      secondary: { label: "Data Komisariat", href: "/commissariat" },
    },
    /**
     * Latar video hero (opsional).
     *
     * Cara mengaktifkan:
     * 1. Taruh file di `apps/web/public/assets/videos/hero.mp4`.
     * 2. Ubah `enabled` menjadi true.
     *
     * Panduan encode agar tetap cepat (target ≤ 2 MB):
     * ffmpeg -i sumber.mp4 -vf "scale=1280:-2" -an -c:v libx264 -crf 26 \
     *   -preset slow -movflags +faststart -t 8 hero.mp4
     * (1280x720, tanpa audio, loop 8 detik, faststart agar bisa diputar sebelum
     * file selesai diunduh). Poster tetap `/assets/images/raker.jpg`.
     */
    video: {
      enabled: false,
      src: "/assets/videos/hero.mp4",
      type: "video/mp4",
      poster: "/assets/images/raker.jpg",
    },
  },
  /**
   * Metrik Beranda. Nilainya statis dan disengaja (ADR 0001): harus persis sama
   * dengan yang ditampilkan daftar publik, bukan angka karangan atau pembulatan.
   * Perbarui ketika sumber datanya berubah.
   *
   * Sumber tiap angka:
   * - Komisariat   : jumlah baris Commissariat di API (9)
   * - Anggota      : Membership ACTIVE + PUBLISHED (619)
   * - Program Kerja: ProgramKerja dengan publicationStatus PUBLISHED (139)
   * - Tahun Berkarya: sejak 2014, tidak ada di API jadi konstanta
   */
  stats: [
    { label: "Komisariat", number: 9, suffix: "" },
    { label: "Anggota", number: 619, suffix: "" },
    { label: "Program Kerja", number: 139, suffix: "" },
    { label: "Tahun Berkarya", number: 12, suffix: "+" },
  ],
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
    title: "Berita & Kegiatan",
    description:
      "Ikuti jejak langkah dan kegiatan inspiratif dari GenBI Jawa Timur dalam membangun negeri.",
  },
};
