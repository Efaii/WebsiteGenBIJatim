import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/testimonials');

// Ensure directory exists to prevent ENOENT errors
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const getAdminTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, role, quote } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Generate unique WEBP filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-compressed.webp`;
    const savePath = path.join(UPLOAD_DIR, filename);

    // Stream buffer into Sharp: Resize to max 800px width, compress to WebP (Quality 80)
    await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(savePath);

    const imagePath = `/uploads/testimonials/${filename}`;

    const newTestimonial = await prisma.testimonial.create({
      data: { name, role, quote, image: imagePath },
    });
    
    res.status(201).json(newTestimonial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, quote } = req.body;
    
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    let imagePath = existing.image;

    if (req.file) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-compressed.webp`;
      const savePath = path.join(UPLOAD_DIR, filename);

      await sharp(req.file.buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(savePath);

      imagePath = `/uploads/testimonials/${filename}`;

      // Safely Delete old image file to save disk space
      if (existing.image && existing.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../public', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: { name, role, quote, image: imagePath },
    });
    
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    // Ensure physical file deletion from disk upon DB deletion
    if (existing.image && existing.image.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../public', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await prisma.testimonial.delete({ where: { id } });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
