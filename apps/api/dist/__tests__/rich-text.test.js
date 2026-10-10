"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const rich_text_1 = require("../lib/rich-text");
/*
 * Unit sanitizer teks kaya: satu-satunya gerbang keamanan sebelum HTML
 * disimpan (dipakai isi Berita dan jawaban FAQ). Tes menembak interface yang
 * sama dengan pemanggil; perilaku internal sanitize-html tidak diuji.
 */
// Tag presentasi dasar dipertahankan apa adanya.
strict_1.default.equal((0, rich_text_1.sanitizeRichText)("<p><strong>Tebal</strong> dan <em>miring</em></p>"), "<p><strong>Tebal</strong> dan <em>miring</em></p>");
// Daftar dipertahankan; tautan aman lolos bersama rel pengaman.
const withLink = (0, rich_text_1.sanitizeRichText)('<ul><li>Poin <a href="https://contoh.com" onclick="x()">tautan</a></li></ul>');
strict_1.default.match(withLink, /<ul><li>Poin <a href="https:\/\/contoh\.com"/);
strict_1.default.match(withLink, /rel="noopener noreferrer"/);
strict_1.default.doesNotMatch(withLink, /onclick/);
// Skrip, iframe, atribut gaya, dan event dibuang; teks tetap aman.
strict_1.default.equal((0, rich_text_1.sanitizeRichText)('<p style="font-weight:bold" onclick="x()">Aman</p><script>alert(1)</script><iframe src="x"></iframe>'), "<p>Aman</p>");
// Tautan berskema berbahaya kehilangan href-nya, teksnya bertahan.
strict_1.default.equal((0, rich_text_1.sanitizeRichText)('<p><a href="javascript:alert(1)">x</a></p>'), '<p><a rel="noopener noreferrer">x</a></p>');
// Teks polos lama (jawaban FAQ ber-penanda **tebal** dan baris baru) lewat apa adanya.
strict_1.default.equal((0, rich_text_1.sanitizeRichText)("Baris satu\nBaris **dua**"), "Baris satu\nBaris **dua**");
console.log("All rich-text sanitizer assertions passed successfully!");
