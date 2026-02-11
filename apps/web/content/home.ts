/**
 * Homepage Content Dictionary
 *
 * All static content for the landing page is centralized here.
 * To update copy, edit this file only — no component changes needed.
 */

export const homeContent = {
  hero: {
    badge: "GenBI Jatim 2025/2026",
    heading: {
      line1: "Energi Baru",
      line2: "Untuk Indonesia",
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
    { label: "Anggota", number: 500, suffix: "+" },
    { label: "Proker", number: 50, suffix: "+" },
    { label: "Dampak", value: "∞" },
  ],
  scopeSection: {
    titlePrefix: "Sinergi di Bawah Naungan",
    titleHighlight: "KPw BI Provinsi Jawa Timur",
    description:
      "GenBI Koordinator Komisariat Jawa Timur menaungi mahasiswa penerima beasiswa Bank Indonesia dari 9 Perguruan Tinggi Negeri dan Swasta di wilayah Surabaya, Madura, dan Bojonegoro. Kami bersinergi untuk mengembangkan potensi kepemimpinan dan berkontribusi bagi masyarakat.",
  },
  portalGrid: {
    title: "Jelajahi Platform GenBI Jatim",
    description: "Semua fitur dan informasi yang Anda butuhkan, ada di sini.",
    items: [
      {
        title: "Profil Kampus Mitra",
        desc: "Pantau profil dan kinerja 9 Komisariat.",
        link: "/commissariat",
        color: "from-blue-500 to-indigo-600",
        iconName: "LayoutDashboard" as const,
      },
      {
        title: "Pusat Dokumen",
        desc: "Unduh SOP, Panduan, dan Template surat.",
        link: "/docs",
        color: "from-emerald-500 to-teal-600",
        iconName: "FileText" as const,
      },
      {
        title: "Database Awardee",
        desc: "Cari data penerima beasiswa se-Jatim.",
        link: "/awardee",
        color: "from-orange-500 to-red-600",
        iconName: "GraduationCap" as const,
      },
      {
        title: "Kabar & Berita",
        desc: "Informasi kegiatan terbaru GenBI Jatim.",
        link: "/news",
        color: "from-purple-500 to-pink-600",
        iconName: "Newspaper" as const,
      },
    ],
  },
  newsPreview: {
    title: "Berita & Kegiatan",
    description:
      "Ikuti jejak langkah dan kegiatan inspiratif dari GenBI Jawa Timur dalam membangun negeri.",
    items: [
      {
        title: "Partisipasi GenBI Jatim dalam Sosialisasi QRIS Nasional",
        excerpt:
          "GenBI Jatim turut serta dalam upaya Bank Indonesia memperluas akseptasi digital di kalangan UMKM melalui program sosialisasi masif di 5 kota besar.",
        tag: "KEGIATAN",
        date: "20 Okt 2025",
        image: "/assets/images/raker.jpg",
        slug: "partisipasi-genbi-jatim-sosialisasi-qris-nasional",
      },
      {
        title: "Beasiswa Bank Indonesia 2026 Segera Dibuka",
        excerpt:
          "Siapkan dirimu! Pendaftaran beasiswa paling bergengsi akan segera dibuka. Simak syarat dan ketentuan lengkapnya di sini.",
        tag: "PENGUMUMAN",
        date: "15 Okt 2025",
        image: "/assets/images/background.jpg",
        slug: "beasiswa-bank-indonesia-2026-segera-dibuka",
      },
      {
        title: "GenBI Jatim Raih Penghargaan Komunitas Terbaik",
        excerpt:
          "Sebuah pencapaian membanggakan, GenBI Jatim dinobatkan sebagai komunitas paling aktif dan berdampak dalam ajang GenBI Award Nasional tahun ini.",
        tag: "PRESTASI",
        date: "01 Okt 2025",
        image: "/assets/images/bnsp.JPG",
        slug: "genbi-jatim-raih-penghargaan-komunitas-terbaik",
      },
    ],
  },
  cta: {
    title: "Jadilah Energi Baru untuk Indonesia Maju",
    description:
      "Bergabunglah dengan ekosistem kepemimpinan terbesar di Jawa Timur. Persiapkan dirimu untuk seleksi penerima beasiswa tahun 2026.",
    primary: { label: "Panduan & Syarat Beasiswa", href: "/docs" },
    secondary: {
      label: "Ikuti Instagram",
      href: "https://instagram.com/genbi_jatim",
    },
  },
};
