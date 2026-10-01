/*
 * Modul kecil komposisi byline Berita.
 *
 * Satu tempat untuk aturan tampilan "Nama penerbit - Komisariat · Tanggal"
 * (lihat ADR 0011/0016): bagian-bagian byline disusun di sini, lalu tiap
 * permukaan (halaman publik, daftar admin, pratinjau form) hanya mengurus
 * gayanya sendiri. Fallback nama penerbit mengikuti aturan domain server
 * (admin global default "GenBI Jatim"; akun komisariat memakai nama akun).
 */

export type NewsBylineInput = {
  author: string;
  publisher?: string | null;
  publishedAt?: string | null;
};

export type NewsBylineParts = {
  author: string;
  publisher: string | null;
  dateLabel: string | null;
};

/** Tanggal panjang `id-ID` untuk byline; `null` bila kosong/tidak valid. */
export const formatNewsDate = (
  value: string | null | undefined,
): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
};

export const newsBylineParts = (input: NewsBylineInput): NewsBylineParts => ({
  author: input.author,
  publisher: input.publisher ?? null,
  dateLabel: formatNewsDate(input.publishedAt),
});

/** Teks datar byline (tanpa gaya) untuk baris ringkas admin. */
export const newsBylineText = (parts: NewsBylineParts): string =>
  [
    parts.author,
    parts.publisher ? `- ${parts.publisher}` : null,
    parts.dateLabel ? `· ${parts.dateLabel}` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ");

/** Fallback nama penerbit saat kolom dikosongkan (mengikuti aturan server). */
export const newsAuthorFallback = (
  role: string,
  displayName: string | null,
): string =>
  role === "ADMIN_GLOBAL"
    ? "GenBI Jatim"
    : displayName?.trim() || "GenBI Jatim";
