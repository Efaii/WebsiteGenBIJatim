import { Request, Response } from 'express';
import { FaqService } from '../services/faq.service';
import { createFaqSchema, updateFaqSchema, idParamSchema } from '../lib/validations';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

/**
 * @controller FaqController
 * @description FAQ CRUD with Zod validation, delegates DB operations to FaqService.
 */

export const getAdminFaqs = catchAsync(async (req: Request, res: Response) => {
  const faqs = await FaqService.getAll();
  res.status(200).json(faqs);
});

export const createFaq = catchAsync(async (req: Request, res: Response) => {
  const parsed = createFaqSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
  }

  const newFaq = await FaqService.create(parsed.data);
  res.status(201).json(newFaq);
});

export const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const paramsParsed = idParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    throw new AppError('Invalid ID', 400);
  }

  const bodyParsed = updateFaqSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: bodyParsed.error.flatten().fieldErrors });
  }

  const updatedFaq = await FaqService.update(paramsParsed.data.id, bodyParsed.data);
  res.status(200).json(updatedFaq);
});

export const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const paramsParsed = idParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    throw new AppError('Invalid ID', 400);
  }

  const result = await FaqService.delete(paramsParsed.data.id);
  if (!result) {
    throw new AppError('FAQ not found', 404);
  }

  res.status(200).json({ message: 'FAQ berhasil dihapus dan urutan dirapikan' });
});
