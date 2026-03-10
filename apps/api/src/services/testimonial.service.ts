import prisma from '../lib/prisma';

/**
 * @service TestimonialService
 * @description CRUD operations for testimonial entries (DB layer only, no file I/O).
 */
export const TestimonialService = {
  async getAll() {
    return prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async findById(id: string) {
    return prisma.testimonial.findUnique({ where: { id } });
  },

  async create(data: { name: string; role: string; quote: string; image: string }) {
    return prisma.testimonial.create({ data });
  },

  async update(id: string, data: { name?: string; role?: string; quote?: string; image?: string }) {
    return prisma.testimonial.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.testimonial.delete({ where: { id } });
  },
};
