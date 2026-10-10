"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRichText = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
/*
 * Teks kaya untuk isi Berita dan jawaban FAQ: penulisan dapat disalin dari
 * Word (bold, daftar, tautan) dan tetap tampil di halaman publik. Semua HTML
 * disaring sebelum disimpan: hanya tag presentasi dasar yang lolos, tanpa
 * atribut gaya, skrip, iframe, atau elemen asing lain. Tautan dipaksa
 * rel="noopener noreferrer" untuk keamanan.
 */
const OPTIONS = {
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
    allowedAttributes: { a: ["href", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
        a: sanitize_html_1.default.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
    disallowedTagsMode: "discard",
};
const sanitizeRichText = (value) => (0, sanitize_html_1.default)(value, OPTIONS).trim();
exports.sanitizeRichText = sanitizeRichText;
