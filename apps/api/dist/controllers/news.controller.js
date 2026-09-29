"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNews = exports.updateNews = exports.createNews = exports.getAllNewsCountAndData = exports.getLatestNews = exports.getNewsBySlug = exports.getPublicNews = void 0;
const prisma_1 = require("../lib/prisma");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const UPLOAD_DIR = path_1.default.join(__dirname, '../../public/uploads/news');
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
const getPublicNews = async (req, res) => {
    const news = await prisma_1.prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({
        success: true,
        message: 'News retrieved successfully',
        data: news,
    });
};
exports.getPublicNews = getPublicNews;
const getNewsBySlug = async (req, res) => {
    const { slug } = req.params;
    const article = await prisma_1.prisma.news.findUnique({
        where: { slug },
    });
    if (!article) {
        return res.status(404).json({ message: 'News article not found' });
    }
    res.status(200).json(article);
};
exports.getNewsBySlug = getNewsBySlug;
const getLatestNews = async (req, res) => {
    const news = await prisma_1.prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
        take: 4,
    });
    res.status(200).json(news);
};
exports.getLatestNews = getLatestNews;
const getAllNewsCountAndData = async (req, res) => {
    const news = await prisma_1.prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(news);
};
exports.getAllNewsCountAndData = getAllNewsCountAndData;
const createNews = async (req, res) => {
    const { title, content, author } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || !title.trim())
        errors.push('Title is required');
    if (!content || typeof content !== 'string' || !content.trim())
        errors.push('Content is required');
    if (!author || typeof author !== 'string' || !author.trim())
        errors.push('Author is required');
    if (!req.file)
        errors.push('Cover image is required');
    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    let slug = generateSlug(title);
    // Check if slug exists
    const existingSlug = await prisma_1.prisma.news.findUnique({ where: { slug } });
    if (existingSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    const filename = `${Date.now()}-${slug}-cover.webp`;
    const savePath = path_1.default.join(UPLOAD_DIR, filename);
    // Compress Cover Image
    await (0, sharp_1.default)(req.file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(savePath);
    const imagePath = `/uploads/news/${filename}`;
    const newArticle = await prisma_1.prisma.news.create({
        data: { title, slug, content, author, image: imagePath },
    });
    res.status(201).json(newArticle);
};
exports.createNews = createNews;
const updateNews = async (req, res) => {
    const { id } = req.params;
    const { title, content, author } = req.body;
    const existing = await prisma_1.prisma.news.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ message: 'Not found' });
    let imagePath = existing.image;
    let slug = existing.slug;
    if (title && title !== existing.title) {
        slug = generateSlug(title);
        const existingSlug = await prisma_1.prisma.news.findUnique({ where: { slug } });
        if (existingSlug && existingSlug.id !== id) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
    }
    if (req.file) {
        const filename = `${Date.now()}-${slug}-cover.webp`;
        const savePath = path_1.default.join(UPLOAD_DIR, filename);
        await (0, sharp_1.default)(req.file.buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(savePath);
        imagePath = `/uploads/news/${filename}`;
        // Delete old cover
        if (existing.image && existing.image.startsWith('/uploads/')) {
            const oldPath = path_1.default.join(UPLOAD_DIR, path_1.default.basename(existing.image));
            if (fs_1.default.existsSync(oldPath))
                fs_1.default.unlinkSync(oldPath);
        }
    }
    const updated = await prisma_1.prisma.news.update({
        where: { id },
        data: {
            ...(title !== undefined ? { title } : {}),
            slug,
            ...(content !== undefined ? { content } : {}),
            ...(author !== undefined ? { author } : {}),
            image: imagePath,
        },
    });
    res.status(200).json(updated);
};
exports.updateNews = updateNews;
const deleteNews = async (req, res) => {
    const { id } = req.params;
    const existing = await prisma_1.prisma.news.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ message: 'Not found' });
    if (existing.image && existing.image.startsWith('/uploads/')) {
        const oldPath = path_1.default.join(UPLOAD_DIR, path_1.default.basename(existing.image));
        if (fs_1.default.existsSync(oldPath))
            fs_1.default.unlinkSync(oldPath);
    }
    await prisma_1.prisma.news.delete({ where: { id } });
    res.status(200).json({ message: 'Deleted successfully' });
};
exports.deleteNews = deleteNews;
