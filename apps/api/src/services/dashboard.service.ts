import prisma from '../lib/prisma';

/**
 * @service DashboardService
 * @description Aggregates count statistics for the admin dashboard.
 */
export const DashboardService = {
  async getStats() {
    const [faqCount, testimonialCount, commissariatCount, newsCount, prokerCount, totalMembers] = await Promise.all([
      prisma.faq.count(),
      prisma.testimonial.count(),
      prisma.commissariat.count(),
      (prisma as any).news.count(),
      prisma.programKerja.count(),
      prisma.commissariat.aggregate({
        _sum: {
          memberCount: true
        }
      })
    ]);

    return {
      faqs: faqCount,
      testimonials: testimonialCount,
      commissariats: commissariatCount,
      news: newsCount,
      proker: prokerCount,
      members: totalMembers._sum.memberCount || 0,
      systemStatus: 'Online',
    };
  },
};
