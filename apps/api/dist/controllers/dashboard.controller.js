"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardStats = async (req, res) => {
    try {
        // Run all count aggregations concurrently for absolute maximum speed
        const [faqCount, testimonialCount, commissariatCount, newsCount] = await Promise.all([
            prisma.faq.count(),
            prisma.testimonial.count(),
            prisma.commissariat.count(),
            prisma.news.count(), // handle typescript strict type temporarily
        ]);
        res.status(200).json({
            faqs: faqCount,
            testimonials: testimonialCount,
            commissariats: commissariatCount,
            news: newsCount,
            // You can add logic for 'online' status directly on frontend, but we'll return a static flag for the backend health
            systemStatus: 'Online',
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getDashboardStats = getDashboardStats;
