"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNews = exports.updateNews = exports.createNews = exports.getAllNewsCountAndData = exports.getLatestNews = void 0;
// We use any type for prisma here to bypass the strict EPERM error types missing if the user hasn't run db push yet.
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const prisma = new client_1.PrismaClient();
const UPLOAD_DIR = path_1.default.join(__dirname, '../../public/uploads/news');
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
const getLatestNews = async (req, res) => {
    try {
        const news = await prisma.news.findMany({
            orderBy: { createdAt: 'desc' },
            take: 4,
        });
        res.status(200).json(news);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getLatestNews = getLatestNews;
const getAllNewsCountAndData = async (req, res) => {
    try {
        const news = await prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
        res.status(200).json(news);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getAllNewsCountAndData = getAllNewsCountAndData;
const createNews = async (req, res) => {
    try {
        const { title, content, author } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'Cover image is required' });
        }
        let slug = generateSlug(title);
        // Check if slug exists
        const existingSlug = await prisma.news.findUnique({ where: { slug } });
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
        const newArticle = await prisma.news.create({
            data: { title, slug, content, author, image: imagePath },
        });
        res.status(201).json(newArticle);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.createNews = createNews;
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author } = req.body;
        const existing = await prisma.news.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ message: 'Not found' });
        let imagePath = existing.image;
        let slug = existing.slug;
        if (title && title !== existing.title) {
            slug = generateSlug(title);
            const existingSlug = await prisma.news.findUnique({ where: { slug } });
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
                const oldPath = path_1.default.join(__dirname, '../../public', existing.image);
                if (fs_1.default.existsSync(oldPath))
                    fs_1.default.unlinkSync(oldPath);
            }
        }
        const updated = await prisma.news.update({
            where: { id },
            data: { title, slug, content, author, image: imagePath },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateNews = updateNews;
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.news.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ message: 'Not found' });
        if (existing.image && existing.image.startsWith('/uploads/')) {
            const oldPath = path_1.default.join(__dirname, '../../public', existing.image);
            if (fs_1.default.existsSync(oldPath))
                fs_1.default.unlinkSync(oldPath);
        }
        await prisma.news.delete({ where: { id } });
        res.status(200).json({ message: 'Deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.deleteNews = deleteNews;
