import { Request, Response, NextFunction } from 'express';
import { getCmsSession } from '../services/cms-session.service';
import { ApiError } from '../lib/api-error';

export type CmsSession = NonNullable<Awaited<ReturnType<typeof getCmsSession>>>;
export interface CmsRequest extends Request { cmsSession?: CmsSession; }

export const requireCmsSession = async (req: CmsRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies?.genbi_cms_session as string | undefined;
  if (!token) return next(new ApiError('UNAUTHENTICATED', 'Authentication is required.', 401));
  const session = await getCmsSession(token);
  if (!session) return next(new ApiError('UNAUTHENTICATED', 'Session is invalid or expired.', 401));
  req.cmsSession = session;
  next();
};

export const requireCmsRole = (...roles: CmsSession['cmsAccount']['role'][]) => (req: CmsRequest, _res: Response, next: NextFunction) => {
  if (!req.cmsSession || !roles.includes(req.cmsSession.cmsAccount.role)) return next(new ApiError('FORBIDDEN', 'You do not have permission for this operation.', 403));
  next();
};
