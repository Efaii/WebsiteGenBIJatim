/**
 * Label dan warna status publikasi berita.
 *
 * Warna semantik hanya dipakai untuk status; aksen genbi-blue tetap untuk
 * aksi dan tautan. Dipakai bersama oleh daftar berita dan kartu status di
 * halaman kelola berita.
 */

export const NEWS_STATUS_BADGE =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";

export const NEWS_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Menunggu persetujuan",
  APPROVED: "Disetujui",
  PUBLISHED: "Terbit",
  REJECTED: "Ditolak",
  ARCHIVED: "Arsip",
};

export const NEWS_STATUS_CLASS: Record<string, string> = {
  DRAFT: "border-slate-200 bg-slate-100 text-slate-600",
  SUBMITTED: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-genbi-haze bg-genbi-light text-genbi-blue",
  PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  ARCHIVED: "border-slate-200 bg-slate-50 text-slate-500",
};

export const newsStatusClass = (status: string): string =>
  NEWS_STATUS_CLASS[status] ?? NEWS_STATUS_CLASS.DRAFT;
