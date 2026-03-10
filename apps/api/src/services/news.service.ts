import prisma from '../lib/prisma';

/**
 * @service NewsService
 * @description CRUD operations for news articles (DB layer only, no file I/O).
 */

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export const NewsService = {
  async getLatest(take = 4) {
    return (prisma as any).news.findMany({
      orderBy: { createdAt: 'desc' },
      take,
    });
  },

  async getAll() {
    return (prisma as any).news.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async findById(id: string) {
    return (prisma as any).news.findUnique({ where: { id } });
  },

  async findBySlug(slug: string) {
    return (prisma as any).news.findUnique({ where: { slug } });
  },

  async createSlug(title: string) {
    let slug = generateSlug(title);
    const existing = await (prisma as any).news.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    return slug;
  },

  async create(data: { title: string; slug: string; content: string; author: string; image: string }) {
    return (prisma as any).news.create({ data });
  },

  async update(id: string, data: { title?: string; slug?: string; content?: string; author?: string; image?: string }) {
    return (prisma as any).news.update({ where: { id }, data });
  },

  async updateSlug(title: string, currentId: string) {
    let slug = generateSlug(title);
    const existing = await (prisma as any).news.findUnique({ where: { slug } });
    if (existing && existing.id !== currentId) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    return slug;
  },

  async delete(id: string) {
    return (prisma as any).news.delete({ where: { id } });
  },
};
