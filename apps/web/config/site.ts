/**
 * @file siteConfig.ts
 * @description Global configuration object for GenBI Jatim platform metadata and navigation structure.
 */

export const siteConfig = {
  /* --- CORE_METADATA --- */
  name: "GenBI Jatim",
  description: "Energi Baru untuk Indonesia",

  /* --- NAVIGATION_STRUCTURE --- */
  navItems: [
    { label: "Beranda", href: "/" },

    /* PROFILE_DROPDOWN */
    { 
      label: "Profil", 
      href: "#", 
      children: [
        { label: "Tentang Kami", href: "/about" },
        { label: "Awardee", href: "/awardee" }
      ] 
    },

    /* COMMISSION_MEGA_MENU */
    { label: "Komisariat", href: "/commissariat", isMega: true },

    /* MEDIA_DROPDOWN */
    { 
      label: "Media", 
      href: "#", 
      children: [
        { label: "Berita", href: "/news" },
        { label: "Kalender", href: "/calendar" }
      ] 
    },

    /* CONTACT_DIRECT_LINK */
    { label: "Hubungi Kami", href: "/contact" },
  ],
};