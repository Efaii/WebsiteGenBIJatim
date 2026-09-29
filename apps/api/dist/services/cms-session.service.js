"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeCmsSession = exports.getCmsSession = exports.createCmsSession = void 0;
const crypto_1 = require("crypto");
const prisma_1 = require("../lib/prisma");
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const hashToken = (token) => (0, crypto_1.createHash)('sha256').update(token).digest('hex');
const createCmsSession = async (cmsAccountId) => {
    const token = (0, crypto_1.randomBytes)(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await prisma_1.prisma.cmsSession.create({ data: { cmsAccountId, tokenHash: hashToken(token), expiresAt } });
    return { token, expiresAt };
};
exports.createCmsSession = createCmsSession;
const getCmsSession = async (token) => {
    const session = await prisma_1.prisma.cmsSession.findUnique({
        where: { tokenHash: hashToken(token) },
        include: { cmsAccount: { include: { assignments: { where: { active: true } } } } },
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.cmsAccount.status !== 'ACTIVE')
        return null;
    return session;
};
exports.getCmsSession = getCmsSession;
const revokeCmsSession = async (token) => {
    await prisma_1.prisma.cmsSession.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
};
exports.revokeCmsSession = revokeCmsSession;
