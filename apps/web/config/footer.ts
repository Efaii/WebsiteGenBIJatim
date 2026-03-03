import { Instagram, Youtube, Mail } from "lucide-react";

export const footerConfig = {
  identity: {
    name: "GenBI Jawa Timur",
    description: "Komunitas penerima Beasiswa Bank Indonesia yang berdedikasi sebagai Energi Untuk Negeri.",
    logo: "/assets/logos/genbi.svg",
    address: {
      title: "Sekretariat GenBI Jatim",
      line1: "Perpustakaan Bank Indonesia",
      line2: "Jl. Taman Mayangkara No.6, Surabaya, Jawa Timur",
    },
    support: {
      label: "Didukung Penuh Oleh",
      logo: "/assets/logos/bankIndonesiaBlue.svg",
    },
  },
  sections: [
    {
      id: "jelajahi",
      title: "Jelajahi",
      links: [
        { label: "Tentang Kami", href: "/about" },
        { label: "Komisariat & Kampus", href: "/commissariat" },
        { label: "Kalender Kegiatan", href: "/calendar" },
        { label: "Panduan & Dokumen", href: "/docs" },
        { label: "Database Awardee", href: "/awardee" },
        { label: "Berita Terkini", href: "/news" },
      ],
    },
    {
      id: "komisariat",
      title: "Mitra Komisariat",
      links: [
        { label: "Universitas Airlangga", href: "/commissariat/unair" },
        { label: "Institut Teknologi Sepuluh Nopember", href: "/commissariat/its" },
        { label: "Universitas Negeri Surabaya", href: "/commissariat/unesa" },
        { label: "UPN Veteran Jatim", href: "/commissariat/upn-veteran-jatim" },
        { label: "Lihat Semua (9) →", href: "/commissariat", isBold: true },
      ],
    },
  ],
  socials: [
    {
      name: "Instagram",
      href: "https://instagram.com/genbi_jatim",
      icon: Instagram,
    },
    {
      name: "YouTube",
      href: "http://youtube.com/@genbijawatimur3986",
      icon: Youtube,
    },
    {
      name: "Email",
      href: "https://mail.google.com/mail/?view=cm&fs=1&to=genbisuramadubjn@gmail.com",
      icon: Mail,
    },
  ],
  contact: {
    label: "Butuh info beasiswa/kemitraan?",
    cta: "Hubungi Pengurus →",
    href: "/contact",
  },
  bottom: {
    copyright: `© ${new Date().getFullYear()} Generasi Baru Indonesia Korkom Jawa Timur. All rights reserved.`,
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Syarat & Ketentuan", href: "#" },
    ],
  },
};
