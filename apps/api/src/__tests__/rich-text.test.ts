import assert from "node:assert/strict";
import { sanitizeRichText } from "../lib/rich-text";

/*
 * Unit sanitizer teks kaya: satu-satunya gerbang keamanan sebelum HTML
 * disimpan (dipakai isi Berita dan jawaban FAQ). Tes menembak interface yang
 * sama dengan pemanggil; perilaku internal sanitize-html tidak diuji.
 */

// Tag presentasi dasar dipertahankan apa adanya.
assert.equal(
  sanitizeRichText("<p><strong>Tebal</strong> dan <em>miring</em></p>"),
  "<p><strong>Tebal</strong> dan <em>miring</em></p>",
);

// Daftar dipertahankan; tautan aman lolos bersama rel pengaman.
const withLink = sanitizeRichText(
  '<ul><li>Poin <a href="https://contoh.com" onclick="x()">tautan</a></li></ul>',
);
assert.match(withLink, /<ul><li>Poin <a href="https:\/\/contoh\.com"/);
assert.match(withLink, /rel="noopener noreferrer"/);
assert.doesNotMatch(withLink, /onclick/);

// Skrip, iframe, atribut gaya, dan event dibuang; teks tetap aman.
assert.equal(
  sanitizeRichText(
    '<p style="font-weight:bold" onclick="x()">Aman</p><script>alert(1)</script><iframe src="x"></iframe>',
  ),
  "<p>Aman</p>",
);

// Tautan berskema berbahaya kehilangan href-nya, teksnya bertahan.
assert.equal(
  sanitizeRichText('<p><a href="javascript:alert(1)">x</a></p>'),
  '<p><a rel="noopener noreferrer">x</a></p>',
);

// Teks polos lama (jawaban FAQ ber-penanda **tebal** dan baris baru) lewat apa adanya.
assert.equal(
  sanitizeRichText("Baris satu\nBaris **dua**"),
  "Baris satu\nBaris **dua**",
);

console.log("All rich-text sanitizer assertions passed successfully!");
