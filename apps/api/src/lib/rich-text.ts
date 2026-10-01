import sanitizeHtml from "sanitize-html";

/*
 * Konten Berita mendukung teks kaya supaya penulisan dapat disalin dari Word
 * (bold, daftar, tautan) dan tetap tampil di halaman publik. Semua HTML
 * disaring sebelum disimpan: hanya tag presentasi dasar yang lolos, tanpa
 * atribut gaya, skrip, iframe, atau elemen asing lain. Tautan dipaksa
 * rel="noopener noreferrer" untuk keamanan.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "blockquote",
    "a",
  ],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
  disallowedTagsMode: "discard",
};

export const sanitizeNewsContent = (value: string): string =>
  sanitizeHtml(value, OPTIONS).trim();
