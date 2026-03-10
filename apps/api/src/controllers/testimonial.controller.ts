import { Request, Response } from 'express';
import { TestimonialService } from '../services/testimonial.service';
import { createTestimonialSchema, updateTestimonialSchema, idParamSchema } from '../lib/validations';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

/**
 * @controller TestimonialController
 * @description Testimonial CRUD with Zod validation. Image processing stays here (HTTP concern),
 * DB operations are delegated to TestimonialService.
 */

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/testimonials');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const getAdminTestimonials = catchAsync(async (req: Request, res: Response) => {
  const testimonials = await TestimonialService.getAll();
  res.status(200).json(testimonials);
});

export const createTestimonial = catchAsync(async (req: Request, res: Response) => {
  const parsed = createTestimonialSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
  }

  if (!req.file) {
    throw new AppError('Image file is required', 400);
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-compressed.webp`;
  const savePath = path.join(UPLOAD_DIR, filename);

  await sharp(req.file.buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(savePath);

  const imagePath = `/uploads/testimonials/${filename}`;
  const newTestimonial = await TestimonialService.create({ ...parsed.data, image: imagePath });
  res.status(201).json(newTestimonial);
});

export const updateTestimonial = catchAsync(async (req: Request, res: Response) => {
  const paramsParsed = idParamSchema.safeParse(req.params);
  if (!paramsParsed.success) throw new AppError('Invalid ID', 400);

  const bodyParsed = updateTestimonialSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: bodyParsed.error.flatten().fieldErrors });
  }

  const existing = await TestimonialService.findById(paramsParsed.data.id);
  if (!existing) throw new AppError('Not found', 404);

  let imagePath = existing.image;

  if (req.file) {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-compressed.webp`;
    const savePath = path.join(UPLOAD_DIR, filename);

    await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(savePath);

    imagePath = `/uploads/testimonials/${filename}`;

    if (existing.image && existing.image.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../public', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const updated = await TestimonialService.update(paramsParsed.data.id, { ...bodyParsed.data, image: imagePath });
  res.status(200).json(updated);
});

export const deleteTestimonial = catchAsync(async (req: Request, res: Response) => {
  const paramsParsed = idParamSchema.safeParse(req.params);
  if (!paramsParsed.success) throw new AppError('Invalid ID', 400);

  const existing = await TestimonialService.findById(paramsParsed.data.id);
  if (!existing) throw new AppError('Not found', 404);

  if (existing.image && existing.image.startsWith('/uploads/')) {
    const oldPath = path.join(__dirname, '../../public', existing.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  await TestimonialService.delete(paramsParsed.data.id);
  res.status(200).json({ message: 'Deleted successfully' });
});
