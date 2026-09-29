"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transitionNews = exports.previewNews = exports.updateNewsSlug = exports.transitionNewsRevision = exports.cancelNewsRevision = exports.updateNewsRevision = exports.createNewsRevision = exports.updateDraftNews = exports.createDraftNews = exports.listCmsNews = exports.getPublishedNews = exports.listPublishedNews = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const news_lifecycle_1 = require("../domain/news-lifecycle");
const types_1 = require("@repo/types");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const storage_1 = require("../lib/storage");
const publicNewsDir = () => (0, storage_1.publicStoragePath)('news');
const privateNewsDir = () => (0, storage_1.privateStoragePath)('news');
const privateStagedNewsPath = (filename) => (0, storage_1.privateStoragePath)(path_1.default.join('staged', 'news', filename));
const assertImageSignature = (file) => {
    const isJpeg = file.mimetype === 'image/jpeg' && file.buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    const isPng = file.mimetype === 'image/png' && file.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp = file.mimetype === 'image/webp' && file.buffer.subarray(0, 4).toString() === 'RIFF' && file.buffer.subarray(8, 12).toString() === 'WEBP';
    if (!isJpeg && !isPng && !isWebp)
        throw new api_error_1.ApiError('UNSUPPORTED_MEDIA_TYPE', 'Cover signature does not match its declared type.', 415);
};
const categories = Object.values(client_1.NewsCategory);
const publicProjection = (news) => ({ id: news.id, title: news.title, slug: news.slug, excerpt: news.excerpt, content: news.content, category: news.category, coverImage: news.coverAssets?.find((asset) => asset.status === 'PUBLIC')?.storageKey ?? null, publishedAt: news.publishedAt, byline: 'GenBI Jatim' });
const includePublic = { coverAssets: { where: { status: 'PUBLIC' } } };
const includeCms = { coverAssets: true, revisions: { orderBy: { updatedAt: 'desc' } }, slugAliases: true };
const audit = (accountId, action, entityId, oldStatus, newStatus) => prisma_1.prisma.auditEvent.create({ data: { cmsAccountId: accountId, action, entity: 'NEWS', entityId, oldStatus, newStatus } });
const listPublishedNews = async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 25));
    const where = { publicationStatus: 'PUBLISHED', deletedAt: null };
    const [items, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.news.findMany({ where, include: includePublic, orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
        prisma_1.prisma.news.count({ where }),
    ]);
    return (0, request_context_middleware_1.sendSuccess)(res, items.map(publicProjection), { pagination: { page, pageSize, total, hasNextPage: page * pageSize < total } });
};
exports.listPublishedNews = listPublishedNews;
const getPublishedNews = async (req, res) => {
    const article = await prisma_1.prisma.news.findFirst({ where: { OR: [{ slug: req.params.slug }, { slugAliases: { some: { slug: req.params.slug } } }], publicationStatus: 'PUBLISHED', deletedAt: null }, include: includePublic });
    if (!article)
        throw new api_error_1.ApiError('NOT_FOUND', 'News not found.', 404);
    return (0, request_context_middleware_1.sendSuccess)(res, publicProjection(article));
};
exports.getPublishedNews = getPublishedNews;
const listCmsNews = async (req, res) => {
    const status = typeof req.query.status === 'string' && Object.values(client_1.PublicationStatus).includes(req.query.status) ? req.query.status : undefined;
    const category = typeof req.query.category === 'string' && categories.includes(req.query.category) ? req.query.category : undefined;
    const items = await prisma_1.prisma.news.findMany({ where: { deletedAt: null, ...(status ? { publicationStatus: status } : {}), ...(category ? { category } : {}) }, include: includeCms, orderBy: { updatedAt: 'desc' } });
    return (0, request_context_middleware_1.sendSuccess)(res, items);
};
exports.listCmsNews = listCmsNews;
const parseNewsFields = (body) => {
    const parsed = types_1.newsWriteSchema.partial().safeParse(body);
    if (!parsed.success)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Invalid News fields.', 400, { body: ['Unknown or invalid News fields'] });
    return parsed.data;
};
const createDraftNews = async (req, res) => {
    const parsed = parseNewsFields(req.body);
    const title = (0, news_lifecycle_1.normalizeNewsText)(parsed.title ?? 'Untitled', 'title', 160);
    const slug = (0, news_lifecycle_1.newsSlug)(title);
    const accountId = req.cmsSession.cmsAccountId;
    let cover = undefined;
    if (req.file) {
        assertImageSignature(req.file);
        await (0, storage_1.ensureStorageRoots)();
        await promises_1.default.mkdir(privateNewsDir(), { recursive: true });
        const storageKey = `staged/news/${crypto_1.default.randomUUID()}${path_1.default.extname(req.file.originalname).toLowerCase()}`;
        await promises_1.default.mkdir(path_1.default.dirname(privateStagedNewsPath(path_1.default.basename(storageKey))), { recursive: true });
        await promises_1.default.writeFile(privateStagedNewsPath(path_1.default.basename(storageKey)), req.file.buffer);
        cover = { storageKey, originalFilename: req.file.originalname, mimeType: req.file.mimetype, byteSize: req.file.size };
    }
    const created = await prisma_1.prisma.news.create({ data: { title, slug: `${slug}-${Date.now()}`, excerpt: parsed.excerpt ?? '', content: parsed.content ?? '', category: parsed.category ?? null, image: '', author: 'GenBI Jatim', authorAccountId: accountId, publicationStatus: 'DRAFT' } });
    if (cover)
        await prisma_1.prisma.newsCoverAsset.create({ data: { ...cover, newsId: created.id, visibility: 'STAGED', status: 'STAGED' } });
    await prisma_1.prisma.auditEvent.create({ data: { cmsAccountId: accountId, action: 'CREATE', entity: 'NEWS', entityId: created.id, newStatus: 'DRAFT' } });
    return (0, request_context_middleware_1.sendSuccess)(res, created);
};
exports.createDraftNews = createDraftNews;
const updateDraftNews = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news)
        throw new api_error_1.ApiError('NOT_FOUND', 'News not found.', 404);
    if (news.publicationStatus !== 'DRAFT' && news.publicationStatus !== 'REJECTED')
        throw new api_error_1.ApiError('CONFLICT', 'Only editable News drafts can be updated.', 409);
    const fields = parseNewsFields(req.body);
    const updated = await prisma_1.prisma.news.update({ where: { id: news.id }, data: {
            ...(fields.title ? { title: (0, news_lifecycle_1.normalizeNewsText)(fields.title, 'title', 160) } : {}),
            ...(fields.excerpt !== undefined ? { excerpt: fields.excerpt.trim() } : {}),
            ...(fields.content !== undefined ? { content: fields.content.trim() } : {}),
            ...(fields.category !== undefined ? { category: fields.category } : {}),
            ...(news.publicationStatus === 'REJECTED' ? { publicationStatus: 'DRAFT' } : {}),
        } });
    await audit(req.cmsSession.cmsAccountId, 'EDIT', news.id, news.publicationStatus, updated.publicationStatus);
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.updateDraftNews = updateDraftNews;
const createNewsRevision = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id }, include: { revisions: { where: { cancelledAt: null, publicationStatus: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] } } } } });
    if (!news)
        throw new api_error_1.ApiError('NOT_FOUND', 'News not found.', 404);
    if (news.publicationStatus !== 'PUBLISHED')
        throw new api_error_1.ApiError('CONFLICT', 'Revisions can only be created from published News.', 409);
    if (news.revisions.length)
        throw new api_error_1.ApiError('CONFLICT', 'News already has an active revision.', 409);
    const fields = parseNewsFields(req.body);
    const revision = await prisma_1.prisma.newsRevision.create({ data: { newsId: news.id, title: fields.title ? (0, news_lifecycle_1.normalizeNewsText)(fields.title, 'title', 160) : news.title, slug: news.slug, excerpt: fields.excerpt ?? news.excerpt, content: fields.content ?? news.content, category: fields.category === undefined ? news.category : fields.category, publicationStatus: 'DRAFT' } });
    if (req.file)
        await stageRevisionCover(revision.id, req.file);
    await audit(req.cmsSession.cmsAccountId, 'EDIT', news.id, 'PUBLISHED', 'DRAFT');
    return (0, request_context_middleware_1.sendSuccess)(res, revision);
};
exports.createNewsRevision = createNewsRevision;
const stageRevisionCover = async (revisionId, file) => {
    assertImageSignature(file);
    await (0, storage_1.ensureStorageRoots)();
    await promises_1.default.mkdir(privateNewsDir(), { recursive: true });
    const storageKey = `staged/news/${crypto_1.default.randomUUID()}${path_1.default.extname(file.originalname).toLowerCase()}`;
    await promises_1.default.mkdir(path_1.default.dirname(privateStagedNewsPath(path_1.default.basename(storageKey))), { recursive: true });
    await promises_1.default.writeFile(privateStagedNewsPath(path_1.default.basename(storageKey)), file.buffer);
    return prisma_1.prisma.newsCoverAsset.create({ data: { revisionId, storageKey, originalFilename: file.originalname, mimeType: file.mimetype, byteSize: file.size, visibility: 'STAGED', status: 'STAGED' } });
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
    const revision = await prisma_1.prisma.newsRevision.findUnique({ where: { id: req.params.revisionId } });
    if (!revision || revision.cancelledAt)
        throw new api_error_1.ApiError('NOT_FOUND', 'Revision not found.', 404);
    if (revision.publicationStatus !== 'DRAFT' && revision.publicationStatus !== 'REJECTED')
        throw new api_error_1.ApiError('CONFLICT', 'Only draft revisions can be updated.', 409);
    const fields = parseNewsFields(req.body);
    const updated = await prisma_1.prisma.newsRevision.update({ where: { id: revision.id }, data: { ...(fields.title ? { title: (0, news_lifecycle_1.normalizeNewsText)(fields.title, 'title', 160) } : {}), ...(fields.excerpt !== undefined ? { excerpt: fields.excerpt } : {}), ...(fields.content !== undefined ? { content: fields.content } : {}), ...(fields.category !== undefined ? { category: fields.category } : {}), publicationStatus: 'DRAFT' } });
    if (req.file) {
        await prisma_1.prisma.newsCoverAsset.updateMany({ where: { revisionId: revision.id, status: 'STAGED' }, data: { status: 'SUPERSEDED', supersededAt: new Date() } });
        await stageRevisionCover(revision.id, req.file);
        await audit(req.cmsSession.cmsAccountId, 'COVER_REPLACEMENT', revision.newsId);
    }
    await audit(req.cmsSession.cmsAccountId, 'EDIT', revision.newsId, revision.publicationStatus, 'DRAFT');
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.updateNewsRevision = updateNewsRevision;
const cancelNewsRevision = async (req, res) => {
    const revision = await prisma_1.prisma.newsRevision.findUnique({ where: { id: req.params.revisionId } });
    if (!revision)
        throw new api_error_1.ApiError('NOT_FOUND', 'Revision not found.', 404);
    if (!['DRAFT', 'SUBMITTED', 'APPROVED'].includes(revision.publicationStatus))
        throw new api_error_1.ApiError('CONFLICT', 'Revision cannot be cancelled.', 409);
    const updated = await prisma_1.prisma.newsRevision.update({ where: { id: revision.id }, data: { cancelledAt: new Date(), publicationStatus: 'ARCHIVED' } });
    await audit(req.cmsSession.cmsAccountId, 'CANCEL_REVISION', revision.newsId, revision.publicationStatus, 'ARCHIVED');
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.cancelNewsRevision = cancelNewsRevision;
const transitionNewsRevision = async (req, res) => {
    const revision = await prisma_1.prisma.newsRevision.findUnique({ where: { id: req.params.revisionId } });
    if (!revision || revision.cancelledAt)
        throw new api_error_1.ApiError('NOT_FOUND', 'Revision not found.', 404);
    const to = req.body.status;
    if (!Object.values(client_1.PublicationStatus).includes(to))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Invalid News status.', 400, { status: ['Unsupported status'] });
    (0, news_lifecycle_1.assertNewsTransition)(revision.publicationStatus, to, req.body.rejectionReason);
    if (to === 'PUBLISHED' && (!revision.excerpt || !revision.content || !revision.category))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Revision is incomplete for publishing.', 400);
    if (to !== 'PUBLISHED') {
        const updated = await prisma_1.prisma.newsRevision.update({ where: { id: revision.id }, data: { publicationStatus: to, rejectionReason: to === 'REJECTED' ? req.body.rejectionReason : revision.rejectionReason } });
        await audit(req.cmsSession.cmsAccountId, to, revision.newsId, revision.publicationStatus, to);
        return (0, request_context_middleware_1.sendSuccess)(res, updated);
    }
    const cover = await prisma_1.prisma.newsCoverAsset.findFirst({ where: { revisionId: revision.id, status: 'STAGED' } });
    const promoted = cover ? await promoteStagedCover(cover) : null;
    let updated;
    try {
        updated = await prisma_1.prisma.$transaction(async (tx) => {
            const now = new Date();
            await tx.news.update({ where: { id: revision.newsId }, data: { title: revision.title, slug: revision.slug, excerpt: revision.excerpt, content: revision.content, category: revision.category, publicationStatus: 'PUBLISHED', publishedAt: now } });
            if (cover) {
                await tx.newsCoverAsset.updateMany({ where: { newsId: revision.newsId, status: 'PUBLIC' }, data: { status: 'SUPERSEDED', supersededAt: now } });
                await tx.newsCoverAsset.update({ where: { id: cover.id }, data: { newsId: revision.newsId, storageKey: `/uploads/news/${promoted.publicFilename}`, status: 'PUBLIC', visibility: 'PUBLIC' } });
            }
            return tx.newsRevision.update({ where: { id: revision.id }, data: { publicationStatus: 'PUBLISHED', publishedAt: now } });
        });
    }
    catch (error) {
        if (promoted)
            await promises_1.default.rm(promoted.publicPath, { force: true });
        throw error;
    }
    await audit(req.cmsSession.cmsAccountId, 'PUBLISHED', revision.newsId, revision.publicationStatus, 'PUBLISHED');
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.transitionNewsRevision = transitionNewsRevision;
const updateNewsSlug = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news)
        throw new api_error_1.ApiError('NOT_FOUND', 'News not found.', 404);
    const nextSlug = (0, news_lifecycle_1.newsSlug)((0, news_lifecycle_1.normalizeNewsText)(req.body.slug, 'slug', 180));
    if (!nextSlug || nextSlug === news.slug)
        return (0, request_context_middleware_1.sendSuccess)(res, news);
    const existing = await prisma_1.prisma.news.findFirst({ where: { OR: [{ slug: nextSlug }, { slugAliases: { some: { slug: nextSlug } } }] } });
    if (existing)
        throw new api_error_1.ApiError('CONFLICT', 'Slug has already been used.', 409);
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.newsSlugAlias.create({ data: { slug: news.slug, newsId: news.id } });
        return tx.news.update({ where: { id: news.id }, data: { slug: nextSlug } });
    });
    await audit(req.cmsSession.cmsAccountId, 'SLUG_CHANGE', news.id);
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.updateNewsSlug = updateNewsSlug;
const previewNews = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id }, include: includePublic });
    if (!news)
        throw new api_error_1.ApiError('NOT_FOUND', 'News not found.', 404);
    return (0, request_context_middleware_1.sendSuccess)(res, { ...publicProjection(news), isPreview: true, publicationStatus: news.publicationStatus });
};
exports.previewNews = previewNews;
const transitionNews = async (req, res) => {
    const news = await prisma_1.prisma.news.findUnique({ where: { id: req.params.id } });
    if (!news)
        throw new api_error_1.ApiError('NOT_FOUND', 'News not found.', 404);
    const to = req.body.status;
    if (!Object.values(client_1.PublicationStatus).includes(to))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Invalid News status.', 400, { status: ['Unsupported status'] });
    (0, news_lifecycle_1.assertNewsTransition)(news.publicationStatus, to, req.body.rejectionReason);
    const activeCover = await prisma_1.prisma.newsCoverAsset.findFirst({ where: { newsId: news.id, status: 'STAGED' }, orderBy: { createdAt: 'desc' } });
    if (to === 'PUBLISHED' && (!news.excerpt || !news.content || !news.category || !activeCover))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'News is incomplete for publishing.', 400);
    if (to === 'PUBLISHED' && activeCover) {
        await (0, storage_1.ensureStorageRoots)();
        await promises_1.default.mkdir(publicNewsDir(), { recursive: true });
        const publicFilename = `${crypto_1.default.randomUUID()}${path_1.default.extname(activeCover.originalFilename).toLowerCase()}`;
        const publicPath = path_1.default.join(publicNewsDir(), publicFilename);
        await promises_1.default.copyFile(privateStagedNewsPath(path_1.default.basename(activeCover.storageKey)), publicPath);
        try {
            const updated = await prisma_1.prisma.$transaction(async (tx) => {
                await tx.newsCoverAsset.update({ where: { id: activeCover.id }, data: { storageKey: `/uploads/news/${publicFilename}`, visibility: 'PUBLIC', status: 'PUBLIC' } });
                const published = await tx.news.update({ where: { id: news.id }, data: { publicationStatus: to, publishedAt: new Date() } });
                await tx.auditEvent.create({ data: { cmsAccountId: req.cmsSession.cmsAccount.id, action: to, entity: 'NEWS', entityId: news.id, oldStatus: news.publicationStatus, newStatus: to } });
                return published;
            });
            return (0, request_context_middleware_1.sendSuccess)(res, updated);
        }
        catch (error) {
            await promises_1.default.rm(publicPath, { force: true });
            throw error;
        }
    }
    const updated = await prisma_1.prisma.news.update({ where: { id: news.id }, data: { publicationStatus: to, rejectionReason: to === 'REJECTED' ? req.body.rejectionReason : news.rejectionReason, publishedAt: to === 'PUBLISHED' ? new Date() : to === 'DRAFT' ? null : news.publishedAt } });
    await prisma_1.prisma.auditEvent.create({ data: { cmsAccountId: req.cmsSession.cmsAccount.id, action: to, entity: 'NEWS', entityId: news.id, oldStatus: news.publicationStatus, newStatus: to } });
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.transitionNews = transitionNews;
