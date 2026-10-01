/**
 * Kelas gaya bersama area admin.
 *
 * Satu sumber untuk tombol, kolom isian, dan kartu supaya seluruh halaman
 * admin memakai bahasa visual yang sama dengan halaman publik:
 * - satu aksen, `genbi-blue`, hanya untuk aksi dan tautan;
 * - warna semantik (merah, amber, emerald) hanya untuk status/validasi;
 * - latar `genbi-soft`, garis `genbi-line`, radius dari skala globals.css;
 * - tombol selalu pill, kolom isian memakai radius thumb.
 */

export const PANEL =
  "rounded-card border border-genbi-line bg-white shadow-[0_18px_44px_-30px_rgba(16,42,92,0.35)]";

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-genbi-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-genbi-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-genbi-haze hover:bg-genbi-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const BTN_DANGER =
  "inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const BTN_SMALL =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-genbi-haze hover:bg-genbi-light hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 disabled:pointer-events-none disabled:opacity-40";

export const BTN_ICON =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors duration-200 hover:border-genbi-haze hover:bg-genbi-light hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 disabled:pointer-events-none disabled:opacity-40";

/** Dasar kolom isian tanpa lebar; pakai FIELD untuk kolom selebar induk. */
export const FIELD_BASE =
  "rounded-thumb border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-genbi-blue focus:ring-2 focus:ring-genbi-blue/20";

export const FIELD = `w-full ${FIELD_BASE}`;

export const LABEL = "block text-sm font-medium text-slate-700";

export const FILE_INPUT =
  "block w-full text-sm text-slate-500 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-genbi-light file:px-4 file:py-2 file:text-sm file:font-semibold file:text-genbi-blue file:transition-colors hover:file:bg-genbi-haze disabled:pointer-events-none disabled:opacity-60";

/** Tautan navigasi sidebar admin. */
export const NAV_LINK =
  "flex items-center gap-2.5 rounded-thumb px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-genbi-soft hover:text-genbi-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50";

/** Keadaan aktif NAV_LINK: latar aksen lembut dengan teks biru. */
export const NAV_LINK_ACTIVE =
  "bg-genbi-light font-semibold text-genbi-blue hover:bg-genbi-light hover:text-genbi-blue";
