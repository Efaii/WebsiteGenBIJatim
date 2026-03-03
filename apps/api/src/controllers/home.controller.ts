import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHomeContent = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany();
    const faqs = await prisma.faq.findMany({ 
      where: { isActive: true },
      orderBy: { order: 'asc' } 
    });
    const commissariats = await prisma.commissariat.findMany();

    // Deliver the exact signature expected by Frontend HomeDataResponse interface
    res.status(200).json({
      testimonials,
      faqs: faqs,
      commissariats,
    });
  } catch (error) {
    console.error('Error fetching home content:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
