"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNewsGalleryAsset = exports.orderNewsGalleryAssets = exports.addNewsGalleryAsset = exports.transitionNews = exports.previewNews = exports.setNewsFeaturedOrder = exports.updateNewsSlug = exports.transitionNewsRevision = exports.cancelNewsRevision = exports.updateNewsRevision = exports.createNewsRevision = exports.updateDraftNews = exports.createDraftNews = exports.listCmsNews = exports.getPublishedNews = exports.listPublishedNews = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const news_lifecycle_1 = require("../domain/news-lifecycle");
const types_1 = require("@repo/types");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const storage_1 = require("../lib/storage");
const rich_text_1 = require("../lib/rich-text");
const publicNewsDir = () => (0, storage_1.publicStoragePath)("news");
const privateNewsDir = () => (0, storage_1.privateStoragePath)("news");
const privateStagedNewsPath = (filename) => (0, storage_1.privateStoragePath)(path_1.default.join("staged", "news", filename));
const privateStagedNewsDir = () => (0, storage_1.privateStoragePath)(path_1.default.join("staged", "news"));
const assertImageSignature = (file) => {
    const isJpeg = file.mimetype === "image/jpeg" &&
        file.buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    const isPng = file.mimetype === "image/png" &&
        file.buffer
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp = file.mimetype === "image/webp" &&
        file.buffer.subarray(0, 4).toString() === "RIFF" &&
        file.buffer.subarray(8, 12).toString() === "WEBP";
    if (!isJpeg && !isPng && !isWebp)
        throw new api_error_1.ApiError("UNSUPPORTED_MEDIA_TYPE", "Cover signature does not match its declared type.", 415);
};
/*
 * Cover kanonik selalu dikonversi ke WebP saat distaging supaya berkas publik
 * seragam dan ringan (berkas asli tidak disimpan; promosi ke publik menyalin
 * berkas WebP yang sama).
 */
const stageNewsCoverBuffer = async (file) => {
    assertImageSignature(file);
    const webpBuffer = await (0, sharp_1.default)(file.buffer)
        .rotate()
        .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
    })
        .webp({ quality: 80 })
        .toBuffer();
    await (0, storage_1.ensureStorageRoots)();
    await promises_1.default.mkdir(privateStagedNewsDir(), { recursive: true });
    const storageKey = `staged/news/${crypto_1.default.randomUUID()}.webp`;
    await promises_1.default.writeFile(privateStagedNewsPath(path_1.default.basename(storageKey)), webpBuffer);
    const originalFilename = `${path_1.default.basename(file.originalname, path_1.default.extname(file.originalname))}.webp`;
    return {
        storageKey,
        originalFilename,
        mimeType: "image/webp",
        byteSize: webpBuffer.length,
    };
};
/*
 * Galeri berita: sampai 6 gambar pendukung ber-role GALLERY per berita
 * (dinaikkan dari 4 sesuai permintaan editor). Draft menstaging (promosi saat
 * terbit); berita terbit menulis langsung ke publik.
 */
