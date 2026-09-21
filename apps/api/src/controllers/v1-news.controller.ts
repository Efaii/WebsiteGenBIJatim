import { Request, Response } from 'express';
import { NewsCategory, PublicationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { CmsRequest } from '../middlewares/cms-session.middleware';
import { sendSuccess } from '../middlewares/request-context.middleware';
import { assertNewsTransition, newsSlug, normalizeNewsText } from '../domain/news-lifecycle';
import { newsWriteSchema } from '@repo/types';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { privateStoragePath, publicStoragePath, ensureStorageRoots } from '../lib/storage';

const publicNewsDir = () => publicStoragePath('news');
const privateNewsDir = () => privateStoragePath('news');
const privateStagedNewsPath = (filename: string) => privateStoragePath(path.join('staged', 'news', filename));

const assertImageSignature = (file: Express.Multer.File) => {
  const isJpeg = file.mimetype === 'image/jpeg' && file.buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const isPng = file.mimetype === 'image/png' && file.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = file.mimetype === 'image/webp' && file.buffer.subarray(0, 4).toString() === 'RIFF' && file.buffer.subarray(8, 12).toString() === 'WEBP';
  if (!isJpeg && !isPng && !isWebp) throw new ApiError('UNSUPPORTED_MEDIA_TYPE', 'Cover signature does not match its declared type.', 415);
};

const categories = Object.values(NewsCategory);
type PublicNews = { id: string; title: string; slug: string; excerpt: string; content: string; category: NewsCategory | null; publishedAt: Date | null; coverAssets?: Array<{ status: string; storageKey: string }> };
const publicProjection = (news: PublicNews) => ({ id: news.id, title: news.title, slug: news.slug, excerpt: news.excerpt, content: news.content, category: news.category, coverImage: news.coverAssets?.find((asset) => asset.status === 'PUBLIC')?.storageKey ?? null, publishedAt: news.publishedAt, byline: 'GenBI Jatim' });
const includePublic = { coverAssets: { where: { status: 'PUBLIC' } } } as const;
const includeCms = { coverAssets: true, revisions: { orderBy: { updatedAt: 'desc' as const } }, slugAliases: true } as const;

const audit = (accountId: string, action: string, entityId: string, oldStatus?: string, newStatus?: string) =>
  prisma.auditEvent.create({ data: { cmsAccountId: accountId, action, entity: 'NEWS', entityId, oldStatus, newStatus } });

export const listPublishedNews = async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 25));
  const where = { publicationStatus: 'PUBLISHED' as const, deletedAt: null };
  const [items, total] = await prisma.$transaction([
    prisma.news.findMany({ where, include: includePublic, orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
    prisma.news.count({ where }),
  ]);
  return sendSuccess(res, items.map(publicProjection), { pagination: { page, pageSize, total, hasNextPage: page * pageSize < total } });
};

export const getPublishedNews = async (req: Request, res: Response) => {
  const article = await prisma.news.findFirst({ where: { OR: [{ slug: req.params.slug }, { slugAliases: { some: { slug: req.params.slug } } }], publicationStatus: 'PUBLISHED', deletedAt: null }, include: includePublic });
  if (!article) throw new ApiError('NOT_FOUND', 'News not found.', 404);
  return sendSuccess(res, publicProjection(article));
};

export const listCmsNews = async (req: CmsRequest, res: Response) => {
  const status = typeof req.query.status === 'string' && Object.values(PublicationStatus).includes(req.query.status as PublicationStatus) ? req.query.status as PublicationStatus : undefined;
  const category = typeof req.query.category === 'string' && categories.includes(req.query.category as NewsCategory) ? req.query.category as NewsCategory : undefined;
  const items = await prisma.news.findMany({ where: { deletedAt: null, ...(status ? { publicationStatus: status } : {}), ...(category ? { category } : {}) }, include: includeCms, orderBy: { updatedAt: 'desc' } });
  return sendSuccess(res, items);
};

const parseNewsFields = (body: unknown) => {
  const parsed = newsWriteSchema.partial().safeParse(body);
  if (!parsed.success) throw new ApiError('VALIDATION_ERROR', 'Invalid News fields.', 400, { body: ['Unknown or invalid News fields'] });
  return parsed.data;
};

export const createDraftNews = async (req: CmsRequest, res: Response) => {
  const parsed = parseNewsFields(req.body);
  const title = normalizeNewsText(parsed.title ?? 'Untitled', 'title', 160);
  const slug = newsSlug(title);
  const accountId = req.cmsSession!.cmsAccountId;
  let cover = undefined as { storageKey: string; originalFilename: string; mimeType: string; byteSize: number } | undefined;
  if (req.file) {
    assertImageSignature(req.file);
    await ensureStorageRoots();
    await fs.mkdir(privateNewsDir(), { recursive: true });
    const storageKey = `staged/news/${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;
    await fs.mkdir(path.dirname(privateStagedNewsPath(path.basename(storageKey))), { recursive: true });
    await fs.writeFile(privateStagedNewsPath(path.basename(storageKey)), req.file.buffer);
    cover = { storageKey, originalFilename: req.file.originalname, mimeType: req.file.mimetype, byteSize: req.file.size };
  }
  const created = await prisma.news.create({ data: { title, slug: `${slug}-${Date.now()}`, excerpt: parsed.excerpt ?? '', content: parsed.content ?? '', category: parsed.category ?? null, image: '', author: 'GenBI Jatim', authorAccountId: accountId, publicationStatus: 'DRAFT' } });
  if (cover) await prisma.newsCoverAsset.create({ data: { ...cover, newsId: created.id, visibility: 'STAGED', status: 'STAGED' } });
  await prisma.auditEvent.create({ data: { cmsAccountId: accountId, action: 'CREATE', entity: 'NEWS', entityId: created.id, newStatus: 'DRAFT' } });
  return sendSuccess(res, created);
};

export const updateDraftNews = async (req: CmsRequest, res: Response) => {
  const news = await prisma.news.findUnique({ where: { id: req.params.id } });
  if (!news) throw new ApiError('NOT_FOUND', 'News not found.', 404);
  if (news.publicationStatus !== 'DRAFT' && news.publicationStatus !== 'REJECTED') throw new ApiError('CONFLICT', 'Only editable News drafts can be updated.', 409);
  const fields = parseNewsFields(req.body);
  const updated = await prisma.news.update({ where: { id: news.id }, data: {
    ...(fields.title ? { title: normalizeNewsText(fields.title, 'title', 160) } : {}),
    ...(fields.excerpt !== undefined ? { excerpt: fields.excerpt.trim() } : {}),
    ...(fields.content !== undefined ? { content: fields.content.trim() } : {}),
    ...(fields.category !== undefined ? { category: fields.category } : {}),
    ...(news.publicationStatus === 'REJECTED' ? { publicationStatus: 'DRAFT' } : {}),
  } });
  await audit(req.cmsSession!.cmsAccountId, 'EDIT', news.id, news.publicationStatus, updated.publicationStatus);
  return sendSuccess(res, updated);
};

export const createNewsRevision = async (req: CmsRequest, res: Response) => {
  const news = await prisma.news.findUnique({ where: { id: req.params.id }, include: { revisions: { where: { cancelledAt: null, publicationStatus: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] } } } } });
  if (!news) throw new ApiError('NOT_FOUND', 'News not found.', 404);
  if (news.publicationStatus !== 'PUBLISHED') throw new ApiError('CONFLICT', 'Revisions can only be created from published News.', 409);
  if (news.revisions.length) throw new ApiError('CONFLICT', 'News already has an active revision.', 409);
  const fields = parseNewsFields(req.body);
  const revision = await prisma.newsRevision.create({ data: { newsId: news.id, title: fields.title ? normalizeNewsText(fields.title, 'title', 160) : news.title, slug: news.slug, excerpt: fields.excerpt ?? news.excerpt, content: fields.content ?? news.content, category: fields.category === undefined ? news.category : fields.category, publicationStatus: 'DRAFT' } });
  if (req.file) await stageRevisionCover(revision.id, req.file);
  await audit(req.cmsSession!.cmsAccountId, 'EDIT', news.id, 'PUBLISHED', 'DRAFT');
  return sendSuccess(res, revision);
};

const stageRevisionCover = async (revisionId: string, file: Express.Multer.File) => {
  assertImageSignature(file);
  await ensureStorageRoots();
  await fs.mkdir(privateNewsDir(), { recursive: true });
  const storageKey = `staged/news/${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
  await fs.mkdir(path.dirname(privateStagedNewsPath(path.basename(storageKey))), { recursive: true });
  await fs.writeFile(privateStagedNewsPath(path.basename(storageKey)), file.buffer);
  return prisma.newsCoverAsset.create({ data: { revisionId, storageKey, originalFilename: file.originalname, mimeType: file.mimetype, byteSize: file.size, visibility: 'STAGED', status: 'STAGED' } });
};

const promoteStagedCover = async (cover: { storageKey: string; originalFilename: string }) => {
  await ensureStorageRoots();
  await fs.mkdir(publicNewsDir(), { recursive: true });
  const publicFilename = `${crypto.randomUUID()}${path.extname(cover.originalFilename).toLowerCase()}`;
  const publicPath = path.join(publicNewsDir(), publicFilename);
  await fs.copyFile(privateStagedNewsPath(path.basename(cover.storageKey)), publicPath);
  return { publicFilename, publicPath };
};

export const updateNewsRevision = async (req: CmsRequest, res: Response) => {
  const revision = await prisma.newsRevision.findUnique({ where: { id: req.params.revisionId } });
  if (!revision || revision.cancelledAt) throw new ApiError('NOT_FOUND', 'Revision not found.', 404);
  if (revision.publicationStatus !== 'DRAFT' && revision.publicationStatus !== 'REJECTED') throw new ApiError('CONFLICT', 'Only draft revisions can be updated.', 409);
  const fields = parseNewsFields(req.body);
  const updated = await prisma.newsRevision.update({ where: { id: revision.id }, data: { ...(fields.title ? { title: normalizeNewsText(fields.title, 'title', 160) } : {}), ...(fields.excerpt !== undefined ? { excerpt: fields.excerpt } : {}), ...(fields.content !== undefined ? { content: fields.content } : {}), ...(fields.category !== undefined ? { category: fields.category } : {}), publicationStatus: 'DRAFT' } });
  if (req.file) {
    await prisma.newsCoverAsset.updateMany({ where: { revisionId: revision.id, status: 'STAGED' }, data: { status: 'SUPERSEDED', supersededAt: new Date() } });
    await stageRevisionCover(revision.id, req.file);
    await audit(req.cmsSession!.cmsAccountId, 'COVER_REPLACEMENT', revision.newsId);
  }
  await audit(req.cmsSession!.cmsAccountId, 'EDIT', revision.newsId, revision.publicationStatus, 'DRAFT');
  return sendSuccess(res, updated);
};

export const cancelNewsRevision = async (req: CmsRequest, res: Response) => {
  const revision = await prisma.newsRevision.findUnique({ where: { id: req.params.revisionId } });
  if (!revision) throw new ApiError('NOT_FOUND', 'Revision not found.', 404);
  if (!['DRAFT', 'SUBMITTED', 'APPROVED'].includes(revision.publicationStatus)) throw new ApiError('CONFLICT', 'Revision cannot be cancelled.', 409);
  const updated = await prisma.newsRevision.update({ where: { id: revision.id }, data: { cancelledAt: new Date(), publicationStatus: 'ARCHIVED' } });
  await audit(req.cmsSession!.cmsAccountId, 'CANCEL_REVISION', revision.newsId, revision.publicationStatus, 'ARCHIVED');
  return sendSuccess(res, updated);
};

export const transitionNewsRevision = async (req: CmsRequest, res: Response) => {
  const revision = await prisma.newsRevision.findUnique({ where: { id: req.params.revisionId } });
  if (!revision || revision.cancelledAt) throw new ApiError('NOT_FOUND', 'Revision not found.', 404);
  const to = req.body.status;
  if (!Object.values(PublicationStatus).includes(to)) throw new ApiError('VALIDATION_ERROR', 'Invalid News status.', 400, { status: ['Unsupported status'] });
  assertNewsTransition(revision.publicationStatus, to, req.body.rejectionReason);
  if (to === 'PUBLISHED' && (!revision.excerpt || !revision.content || !revision.category)) throw new ApiError('VALIDATION_ERROR', 'Revision is incomplete for publishing.', 400);
  if (to !== 'PUBLISHED') {
    const updated = await prisma.newsRevision.update({ where: { id: revision.id }, data: { publicationStatus: to, rejectionReason: to === 'REJECTED' ? req.body.rejectionReason : revision.rejectionReason } });
    await audit(req.cmsSession!.cmsAccountId, to, revision.newsId, revision.publicationStatus, to);
    return sendSuccess(res, updated);
  }
   const cover = await prisma.newsCoverAsset.findFirst({ where: { revisionId: revision.id, status: 'STAGED' } });
   const promoted = cover ? await promoteStagedCover(cover) : null;
   let updated;
   try {
   updated = await prisma.$transaction(async (tx) => {
    const now = new Date();
    await tx.news.update({ where: { id: revision.newsId }, data: { title: revision.title, slug: revision.slug, excerpt: revision.excerpt, content: revision.content, category: revision.category, publicationStatus: 'PUBLISHED', publishedAt: now } });
    if (cover) {
      await tx.newsCoverAsset.updateMany({ where: { newsId: revision.newsId, status: 'PUBLIC' }, data: { status: 'SUPERSEDED', supersededAt: now } });
       await tx.newsCoverAsset.update({ where: { id: cover.id }, data: { newsId: revision.newsId, storageKey: `/uploads/news/${promoted!.publicFilename}`, status: 'PUBLIC', visibility: 'PUBLIC' } });
    }
    return tx.newsRevision.update({ where: { id: revision.id }, data: { publicationStatus: 'PUBLISHED', publishedAt: now } });
   });
   } catch (error) {
     if (promoted) await fs.rm(promoted.publicPath, { force: true });
     throw error;
   }
  await audit(req.cmsSession!.cmsAccountId, 'PUBLISHED', revision.newsId, revision.publicationStatus, 'PUBLISHED');
  return sendSuccess(res, updated);
};

export const updateNewsSlug = async (req: CmsRequest, res: Response) => {
  const news = await prisma.news.findUnique({ where: { id: req.params.id } });
  if (!news) throw new ApiError('NOT_FOUND', 'News not found.', 404);
  const nextSlug = newsSlug(normalizeNewsText(req.body.slug, 'slug', 180));
  if (!nextSlug || nextSlug === news.slug) return sendSuccess(res, news);
  const existing = await prisma.news.findFirst({ where: { OR: [{ slug: nextSlug }, { slugAliases: { some: { slug: nextSlug } } }] } });
  if (existing) throw new ApiError('CONFLICT', 'Slug has already been used.', 409);
  const updated = await prisma.$transaction(async (tx) => {
    await tx.newsSlugAlias.create({ data: { slug: news.slug, newsId: news.id } });
    return tx.news.update({ where: { id: news.id }, data: { slug: nextSlug } });
  });
  await audit(req.cmsSession!.cmsAccountId, 'SLUG_CHANGE', news.id);
  return sendSuccess(res, updated);
};

export const previewNews = async (req: CmsRequest, res: Response) => {
  const news = await prisma.news.findUnique({ where: { id: req.params.id }, include: includePublic });
  if (!news) throw new ApiError('NOT_FOUND', 'News not found.', 404);
  return sendSuccess(res, { ...publicProjection(news), isPreview: true, publicationStatus: news.publicationStatus });
};

export const transitionNews = async (req: CmsRequest, res: Response) => {
  const news = await prisma.news.findUnique({ where: { id: req.params.id } });
  if (!news) throw new ApiError('NOT_FOUND', 'News not found.', 404);
  const to = req.body.status;
  if (!Object.values(PublicationStatus).includes(to)) throw new ApiError('VALIDATION_ERROR', 'Invalid News status.', 400, { status: ['Unsupported status'] });
  assertNewsTransition(news.publicationStatus, to, req.body.rejectionReason);
  const activeCover = await prisma.newsCoverAsset.findFirst({ where: { newsId: news.id, status: 'STAGED' }, orderBy: { createdAt: 'desc' } });
  if (to === 'PUBLISHED' && (!news.excerpt || !news.content || !news.category || !activeCover)) throw new ApiError('VALIDATION_ERROR', 'News is incomplete for publishing.', 400);
  if (to === 'PUBLISHED' && activeCover) {
    await ensureStorageRoots();
    await fs.mkdir(publicNewsDir(), { recursive: true });
    const publicFilename = `${crypto.randomUUID()}${path.extname(activeCover.originalFilename).toLowerCase()}`;
    const publicPath = path.join(publicNewsDir(), publicFilename);
    await fs.copyFile(privateStagedNewsPath(path.basename(activeCover.storageKey)), publicPath);
    try {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.newsCoverAsset.update({ where: { id: activeCover.id }, data: { storageKey: `/uploads/news/${publicFilename}`, visibility: 'PUBLIC', status: 'PUBLIC' } });
        const published = await tx.news.update({ where: { id: news.id }, data: { publicationStatus: to, publishedAt: new Date() } });
        await tx.auditEvent.create({ data: { cmsAccountId: req.cmsSession!.cmsAccount.id, action: to, entity: 'NEWS', entityId: news.id, oldStatus: news.publicationStatus, newStatus: to } });
        return published;
      });
      return sendSuccess(res, updated);
    } catch (error) {
      await fs.rm(publicPath, { force: true });
      throw error;
    }
  }
  const updated = await prisma.news.update({ where: { id: news.id }, data: { publicationStatus: to, rejectionReason: to === 'REJECTED' ? req.body.rejectionReason : news.rejectionReason, publishedAt: to === 'PUBLISHED' ? new Date() : to === 'DRAFT' ? null : news.publishedAt } });
  await prisma.auditEvent.create({ data: { cmsAccountId: req.cmsSession!.cmsAccount.id, action: to, entity: 'NEWS', entityId: news.id, oldStatus: news.publicationStatus, newStatus: to } });
  return sendSuccess(res, updated);
};
