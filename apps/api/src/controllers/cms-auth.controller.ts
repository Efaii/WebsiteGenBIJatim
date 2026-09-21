import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { createCmsSession, revokeCmsSession } from '../services/cms-session.service';
import { CmsRequest } from '../middlewares/cms-session.middleware';
import { sendSuccess } from '../middlewares/request-context.middleware';

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api/v1' };

export const loginCms = async (req: Request, res: Response) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!username || !password) throw new ApiError('VALIDATION_ERROR', 'Username and password are required.', 400);
  const user = await prisma.user.findUnique({ where: { username }, include: { cmsAccount: true } });
  if (!user?.cmsAccount || user.cmsAccount.status !== 'ACTIVE' || !(await bcrypt.compare(password, user.password))) throw new ApiError('UNAUTHENTICATED', 'Invalid credentials.', 401);
  const session = await createCmsSession(user.cmsAccount.id);
  res.cookie('genbi_cms_session', session.token, { ...cookieOptions, expires: session.expiresAt });
  return sendSuccess(res, { accountId: user.cmsAccount.id, role: user.cmsAccount.role, mustChangePassword: user.cmsAccount.mustChangePassword });
};

export const logoutCms = async (req: CmsRequest, res: Response) => {
  const token = req.cookies?.genbi_cms_session as string | undefined;
  if (token) await revokeCmsSession(token);
  res.clearCookie('genbi_cms_session', cookieOptions);
  return sendSuccess(res, null);
};