const NEWS_GALLERY_LIMIT = 6;
const savePublicNewsAssetBuffer = async (file) => {
    assertImageSignature(file);
    const webpBuffer = await (0, sharp_1.default)(file.buffer)
        .rotate()
        .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
    })
        .webp({ quality: 80 })
        .toBuffer();
    await (0, storage_1.ensureStorageRoots)();
    await promises_1.default.mkdir(publicNewsDir(), { recursive: true });
    const filename = `${crypto_1.default.randomUUID()}.webp`;
    await promises_1.default.writeFile(path_1.default.join(publicNewsDir(), filename), webpBuffer);
    const originalFilename = `${path_1.default.basename(file.originalname, path_1.default.extname(file.originalname))}.webp`;
    return {
        storageKey: `/uploads/news/${filename}`,
        originalFilename,
        mimeType: "image/webp",
        byteSize: webpBuffer.length,
    };
};
const removeNewsAssetFile = async (storageKey) => {
    try {
        if (storageKey.startsWith("/uploads/news/")) {
            await promises_1.default.rm((0, storage_1.publicStoragePath)(path_1.default.join("news", path_1.default.basename(storageKey))), { force: true });
        }
        else if (storageKey.startsWith("staged/news/")) {
            await promises_1.default.rm(privateStagedNewsPath(path_1.default.basename(storageKey)), {
                force: true,
            });
        }
    }
    catch {
        // Berkas mungkin sudah tidak ada; tidak menghalangi operasi database.
    }
};
const activeGalleryAssets = (newsId) => prisma_1.prisma.newsCoverAsset.findMany({
    where: { newsId, role: "GALLERY", status: { in: ["STAGED", "PUBLIC"] } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
});
const categories = Object.values(client_1.NewsCategory);
/*
 * Urutan gambar publik: aset berperan COVER selalu lebih dulu (satuannya
 * thumbnail pilihan editor), sisanya mengikuti sortOrder lalu createdAt.
 * Berita lama yang seluruh asetnya GALLERY tetap tampil dengan urutan stabil.
 */
const publicNewsImages = (news) => [...(news.coverAssets ?? [])]
    .sort((left, right) => Number(right.role === "COVER") - Number(left.role === "COVER") ||
    left.sortOrder - right.sortOrder ||
    left.createdAt.getTime() - right.createdAt.getTime())
    .map((asset) => asset.storageKey);
const publicProjection = (news) => {
    const images = publicNewsImages(news);
    return {
        id: news.id,
        title: news.title,
        slug: news.slug,
        excerpt: news.excerpt,
        content: news.content,
        category: news.category,
        coverImage: images[0] ?? null,
        images,
        publishedAt: news.publishedAt,
        author: news.author,
        publisher: news.publisher,
        featuredOrder: news.featuredOrder,
    };
};
const includePublic = { coverAssets: { where: { status: "PUBLIC" } } };
const includeCms = {
    coverAssets: true,
    revisions: { orderBy: { updatedAt: "desc" } },
    slugAliases: true,
};
const audit = (accountId, action, entityId, oldStatus, newStatus) => prisma_1.prisma.auditEvent.create({
    data: {
        cmsAccountId: accountId,
        action,
        entity: "NEWS",
        entityId,
        oldStatus,
        newStatus,
    },
});
/*
 * Scope Berita: admin global lintas komisariat; sekretaris terikat komisariat
 * pada assignment aktifnya. Penerbit (publisher) dan komisariat asal diisi
 * dari scope ini sehingga tidak bisa dipalsukan lewat body (ADR 0016).
 */
const newsScope = (req) => {
    const account = req.cmsSession.cmsAccount;
    if (account.role === "ADMIN_GLOBAL")
        return null;
    const assignment = account.assignments[0];
    const commissariatId = assignment?.commissariatId;
    if (!commissariatId)
        throw new api_error_1.ApiError("FORBIDDEN", "The active CMS assignment has no commissariat scope.", 403);
    return { ...assignment, commissariatId };
};
const assertNewsScope = (req, news) => {
    const scope = newsScope(req);
    if (!scope)
        return;
    if (!news.commissariatId || news.commissariatId !== scope.commissariatId)
        throw new api_error_1.ApiError("FORBIDDEN", "The requested News is outside the active CMS scope.", 403);
};
const listPublishedNews = async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 25));
    /*
     * `featured=1` mengembalikan pilihan beranda yang dikurasi admin global
     * (urut `featuredOrder`); tanpa itu, daftar biasa: terbaru lebih dulu.
     */
    const featuredOnly = req.query.featured === "1" || req.query.featured === "true";
    const where = {
        publicationStatus: "PUBLISHED",
        deletedAt: null,
        ...(featuredOnly ? { featuredOrder: { not: null } } : {}),
    };
    const [items, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.news.findMany({
            where,
            include: includePublic,
            orderBy: featuredOnly
                ? [{ featuredOrder: "asc" }, { id: "asc" }]
                : [{ publishedAt: "desc" }, { id: "desc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma_1.prisma.news.count({ where }),
    ]);
    return (0, request_context_middleware_1.sendSuccess)(res, items.map(publicProjection), {
        pagination: { page, pageSize, total, hasNextPage: page * pageSize < total },
    });
};
exports.listPublishedNews = listPublishedNews;
const getPublishedNews = async (req, res) => {
    const article = await prisma_1.prisma.news.findFirst({
        where: {
            OR: [
                { slug: req.params.slug },
                { slugAliases: { some: { slug: req.params.slug } } },
            ],
            publicationStatus: "PUBLISHED",
            deletedAt: null,
        },
        include: includePublic,
    });
    if (!article)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    return (0, request_context_middleware_1.sendSuccess)(res, publicProjection(article));
};
exports.getPublishedNews = getPublishedNews;
const listCmsNews = async (req, res) => {
    const status = typeof req.query.status === "string" &&
        Object.values(client_1.PublicationStatus).includes(req.query.status)
        ? req.query.status
        : undefined;
    const category = typeof req.query.category === "string" &&
        categories.includes(req.query.category)
        ? req.query.category
        : undefined;
    const scope = newsScope(req);
    const items = await prisma_1.prisma.news.findMany({
        where: {
            deletedAt: null,
            ...(scope ? { commissariatId: scope.commissariatId } : {}),
            ...(status ? { publicationStatus: status } : {}),
            ...(category ? { category } : {}),
        },
        include: includeCms,
        orderBy: { updatedAt: "desc" },
    });
    return (0, request_context_middleware_1.sendSuccess)(res, items);
};
exports.listCmsNews = listCmsNews;
const parseNewsFields = (body) => {
    const parsed = types_1.newsWriteSchema.partial().safeParse(body);
    if (!parsed.success)
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Invalid News fields.", 400, {
            body: ["Unknown or invalid News fields"],
        });
    return parsed.data;
};
const createDraftNews = async (req, res) => {
    const parsed = parseNewsFields(req.body);
    const title = (0, news_lifecycle_1.normalizeNewsText)(parsed.title ?? "Untitled", "title", 160);
    const slug = (0, news_lifecycle_1.newsSlug)(title);
    const session = req.cmsSession;
    const accountId = session.cmsAccountId;
    const scope = newsScope(req);
    const author = (0, news_lifecycle_1.resolveNewsAuthor)(parsed.author, session.cmsAccount.role, session.cmsAccount.user.name);
    let publisher = null;
    let commissariatId = null;
    if (scope) {
        const commissariat = await prisma_1.prisma.commissariat.findUnique({
            where: { id: scope.commissariatId },
            select: { name: true },
        });
        if (!commissariat)
            throw new api_error_1.ApiError("FORBIDDEN", "The active CMS assignment points to a missing commissariat.", 403);
        publisher = commissariat.name;
        commissariatId = scope.commissariatId;
    }
    let cover = undefined;
    if (req.file) {
        cover = await stageNewsCoverBuffer(req.file);
    }
    const created = await prisma_1.prisma.news.create({
        data: {
            title,
            slug: `${slug}-${Date.now()}`,
            excerpt: parsed.excerpt ?? "",
            content: (0, rich_text_1.sanitizeRichText)(parsed.content ?? ""),
            category: parsed.category ?? null,
            image: "",
            author,
            publisher,
            commissariatId,
            authorAccountId: accountId,
            publicationStatus: "DRAFT",
        },
    });
    if (cover)
        await prisma_1.prisma.newsCoverAsset.create({
            data: {
                ...cover,
                newsId: created.id,
                role: "COVER",
                visibility: "STAGED",
                status: "STAGED",
            },
        });
    await prisma_1.prisma.auditEvent.create({
        data: {
            cmsAccountId: accountId,
            action: "CREATE",
            entity: "NEWS",
            entityId: created.id,
            newStatus: "DRAFT",
        },
    });
    return (0, request_context_middleware_1.sendSuccess)(res, created);
};
exports.createDraftNews = createDraftNews;
const updateDraftNews = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    assertNewsScope(req, news);
    if (news.publicationStatus !== "DRAFT" &&
        news.publicationStatus !== "REJECTED")
        throw new api_error_1.ApiError("CONFLICT", "Only editable News drafts can be updated.", 409);
    const fields = parseNewsFields(req.body);
    const updated = await prisma_1.prisma.news.update({
        where: { id: news.id },
        data: {
            ...(fields.title
                ? { title: (0, news_lifecycle_1.normalizeNewsText)(fields.title, "title", 160) }
                : {}),
            ...(fields.excerpt !== undefined
                ? { excerpt: fields.excerpt.trim() }
                : {}),
            ...(fields.content !== undefined
                ? { content: (0, rich_text_1.sanitizeRichText)(fields.content.trim()) }
                : {}),
            ...(fields.category !== undefined ? { category: fields.category } : {}),
            ...(fields.author !== undefined
                ? { author: (0, news_lifecycle_1.normalizeNewsText)(fields.author, "author", 120) }
                : {}),
            ...(news.publicationStatus === "REJECTED"
                ? { publicationStatus: "DRAFT" }
                : {}),
        },
    });
    if (req.file) {
        await prisma_1.prisma.newsCoverAsset.updateMany({
            where: { newsId: news.id, status: "STAGED" },
            data: { status: "SUPERSEDED", supersededAt: new Date() },
        });
        const staged = await stageNewsCoverBuffer(req.file);
        await prisma_1.prisma.newsCoverAsset.create({
            data: {
                ...staged,
                newsId: news.id,
                role: "COVER",
                visibility: "STAGED",
                status: "STAGED",
            },
        });
        await audit(req.cmsSession.cmsAccountId, "COVER_REPLACEMENT", news.id);
    }
    await audit(req.cmsSession.cmsAccountId, "EDIT", news.id, news.publicationStatus, updated.publicationStatus);
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.updateDraftNews = updateDraftNews;
const createNewsRevision = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({
        where: { id: req.params.id },
        include: {
            revisions: {
                where: {
                    cancelledAt: null,
                    publicationStatus: { in: ["DRAFT", "SUBMITTED", "APPROVED"] },
                },
            },
        },
    });
    if (!news)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    if (news.publicationStatus !== "PUBLISHED")
        throw new api_error_1.ApiError("CONFLICT", "Revisions can only be created from published News.", 409);
    if (news.revisions.length)
        throw new api_error_1.ApiError("CONFLICT", "News already has an active revision.", 409);
    const fields = parseNewsFields(req.body);
    const revision = await prisma_1.prisma.newsRevision.create({
        data: {
            newsId: news.id,
            title: fields.title
                ? (0, news_lifecycle_1.normalizeNewsText)(fields.title, "title", 160)
                : news.title,
            slug: news.slug,
            excerpt: fields.excerpt ?? news.excerpt,
            content: fields.content === undefined
                ? news.content
                : (0, rich_text_1.sanitizeRichText)(fields.content),
            category: fields.category === undefined ? news.category : fields.category,
            publicationStatus: "DRAFT",
        },
    });
    if (req.file)
        await stageRevisionCover(revision.id, req.file);
    await audit(req.cmsSession.cmsAccountId, "EDIT", news.id, "PUBLISHED", "DRAFT");
    return (0, request_context_middleware_1.sendSuccess)(res, revision);
};
exports.createNewsRevision = createNewsRevision;
const stageRevisionCover = async (revisionId, file) => {
    const staged = await stageNewsCoverBuffer(file);
    return prisma_1.prisma.newsCoverAsset.create({
        data: {
            revisionId,
            ...staged,
            role: "COVER",
            visibility: "STAGED",
            status: "STAGED",
        },
    });
};
const promoteStagedCover = async (cover) => {
    await (0, storage_1.ensureStorageRoots)();
    await promises_1.default.mkdir(publicNewsDir(), { recursive: true });
    const publicFilename = `${crypto_1.default.randomUUID()}${path_1.default.extname(cover.originalFilename).toLowerCase()}`;
    const publicPath = path_1.default.join(publicNewsDir(), publicFilename);
    await promises_1.default.copyFile(privateStagedNewsPath(path_1.default.basename(cover.storageKey)), publicPath);
    return { publicFilename, publicPath };
};
const updateNewsRevision = async (req, res) => {
    const revision = await prisma_1.prisma.newsRevision.findUnique({
        where: { id: req.params.revisionId },
    });
    if (!revision || revision.cancelledAt)
        throw new api_error_1.ApiError("NOT_FOUND", "Revision not found.", 404);
    if (revision.publicationStatus !== "DRAFT" &&
        revision.publicationStatus !== "REJECTED")
        throw new api_error_1.ApiError("CONFLICT", "Only draft revisions can be updated.", 409);
    const fields = parseNewsFields(req.body);
    const updated = await prisma_1.prisma.newsRevision.update({
        where: { id: revision.id },
        data: {
            ...(fields.title
                ? { title: (0, news_lifecycle_1.normalizeNewsText)(fields.title, "title", 160) }
                : {}),
            ...(fields.excerpt !== undefined ? { excerpt: fields.excerpt } : {}),
            ...(fields.content !== undefined
                ? { content: (0, rich_text_1.sanitizeRichText)(fields.content) }
                : {}),
            ...(fields.category !== undefined ? { category: fields.category } : {}),
            publicationStatus: "DRAFT",
        },
    });
    if (req.file) {
        await prisma_1.prisma.newsCoverAsset.updateMany({
            where: { revisionId: revision.id, status: "STAGED" },
            data: { status: "SUPERSEDED", supersededAt: new Date() },
        });
        await stageRevisionCover(revision.id, req.file);
        await audit(req.cmsSession.cmsAccountId, "COVER_REPLACEMENT", revision.newsId);
    }
    await audit(req.cmsSession.cmsAccountId, "EDIT", revision.newsId, revision.publicationStatus, "DRAFT");
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.updateNewsRevision = updateNewsRevision;
const cancelNewsRevision = async (req, res) => {
    const revision = await prisma_1.prisma.newsRevision.findUnique({
        where: { id: req.params.revisionId },
    });
    if (!revision)
        throw new api_error_1.ApiError("NOT_FOUND", "Revision not found.", 404);
    if (!["DRAFT", "SUBMITTED", "APPROVED"].includes(revision.publicationStatus))
        throw new api_error_1.ApiError("CONFLICT", "Revision cannot be cancelled.", 409);
    const updated = await prisma_1.prisma.newsRevision.update({
        where: { id: revision.id },
        data: { cancelledAt: new Date(), publicationStatus: "ARCHIVED" },
    });
    await audit(req.cmsSession.cmsAccountId, "CANCEL_REVISION", revision.newsId, revision.publicationStatus, "ARCHIVED");
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.cancelNewsRevision = cancelNewsRevision;
const transitionNewsRevision = async (req, res) => {
    const revision = await prisma_1.prisma.newsRevision.findUnique({
        where: { id: req.params.revisionId },
    });
    if (!revision || revision.cancelledAt)
        throw new api_error_1.ApiError("NOT_FOUND", "Revision not found.", 404);
    const to = req.body.status;
    if (!Object.values(client_1.PublicationStatus).includes(to))
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Invalid News status.", 400, {
            status: ["Unsupported status"],
        });
    (0, news_lifecycle_1.assertNewsTransition)(revision.publicationStatus, to, req.body.rejectionReason);
    if (to === "PUBLISHED" &&
        (!revision.excerpt || !revision.content || !revision.category))
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Revision is incomplete for publishing.", 400);
    if (to !== "PUBLISHED") {
        const updated = await prisma_1.prisma.newsRevision.update({
            where: { id: revision.id },
            data: {
                publicationStatus: to,
                rejectionReason: to === "REJECTED"
                    ? req.body.rejectionReason
                    : revision.rejectionReason,
            },
        });
        await audit(req.cmsSession.cmsAccountId, to, revision.newsId, revision.publicationStatus, to);
        return (0, request_context_middleware_1.sendSuccess)(res, updated);
    }
    const cover = await prisma_1.prisma.newsCoverAsset.findFirst({
        where: { revisionId: revision.id, status: "STAGED" },
    });
    const promoted = cover ? await promoteStagedCover(cover) : null;
    let updated;
    try {
        updated = await prisma_1.prisma.$transaction(async (tx) => {
            const now = new Date();
            await tx.news.update({
                where: { id: revision.newsId },
                data: {
                    title: revision.title,
                    slug: revision.slug,
                    excerpt: revision.excerpt,
                    content: revision.content,
                    category: revision.category,
                    publicationStatus: "PUBLISHED",
                    publishedAt: now,
                },
            });
            if (cover) {
                await tx.newsCoverAsset.updateMany({
                    where: { newsId: revision.newsId, status: "PUBLIC" },
                    data: { status: "SUPERSEDED", supersededAt: now },
                });
                await tx.newsCoverAsset.update({
                    where: { id: cover.id },
                    data: {
                        newsId: revision.newsId,
                        storageKey: `/uploads/news/${promoted.publicFilename}`,
                        status: "PUBLIC",
                        visibility: "PUBLIC",
                    },
                });
            }
            return tx.newsRevision.update({
                where: { id: revision.id },
                data: { publicationStatus: "PUBLISHED", publishedAt: now },
            });
        });
    }
    catch (error) {
        if (promoted)
            await promises_1.default.rm(promoted.publicPath, { force: true });
        throw error;
    }
    await audit(req.cmsSession.cmsAccountId, "PUBLISHED", revision.newsId, revision.publicationStatus, "PUBLISHED");
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.transitionNewsRevision = transitionNewsRevision;
const updateNewsSlug = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    const nextSlug = (0, news_lifecycle_1.newsSlug)((0, news_lifecycle_1.normalizeNewsText)(req.body.slug, "slug", 180));
    if (!nextSlug || nextSlug === news.slug)
        return (0, request_context_middleware_1.sendSuccess)(res, news);
    const existing = await prisma_1.prisma.news.findFirst({
        where: {
            OR: [{ slug: nextSlug }, { slugAliases: { some: { slug: nextSlug } } }],
        },
    });
    if (existing)
        throw new api_error_1.ApiError("CONFLICT", "Slug has already been used.", 409);
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.newsSlugAlias.create({
            data: { slug: news.slug, newsId: news.id },
        });
        return tx.news.update({ where: { id: news.id }, data: { slug: nextSlug } });
    });
    await audit(req.cmsSession.cmsAccountId, "SLUG_CHANGE", news.id);
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.updateNewsSlug = updateNewsSlug;
/*
 * Slot beranda (ADR 0012/0013): `featuredOrder` 1-3 hanya untuk berita terbit;
 * satu slot hanya diisi satu berita — slot yang sama dilepas otomatis dari
 * berita lain.
 */
