import prisma from '../lib/prisma';

/**
 * @service HomeService
 * @description Aggregates homepage data (testimonials, FAQs, commissariats) from DB.
 */
export const HomeService = {
  async getHomeContent() {
    const [testimonials, faqs, commissariats] = await Promise.all([
      prisma.testimonial.findMany(),
      prisma.faq.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      prisma.commissariat.findMany(),
    ]);

    return { testimonials, faqs, commissariats };
  },
};
