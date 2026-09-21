import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const errorObj = err as { status?: number; statusCode?: number; name?: string; message?: string; code?: string; errors?: unknown; fields?: unknown };
  const requestId = res.locals?.requestId ?? req.header?.('x-request-id') ?? 'unknown';

  // Prisma Known Request Error handling
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. P2002)
    if (err.code === 'P2002') {
      const targets = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : String(err.meta.target)) : 'field';
      return res.status(409).json({ error: { code: 'CONFLICT', message: `A record with this ${targets} already exists.` }, meta: { requestId } });
    }
    // Foreign key constraint failed (P2003)
    if (err.code === 'P2003') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid reference or foreign key constraint failed.' }, meta: { requestId } });
    }
    // Record to update/delete not found (P2025)
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found.' }, meta: { requestId } });
    }
    // Other Prisma client request errors
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Database request could not be completed.' }, meta: { requestId } });
  }

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Database validation failed. Please check your inputs.' }, meta: { requestId } });
  }

  // Custom App / Express status error
  const status = errorObj.status || errorObj.statusCode || (errorObj.name === 'ValidationError' ? 400 : 500);
  const message = errorObj.message || 'Internal Server Error';

  if (status >= 500) {
    console.error('[Unhandled Error]:', err);
  }

  const code = errorObj.code && ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'UNSUPPORTED_MEDIA_TYPE', 'RATE_LIMITED', 'INTERNAL_ERROR'].includes(errorObj.code) ? errorObj.code : status >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_ERROR';
  const fields = errorObj.fields ?? errorObj.errors;
  return res.status(status).json({ error: { code, message: status >= 500 ? 'Internal server error.' : message, ...(fields && typeof fields === 'object' ? { fields } : {}) }, meta: { requestId } });
};
