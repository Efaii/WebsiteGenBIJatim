"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHomeMediaFile = exports.uploadCanonicalNewsCover = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
exports.uploadCanonicalNewsCover = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
        const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
        if (allowedMimeTypes.includes(file.mimetype) &&
            allowedExtensions.includes(path_1.default.extname(file.originalname).toLowerCase()))
            return cb(null, true);
        cb(new Error("Only JPEG, PNG, or WebP covers are allowed."));
    },
});
/**
 * Unggahan media konten Beranda (gambar apa pun; video mp4/webm).
 *
 * Tidak ada filter tipe di sini: layanan (`home-media.service`) yang memberi
 * pesan khusus per slot (gambar dikonversi WebP; video dibatasi mp4/webm dan
 * 2 MB). Batas ukuran di sini lebar (50 MB) supaya pesan dari layanan yang
 * dipakai untuk berkas yang wajar.
 */
exports.uploadHomeMediaFile = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
});
