"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearHomeMedia = exports.saveHomeVideo = exports.saveHomeImage = exports.VIDEO_MAX_BYTES = void 0;
const crypto_1 = __importDefault(require("crypto"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const storage_1 = require("../lib/storage");
/**
 * Media hero (dan slot gambar konten beranda lain) — ADR 0013 keputusan 3 & 4.
 *
 * - Gambar dikonversi ke WebP (sharp, kualitas 80, sisi panjang maks 1920),
 *   berkas asli tidak disimpan.
 * - Video tidak ditranskodasi; hanya mp4/webm dengan batas 2 MB (ADR 0005).
 * - Berkas lama hanya dihapus bila ia berada di storage yang kita kelola
 *   (`/uploads/home/...`); aset statis repo tidak pernah disentuh.
 */
const IMAGE_SLOTS = new Set([
    "hero.poster",
    "about.image.1",
    "about.image.2",
    "about.image.3",
    "about.image.4",
    "pilar.image.1",
    "pilar.image.2",
    "pilar.image.3",
]);
const VIDEO_SLOTS = new Set(["hero.video"]);
const IMAGE_MAX_SIDE = 1920;
const WEBP_QUALITY = 80;
exports.VIDEO_MAX_BYTES = 2 * 1024 * 1024;
const VIDEO_MIME_TYPES = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
};
const MANAGED_PREFIX = "/uploads/home/";
const removeManagedFile = async (recordPath) => {
    if (!recordPath || !recordPath.startsWith(MANAGED_PREFIX))
        return;
    const relative = recordPath.replace("/uploads/", "");
    try {
        await promises_1.default.unlink((0, storage_1.publicStoragePath)(relative));
    }
    catch {
        // Berkas mungkin sudah tidak ada; tidak menghalangi penggantian slot.
    }
};
const saveHomeImage = async (slot, file) => {
    if (!IMAGE_SLOTS.has(slot)) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", `Slot media tidak menerima gambar: ${slot}.`, 400);
    }
    if (!file.mimetype.startsWith("image/")) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Slot ini hanya menerima berkas gambar (JPEG, PNG, WebP).", 400);
    }
    const converted = await (0, sharp_1.default)(file.buffer)
        .rotate()
        .resize({
        width: IMAGE_MAX_SIDE,
        height: IMAGE_MAX_SIDE,
        fit: "inside",
        withoutEnlargement: true,
    })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer({ resolveWithObject: true });
    await (0, storage_1.ensureStorageRoots)();
    await promises_1.default.mkdir((0, storage_1.publicStoragePath)("home"), { recursive: true });
    const filename = `${crypto_1.default.randomUUID()}.webp`;
    await promises_1.default.writeFile((0, storage_1.publicStoragePath)(path_1.default.join("home", filename)), converted.data);
    const recordPath = `${MANAGED_PREFIX}${filename}`;
    const previous = await prisma_1.prisma.homeMediaAsset.findUnique({ where: { slot } });
    const asset = await prisma_1.prisma.homeMediaAsset.upsert({
        where: { slot },
        update: {
            kind: "IMAGE",
            path: recordPath,
            mimeType: "image/webp",
            width: converted.info.width,
            height: converted.info.height,
            bytes: converted.info.size,
        },
        create: {
            slot,
            kind: "IMAGE",
            path: recordPath,
            mimeType: "image/webp",
            alt: previous?.alt ?? "",
            width: converted.info.width,
            height: converted.info.height,
            bytes: converted.info.size,
        },
    });
    await removeManagedFile(previous?.path);
    return asset;
};
exports.saveHomeImage = saveHomeImage;
const saveHomeVideo = async (slot, file) => {
    if (!VIDEO_SLOTS.has(slot)) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", `Slot media tidak menerima video: ${slot}.`, 400);
    }
    const extension = VIDEO_MIME_TYPES[file.mimetype];
    if (!extension) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Video harus berformat MP4 atau WebM.", 400);
    }
    if (file.size > exports.VIDEO_MAX_BYTES) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Video maksimal 2 MB (anggaran media hero, ADR 0005). Kompres dulu sebelum mengunggah.", 400);
    }
    await (0, storage_1.ensureStorageRoots)();
    await promises_1.default.mkdir((0, storage_1.publicStoragePath)("home"), { recursive: true });
    const filename = `${crypto_1.default.randomUUID()}${extension}`;
    await promises_1.default.writeFile((0, storage_1.publicStoragePath)(path_1.default.join("home", filename)), file.buffer);
    const recordPath = `${MANAGED_PREFIX}${filename}`;
    const previous = await prisma_1.prisma.homeMediaAsset.findUnique({ where: { slot } });
    const asset = await prisma_1.prisma.homeMediaAsset.upsert({
        where: { slot },
        update: {
            kind: "VIDEO",
            path: recordPath,
            mimeType: file.mimetype,
            width: null,
            height: null,
            bytes: file.size,
        },
        create: {
            slot,
            kind: "VIDEO",
            path: recordPath,
            mimeType: file.mimetype,
            alt: previous?.alt ?? "",
            bytes: file.size,
        },
    });
    await removeManagedFile(previous?.path);
    return asset;
};
exports.saveHomeVideo = saveHomeVideo;
const clearHomeMedia = async (slot) => {
    if (!IMAGE_SLOTS.has(slot) && !VIDEO_SLOTS.has(slot)) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", `Slot media tidak dikenal: ${slot}.`, 400);
    }
    const existing = await prisma_1.prisma.homeMediaAsset.findUnique({ where: { slot } });
    if (existing) {
        await prisma_1.prisma.homeMediaAsset.delete({ where: { slot } });
    }
    if (slot === "hero.video") {
        // Video yang dikosongkan tidak boleh tetap "aktif" tanpa berkas.
        await prisma_1.prisma.homeHero.updateMany({
            where: { id: "default" },
            data: { videoEnabled: false },
        });
    }
    await removeManagedFile(existing?.path);
    return existing;
};
exports.clearHomeMedia = clearHomeMedia;
