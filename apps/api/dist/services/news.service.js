"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * @service NewsService
 * @description CRUD operations for news articles (DB layer only, no file I/O).
 */
function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
exports.NewsService = {
    async getLatest(take = 4) {
        return prisma_1.default.news.findMany({
            orderBy: { createdAt: 'desc' },
            take,
        });
    },
    async getAll() {
        return prisma_1.default.news.findMany({ orderBy: { createdAt: 'desc' } });
    },
    async findById(id) {
        return prisma_1.default.news.findUnique({ where: { id } });
    },
    async findBySlug(slug) {
        return prisma_1.default.news.findUnique({ where: { slug } });
    },
    async createSlug(title) {
        let slug = generateSlug(title);
        const existing = await prisma_1.default.news.findUnique({ where: { slug } });
        if (existing)
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        return slug;
    },
    async create(data) {
        return prisma_1.default.news.create({ data });
    },
    async update(id, data) {
        return prisma_1.default.news.update({ where: { id }, data });
    },
    async updateSlug(title, currentId) {
        let slug = generateSlug(title);
        const existing = await prisma_1.default.news.findUnique({ where: { slug } });
        if (existing && existing.id !== currentId)
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        return slug;
    },
    async delete(id) {
        return prisma_1.default.news.delete({ where: { id } });
    },
};
