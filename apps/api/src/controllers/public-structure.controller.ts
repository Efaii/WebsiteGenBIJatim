import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { DEFAULT_PUBLIC_PERIOD, PUBLIC_PERIODS } from '../domain/public-periods';
import { buildPublicStructure } from '../domain/public-structure';
import { sendSuccess } from '../middlewares/request-context.middleware';

const prisma = new PrismaClient();

const sendError = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ error: { code, message }, meta: { requestId: res.locals.requestId } });

/**
 * GET /api/v1/commissariats/:slug/structure?period=2025/2026
 *
 * Returns the public structure for one commissariat and period, derived from
 * ACTIVE + PUBLISHED Membership rows.
 */
export const getCommissariatStructure = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const requested =
    typeof req.query.period === 'string' && req.query.period.trim()
      ? req.query.period.trim()
      : DEFAULT_PUBLIC_PERIOD;
  const period = PUBLIC_PERIODS.find((label) => label === requested);
  if (!period) return sendError(res, 400, 'VALIDATION_ERROR', `Unknown period "${requested}".`);

  const commissariat = await prisma.commissariat.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });
  if (!commissariat) return sendError(res, 404, 'NOT_FOUND', 'Komisariat tidak ditemukan');

  const memberships = await prisma.membership.findMany({
    where: {
      commissariatId: commissariat.id,
      period: { label: period },
      publicationStatus: 'PUBLISHED',
      membershipStatus: 'ACTIVE',
    },
    select: { name: true, position: true, division: { select: { name: true } } },
  });

  const structure = buildPublicStructure(memberships);
  return sendSuccess(res, {
    commissariat: { slug: commissariat.slug, name: commissariat.name },
    period,
    ...structure,
  });
};
