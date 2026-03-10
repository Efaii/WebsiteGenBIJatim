import prisma from '../lib/prisma';

/**
 * @service DashboardService
 * @description Aggregates count statistics for the admin dashboard.
 */
export const DashboardService = {
  async getStats() {
    const [faqCount, testimonialCount, commissariatCount, newsCount] = await Promise.all([
      prisma.faq.count(),
      prisma.testimonial.count(),
      prisma.commissariat.count(),
      (prisma as any).news.count(),
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
