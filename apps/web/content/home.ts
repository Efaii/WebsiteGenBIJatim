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
      primary: { label: "Profil Lengkap", href: "/about" },
      secondary: { label: "Data Komisariat", href: "/commissariat" },
    },
  },
  stats: [
    { label: "Komisariat", suffix: "", isDynamic: true },
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
  cta: {
    badge: "Nantikan Informasi Resmi Pendaftaran 2026",
    title: "Mari Bergerak \n Tebarkan Makna",
    description:
      "Bergabunglah dengan keluarga besar GenBI Jawa Timur. Temukan ruang untuk tumbuh, memimpin, dan memberikan dampak nyata bagi masyarakat bersama Bank Indonesia.",
    primary: { label: "Gabung Bersama", href: "/docs" },
    secondary: {
      label: "Intip Keseruan",
      href: "https://instagram.com/genbi_jatim",
    },
  },
};
