export type NavDropdown = "profil" | "commissariat";

export type NavItem = {
  label: string;
  href: string;
  dropdown?: NavDropdown;
};

const navItems: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Profil", href: "/profil", dropdown: "profil" },
  { label: "Komisariat", href: "/commissariat", dropdown: "commissariat" },
  { label: "Awardee", href: "/awardee" },
  { label: "Berita", href: "/news" },
  { label: "Kalender", href: "/calendar" },
  { label: "Dokumen", href: "/docs" },
  { label: "Hubungi Kami", href: "/contact" },
];

export const siteConfig = {
  name: "GenBI Jatim",
  description: "Energi Baru untuk Indonesia",
  navItems,
  links: {
    instagram: "https://instagram.com/genbijatim",
    admin: "/admin",
  },
};
