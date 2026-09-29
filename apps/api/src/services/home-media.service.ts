import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/api-error";
import { ensureStorageRoots, publicStoragePath } from "../lib/storage";

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
export const VIDEO_MAX_BYTES = 2 * 1024 * 1024;
const VIDEO_MIME_TYPES: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

const MANAGED_PREFIX = "/uploads/home/";

const removeManagedFile = async (recordPath: string | null | undefined) => {
  if (!recordPath || !recordPath.startsWith(MANAGED_PREFIX)) return;
  const relative = recordPath.replace("/uploads/", "");
  try {
    await fs.unlink(publicStoragePath(relative));
  } catch {
    // Berkas mungkin sudah tidak ada; tidak menghalangi penggantian slot.
  }
};

export const saveHomeImage = async (
  slot: string,
  file: Express.Multer.File,
) => {
  if (!IMAGE_SLOTS.has(slot)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Slot media tidak menerima gambar: ${slot}.`,
      400,
    );
  }
  if (!file.mimetype.startsWith("image/")) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Slot ini hanya menerima berkas gambar (JPEG, PNG, WebP).",
      400,
    );
  }

  const converted = await sharp(file.buffer)
    .rotate()
    .resize({
      width: IMAGE_MAX_SIDE,
      height: IMAGE_MAX_SIDE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  await ensureStorageRoots();
  await fs.mkdir(publicStoragePath("home"), { recursive: true });
  const filename = `${crypto.randomUUID()}.webp`;
  await fs.writeFile(
    publicStoragePath(path.join("home", filename)),
    converted.data,
  );

  const recordPath = `${MANAGED_PREFIX}${filename}`;
  const previous = await prisma.homeMediaAsset.findUnique({ where: { slot } });
  const asset = await prisma.homeMediaAsset.upsert({
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

export const saveHomeVideo = async (
  slot: string,
  file: Express.Multer.File,
) => {
  if (!VIDEO_SLOTS.has(slot)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Slot media tidak menerima video: ${slot}.`,
      400,
    );
  }
  const extension = VIDEO_MIME_TYPES[file.mimetype];
  if (!extension) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Video harus berformat MP4 atau WebM.",
      400,
    );
  }
  if (file.size > VIDEO_MAX_BYTES) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Video maksimal 2 MB (anggaran media hero, ADR 0005). Kompres dulu sebelum mengunggah.",
      400,
    );
  }

  await ensureStorageRoots();
  await fs.mkdir(publicStoragePath("home"), { recursive: true });
  const filename = `${crypto.randomUUID()}${extension}`;
  await fs.writeFile(
    publicStoragePath(path.join("home", filename)),
    file.buffer,
  );

  const recordPath = `${MANAGED_PREFIX}${filename}`;
  const previous = await prisma.homeMediaAsset.findUnique({ where: { slot } });
  const asset = await prisma.homeMediaAsset.upsert({
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

export const clearHomeMedia = async (slot: string) => {
  if (!IMAGE_SLOTS.has(slot) && !VIDEO_SLOTS.has(slot)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Slot media tidak dikenal: ${slot}.`,
      400,
    );
  }
  const existing = await prisma.homeMediaAsset.findUnique({ where: { slot } });
  if (existing) {
    await prisma.homeMediaAsset.delete({ where: { slot } });
  }
  if (slot === "hero.video") {
    // Video yang dikosongkan tidak boleh tetap "aktif" tanpa berkas.
    await prisma.homeHero.updateMany({
      where: { id: "default" },
      data: { videoEnabled: false },
    });
  }
  await removeManagedFile(existing?.path);
  return existing;
};
