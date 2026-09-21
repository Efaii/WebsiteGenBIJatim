import { createHash, randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const createCmsSession = async (cmsAccountId: string) => {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.cmsSession.create({ data: { cmsAccountId, tokenHash: hashToken(token), expiresAt } });
  return { token, expiresAt };
};

export const getCmsSession = async (token: string) => {
  const session = await prisma.cmsSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { cmsAccount: { include: { assignments: { where: { active: true } } } } },
  });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.cmsAccount.status !== 'ACTIVE') return null;
  return session;
};

export const revokeCmsSession = async (token: string) => {
  await prisma.cmsSession.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
};
