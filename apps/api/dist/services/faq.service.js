"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * @service FaqService
 * @description CRUD operations for FAQ entries with auto-ordering.
 */
exports.FaqService = {
    async getAll() {
        return prisma_1.default.faq.findMany({ orderBy: { order: 'asc' } });
    },
    async create(data) {
        const lastFaq = await prisma_1.default.faq.findFirst({ orderBy: { order: 'desc' } });
        const nextOrder = lastFaq ? lastFaq.order + 1 : 1;
        return prisma_1.default.faq.create({
            data: {
                question: data.question,
                answer: data.answer,
                order: nextOrder,
                isActive: data.isActive !== undefined ? data.isActive : true,
            },
        });
    },
    async update(id, data) {
        return prisma_1.default.faq.update({ where: { id }, data });
    },
    async delete(id) {
        const faqToDelete = await prisma_1.default.faq.findUnique({ where: { id } });
        if (!faqToDelete)
            return null;
        const deletedOrder = faqToDelete.order;
        await prisma_1.default.faq.delete({ where: { id } });
        await prisma_1.default.faq.updateMany({
            where: { order: { gt: deletedOrder } },
            data: { order: { decrement: 1 } },
        });
        return true;
    },
};
