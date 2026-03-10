import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * @middleware GlobalErrorHandler
 * @description Centralized error handler that formats and sends uniform error responses.
 */
export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // Log unexpected errors for developers, but don't leak details to clients
    console.error('UNEXPECTED ERROR 💥:', err);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
