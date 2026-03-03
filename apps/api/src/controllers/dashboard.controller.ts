import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Run all count aggregations concurrently for absolute maximum speed
    const [faqCount, testimonialCount, commissariatCount, newsCount] = await Promise.all([
      prisma.faq.count(),
      prisma.testimonial.count(),
      prisma.commissariat.count(),
      (prisma as any).news.count(), // handle typescript strict type temporarily
    ]);

    res.status(200).json({
      faqs: faqCount,
      testimonials: testimonialCount,
      commissariats: commissariatCount,
      news: newsCount,
      // You can add logic for 'online' status directly on frontend, but we'll return a static flag for the backend health
      systemStatus: 'Online', 
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
