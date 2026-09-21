import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendSuccess } from '../middlewares/request-context.middleware';

export const listPublishedMemberships = async (req: Request, res: Response) => {
  const items = await prisma.membership.findMany({
    where: {
      publicationStatus: 'PUBLISHED',
      membershipStatus: 'ACTIVE',
      ...(typeof req.query.commissariatId === 'string' ? { commissariatId: req.query.commissariatId } : {}),
      ...(typeof req.query.periodId === 'string' ? { periodId: req.query.periodId } : {}),
    },
    select: { id: true, name: true, position: true, studyProgram: true, division: { select: { name: true } }, commissariat: { select: { slug: true, name: true } }, period: { select: { label: true } } },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  });
  return sendSuccess(res, items.map((item) => ({ id: item.id, name: item.name, position: item.position, studyProgram: item.studyProgram, division: item.division?.name ?? '-', commissariat: item.commissariat, period: item.period.label })));
};
