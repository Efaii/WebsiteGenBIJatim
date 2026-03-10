import { z } from 'zod';

/**
 * @module validations
 * @description Centralized Zod schemas for input validation across all routes.
 */

/* --- AUTH --- */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

/* --- FAQ --- */
export const createFaqSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters'),
  answer: z.string().min(3, 'Answer must be at least 3 characters'),
  isActive: z.boolean().optional(),
});

export const updateFaqSchema = z.object({
  question: z.string().min(3).optional(),
  answer: z.string().min(3).optional(),
  order: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

/* --- TESTIMONIAL --- */
export const createTestimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  quote: z.string().min(5, 'Quote must be at least 5 characters'),
});

export const updateTestimonialSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  quote: z.string().min(5).optional(),
});

/* --- NEWS --- */
export const createNewsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  author: z.string().min(1, 'Author is required'),
});

export const updateNewsSchema = z.object({
  title: z.string().min(5).optional(),
  content: z.string().min(10).optional(),
  author: z.string().min(1).optional(),
});

/* --- ID PARAMETER --- */
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});
