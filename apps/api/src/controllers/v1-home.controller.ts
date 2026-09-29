import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/api-error";
import { CmsRequest } from "../middlewares/cms-session.middleware";
import { sendSuccess } from "../middlewares/request-context.middleware";

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
const MEDIA_SLOTS = new Set<string>([
  "hero.poster",
  "hero.video",
  ...ABOUT_IMAGE_SLOTS,
  "pilar.image.1",
  "pilar.image.2",
  "pilar.image.3",
]);
const KNOWN_SECTIONS = new Set(["hero", "about", "pilar", "story", "media"]);

const wordCount = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const requireString = (value: unknown, field: string, max: number): string => {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > max
  ) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `${field} harus berupa teks 1-${max} karakter.`,
      400,
    );
  }
  return value;
};

const requireObject = (
  value: unknown,
  field: string,
): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError("VALIDATION_ERROR", `${field} harus berupa objek.`, 400);
  }
  return value as Record<string, unknown>;
};

const readContent = async () => {
  const [hero, about, pilar, story, media] = await Promise.all([
    prisma.homeHero.findUnique({ where: { id: "default" } }),
    prisma.homeAbout.findUnique({ where: { id: "default" } }),
    prisma.homePilarCard.findMany({ orderBy: { position: "asc" } }),
    prisma.homeStoryMilestone.findMany({ orderBy: { position: "asc" } }),
    prisma.homeMediaAsset.findMany(),
  ]);

  const mediaBySlot = new Map(media.map((asset) => [asset.slot, asset]));
  const mediaRef = (slot: string) => {
    const asset = mediaBySlot.get(slot);
    if (!asset) return null;
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

export const getHomeContent = async (_req: Request, res: Response) =>
  sendSuccess(res, await readContent());

export const updateHomeContent = async (req: CmsRequest, res: Response) => {
  const body = requireObject(req.body, "body");
  const keys = Object.keys(body);
  if (keys.length === 0)
    throw new ApiError(
      "VALIDATION_ERROR",
      "Tidak ada perubahan yang dikirim.",
      400,
    );
  for (const key of keys) {
    if (!KNOWN_SECTIONS.has(key)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        `Bagian tidak dikenal: ${key}.`,
        400,
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    if (body.hero !== undefined) {
      const hero = requireObject(body.hero, "hero");
      const heading = requireObject(hero.heading, "hero.heading");
      const headingLine1 = requireString(
        heading.line1,
        "hero.heading.line1",
        120,
      );
      const headingLine2 = requireString(
        heading.line2,
        "hero.heading.line2",
        120,
      );
      const description = requireString(
        hero.description,
        "hero.description",
        400,
      );
      if (wordCount(description) > HERO_DESCRIPTION_MAX_WORDS) {
        throw new ApiError(
          "VALIDATION_ERROR",
          `hero.description maksimal ${HERO_DESCRIPTION_MAX_WORDS} kata.`,
          400,
        );
      }
      if (typeof hero.videoEnabled !== "boolean") {
        throw new ApiError(
          "VALIDATION_ERROR",
          "hero.videoEnabled harus boolean.",
          400,
        );
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
        paragraphLead: requireString(
          about.paragraphLead,
          "about.paragraphLead",
          200,
        ),
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
      if (
        !Array.isArray(pilar.items) ||
        pilar.items.length !== PILAR_POSITIONS.length
      ) {
        throw new ApiError(
          "VALIDATION_ERROR",
          "pilar.items harus berisi tepat 3 kartu.",
          400,
        );
      }
      const seen = new Set<number>();
      for (const rawItem of pilar.items) {
        const item = requireObject(rawItem, "pilar.items[]");
        const position = item.position;
        if (
          typeof position !== "number" ||
          !PILAR_POSITIONS.includes(position) ||
          seen.has(position)
        ) {
          throw new ApiError(
            "VALIDATION_ERROR",
            "pilar.items.position harus 1-3 dan tidak boleh ganda.",
            400,
          );
        }
        seen.add(position);
        const title = requireString(
          item.title,
          `pilar.items[${position}].title`,
          120,
        );
        const description = requireString(
          item.description,
          `pilar.items[${position}].description`,
          600,
        );
        if (!Array.isArray(item.points) || item.points.length !== 3) {
          throw new ApiError(
            "VALIDATION_ERROR",
            `pilar.items[${position}].points harus berisi 3 poin.`,
            400,
          );
        }
        const points = item.points.map((point, index) =>
          requireString(
            point,
            `pilar.items[${position}].points[${index}]`,
            200,
          ),
        );
        await tx.homePilarCard.upsert({
          where: { position },
          update: { title, description, points },
          create: { position, title, description, points },
        });
      }
    }

    if (body.story !== undefined) {
      const story = requireObject(body.story, "story");
      if (
        !Array.isArray(story.milestones) ||
        story.milestones.length !== STORY_POSITIONS.length
      ) {
        throw new ApiError(
          "VALIDATION_ERROR",
          "story.milestones harus berisi tepat 4 milestone.",
          400,
        );
      }
      const seen = new Set<number>();
      for (const rawMilestone of story.milestones) {
        const milestone = requireObject(rawMilestone, "story.milestones[]");
        const position = milestone.position;
        if (
          typeof position !== "number" ||
          !STORY_POSITIONS.includes(position) ||
          seen.has(position)
        ) {
          throw new ApiError(
            "VALIDATION_ERROR",
            "story.milestones.position harus 1-4 dan tidak boleh ganda.",
            400,
          );
        }
        seen.add(position);
        const title = requireString(
          milestone.title,
          `story.milestones[${position}].title`,
          200,
        );
        const description = requireString(
          milestone.description,
          `story.milestones[${position}].description`,
          600,
        );
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
        throw new ApiError(
          "VALIDATION_ERROR",
          "media tidak boleh kosong.",
          400,
        );
      }
      for (const [slot, rawValue] of entries) {
        if (!MEDIA_SLOTS.has(slot)) {
          throw new ApiError(
            "VALIDATION_ERROR",
            `Slot media tidak dikenal: ${slot}.`,
            400,
          );
        }
        const value = requireObject(rawValue, `media.${slot}`);
        const src =
          value.src === undefined
            ? undefined
            : requireString(value.src, `media.${slot}.src`, 500);
        if (
          value.alt !== undefined &&
          (typeof value.alt !== "string" || value.alt.length > 300)
        ) {
          throw new ApiError(
            "VALIDATION_ERROR",
            `media.${slot}.alt harus teks maksimal 300 karakter.`,
            400,
          );
        }
        if (src === undefined && value.alt === undefined) {
          throw new ApiError(
            "VALIDATION_ERROR",
            `media.${slot} tidak berisi perubahan.`,
            400,
          );
        }
        const existing = await tx.homeMediaAsset.findUnique({
          where: { slot },
        });
        if (existing) {
          await tx.homeMediaAsset.update({
            where: { slot },
            data: {
              ...(src !== undefined ? { path: src } : {}),
              ...(value.alt !== undefined ? { alt: value.alt as string } : {}),
            },
          });
        } else {
          if (src === undefined) {
            throw new ApiError(
              "VALIDATION_ERROR",
              `Slot media ${slot} belum ada; sertakan src untuk membuatnya.`,
              400,
            );
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

  return sendSuccess(res, await readContent());
};
