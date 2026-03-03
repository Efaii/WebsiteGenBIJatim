"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTestimonial = exports.updateTestimonial = exports.createTestimonial = exports.getAdminTestimonials = void 0;
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const prisma = new client_1.PrismaClient();
const UPLOAD_DIR = path_1.default.join(__dirname, '../../public/uploads/testimonials');
// Ensure directory exists to prevent ENOENT errors
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const getAdminTestimonials = async (req, res) => {
    try {
        const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
        res.status(200).json(testimonials);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getAdminTestimonials = getAdminTestimonials;
const createTestimonial = async (req, res) => {
    try {
        const { name, role, quote } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
        }
        // Generate unique WEBP filename
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-compressed.webp`;
        const savePath = path_1.default.join(UPLOAD_DIR, filename);
        // Stream buffer into Sharp: Resize to max 800px width, compress to WebP (Quality 80)
        await (0, sharp_1.default)(req.file.buffer)
            .resize({ width: 800, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(savePath);
        const imagePath = `/uploads/testimonials/${filename}`;
        const newTestimonial = await prisma.testimonial.create({
            data: { name, role, quote, image: imagePath },
        });
        res.status(201).json(newTestimonial);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.createTestimonial = createTestimonial;
const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, quote } = req.body;
        const existing = await prisma.testimonial.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ message: 'Not found' });
        let imagePath = existing.image;
        if (req.file) {
            const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-compressed.webp`;
            const savePath = path_1.default.join(UPLOAD_DIR, filename);
            await (0, sharp_1.default)(req.file.buffer)
                .resize({ width: 800, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(savePath);
            imagePath = `/uploads/testimonials/${filename}`;
            // Safely Delete old image file to save disk space
            if (existing.image && existing.image.startsWith('/uploads/')) {
                const oldPath = path_1.default.join(__dirname, '../../public', existing.image);
                if (fs_1.default.existsSync(oldPath))
                    fs_1.default.unlinkSync(oldPath);
            }
        }
        const updated = await prisma.testimonial.update({
            where: { id },
            data: { name, role, quote, image: imagePath },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateTestimonial = updateTestimonial;
const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.testimonial.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ message: 'Not found' });
        // Ensure physical file deletion from disk upon DB deletion
        if (existing.image && existing.image.startsWith('/uploads/')) {
            const oldPath = path_1.default.join(__dirname, '../../public', existing.image);
            if (fs_1.default.existsSync(oldPath))
                fs_1.default.unlinkSync(oldPath);
        }
        await prisma.testimonial.delete({ where: { id } });
        res.status(200).json({ message: 'Deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.deleteTestimonial = deleteTestimonial;
