import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { DEFAULT_PUBLIC_PERIOD, PUBLIC_PERIODS } from '../domain/public-periods';
import { projectPublicAwardee, summarizeAwardeesByCommissariat } from '../domain/public-membership';
import { sendSuccess } from '../middlewares/request-context.middleware';

const prisma = new PrismaClient();

const sendError = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ error: { code, message }, meta: { requestId: res.locals.requestId } });

/**
 * GET /api/v1/awardees?period=2025/2026&commissariatSlug=its
 *
 * Lists every awardee (Membership ACTIVE + PUBLISHED) for a period, with an
 * optional commissariat filter and a per-commissariat count summary.
 */
export const listPublicAwardees = async (req: Request, res: Response) => {
  const requested =
    typeof req.query.period === 'string' && req.query.period.trim()
      ? req.query.period.trim()
      : DEFAULT_PUBLIC_PERIOD;
  const period = PUBLIC_PERIODS.find((label) => label === requested);
  if (!period) return sendError(res, 400, 'VALIDATION_ERROR', `Unknown period "${requested}".`);

  const commissariatSlug =
    typeof req.query.commissariatSlug === 'string' && req.query.commissariatSlug.trim()
      ? req.query.commissariatSlug.trim()
      : undefined;

  const memberships = await prisma.membership.findMany({
    where: {
      publicationStatus: 'PUBLISHED',
      membershipStatus: 'ACTIVE',
      period: { label: period },
      ...(commissariatSlug ? { commissariat: { slug: commissariatSlug } } : {}),
    },
    select: {
      id: true,
      name: true,
      position: true,
      studyProgram: true,
      division: { select: { name: true } },
      commissariat: { select: { slug: true, name: true } },
      period: { select: { label: true } },
    },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  });

  const awardees = memberships.map(projectPublicAwardee);

  return sendSuccess(res, {
    period,
    awardees,
    summary: {
      total: awardees.length,
      byCommissariat: summarizeAwardeesByCommissariat(awardees),
    },
  });
};
