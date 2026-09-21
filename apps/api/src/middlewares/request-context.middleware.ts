import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.header('x-request-id')?.trim() || randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

export const sendSuccess = <T>(res: Response, data: T, meta: Record<string, unknown> = {}) =>
  res.json({ data, meta: { requestId: res.locals.requestId, ...meta } });
