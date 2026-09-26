import { Request, Response } from 'express';
import { DEFAULT_PUBLIC_PERIOD, PUBLIC_PERIODS } from '../domain/public-periods';
import { sendSuccess } from '../middlewares/request-context.middleware';

export const listPublicPeriods = async (_req: Request, res: Response) =>
  sendSuccess(res, {
    periods: [...PUBLIC_PERIODS],
    defaultPeriod: DEFAULT_PUBLIC_PERIOD,
  });
