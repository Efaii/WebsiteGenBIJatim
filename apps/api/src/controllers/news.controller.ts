import { Request, Response } from 'express';
import { NewsService } from '../services/news.service';
import { createNewsSchema, updateNewsSchema, idParamSchema } from '../lib/validations';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

/**
 * @controller NewsController
 * @description News CRUD with Zod validation. Image processing stays here (HTTP concern),
 * DB operations are delegated to NewsService.
 */

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/news');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const getLatestNews = catchAsync(async (req: Request, res: Response) => {
  const news = await NewsService.getLatest();
  res.status(200).json(news);
});

export const getAllNewsCountAndData = catchAsync(async (req: Request, res: Response) => {
  const news = await NewsService.getAll();
  res.status(200).json(news);
});

export const createNews = catchAsync(async (req: Request, res: Response) => {
  const parsed = createNewsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
  }

  if (!req.file) {
    throw new AppError('Cover image is required', 400);
  }

  const slug = await NewsService.createSlug(parsed.data.title);
  const filename = `${Date.now()}-${slug}-cover.webp`;
  const savePath = path.join(UPLOAD_DIR, filename);

  await sharp(req.file.buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(savePath);

  const imagePath = `/uploads/news/${filename}`;
  const newArticle = await NewsService.create({ ...parsed.data, slug, image: imagePath });
  res.status(201).json(newArticle);
});

export const updateNews = catchAsync(async (req: Request, res: Response) => {
  const paramsParsed = idParamSchema.safeParse(req.params);
  if (!paramsParsed.success) throw new AppError('Invalid ID', 400);

  const bodyParsed = updateNewsSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: bodyParsed.error.flatten().fieldErrors });
  }

  const existing = await NewsService.findById(paramsParsed.data.id);
  if (!existing) throw new AppError('Not found', 404);

  let imagePath = existing.image;
  let slug = existing.slug;

  if (bodyParsed.data.title && bodyParsed.data.title !== existing.title) {
    slug = await NewsService.updateSlug(bodyParsed.data.title, paramsParsed.data.id);
  }

  if (req.file) {
    const filename = `${Date.now()}-${slug}-cover.webp`;
    const savePath = path.join(UPLOAD_DIR, filename);

    await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(savePath);

    imagePath = `/uploads/news/${filename}`;

    if (existing.image && existing.image.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../public', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const updated = await NewsService.update(paramsParsed.data.id, { ...bodyParsed.data, slug, image: imagePath });
  res.status(200).json(updated);
});

export const deleteNews = catchAsync(async (req: Request, res: Response) => {
  const paramsParsed = idParamSchema.safeParse(req.params);
  if (!paramsParsed.success) throw new AppError('Invalid ID', 400);

  const existing = await NewsService.findById(paramsParsed.data.id);
  if (!existing) throw new AppError('Not found', 404);

  if (existing.image && existing.image.startsWith('/uploads/')) {
    const oldPath = path.join(__dirname, '../../public', existing.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  await NewsService.delete(paramsParsed.data.id);
  res.status(200).json({ message: 'Deleted successfully' });
});
