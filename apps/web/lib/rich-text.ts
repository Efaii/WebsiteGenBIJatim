/*
 * Utilitas teks kaya (sisi klien).
 *
 * Editor admin (isi Berita dan jawaban FAQ) menyimpan HTML sederhana:
 * paragraf, tebal, miring, garis bawah, coret, daftar, judul, kutipan, dan
 * tautan. Fungsi di sini menyiapkan konten lama (teks polos) untuk editor,
 * membaca teks polos untuk validasi, membersihkan HTML tempelan (mis. dari
 * Word), dan menjaga gerbang render aman untuk halaman publik. Server tetap
 * menyaring ulang sebelum menyimpan (lib/rich-text.ts di API).
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
  "a",
]);

const TAG_ALIAS: Record<string, string> = {
  b: "strong",
  i: "em",
  h1: "h2",
};

const BLOCK_FALLBACK = new Set([
  "div",
  "section",
  "article",
  "header",
  "footer",
  "table",
  "tr",
  "h4",
  "h5",
  "h6",
]);

const SAFE_URL = /^(https?:|mailto:)/i;

export const isRichHtml = (value: string): boolean =>
  /<(p|br|strong|b|em|i|u|s|ul|ol|li|h2|h3|blockquote|a)[\s>/]/i.test(value);

/*
 * Gerbang render halaman publik: hanya bentuk HTML yang dikenal dan bebas
 * elemen berbahaya yang dirender mentah. Konten baru sudah disaring di API;
 * ini sabuk pengaman untuk baris lama yang dibuat sebelum editor teks kaya.
 */
const RICH_CONTENT =
  /<(p|br|strong|b|em|i|u|s|ul|ol|li|h2|h3|blockquote|a)[\s>/]/i;
const DANGEROUS_CONTENT = /<(script|iframe|style|object|embed|link|meta)\b/i;

export const isSafeRichHtml = (value: string): boolean =>
  RICH_CONTENT.test(value) &&
  !DANGEROUS_CONTENT.test(value) &&
  !/\son\w+\s*=/i.test(value);

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Konten tersimpan (teks polos lama atau HTML) menjadi HTML editor. */
export const contentToEditorHtml = (content: string): string => {
  if (!content.trim()) return "";
  if (isRichHtml(content)) return content;
  return content
    .split(/\n{2,}/)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
};

/** Teks polos untuk validasi dan hitungan karakter. */
export const plainTextOf = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const wrappersForStyle = (style: string): string[] => {
  const wrappers: string[] = [];
  if (/font-weight:\s*(bold|[6-9]00)/i.test(style)) wrappers.push("strong");
  if (/font-style:\s*italic/i.test(style)) wrappers.push("em");
  if (/text-decoration[^;]*underline/i.test(style)) wrappers.push("u");
  if (/text-decoration[^;]*line-through/i.test(style)) wrappers.push("s");
  return wrappers;
};

const transformNode = (node: Node): Node[] => {
  if (node.nodeType === Node.TEXT_NODE) return [node.cloneNode(true)];
  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes).flatMap(transformNode);

  // Gaya teks dari Word (span/font/div ber-style) menjadi tag semantik.
  if (["span", "font", "div", "section", "p"].includes(tag)) {
    const wrappers = wrappersForStyle(element.getAttribute("style") ?? "");
    if (wrappers.length > 0) {
      let content: Node[] = children;
      for (const wrapper of [...wrappers].reverse()) {
        const wrap = document.createElement(wrapper);
        content.forEach((child) => wrap.appendChild(child));
        content = [wrap];
      }
      if (tag === "div" || tag === "section") {
        const paragraph = document.createElement("p");
        content.forEach((child) => paragraph.appendChild(child));
        return [paragraph];
      }
      return content;
    }
  }

  if (!ALLOWED_TAGS.has(tag)) {
    if (BLOCK_FALLBACK.has(tag)) {
      const paragraph = document.createElement("p");
      children.forEach((child) => paragraph.appendChild(child));
      return [paragraph];
    }
    return children;
  }

  const normalized = document.createElement(TAG_ALIAS[tag] ?? tag);
  if (tag === "a") {
    const href = (element.getAttribute("href") ?? "").trim();
    if (!SAFE_URL.test(href)) return children;
    normalized.setAttribute("href", href);
  }
  children.forEach((child) => normalized.appendChild(child));
  return [normalized];
};

/** Saring HTML tempelan/draf: hanya tag dan tautan yang aman. */
export const sanitizeEditorHtml = (html: string): string => {
  const template = document.createElement("template");
  template.innerHTML = html;
  const container = document.createElement("div");
  Array.from(template.content.childNodes)
    .flatMap(transformNode)
    .forEach((child) => container.appendChild(child));
  return container.innerHTML;
};
