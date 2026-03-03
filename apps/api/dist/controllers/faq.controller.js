"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaq = exports.updateFaq = exports.createFaq = exports.getAdminFaqs = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAdminFaqs = async (req, res) => {
    try {
        const faqs = await prisma.faq.findMany({ orderBy: { order: 'asc' } });
        res.status(200).json(faqs);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getAdminFaqs = getAdminFaqs;
const createFaq = async (req, res) => {
    try {
        const { question, answer, isActive } = req.body;
        const lastFaq = await prisma.faq.findFirst({
            orderBy: { order: 'desc' },
        });
        const nextOrder = lastFaq ? lastFaq.order + 1 : 1;
        const newFaq = await prisma.faq.create({
            data: { question, answer, order: nextOrder, isActive: isActive !== undefined ? isActive : true, },
        });
        res.status(201).json(newFaq);
    }
    catch (error) {
        console.error("Error creating FAQ:", error);
        res.status(500).json({ message: "Gagal membuat FAQ" });
    }
};
exports.createFaq = createFaq;
const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, order, isActive } = req.body;
        const updatedFaq = await prisma.faq.update({
            where: { id },
            data: { question, answer, order, isActive },
        });
        res.status(200).json(updatedFaq);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateFaq = updateFaq;
const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faqToDelete = await prisma.faq.findUnique({ where: { id } });
        if (!faqToDelete) {
            return res.status(404).json({ message: 'FAQ not found' });
        }
        const deletedOrder = faqToDelete.order;
        await prisma.faq.delete({ where: { id } });
        await prisma.faq.updateMany({
            where: { order: { gt: deletedOrder } },
            data: { order: { decrement: 1 } },
        });
        res.status(200).json({ message: 'FAQ berhasil dihapus dan urutan dirapikan' });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal menghapus FAQ' });
    }
};
exports.deleteFaq = deleteFaq;
