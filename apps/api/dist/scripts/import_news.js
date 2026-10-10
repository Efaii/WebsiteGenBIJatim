"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Impor berita dari `data/berita` (satu file markdown + folder dokumentasi).
 *
 * Default mode adalah DRY-RUN: tidak ada file yang ditulis dan tidak ada baris
 * database yang dibuat. Gunakan `--apply` untuk benar-benar mengimpor.
 *
 * Konvensi yang diikuti (seperti alur CMS berita):
 * - file gambar publik disimpan di `<public storage>/news/<uuid>.webp`,
 *   `storageKey` = `/uploads/news/<uuid>.webp`;
 * - urutan galeri memakai `sortOrder`; gambar pertama berperan `COVER`
 *   (thumbnail pilihan editor), sisanya `GALLERY`. File yang bernama
 *   `thumbnail.*` di folder dokumentasi SELALU menjadi gambar pertama;
 * - berita diimpor berstatus `PUBLISHED` dengan `publishedAt` dari data.
 *
 * Gambar sumber (JPG 2-10 MB) dikonversi ke WebP maksimal 1600px, quality 80,
 * dengan orientasi EXIF diputar otomatis — sama semangatnya dengan pipeline foto
 * proker supaya halaman publik tidak menyajikan file raksasa.
 */
const client_1 = require("@prisma/client");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const news_lifecycle_1 = require("../domain/news-lifecycle");
const storage_1 = require("../lib/storage");
const prisma = new client_1.PrismaClient();
const APPLY = process.argv.includes("--apply");
const mirrorIndex = process.argv.indexOf("--mirror-to");
const MIRROR_TO = mirrorIndex >= 0 ? process.argv[mirrorIndex + 1] : undefined;
const SOURCE_DIR = path_1.default.resolve(process.cwd(), "../../data/berita");
const MARKDOWN_PATH = path_1.default.join(SOURCE_DIR, "Draft Berita Website GenBI Jatim.md");
const MAX_IMAGE_WIDTH = 1600;
const MAX_TITLE = 160;
const MAX_EXCERPT = 280;
/**
 * Peta artikel -> folder dokumentasi. Urutan tidak dipakai untuk tampilan
 * (tampilan mengikuti `publishedAt`), tapi dipertahankan agar mudah dibaca.
 */
const ARTICLES = [
    {
        needle: "Leadership Practice",
        folder: "leadership_practice",
        publishedAt: "2025-11-02T00:00:00.000Z",
        category: "PELATIHAN",
        author: "Fathir Ainur Rochim",
        publisher: "GenBI Jatim",
    },
    {
        needle: "BNSP",
        folder: "bnsp",
        publishedAt: "2025-11-23T00:00:00.000Z",
        category: "PELATIHAN",
        author: "Fathir Ainur Rochim",
        publisher: "GenBI Jatim",
    },
    {
        needle: "MANCING",
        folder: "Genbi_Mancing",
        publishedAt: "2026-04-18T00:00:00.000Z",
        category: "SOSIAL",
        author: "Fathir Ainur Rochim",
        publisher: "GenBI Jatim",
    },
    {
        needle: "Dikukuhkan",
        folder: "Pengukuhan",
        publishedAt: "2026-05-08T00:00:00.000Z",
        category: "KEGIATAN",
        author: "Fathir Ainur Rochim",
        publisher: "GenBI Jatim",
    },
];
/**
 * Belah markdown menjadi beberapa artikel. Judul artikel adalah baris yang
 * seluruhnya tebal (`**Judul**`); baris catatan redaksi seperti
 * `**Link Dokumentasi:**` dan `**Image Untuk Hero:**` dibuang dari isi.
 */
