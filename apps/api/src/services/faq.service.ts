import prisma from '../lib/prisma';

/**
 * @service FaqService
 * @description CRUD operations for FAQ entries with auto-ordering.
 */
export const FaqService = {
  async getAll() {
    return prisma.faq.findMany({ orderBy: { order: 'asc' } });
  },

  async create(data: { question: string; answer: string; isActive?: boolean }) {
    const lastFaq = await prisma.faq.findFirst({ orderBy: { order: 'desc' } });
    const nextOrder = lastFaq ? lastFaq.order + 1 : 1;

    return prisma.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        order: nextOrder,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  },

  async update(id: string, data: { question?: string; answer?: string; order?: number; isActive?: boolean }) {
    return prisma.faq.update({ where: { id }, data });
  },

  async delete(id: string) {
    const faqToDelete = await prisma.faq.findUnique({ where: { id } });
    if (!faqToDelete) return null;

    const deletedOrder = faqToDelete.order;
    await prisma.faq.delete({ where: { id } });
    await prisma.faq.updateMany({
      where: { order: { gt: deletedOrder } },
      data: { order: { decrement: 1 } },
    });

    return true;
  },
};
