import { Instagram, Youtube, Mail } from "lucide-react";

/**
 * @file footerConfig.ts
 * @description Centralized configuration for the global footer, including identity, navigation links, and social assets.
 */

export const footerConfig = {
  /* --- BRAND_IDENTITY_ARCHITECTURE --- */
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

  /* --- NAVIGATION_SECTIONS_ENGINE --- */
  sections: [
    /* EXPLORATION_LINKS */
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
        { label: "Hubungi Kami", href: "/contact" },
      ],
    },
    /* PARTNER_CAMPUS_LIST */
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

  /* --- SOCIAL_CONNECTIVITY_ASSETS --- */
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

  /* --- CONVERSION_CALL_TO_ACTION --- */
  contact: {
    label: "Butuh info beasiswa/kemitraan?",
    cta: "Hubungi Pengurus →",
    href: "/contact",
  },

  /* --- LEGAL_AND_COPYRIGHT_FOOTER --- */
  bottom: {
    copyright: `© ${new Date().getFullYear()} Generasi Baru Indonesia Korkom Jawa Timur. All rights reserved.`,
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Syarat & Ketentuan", href: "#" },
    ],
  },
};