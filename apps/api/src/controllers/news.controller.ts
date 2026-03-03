import { Request, Response } from 'express';
// We use any type for prisma here to bypass the strict EPERM error types missing if the user hasn't run db push yet.
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/news');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export const getLatestNews = async (req: Request, res: Response) => {
  try {
    const news = await (prisma as any).news.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
    });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAllNewsCountAndData = async (req: Request, res: Response) => {
  try {
    const news = await (prisma as any).news.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createNews = async (req: Request, res: Response) => {
  try {
    const { title, content, author } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Cover image is required' });
    }

    let slug = generateSlug(title);
    
    // Check if slug exists
    const existingSlug = await (prisma as any).news.findUnique({ where: { slug } });
    if (existingSlug) {
       slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const filename = `${Date.now()}-${slug}-cover.webp`;
    const savePath = path.join(UPLOAD_DIR, filename);

    // Compress Cover Image
    await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(savePath);

    const imagePath = `/uploads/news/${filename}`;

    const newArticle = await (prisma as any).news.create({
      data: { title, slug, content, author, image: imagePath },
    });
    
    res.status(201).json(newArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, author } = req.body;
    
    const existing = await (prisma as any).news.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    let imagePath = existing.image;
    let slug = existing.slug;

    if (title && title !== existing.title) {
       slug = generateSlug(title);
       const existingSlug = await (prisma as any).news.findUnique({ where: { slug } });
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
        const oldPath = path.join(__dirname, '../../public', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updated = await (prisma as any).news.update({
      where: { id },
      data: { title, slug, content, author, image: imagePath },
    });
    
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existing = await (prisma as any).news.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    if (existing.image && existing.image.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../public', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await (prisma as any).news.delete({ where: { id } });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
