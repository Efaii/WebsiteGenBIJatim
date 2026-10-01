import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/api-error";
import {
  createCmsSession,
  revokeCmsSession,
} from "../services/cms-session.service";
import { CmsRequest } from "../middlewares/cms-session.middleware";
import { sendSuccess } from "../middlewares/request-context.middleware";

/*
 * Cookie sesi dipakai bersama oleh API dan aplikasi web (halaman `/cms/*`
 * diverifikasi di sisi server web), jadi path-nya `/` — bukan `/api/v1` —
 * supaya browser ikut mengirimkannya saat memuat halaman, bukan hanya saat
 * memanggil API. Cookie tetap httpOnly sehingga JavaScript tidak bisa
 * membacanya.
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const loginCms = async (req: Request, res: Response) => {
  const username =
    typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  if (!username || !password)
    throw new ApiError(
      "VALIDATION_ERROR",
      "Username and password are required.",
      400,
    );
  const user = await prisma.user.findUnique({
    where: { username },
    include: { cmsAccount: true },
  });
  if (
    !user?.cmsAccount ||
    user.cmsAccount.status !== "ACTIVE" ||
    !(await bcrypt.compare(password, user.password))
  )
    throw new ApiError("UNAUTHENTICATED", "Invalid credentials.", 401);
  const session = await createCmsSession(user.cmsAccount.id);
  res.cookie("genbi_cms_session", session.token, {
    ...cookieOptions,
    expires: session.expiresAt,
  });
  return sendSuccess(res, {
    accountId: user.cmsAccount.id,
    role: user.cmsAccount.role,
    mustChangePassword: user.cmsAccount.mustChangePassword,
  });
};

export const logoutCms = async (req: CmsRequest, res: Response) => {
  const token = req.cookies?.genbi_cms_session as string | undefined;
  if (token) await revokeCmsSession(token);
  res.clearCookie("genbi_cms_session", cookieOptions);
  return sendSuccess(res, null);
};

/*
 * Ganti password mandiri untuk akun yang sedang masuk. Dipakai alur wajib
 * ganti password saat login pertama akun operator; sesudah berhasil akun
 * dapat memakai area admin seperti biasa.
 */
export const changeCmsPassword = async (req: CmsRequest, res: Response) => {
  const currentPassword =
    typeof req.body?.currentPassword === "string"
      ? req.body.currentPassword
      : "";
  const newPassword =
    typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  if (!currentPassword || newPassword.length < 8)
    throw new ApiError(
      "VALIDATION_ERROR",
      "Password lama dan password baru minimal 8 karakter wajib diisi.",
      400,
    );
  if (currentPassword === newPassword)
    throw new ApiError(
      "VALIDATION_ERROR",
      "Password baru harus berbeda dari password lama.",
      400,
      { newPassword: ["SAME_AS_CURRENT"] },
    );

  const account = req.cmsSession!.cmsAccount;
  const user = await prisma.user.findUnique({
    where: { id: account.userId },
    select: { id: true, password: true },
  });
  if (!user || !(await bcrypt.compare(currentPassword, user.password)))
    throw new ApiError("VALIDATION_ERROR", "Password lama tidak cocok.", 400, {
      currentPassword: ["INVALID"],
    });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
    await tx.cmsAccount.update({
      where: { id: account.id },
      data: { mustChangePassword: false },
    });
  });

  await prisma.auditEvent.create({
    data: {
      cmsAccountId: account.id,
      action: "PASSWORD_CHANGED",
      entity: "CMS_ACCOUNT",
      entityId: account.id,
    },
  });

  return sendSuccess(res, { mustChangePassword: false });
};

/*
 * Dipakai aplikasi web untuk memverifikasi sesi yang sedang aktif dan
 * memutuskan apakah halaman CMS boleh dirender (hanya `ADMIN_GLOBAL`).
 */
export const currentCms = async (req: CmsRequest, res: Response) => {
  const account = req.cmsSession!.cmsAccount;
  const assignment = account.assignments[0] ?? null;
  const commissariat = assignment?.commissariatId
    ? await prisma.commissariat.findUnique({
        where: { id: assignment.commissariatId },
        select: { name: true },
      })
    : null;
  return sendSuccess(res, {
    accountId: account.id,
    username: account.user.username,
    displayName: account.user.name ?? null,
    role: account.role,
    mustChangePassword: account.mustChangePassword,
    commissariatName: commissariat?.name ?? null,
  });
};
