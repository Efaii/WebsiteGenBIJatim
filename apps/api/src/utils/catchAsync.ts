import { Request, Response, NextFunction } from 'express';

/**
 * @function catchAsync
 * @description Wraps async express handlers to catch errors and pass them to next() automatically.
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
