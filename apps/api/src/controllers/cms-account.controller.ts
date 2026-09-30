import { Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/api-error";
import { CmsRequest } from "../middlewares/cms-session.middleware";
import { sendSuccess } from "../middlewares/request-context.middleware";

/*
 * Pengelolaan akun operator CMS (khusus admin global).
 *
 * Akun operator adalah akun bersama berbasis scope: satu peran dengan satu
 * penugasan aktif (komisariat dan periode, plus divisi untuk sekretaris
 * divisi). Akun baru wajib mengganti password saat pertama masuk; admin
 * global dapat mereset password dan menonaktifkan atau mengaktifkan akun.
 * Seluruh aksi tercatat sebagai AuditEvent entitas CMS_ACCOUNT.
 */

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,30}$/;

const ROLES = ["ADMIN_GLOBAL", "SEKRETARIS_UMUM", "SEKRETARIS_DIVISI"] as const;
type AccountRole = (typeof ROLES)[number];

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const resolveScope = async (
  role: AccountRole,
  body: Record<string, unknown>,
): Promise<{
  commissariatId: string | null;
  periodId: string | null;
  divisionId: string | null;
}> => {
  if (role === "ADMIN_GLOBAL")
    return { commissariatId: null, periodId: null, divisionId: null };
  const commissariatId = text(body.commissariatId);
  const periodId = text(body.periodId);
  if (!commissariatId || !periodId)
    throw new ApiError(
      "VALIDATION_ERROR",
      "Komisariat dan periode wajib dipilih.",
      400,
      { scope: ["REQUIRED"] },
    );
  const [commissariat, period] = await Promise.all([
    prisma.commissariat.findUnique({
      where: { id: commissariatId },
      select: { id: true },
    }),
    prisma.period.findFirst({
      where: { id: periodId, commissariatId },
      select: { id: true },
    }),
  ]);
  if (!commissariat || !period)
    throw new ApiError("VALIDATION_ERROR", "Scope akun tidak valid.", 400, {
      scope: ["INVALID_SCOPE"],
    });
  if (role === "SEKRETARIS_DIVISI") {
    const divisionId = text(body.divisionId);
    if (!divisionId)
      throw new ApiError("VALIDATION_ERROR", "Divisi wajib dipilih.", 400, {
        divisionId: ["REQUIRED"],
      });
    const division = await prisma.division.findFirst({
      where: { id: divisionId, commissariatId, periodId },
      select: { id: true },
    });
    if (!division)
      throw new ApiError(
        "VALIDATION_ERROR",
        "Divisi tidak termasuk scope yang dipilih.",
        400,
        { divisionId: ["INVALID_DIVISION"] },
      );
    return { commissariatId, periodId, divisionId };
  }
  return { commissariatId, periodId, divisionId: null };
};

