"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderFaqs = exports.deleteFaq = exports.updateFaq = exports.createFaq = exports.listCmsFaqs = exports.listPublicFaqs = void 0;
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const rich_text_1 = require("../lib/rich-text");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
/*
 * FAQ jalur kanonik (ADR 0014). Baca publik hanya FAQ aktif sesuai urutan;
 * pengelolaan (tambah/ubah/hapus/urut/aktif) hanya ADMIN_GLOBAL.
 */
const requireText = (value, field, max) => {
    if (typeof value !== "string" ||
        value.trim().length === 0 ||
        value.length > max) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", `${field} harus berupa teks 1-${max} karakter.`, 400);
    }
    return value.trim();
};
/*
 * Jawaban FAQ memakai teks kaya: disaring lebih dulu (hanya tag/atribut
 * presentasi yang lolos), lalu diukur panjangnya supaya skrip atau gaya
 * berbahaya tidak pernah masuk database. Jawaban lama berformat teks polos
 * tetap diterima karena penyaring meneruskan teks apa adanya.
 */
const requireRichAnswer = (value, max) => {
    if (typeof value !== "string") {
        throw new api_error_1.ApiError("VALIDATION_ERROR", `answer harus berupa teks 1-${max} karakter.`, 400);
    }
    const sanitized = (0, rich_text_1.sanitizeRichText)(value);
    if (sanitized.length === 0 || sanitized.length > max) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", `answer harus berupa teks 1-${max} karakter.`, 400);
    }
    return sanitized;
};
const orderedFaqs = () => prisma_1.prisma.faq.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
const listPublicFaqs = async (_req, res) => {
    const faqs = await prisma_1.prisma.faq.findMany({
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return (0, request_context_middleware_1.sendSuccess)(res, faqs);
};
exports.listPublicFaqs = listPublicFaqs;
const listCmsFaqs = async (_req, res) => (0, request_context_middleware_1.sendSuccess)(res, await orderedFaqs());
exports.listCmsFaqs = listCmsFaqs;
const createFaq = async (req, res) => {
    const question = requireText(req.body?.question, "question", 300);
    const answer = requireRichAnswer(req.body?.answer, 5000);
    const isActive = req.body?.isActive === undefined ? true : Boolean(req.body.isActive);
    const max = await prisma_1.prisma.faq.aggregate({ _max: { order: true } });
    const created = await prisma_1.prisma.faq.create({
        data: { question, answer, isActive, order: (max._max.order ?? 0) + 1 },
    });
    return (0, request_context_middleware_1.sendSuccess)(res, created);
};
exports.createFaq = createFaq;
const updateFaq = async (req, res) => {
    const faq = await prisma_1.prisma.faq.findUnique({ where: { id: req.params.id } });
    if (!faq)
        throw new api_error_1.ApiError("NOT_FOUND", "FAQ not found.", 404);
    const data = {};
    if (req.body?.question !== undefined)
        data.question = requireText(req.body.question, "question", 300);
    if (req.body?.answer !== undefined)
        data.answer = requireRichAnswer(req.body.answer, 5000);
    if (req.body?.isActive !== undefined)
        data.isActive = Boolean(req.body.isActive);
    if (Object.keys(data).length === 0) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Tidak ada perubahan yang dikirim.", 400);
    }
    const updated = await prisma_1.prisma.faq.update({ where: { id: faq.id }, data });
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.updateFaq = updateFaq;
const deleteFaq = async (req, res) => {
    const faq = await prisma_1.prisma.faq.findUnique({ where: { id: req.params.id } });
    if (!faq)
        throw new api_error_1.ApiError("NOT_FOUND", "FAQ not found.", 404);
    await prisma_1.prisma.faq.delete({ where: { id: faq.id } });
    return (0, request_context_middleware_1.sendSuccess)(res, { id: faq.id });
};
exports.deleteFaq = deleteFaq;
/*
 * Urutkan ulang FAQ: `ids` harus memuat tepat semua FAQ yang ada; index array
 * menjadi `order` baru.
 */
const orderFaqs = async (req, res) => {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", "ids harus berupa daftar id FAQ.", 400);
    }
    const all = await prisma_1.prisma.faq.findMany({ select: { id: true } });
    const allIds = new Set(all.map((faq) => faq.id));
    if (ids.length !== all.length || ids.some((id) => !allIds.has(id))) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", "ids harus memuat tepat semua FAQ.", 400);
    }
    await prisma_1.prisma.$transaction(ids.map((id, index) => prisma_1.prisma.faq.update({ where: { id }, data: { order: index } })));
    return (0, request_context_middleware_1.sendSuccess)(res, await orderedFaqs());
};
exports.orderFaqs = orderFaqs;
