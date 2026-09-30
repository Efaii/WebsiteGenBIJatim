import type { LucideIcon } from "lucide-react";
import {
  CircleHelp,
  ClipboardCheck,
  History,
  House,
  LayoutDashboard,
  ListChecks,
  Newspaper,
  Plus,
} from "lucide-react";

/**
 * Navigasi sidebar area admin.
 *
 * Satu sumber kebenaran untuk menu per peran: setiap item menyimpan daftar
 * peran yang berhak melihatnya, dan kelompok tanpa item yang tersedia tidak
 * dirender. Modul yang belum dibangun karena itu otomatis tidak muncul.
 *
 * Tiket lanjutan menambah item ke kelompok yang sudah disiapkan di sini:
 * - Persetujuan: Berita, Program Kerja, Awardee.
 * - Data: Program Kerja lintas komisariat, Awardee per periode.
 * - Sistem: Akun operator.
 */

export type AdminRole =
  | "ADMIN_GLOBAL"
  | "SEKRETARIS_UMUM"
  | "SEKRETARIS_DIVISI";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  ADMIN_GLOBAL: "Admin global",
  SEKRETARIS_UMUM: "Sekretaris umum",
  SEKRETARIS_DIVISI: "Sekretaris divisi",
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: AdminRole[];
};

export type AdminNavGroup = {
  label?: string;
  items: AdminNavItem[];
};

const ALL_ROLES: AdminRole[] = [
  "ADMIN_GLOBAL",
  "SEKRETARIS_UMUM",
  "SEKRETARIS_DIVISI",
];

const GLOBAL_ONLY: AdminRole[] = ["ADMIN_GLOBAL"];

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Dasbor",
    items: [
      {
        href: "/admin",
        label: "Ringkasan",
        icon: LayoutDashboard,
        roles: ALL_ROLES,
      },
    ],
  },
  {
    label: "Konten",
    items: [
      {
        href: "/admin/beranda",
        label: "Beranda",
        icon: House,
        roles: GLOBAL_ONLY,
      },
      {
        href: "/admin/berita",
        label: "Berita",
        icon: Newspaper,
        roles: ALL_ROLES,
      },
      {
        href: "/admin/faq",
        label: "FAQ",
        icon: CircleHelp,
        roles: GLOBAL_ONLY,
      },
    ],
  },
  {
    label: "Program Kerja",
    items: [
      {
        href: "/admin/proker/lintas",
        label: "Lintas Komisariat",
        icon: ListChecks,
        roles: ["SEKRETARIS_UMUM", "SEKRETARIS_DIVISI"],
      },
      {
        href: "/admin/proker/baru",
        label: "Tambah",
        icon: Plus,
        roles: ["SEKRETARIS_DIVISI"],
      },
      {
        href: "/admin/proker",
        label: "Riwayat",
        icon: History,
        roles: ["SEKRETARIS_DIVISI"],
      },
    ],
  },
  {
    label: "Data",
    items: [
      {
        href: "/admin/proker/lintas",
        label: "Program Kerja",
        icon: ListChecks,
        roles: GLOBAL_ONLY,
      },
      // Awardee per periode menyusul dari tiket #87.
    ],
  },
  {
    label: "Persetujuan",
    items: [
      {
        href: "/admin/persetujuan/berita",
        label: "Berita",
        icon: ClipboardCheck,
        roles: GLOBAL_ONLY,
      },
      // Program Kerja dan Awardee menyusul dari tiket #86 dan #89.
    ],
  },
];

/** Kelompok yang terlihat oleh peran, tanpa kelompok kosong. */
export const navGroupsForRole = (role: AdminRole): AdminNavGroup[] =>
  ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
