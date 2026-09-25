import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { projectPublicAwardee } from '../domain/public-membership';
import { MEMBERSHIP_RELEASE_PERIOD } from '../domain/membership-release';
import { sendSuccess } from '../middlewares/request-context.middleware';

export const getAwardees = async (req: Request, res: Response) => {
  const periodId = typeof req.query.periodId === 'string' ? req.query.periodId : undefined;
  const periodLabel = typeof req.query.periodLabel === 'string' ? req.query.periodLabel : MEMBERSHIP_RELEASE_PERIOD;
  const periodFilter = periodId ? { periodId } : { period: { label: periodLabel } };
  const items = await prisma.membership.findMany({
    where: {
      publicationStatus: 'PUBLISHED',
      membershipStatus: 'ACTIVE',
      ...(typeof req.query.commissariatId === 'string' ? { commissariatId: req.query.commissariatId } : {}),
      ...periodFilter,
      ...(typeof req.query.commissariatSlug === 'string' ? { commissariat: { slug: req.query.commissariatSlug } } : {}),
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
  return sendSuccess(res, items.map(projectPublicAwardee));
};
