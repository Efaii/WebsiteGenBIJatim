"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * @service DashboardService
 * @description Aggregates count statistics for the admin dashboard.
 */
exports.DashboardService = {
    async getStats() {
        const [faqCount, testimonialCount, commissariatCount, newsCount] = await Promise.all([
            prisma_1.default.faq.count(),
            prisma_1.default.testimonial.count(),
            prisma_1.default.commissariat.count(),
            prisma_1.default.news.count(),
        ]);
        return {
            faqs: faqCount,
            testimonials: testimonialCount,
            commissariats: commissariatCount,
            news: newsCount,
            systemStatus: 'Online',
        };
    },
};
