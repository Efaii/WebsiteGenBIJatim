"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardStats = async (req, res) => {
    try {
        // Run all count aggregations concurrently for absolute maximum speed
        const [faqCount, testimonialCount, commissariatCount, newsCount, prokerCount, totalMembers] = await Promise.all([
            prisma.faq.count(),
            prisma.testimonial.count(),
            prisma.commissariat.count(),
            prisma.news.count(),
            prisma.programKerja.count(),
            prisma.commissariat.aggregate({
                _sum: {
                    memberCount: true
                }
            })
        ]);
        res.status(200).json({
            faqs: faqCount,
            testimonials: testimonialCount,
            commissariats: commissariatCount,
            news: newsCount,
            proker: prokerCount,
            members: totalMembers._sum.memberCount || 0,
            systemStatus: 'Online',
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getDashboardStats = getDashboardStats;
