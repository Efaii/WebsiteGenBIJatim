import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/news');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export const getPublicNews = async (req: Request, res: Response) => {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({
    success: true,
    message: 'News retrieved successfully',
    data: news,
  });
};

export const getNewsBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const article = await prisma.news.findUnique({
    where: { slug },
  });
  if (!article) {
    return res.status(404).json({ message: 'News article not found' });
  }
  res.status(200).json(article);
};

export const getLatestNews = async (req: Request, res: Response) => {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
    take: 4,
  });
  res.status(200).json(news);
};

export const getAllNewsCountAndData = async (req: Request, res: Response) => {
  const news = await prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
  res.status(200).json(news);
};

export const createNews = async (req: Request, res: Response) => {
  const { title, content, author } = req.body;
  
  const errors: string[] = [];
  if (!title || typeof title !== 'string' || !title.trim()) errors.push('Title is required');
  if (!content || typeof content !== 'string' || !content.trim()) errors.push('Content is required');
  if (!author || typeof author !== 'string' || !author.trim()) errors.push('Author is required');
  if (!req.file) errors.push('Cover image is required');

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  let slug = generateSlug(title);
  
  // Check if slug exists
  const existingSlug = await prisma.news.findUnique({ where: { slug } });
  if (existingSlug) {
     slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const filename = `${Date.now()}-${slug}-cover.webp`;
  const savePath = path.join(UPLOAD_DIR, filename);

  // Compress Cover Image
  await sharp(req.file!.buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(savePath);

  const imagePath = `/uploads/news/${filename}`;

  const newArticle = await prisma.news.create({
    data: { title, slug, content, author, image: imagePath },
  });
  
  res.status(201).json(newArticle);
};

export const updateNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, author } = req.body;
  
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });

  let imagePath = existing.image;
  let slug = existing.slug;

  if (title && title !== existing.title) {
     slug = generateSlug(title);
     const existingSlug = await prisma.news.findUnique({ where: { slug } });
     if (existingSlug && existingSlug.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
     }
  }

  if (req.file) {
    const filename = `${Date.now()}-${slug}-cover.webp`;
    const savePath = path.join(UPLOAD_DIR, filename);

    await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(savePath);

    imagePath = `/uploads/news/${filename}`;

    // Delete old cover
    if (existing.image && existing.image.startsWith('/uploads/')) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(existing.image));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const updated = await prisma.news.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      slug,
      ...(content !== undefined ? { content } : {}),
      ...(author !== undefined ? { author } : {}),
      image: imagePath,
    },
  });
  
  res.status(200).json(updated);
};

export const deleteNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });

  if (existing.image && existing.image.startsWith('/uploads/')) {
    const oldPath = path.join(UPLOAD_DIR, path.basename(existing.image));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  await prisma.news.delete({ where: { id } });
  res.status(200).json({ message: 'Deleted successfully' });
};
