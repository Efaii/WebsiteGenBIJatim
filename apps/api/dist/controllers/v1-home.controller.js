"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHomeMedia = exports.uploadHomeMedia = exports.updateHomeContent = exports.getHomeContent = void 0;
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const home_media_service_1 = require("../services/home-media.service");
/*
 * Konten Beranda v1 (ADR 0013).
 *
 * Baca publik; tulis hanya ADMIN_GLOBAL. Bagian statis (judul/eyebrow/deskripsi
 * pengantar section, metrik hero, chip peran, tahun milestone, kartu "Akses
 * Platform Digital", aset brand) tidak ada di kontrak ini dan tidak dapat
 * ditulis dari API.
 */
const HERO_DESCRIPTION_MAX_WORDS = 20;
const ABOUT_IMAGE_SLOTS = [
    "about.image.1",
    "about.image.2",
    "about.image.3",
    "about.image.4",
];
const PILAR_POSITIONS = [1, 2, 3];
const STORY_POSITIONS = [1, 2, 3, 4];
const MEDIA_SLOTS = new Set([
    "hero.poster",
    "hero.video",
    ...ABOUT_IMAGE_SLOTS,
    "pilar.image.1",
    "pilar.image.2",
    "pilar.image.3",
]);
const KNOWN_SECTIONS = new Set(["hero", "about", "pilar", "story", "media"]);
const wordCount = (value) => value.trim().split(/\s+/).filter(Boolean).length;
const requireString = (value, field, max) => {
    if (typeof value !== "string" ||
        value.trim().length === 0 ||
        value.length > max) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", `${field} harus berupa teks 1-${max} karakter.`, 400);
    }
    return value;
};
const requireObject = (value, field) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", `${field} harus berupa objek.`, 400);
    }
    return value;
};
const readContent = async () => {
    const [hero, about, pilar, story, media] = await Promise.all([
        prisma_1.prisma.homeHero.findUnique({ where: { id: "default" } }),
        prisma_1.prisma.homeAbout.findUnique({ where: { id: "default" } }),
        prisma_1.prisma.homePilarCard.findMany({ orderBy: { position: "asc" } }),
        prisma_1.prisma.homeStoryMilestone.findMany({ orderBy: { position: "asc" } }),
        prisma_1.prisma.homeMediaAsset.findMany(),
    ]);
    const mediaBySlot = new Map(media.map((asset) => [asset.slot, asset]));
    const mediaRef = (slot) => {
        const asset = mediaBySlot.get(slot);
        if (!asset)
            return null;
        return {
            slot: asset.slot,
            src: asset.path,
            alt: asset.alt,
            mimeType: asset.mimeType,
        };
    };
    return {
        hero: hero
            ? {
                heading: { line1: hero.headingLine1, line2: hero.headingLine2 },
                description: hero.description,
                videoEnabled: hero.videoEnabled,
                poster: mediaRef("hero.poster"),
                video: mediaRef("hero.video"),
            }
            : null,
        about: about
            ? {
                paragraphLead: about.paragraphLead,
                paragraph: about.paragraph,
                emphasis: about.emphasis,
                images: ABOUT_IMAGE_SLOTS.map(mediaRef),
            }
            : null,
        pilar: {
            items: pilar.map((card) => ({
                position: card.position,
                title: card.title,
                description: card.description,
                points: Array.isArray(card.points) ? card.points : [],
                image: mediaRef(`pilar.image.${card.position}`),
            })),
        },
        story: {
            milestones: story.map((milestone) => ({
                position: milestone.position,
                title: milestone.title,
                description: milestone.description,
            })),
        },
    };
};
const getHomeContent = async (_req, res) => (0, request_context_middleware_1.sendSuccess)(res, await readContent());
exports.getHomeContent = getHomeContent;
const updateHomeContent = async (req, res) => {
    const body = requireObject(req.body, "body");
    const keys = Object.keys(body);
    if (keys.length === 0)
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Tidak ada perubahan yang dikirim.", 400);
    for (const key of keys) {
        if (!KNOWN_SECTIONS.has(key)) {
            throw new api_error_1.ApiError("VALIDATION_ERROR", `Bagian tidak dikenal: ${key}.`, 400);
        }
    }
    await prisma_1.prisma.$transaction(async (tx) => {
        if (body.hero !== undefined) {
            const hero = requireObject(body.hero, "hero");
            const heading = requireObject(hero.heading, "hero.heading");
            const headingLine1 = requireString(heading.line1, "hero.heading.line1", 120);
            const headingLine2 = requireString(heading.line2, "hero.heading.line2", 120);
            const description = requireString(hero.description, "hero.description", 400);
            if (wordCount(description) > HERO_DESCRIPTION_MAX_WORDS) {
                throw new api_error_1.ApiError("VALIDATION_ERROR", `hero.description maksimal ${HERO_DESCRIPTION_MAX_WORDS} kata.`, 400);
            }
            if (typeof hero.videoEnabled !== "boolean") {
                throw new api_error_1.ApiError("VALIDATION_ERROR", "hero.videoEnabled harus boolean.", 400);
            }
            const data = {
                headingLine1,
                headingLine2,
                description,
                videoEnabled: hero.videoEnabled,
            };
            await tx.homeHero.upsert({
                where: { id: "default" },
                update: data,
                create: { id: "default", ...data },
            });
        }
        if (body.about !== undefined) {
            const about = requireObject(body.about, "about");
            const data = {
                paragraphLead: requireString(about.paragraphLead, "about.paragraphLead", 200),
                paragraph: requireString(about.paragraph, "about.paragraph", 2000),
                emphasis: requireString(about.emphasis, "about.emphasis", 2000),
            };
            await tx.homeAbout.upsert({
                where: { id: "default" },
                update: data,
                create: { id: "default", ...data },
            });
        }
        if (body.pilar !== undefined) {
            const pilar = requireObject(body.pilar, "pilar");
            if (!Array.isArray(pilar.items) ||
                pilar.items.length !== PILAR_POSITIONS.length) {
                throw new api_error_1.ApiError("VALIDATION_ERROR", "pilar.items harus berisi tepat 3 kartu.", 400);
            }
            const seen = new Set();
            for (const rawItem of pilar.items) {
                const item = requireObject(rawItem, "pilar.items[]");
                const position = item.position;
                if (typeof position !== "number" ||
                    !PILAR_POSITIONS.includes(position) ||
                    seen.has(position)) {
                    throw new api_error_1.ApiError("VALIDATION_ERROR", "pilar.items.position harus 1-3 dan tidak boleh ganda.", 400);
                }
                seen.add(position);
                const title = requireString(item.title, `pilar.items[${position}].title`, 120);
                const description = requireString(item.description, `pilar.items[${position}].description`, 600);
                if (!Array.isArray(item.points) || item.points.length !== 3) {
                    throw new api_error_1.ApiError("VALIDATION_ERROR", `pilar.items[${position}].points harus berisi 3 poin.`, 400);
                }
                const points = item.points.map((point, index) => requireString(point, `pilar.items[${position}].points[${index}]`, 200));
                await tx.homePilarCard.upsert({
                    where: { position },
                    update: { title, description, points },
                    create: { position, title, description, points },
                });
            }
        }
        if (body.story !== undefined) {
            const story = requireObject(body.story, "story");
            if (!Array.isArray(story.milestones) ||
                story.milestones.length !== STORY_POSITIONS.length) {
                throw new api_error_1.ApiError("VALIDATION_ERROR", "story.milestones harus berisi tepat 4 milestone.", 400);
            }
            const seen = new Set();
            for (const rawMilestone of story.milestones) {
                const milestone = requireObject(rawMilestone, "story.milestones[]");
                const position = milestone.position;
                if (typeof position !== "number" ||
                    !STORY_POSITIONS.includes(position) ||
                    seen.has(position)) {
                    throw new api_error_1.ApiError("VALIDATION_ERROR", "story.milestones.position harus 1-4 dan tidak boleh ganda.", 400);
                }
                seen.add(position);
                const title = requireString(milestone.title, `story.milestones[${position}].title`, 200);
                const description = requireString(milestone.description, `story.milestones[${position}].description`, 600);
                await tx.homeStoryMilestone.upsert({
                    where: { position },
                    update: { title, description },
                    create: { position, title, description },
                });
            }
        }
        if (body.media !== undefined) {
            const media = requireObject(body.media, "media");
            const entries = Object.entries(media);
            if (entries.length === 0) {
                throw new api_error_1.ApiError("VALIDATION_ERROR", "media tidak boleh kosong.", 400);
            }
            for (const [slot, rawValue] of entries) {
                if (!MEDIA_SLOTS.has(slot)) {
                    throw new api_error_1.ApiError("VALIDATION_ERROR", `Slot media tidak dikenal: ${slot}.`, 400);
                }
                const value = requireObject(rawValue, `media.${slot}`);
                const src = value.src === undefined
                    ? undefined
                    : requireString(value.src, `media.${slot}.src`, 500);
                if (value.alt !== undefined &&
                    (typeof value.alt !== "string" || value.alt.length > 300)) {
                    throw new api_error_1.ApiError("VALIDATION_ERROR", `media.${slot}.alt harus teks maksimal 300 karakter.`, 400);
                }
                if (src === undefined && value.alt === undefined) {
                    throw new api_error_1.ApiError("VALIDATION_ERROR", `media.${slot} tidak berisi perubahan.`, 400);
                }
                const existing = await tx.homeMediaAsset.findUnique({
                    where: { slot },
                });
                if (existing) {
                    await tx.homeMediaAsset.update({
                        where: { slot },
                        data: {
                            ...(src !== undefined ? { path: src } : {}),
                            ...(value.alt !== undefined ? { alt: value.alt } : {}),
                        },
                    });
                }
                else {
                    if (src === undefined) {
                        throw new api_error_1.ApiError("VALIDATION_ERROR", `Slot media ${slot} belum ada; sertakan src untuk membuatnya.`, 400);
                    }
                    await tx.homeMediaAsset.create({
                        data: {
                            slot,
                            kind: slot === "hero.video" ? "VIDEO" : "IMAGE",
                            path: src,
                            alt: typeof value.alt === "string" ? value.alt : "",
                            mimeType: slot === "hero.video" ? "video/mp4" : null,
                        },
                    });
                }
            }
        }
    });
    return (0, request_context_middleware_1.sendSuccess)(res, await readContent());
};
exports.updateHomeContent = updateHomeContent;
/*
 * Unggah/penggantian dan pengosongan media slot hero. Berkas langsung
 * tersimpan di slot (tanpa draft per media, sesuai ADR 0013 keputusan 5);
 * responsnya berisi konten penuh agar editor dapat menyegarkan draft.
 */
const uploadHomeMedia = async (req, res) => {
    const slot = String(req.params.slot ?? "");
    if (!req.file) {
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Berkas tidak ditemukan pada permintaan.", 400);
    }
    if (slot === "hero.video") {
        await (0, home_media_service_1.saveHomeVideo)(slot, req.file);
    }
    else {
        await (0, home_media_service_1.saveHomeImage)(slot, req.file);
    }
    return (0, request_context_middleware_1.sendSuccess)(res, await readContent());
};
exports.uploadHomeMedia = uploadHomeMedia;
const deleteHomeMedia = async (req, res) => {
    const slot = String(req.params.slot ?? "");
    await (0, home_media_service_1.clearHomeMedia)(slot);
    return (0, request_context_middleware_1.sendSuccess)(res, await readContent());
};
exports.deleteHomeMedia = deleteHomeMedia;