export const listCmsAccounts = async (_req: CmsRequest, res: Response) => {
  const accounts = await prisma.cmsAccount.findMany({
    include: {
      user: { select: { username: true, name: true } },
      assignments: {
        orderBy: { createdAt: "asc" },
        include: {
          commissariat: { select: { name: true } },
          period: { select: { label: true } },
          division: { select: { name: true } },
        },
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  return sendSuccess(
    res,
    accounts.map((account) => {
      const active = account.assignments.find((item) => item.active) ?? null;
      return {
        id: account.id,
        username: account.user.username,
        name: account.user.name,
        role: account.role,
        status: account.status,
        mustChangePassword: account.mustChangePassword,
        createdAt: account.createdAt,
        assignment: active
          ? {
              commissariatId: active.commissariatId,
              periodId: active.periodId,
              divisionId: active.divisionId,
              commissariat: active.commissariat?.name ?? null,
              period: active.period?.label ?? null,
              division: active.division?.name ?? null,
            }
          : null,
      };
    }),
  );
};

export const createCmsAccount = async (req: CmsRequest, res: Response) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const username = text(body.username).toLowerCase();
  const name = text(body.name);
  const password = typeof body.password === "string" ? body.password : "";
  const role = text(body.role) as AccountRole;

  if (!USERNAME_PATTERN.test(username))
    throw new ApiError(
      "VALIDATION_ERROR",
      "Username hanya boleh huruf kecil, angka, titik, garis bawah, atau strip (3 sampai 31 karakter).",
      400,
      { username: ["INVALID_FORMAT"] },
    );
  if (!name || name.length > 120)
    throw new ApiError("VALIDATION_ERROR", "Nama operator wajib diisi.", 400, {
      name: ["REQUIRED"],
    });
  if (password.length < 8)
    throw new ApiError(
      "VALIDATION_ERROR",
      "Password awal minimal 8 karakter.",
      400,
      { password: ["MIN_LENGTH"] },
    );
  if (!ROLES.includes(role))
    throw new ApiError("VALIDATION_ERROR", "Peran akun tidak valid.", 400, {
      role: ["INVALID_ROLE"],
    });

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existing)
    throw new ApiError("CONFLICT", "Username sudah dipakai.", 409, {
      username: ["TAKEN"],
    });

  const scope = await resolveScope(role, body);
  const hashed = await bcrypt.hash(password, 10);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { username, name, password: hashed, role },
    });
    const account = await tx.cmsAccount.create({
      data: {
        userId: user.id,
        role,
        status: "ACTIVE",
        mustChangePassword: true,
      },
    });
    if (scope.commissariatId && scope.periodId) {
      await tx.cmsAssignment.create({
        data: {
          cmsAccountId: account.id,
          commissariatId: scope.commissariatId,
          periodId: scope.periodId,
          divisionId: scope.divisionId,
          active: true,
        },
      });
    }
    return account;
  });

  await prisma.auditEvent.create({
    data: {
      cmsAccountId: req.cmsSession!.cmsAccountId,
      action: "CREATED",
      entity: "CMS_ACCOUNT",
      entityId: created.id,
      newStatus: "ACTIVE",
      commissariatId: scope.commissariatId,
      periodId: scope.periodId,
      divisionId: scope.divisionId,
    },
  });

  return sendSuccess(res, {
    id: created.id,
    username,
    role,
    status: created.status,
    mustChangePassword: true,
    ...scope,
  });
};

export const resetCmsAccountPassword = async (
  req: CmsRequest,
  res: Response,
) => {
  const newPassword =
    typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  if (newPassword.length < 8)
    throw new ApiError(
      "VALIDATION_ERROR",
      "Password baru minimal 8 karakter.",
      400,
      { newPassword: ["MIN_LENGTH"] },
    );
  const account = await prisma.cmsAccount.findUnique({
    where: { id: req.params.id },
  });
  if (!account) throw new ApiError("NOT_FOUND", "Akun tidak ditemukan.", 404);

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: account.userId },
      data: { password: hashed },
    });
    await tx.cmsAccount.update({
      where: { id: account.id },
      data: { mustChangePassword: true },
    });
    await tx.cmsSession.updateMany({
      where: { cmsAccountId: account.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });

  await prisma.auditEvent.create({
    data: {
      cmsAccountId: req.cmsSession!.cmsAccountId,
      action: "RESET_PASSWORD",
      entity: "CMS_ACCOUNT",
      entityId: account.id,
    },
  });

  return sendSuccess(res, { id: account.id, mustChangePassword: true });
};

export const updateCmsAccountStatus = async (
  req: CmsRequest,
  res: Response,
) => {
  const status = req.body?.status;
  if (status !== "ACTIVE" && status !== "DISABLED")
    throw new ApiError("VALIDATION_ERROR", "Status akun tidak valid.", 400, {
      status: ["INVALID_STATUS"],
    });
  const account = await prisma.cmsAccount.findUnique({
    where: { id: req.params.id },
  });
  if (!account) throw new ApiError("NOT_FOUND", "Akun tidak ditemukan.", 404);
  if (status === "DISABLED" && account.id === req.cmsSession!.cmsAccountId)
    throw new ApiError(
      "VALIDATION_ERROR",
      "Akun yang sedang dipakai tidak dapat dinonaktifkan.",
      400,
    );
  if (account.status === status)
    return sendSuccess(res, { id: account.id, status });

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.cmsAccount.update({
      where: { id: account.id },
      data: { status },
    });
    if (status === "DISABLED")
      await tx.cmsSession.updateMany({
        where: { cmsAccountId: account.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    return next;
  });

  await prisma.auditEvent.create({
    data: {
      cmsAccountId: req.cmsSession!.cmsAccountId,
      action: status === "DISABLED" ? "DISABLED" : "ENABLED",
      entity: "CMS_ACCOUNT",
      entityId: account.id,
      oldStatus: account.status,
      newStatus: status,
    },
  });

  return sendSuccess(res, { id: updated.id, status: updated.status });
};