const parseSections = (raw) => {
    const sections = [];
    let current = null;
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        const bold = trimmed.match(/^\*\*(.+?)\*\*[.:]?\s*$/);
        if (bold) {
            const label = bold[1].trim();
            if (/^(link dokumentasi|image untuk hero)/i.test(label))
                continue;
            current = { title: label, paragraphs: [] };
            sections.push(current);
            continue;
        }
        if (/^\*\*(link dokumentasi|image untuk hero)/i.test(trimmed))
            continue;
        if (!current)
            continue;
        const text = line
            .replace(/\\([\\`*_{}[\]()#+\-.!"'])/g, "$1")
            .replace(/\s+$/g, "")
            .trim();
        if (text)
            current.paragraphs.push(text);
    }
    return sections;
};
const buildExcerpt = (paragraph) => {
    if (paragraph.length <= MAX_EXCERPT)
        return paragraph;
    const cut = paragraph.slice(0, MAX_EXCERPT - 3);
    const lastSpace = cut.lastIndexOf(" ");
    return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length).trimEnd()}...`;
};
const createUniqueSlug = async (title) => {
    const base = (0, news_lifecycle_1.newsSlug)((0, news_lifecycle_1.normalizeNewsText)(title, "title", MAX_TITLE));
    let candidate = base;
    let suffix = 2;
    while (await prisma.news.findUnique({ where: { slug: candidate } })) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
    }
    return candidate;
};
const listImageFiles = async (folder) => {
    const entries = await promises_1.default.readdir(path_1.default.join(SOURCE_DIR, folder));
    return entries
        .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
        .sort((left, right) => {
        // `thumbnail.*` adalah penanda editor untuk gambar pertama (COVER).
        const leftThumbnail = /^thumbnail\./i.test(left) ? 0 : 1;
        const rightThumbnail = /^thumbnail\./i.test(right) ? 0 : 1;
        return (leftThumbnail - rightThumbnail ||
            left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));
    });
};
/**
 * Salin berita yang baru diimpor ke database lain (mis. acceptance) TANPA
 * menulis ulang file: `storageKey` yang sama dipakai bersama, jadi satu set
 * file melayani dua database.
 */
const mirrorNews = async (mirrorUrl, slugs) => {
    if (slugs.length === 0)
        return;
    const target = new client_1.PrismaClient({ datasources: { db: { url: mirrorUrl } } });
    try {
        for (const slug of slugs) {
            const source = await prisma.news.findUnique({
                where: { slug },
                include: { coverAssets: { orderBy: { sortOrder: "asc" } } },
            });
            if (!source)
                continue;
            if (await target.news.findUnique({ where: { slug } })) {
                console.log(`[MIRROR-SKIP] "${slug}" sudah ada di database target.`);
                continue;
            }
            const created = await target.news.create({
                data: {
                    title: source.title,
                    slug: source.slug,
                    excerpt: source.excerpt,
                    content: source.content,
                    category: source.category,
                    publicationStatus: source.publicationStatus,
                    publishedAt: source.publishedAt,
                    author: source.author,
                    publisher: source.publisher,
                    image: source.image,
                    coverAssets: {
                        create: source.coverAssets.map((asset) => ({
                            storageKey: asset.storageKey,
                            originalFilename: asset.originalFilename,
                            mimeType: asset.mimeType,
                            byteSize: asset.byteSize,
                            visibility: asset.visibility,
                            status: asset.status,
                            role: asset.role,
                            sortOrder: asset.sortOrder,
                        })),
                    },
                },
            });
            console.log(`[MIRROR] "${created.slug}" disalin ke database target.`);
        }
    }
    finally {
        await target.$disconnect();
    }
};
const main = async () => {
    await promises_1.default.access(MARKDOWN_PATH);
    const sections = parseSections(await promises_1.default.readFile(MARKDOWN_PATH, "utf8"));
    const used = new Set();
    const report = [];
    const importedSlugs = [];
    let imported = 0;
    let skipped = 0;
    await (0, storage_1.ensureStorageRoots)();
    const newsDir = (0, storage_1.publicStoragePath)("news");
    await promises_1.default.mkdir(newsDir, { recursive: true });
    for (const article of ARTICLES) {
        const section = sections.find((item) => !used.has(item.title) && item.title.toLowerCase().includes(article.needle.toLowerCase()));
        if (!section) {
            console.warn(`[LEWAT] Artikel dengan kata kunci "${article.needle}" tidak ditemukan di markdown.`);
            continue;
        }
        used.add(section.title);
        const title = (0, news_lifecycle_1.normalizeNewsText)(section.title, "title", MAX_TITLE);
        const slugBase = (0, news_lifecycle_1.newsSlug)(title);
        const existing = await prisma.news.findFirst({ where: { slug: slugBase } });
        if (existing) {
            skipped += 1;
            console.log(`[SKIP] "${title}" sudah ada (slug ${existing.slug}).`);
            report.push({ title, slug: existing.slug, status: "SKIPPED_EXISTING" });
            continue;
        }
        const files = await listImageFiles(article.folder);
        if (files.length === 0) {
            console.warn(`[LEWAT] Folder ${article.folder} tidak punya gambar.`);
            continue;
        }
        const content = section.paragraphs.join("\n\n");
        const excerpt = buildExcerpt(section.paragraphs[0] ?? "");
        if (!APPLY) {
            imported += 1;
            console.log(`[DRY-RUN] "${title}" | ${article.category} | ${article.publishedAt.slice(0, 10)} | ${files.length} gambar (${files[0]} = cover) | slug ${slugBase}`);
            report.push({ title, slug: slugBase, status: "DRY_RUN", images: files.length });
            continue;
        }
        // Konversi dulu di memori; file ditulis setelah rencana jelas.
        const outputs = [];
        for (const file of files) {
            const sourcePath = path_1.default.join(SOURCE_DIR, article.folder, file);
            const buffer = await (0, sharp_1.default)(sourcePath)
                .rotate()
                .resize(MAX_IMAGE_WIDTH, null, { withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
            outputs.push({ filename: `${crypto_1.default.randomUUID()}.webp`, bytes: buffer, source: file });
        }
        const slug = await createUniqueSlug(title);
        const written = [];
        try {
            for (const output of outputs) {
                await promises_1.default.writeFile(path_1.default.join(newsDir, output.filename), output.bytes, { flag: "wx" });
                written.push(path_1.default.join(newsDir, output.filename));
            }
            const created = await prisma.news.create({
                data: {
                    title,
                    slug,
                    excerpt,
                    content,
                    category: article.category,
                    publicationStatus: "PUBLISHED",
                    publishedAt: new Date(article.publishedAt),
                    author: article.author,
                    publisher: article.publisher,
                    image: `/uploads/news/${outputs[0].filename}`,
                    coverAssets: {
                        create: outputs.map((output, index) => ({
                            storageKey: `/uploads/news/${output.filename}`,
                            originalFilename: output.source,
                            mimeType: "image/webp",
                            byteSize: output.bytes.length,
                            visibility: "PUBLIC",
                            status: "PUBLIC",
                            role: index === 0 ? "COVER" : "GALLERY",
                            sortOrder: index,
                        })),
                    },
                },
            });
            imported += 1;
            importedSlugs.push(created.slug);
            console.log(`[IMPOR] "${title}" | slug ${created.slug} | ${outputs.length} gambar dari ${article.folder}`);
            report.push({ title, slug: created.slug, status: "IMPORTED", images: outputs.length });
        }
        catch (error) {
            for (const file of written) {
                await promises_1.default.rm(file, { force: true }).catch(() => undefined);
            }
            throw error;
        }
    }
    const unmatched = sections.filter((section) => !used.has(section.title)).map((section) => section.title);
    if (unmatched.length) {
        console.log(`\nArtikel tanpa konfigurasi impor (dilewati): ${unmatched.map((title) => `"${title}"`).join(", ")}`);
    }
    console.log(`\nRingkasan: ${APPLY ? "diimpor" : "siap diimpor"} ${imported}, dilewati ${skipped}.`);
    if (APPLY) {
        const reportPath = path_1.default.resolve(process.cwd(), "../../backups/news-import-2026-09-29.json");
        await promises_1.default.mkdir(path_1.default.dirname(reportPath), { recursive: true });
        await promises_1.default.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
        console.log(`Laporan: ${reportPath}`);
    }
    if (APPLY && MIRROR_TO)
        await mirrorNews(MIRROR_TO, importedSlugs);
    await prisma.$disconnect();
};
main().catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect().catch(() => undefined);
    process.exitCode = 1;
});
