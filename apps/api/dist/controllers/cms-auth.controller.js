"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutCms = exports.loginCms = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const cms_session_service_1 = require("../services/cms-session.service");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/v1' };
const loginCms = async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!username || !password)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Username and password are required.', 400);
    const user = await prisma_1.prisma.user.findUnique({ where: { username }, include: { cmsAccount: true } });
    if (!user?.cmsAccount || user.cmsAccount.status !== 'ACTIVE' || !(await bcrypt_1.default.compare(password, user.password)))
        throw new api_error_1.ApiError('UNAUTHENTICATED', 'Invalid credentials.', 401);
    const session = await (0, cms_session_service_1.createCmsSession)(user.cmsAccount.id);
    res.cookie('genbi_cms_session', session.token, { ...cookieOptions, expires: session.expiresAt });
    return (0, request_context_middleware_1.sendSuccess)(res, { accountId: user.cmsAccount.id, role: user.cmsAccount.role, mustChangePassword: user.cmsAccount.mustChangePassword });
};
exports.loginCms = loginCms;
const logoutCms = async (req, res) => {
    const token = req.cookies?.genbi_cms_session;
    if (token)
        await (0, cms_session_service_1.revokeCmsSession)(token);
    res.clearCookie('genbi_cms_session', cookieOptions);
    return (0, request_context_middleware_1.sendSuccess)(res, null);
};
exports.logoutCms = logoutCms;
