import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const errorObj = err as { status?: number; statusCode?: number; name?: string; message?: string; errors?: unknown };

  // Prisma Known Request Error handling
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. P2002)
    if (err.code === 'P2002') {
      const targets = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : String(err.meta.target)) : 'field';
      return res.status(409).json({
        message: `A record with this ${targets} already exists.`,
        code: err.code,
        target: err.meta?.target,
      });
    }
    // Foreign key constraint failed (P2003)
    if (err.code === 'P2003') {
      return res.status(400).json({
        message: 'Invalid reference or foreign key constraint failed.',
        code: err.code,
      });
    }
    // Record to update/delete not found (P2025)
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: (err.meta?.cause as string) || 'Record not found.',
        code: err.code,
      });
    }
    // Other Prisma client request errors
    return res.status(400).json({
      message: err.message,
      code: err.code,
    });
  }

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: 'Database validation failed. Please check your inputs.',
      details: err.message,
    });
  }

  // Custom App / Express status error
  const status = errorObj.status || errorObj.statusCode || (errorObj.name === 'ValidationError' ? 400 : 500);
  const message = errorObj.message || 'Internal Server Error';

  if (status >= 500) {
    console.error('[Unhandled Error]:', err);
  }

  return res.status(status).json({
    message,
    ...(errorObj.errors ? { errors: errorObj.errors } : {}),
  });
};
