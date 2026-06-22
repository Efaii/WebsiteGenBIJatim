"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * @service HomeService
 * @description Aggregates homepage data (testimonials, FAQs, commissariats) from DB.
 */
exports.HomeService = {
    async getHomeContent() {
        const [testimonials, faqs, commissariats] = await Promise.all([
            prisma_1.default.testimonial.findMany(),
            prisma_1.default.faq.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
            prisma_1.default.commissariat.findMany(),
        ]);
        return { testimonials, faqs, commissariats };
    },
};
