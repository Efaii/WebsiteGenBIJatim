import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/api-error";
import { sanitizeRichText } from "../lib/rich-text";
import { sendSuccess } from "../middlewares/request-context.middleware";

/*
 * FAQ jalur kanonik (ADR 0014). Baca publik hanya FAQ aktif sesuai urutan;
 * pengelolaan (tambah/ubah/hapus/urut/aktif) hanya ADMIN_GLOBAL.
 */

const requireText = (value: unknown, field: string, max: number): string => {
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
  return value.trim();
};

/*
 * Jawaban FAQ memakai teks kaya: disaring lebih dulu (hanya tag/atribut
 * presentasi yang lolos), lalu diukur panjangnya supaya skrip atau gaya
 * berbahaya tidak pernah masuk database. Jawaban lama berformat teks polos
 * tetap diterima karena penyaring meneruskan teks apa adanya.
 */
const requireRichAnswer = (value: unknown, max: number): string => {
  if (typeof value !== "string") {
    throw new ApiError(
      "VALIDATION_ERROR",
      `answer harus berupa teks 1-${max} karakter.`,
      400,
    );
  }
  const sanitized = sanitizeRichText(value);
  if (sanitized.length === 0 || sanitized.length > max) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `answer harus berupa teks 1-${max} karakter.`,
      400,
    );
  }
  return sanitized;
};

const orderedFaqs = () =>
  prisma.faq.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });

export const listPublicFaqs = async (_req: Request, res: Response) => {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return sendSuccess(res, faqs);
};

export const listCmsFaqs = async (_req: Request, res: Response) =>
  sendSuccess(res, await orderedFaqs());

export const createFaq = async (req: Request, res: Response) => {
  const question = requireText(req.body?.question, "question", 300);
  const answer = requireRichAnswer(req.body?.answer, 5000);
  const isActive =
    req.body?.isActive === undefined ? true : Boolean(req.body.isActive);
  const max = await prisma.faq.aggregate({ _max: { order: true } });
  const created = await prisma.faq.create({
    data: { question, answer, isActive, order: (max._max.order ?? 0) + 1 },
  });
  return sendSuccess(res, created);
};

export const updateFaq = async (req: Request, res: Response) => {
  const faq = await prisma.faq.findUnique({ where: { id: req.params.id } });
  if (!faq) throw new ApiError("NOT_FOUND", "FAQ not found.", 404);
  const data: { question?: string; answer?: string; isActive?: boolean } = {};
  if (req.body?.question !== undefined)
    data.question = requireText(req.body.question, "question", 300);
  if (req.body?.answer !== undefined)
    data.answer = requireRichAnswer(req.body.answer, 5000);
  if (req.body?.isActive !== undefined)
    data.isActive = Boolean(req.body.isActive);
  if (Object.keys(data).length === 0) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Tidak ada perubahan yang dikirim.",
      400,
    );
  }
  const updated = await prisma.faq.update({ where: { id: faq.id }, data });
  return sendSuccess(res, updated);
};

export const deleteFaq = async (req: Request, res: Response) => {
  const faq = await prisma.faq.findUnique({ where: { id: req.params.id } });
  if (!faq) throw new ApiError("NOT_FOUND", "FAQ not found.", 404);
  await prisma.faq.delete({ where: { id: faq.id } });
  return sendSuccess(res, { id: faq.id });
};

/*
 * Urutkan ulang FAQ: `ids` harus memuat tepat semua FAQ yang ada; index array
 * menjadi `order` baru.
 */
export const orderFaqs = async (req: Request, res: Response) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "ids harus berupa daftar id FAQ.",
      400,
    );
  }
  const all = await prisma.faq.findMany({ select: { id: true } });
  const allIds = new Set(all.map((faq) => faq.id));
  if (ids.length !== all.length || ids.some((id) => !allIds.has(id))) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "ids harus memuat tepat semua FAQ.",
      400,
    );
  }
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.faq.update({ where: { id }, data: { order: index } }),
    ),
  );
  return sendSuccess(res, await orderedFaqs());
};
