export type NavDropdown = "profil";

export type NavItem = {
  label: string;
  href: string;
  dropdown?: NavDropdown;
};

const navItems: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Profil", href: "/profil", dropdown: "profil" },
  /*
   * Komisariat sengaja tanpa dropdown: pengunjung harus melewati halaman
   * /commissariat dulu, bukan langsung melompat ke detail kampus.
   */
  { label: "Komisariat", href: "/commissariat" },
  { label: "Awardee", href: "/awardee" },
  { label: "Berita", href: "/news" },
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