const setNewsFeaturedOrder = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news || news.deletedAt)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    const raw = req.body?.featuredOrder;
    const order = raw === null || raw === undefined ? null : Number(raw);
    if (order !== null && (!Number.isInteger(order) || order < 1 || order > 3))
        throw new api_error_1.ApiError("VALIDATION_ERROR", "featuredOrder harus 1-3 atau null.", 400);
    if (order !== null && news.publicationStatus !== "PUBLISHED")
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Hanya berita terbit yang dapat menempati slot beranda.", 400);
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        if (order !== null) {
            await tx.news.updateMany({
                where: { featuredOrder: order, id: { not: news.id } },
                data: { featuredOrder: null },
            });
        }
        return tx.news.update({
            where: { id: news.id },
            data: { featuredOrder: order },
        });
    });
    await audit(req.cmsSession.cmsAccountId, "FEATURED_ORDER", news.id);
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.setNewsFeaturedOrder = setNewsFeaturedOrder;
const previewNews = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({
        where: { id: req.params.id },
        include: includePublic,
    });
    if (!news)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    return (0, request_context_middleware_1.sendSuccess)(res, {
        ...publicProjection(news),
        isPreview: true,
        publicationStatus: news.publicationStatus,
    });
};
exports.previewNews = previewNews;
const transitionNews = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    const to = req.body.status;
    if (!Object.values(client_1.PublicationStatus).includes(to))
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Invalid News status.", 400, {
            status: ["Unsupported status"],
        });
    assertNewsScope(req, news);
    (0, news_lifecycle_1.assertNewsRoleTransition)(req.cmsSession.cmsAccount.role, news.publicationStatus, to, req.body.rejectionReason);
    const stagedAssets = await prisma_1.prisma.newsCoverAsset.findMany({
        where: { newsId: news.id, status: "STAGED" },
        orderBy: { createdAt: "asc" },
    });
    const activeCover = stagedAssets.find((asset) => asset.role === "COVER");
    /*
     * Terbit ulang setelah "tarik ke draft" boleh memakai cover publik yang
     * sudah ada (tidak wajib mengunggah cover baru); draft yang belum pernah
     * punya cover tetap ditolak.
     */
    const publicCoverCount = activeCover === undefined
        ? await prisma_1.prisma.newsCoverAsset.count({
            where: { newsId: news.id, role: "COVER", status: "PUBLIC" },
        })
        : 0;
    if (to === "PUBLISHED" &&
        (!news.excerpt ||
            !news.content ||
            !news.category ||
            (!activeCover && publicCoverCount === 0)))
        throw new api_error_1.ApiError("VALIDATION_ERROR", "News is incomplete for publishing.", 400);
    if (to === "PUBLISHED") {
        await (0, storage_1.ensureStorageRoots)();
        await promises_1.default.mkdir(publicNewsDir(), { recursive: true });
        const promoted = [];
        try {
            for (const asset of stagedAssets) {
                const publicFilename = `${crypto_1.default.randomUUID()}${path_1.default.extname(asset.originalFilename).toLowerCase()}`;
                const publicPath = path_1.default.join(publicNewsDir(), publicFilename);
                await promises_1.default.copyFile(privateStagedNewsPath(path_1.default.basename(asset.storageKey)), publicPath);
                promoted.push({
                    id: asset.id,
                    publicPath,
                    publicKey: `/uploads/news/${publicFilename}`,
                });
            }
            const updated = await prisma_1.prisma.$transaction(async (tx) => {
                for (const item of promoted) {
                    await tx.newsCoverAsset.update({
                        where: { id: item.id },
                        data: {
                            storageKey: item.publicKey,
                            visibility: "PUBLIC",
                            status: "PUBLIC",
                        },
                    });
                }
                const published = await tx.news.update({
                    where: { id: news.id },
                    data: { publicationStatus: to, publishedAt: new Date() },
                });
                await tx.auditEvent.create({
                    data: {
                        cmsAccountId: req.cmsSession.cmsAccount.id,
                        action: to,
                        entity: "NEWS",
                        entityId: news.id,
                        oldStatus: news.publicationStatus,
                        newStatus: to,
                    },
                });
                return published;
            });
            return (0, request_context_middleware_1.sendSuccess)(res, updated);
        }
        catch (error) {
            await Promise.all(promoted.map((item) => promises_1.default.rm(item.publicPath, { force: true })));
            throw error;
        }
    }
    const updated = await prisma_1.prisma.news.update({
        where: { id: news.id },
        data: {
            publicationStatus: to,
            rejectionReason: to === "REJECTED" ? req.body.rejectionReason : news.rejectionReason,
            publishedAt: to === "PUBLISHED"
                ? new Date()
                : to === "DRAFT"
                    ? null
                    : news.publishedAt,
        },
    });
    await prisma_1.prisma.auditEvent.create({
        data: {
            cmsAccountId: req.cmsSession.cmsAccount.id,
            action: to,
            entity: "NEWS",
            entityId: news.id,
            oldStatus: news.publicationStatus,
            newStatus: to,
        },
    });
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.transitionNews = transitionNews;
const addNewsGalleryAsset = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news || news.deletedAt)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    if (!req.file)
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Berkas tidak ditemukan pada permintaan.", 400);
    const gallery = await activeGalleryAssets(news.id);
    if (gallery.length >= NEWS_GALLERY_LIMIT)
        throw new api_error_1.ApiError("VALIDATION_ERROR", `Galeri maksimal ${NEWS_GALLERY_LIMIT} gambar pendukung.`, 400);
    const nextOrder = gallery.length
        ? Math.max(...gallery.map((asset) => asset.sortOrder)) + 1
        : 1;
    const isPublished = news.publicationStatus === "PUBLISHED";
    const stored = isPublished
        ? await savePublicNewsAssetBuffer(req.file)
        : await stageNewsCoverBuffer(req.file);
    const asset = await prisma_1.prisma.newsCoverAsset.create({
        data: {
            ...stored,
            newsId: news.id,
            role: "GALLERY",
            sortOrder: nextOrder,
            visibility: isPublished ? "PUBLIC" : "STAGED",
            status: isPublished ? "PUBLIC" : "STAGED",
        },
    });
    await audit(req.cmsSession.cmsAccountId, "GALLERY_ADD", news.id);
    return (0, request_context_middleware_1.sendSuccess)(res, asset);
};
exports.addNewsGalleryAsset = addNewsGalleryAsset;
const orderNewsGalleryAssets = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    const ids = req.body?.assetIds;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string"))
        throw new api_error_1.ApiError("VALIDATION_ERROR", "assetIds harus berupa daftar id.", 400);
    const gallery = await activeGalleryAssets(news.id);
    const galleryIds = new Set(gallery.map((asset) => asset.id));
    if (ids.length !== gallery.length || ids.some((id) => !galleryIds.has(id)))
        throw new api_error_1.ApiError("VALIDATION_ERROR", "assetIds harus memuat tepat semua gambar galeri berita ini.", 400);
    await prisma_1.prisma.$transaction(ids.map((id, index) => prisma_1.prisma.newsCoverAsset.update({
        where: { id },
        data: { sortOrder: index },
    })));
    await audit(req.cmsSession.cmsAccountId, "GALLERY_ORDER", news.id);
    return (0, request_context_middleware_1.sendSuccess)(res, await activeGalleryAssets(news.id));
};
exports.orderNewsGalleryAssets = orderNewsGalleryAssets;
const deleteNewsGalleryAsset = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news)
        throw new api_error_1.ApiError("NOT_FOUND", "News not found.", 404);
    const asset = await prisma_1.prisma.newsCoverAsset.findFirst({
        where: { id: req.params.assetId, newsId: news.id, role: "GALLERY" },
    });
    if (!asset)
        throw new api_error_1.ApiError("NOT_FOUND", "Gallery asset not found.", 404);
    await removeNewsAssetFile(asset.storageKey);
    await prisma_1.prisma.newsCoverAsset.delete({ where: { id: asset.id } });
    await audit(req.cmsSession.cmsAccountId, "GALLERY_DELETE", news.id);
    return (0, request_context_middleware_1.sendSuccess)(res, { id: asset.id });
};
exports.deleteNewsGalleryAsset = deleteNewsGalleryAsset;
