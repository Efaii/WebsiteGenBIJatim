export type NavDropdown = "profil" | "commissariat";

export type NavItem = {
  label: string;
  href: string;
  dropdown?: NavDropdown;
};

export type CommissariatLink = { name: string; slug: string };

/**
 * Tautan dropdown Komisariat.
 *
 * Ini konten navigasi statis (nama + slug canonical), bukan data organisasi:
 * jumlah anggota, divisi, dan program kerja selalu datang dari API. Slug HARUS
 * sama dengan yang dilayani `/api/commissariats` (perhatikan `upnvjt`).
 */
const commissariatLinks: CommissariatLink[] = [
  { name: "ITS", slug: "its" },
  { name: "PENS", slug: "pens" },
  { name: "UIN Madura", slug: "uin-madura" },
  { name: "UINSA", slug: "uinsa" },
  { name: "UNAIR", slug: "unair" },
  { name: "UNESA", slug: "unesa" },
  { name: "UNUGIRI", slug: "unugiri" },
  { name: "UPN Veteran Jatim", slug: "upnvjt" },
  { name: "UTM", slug: "utm" },
];

const navItems: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Profil", href: "/profil", dropdown: "profil" },
  { label: "Komisariat", href: "/commissariat", dropdown: "commissariat" },
  { label: "Awardee", href: "/awardee" },
  { label: "Berita", href: "/news" },
  { label: "Hubungi Kami", href: "/contact" },
];

export const siteConfig = {
  name: "GenBI Jatim",
  description: "Energi Baru untuk Indonesia",
  navItems,
  commissariatLinks,
  links: {
    instagram: "https://instagram.com/genbijatim",
    admin: "/admin",
  },
};
