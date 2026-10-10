"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentCms = exports.changeCmsPassword = exports.logoutCms = exports.loginCms = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const cms_session_service_1 = require("../services/cms-session.service");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
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
    sameSite: "lax",
    path: "/",
};
const loginCms = async (req, res) => {
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!username || !password)
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Username and password are required.", 400);
    const user = await prisma_1.prisma.user.findUnique({
        where: { username },
        include: { cmsAccount: true },
    });
    if (!user?.cmsAccount ||
        user.cmsAccount.status !== "ACTIVE" ||
        !(await bcrypt_1.default.compare(password, user.password)))
        throw new api_error_1.ApiError("UNAUTHENTICATED", "Invalid credentials.", 401);
    const session = await (0, cms_session_service_1.createCmsSession)(user.cmsAccount.id);
    res.cookie("genbi_cms_session", session.token, {
        ...cookieOptions,
        expires: session.expiresAt,
    });
    return (0, request_context_middleware_1.sendSuccess)(res, {
        accountId: user.cmsAccount.id,
        role: user.cmsAccount.role,
        mustChangePassword: user.cmsAccount.mustChangePassword,
    });
};
exports.loginCms = loginCms;
const logoutCms = async (req, res) => {
    const token = req.cookies?.genbi_cms_session;
    if (token)
        await (0, cms_session_service_1.revokeCmsSession)(token);
    res.clearCookie("genbi_cms_session", cookieOptions);
    return (0, request_context_middleware_1.sendSuccess)(res, null);
};
exports.logoutCms = logoutCms;
/*
 * Ganti password mandiri untuk akun yang sedang masuk. Dipakai alur wajib
 * ganti password saat login pertama akun operator; sesudah berhasil akun
 * dapat memakai area admin seperti biasa.
 */
const changeCmsPassword = async (req, res) => {
    const currentPassword = typeof req.body?.currentPassword === "string"
        ? req.body.currentPassword
        : "";
    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
    if (!currentPassword || newPassword.length < 8)
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Password lama dan password baru minimal 8 karakter wajib diisi.", 400);
    if (currentPassword === newPassword)
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Password baru harus berbeda dari password lama.", 400, { newPassword: ["SAME_AS_CURRENT"] });
    const account = req.cmsSession.cmsAccount;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: account.userId },
        select: { id: true, password: true },
    });
    if (!user || !(await bcrypt_1.default.compare(currentPassword, user.password)))
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Password lama tidak cocok.", 400, {
            currentPassword: ["INVALID"],
        });
    const hashed = await bcrypt_1.default.hash(newPassword, 10);
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: user.id },
            data: { password: hashed },
        });
        await tx.cmsAccount.update({
            where: { id: account.id },
            data: { mustChangePassword: false },
        });
    });
    await prisma_1.prisma.auditEvent.create({
        data: {
            cmsAccountId: account.id,
            action: "PASSWORD_CHANGED",
            entity: "CMS_ACCOUNT",
            entityId: account.id,
        },
    });
    return (0, request_context_middleware_1.sendSuccess)(res, { mustChangePassword: false });
};
exports.changeCmsPassword = changeCmsPassword;
/*
 * Dipakai aplikasi web untuk memverifikasi sesi yang sedang aktif dan
 * memutuskan apakah halaman CMS boleh dirender (hanya `ADMIN_GLOBAL`).
 */
const currentCms = async (req, res) => {
    const account = req.cmsSession.cmsAccount;
    const assignment = account.assignments[0] ?? null;
    const commissariat = assignment?.commissariatId
        ? await prisma_1.prisma.commissariat.findUnique({
            where: { id: assignment.commissariatId },
            select: { name: true },
        })
        : null;
    return (0, request_context_middleware_1.sendSuccess)(res, {
        accountId: account.id,
        username: account.user.username,
        displayName: account.user.name ?? null,
        role: account.role,
        mustChangePassword: account.mustChangePassword,
        commissariatName: commissariat?.name ?? null,
    });
};
exports.currentCms = currentCms;
