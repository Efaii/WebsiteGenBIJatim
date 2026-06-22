"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.updateNewsSchema = exports.createNewsSchema = exports.updateTestimonialSchema = exports.createTestimonialSchema = exports.updateFaqSchema = exports.createFaqSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
/**
 * @module validations
 * @description Centralized Zod schemas for input validation across all routes.
 */
/* --- AUTH --- */
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
/* --- FAQ --- */
exports.createFaqSchema = zod_1.z.object({
    question: zod_1.z.string().min(3, 'Question must be at least 3 characters'),
    answer: zod_1.z.string().min(3, 'Answer must be at least 3 characters'),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateFaqSchema = zod_1.z.object({
    question: zod_1.z.string().min(3).optional(),
    answer: zod_1.z.string().min(3).optional(),
    order: zod_1.z.number().int().positive().optional(),
    isActive: zod_1.z.boolean().optional(),
});
/* --- TESTIMONIAL --- */
exports.createTestimonialSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    role: zod_1.z.string().min(1, 'Role is required'),
    quote: zod_1.z.string().min(5, 'Quote must be at least 5 characters'),
});
exports.updateTestimonialSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    role: zod_1.z.string().min(1).optional(),
    quote: zod_1.z.string().min(5).optional(),
});
/* --- NEWS --- */
exports.createNewsSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
    content: zod_1.z.string().min(10, 'Content must be at least 10 characters'),
    author: zod_1.z.string().min(1, 'Author is required'),
});
exports.updateNewsSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).optional(),
    content: zod_1.z.string().min(10).optional(),
    author: zod_1.z.string().min(1).optional(),
});
/* --- ID PARAMETER --- */
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required'),
});
