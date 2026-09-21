import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendSuccess } from '../middlewares/request-context.middleware';

export const getCanonicalMasters = async (_req: Request, res: Response) => {
  const commissariats = await prisma.commissariat.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, include: { periods: { orderBy: { label: 'desc' }, include: { divisions: { orderBy: { name: 'asc' }, select: { id: true, name: true } } } } } });
  return sendSuccess(res, commissariats.map((item) => ({ id: item.id, slug: item.slug, name: item.name, periods: item.periods.map((period) => ({ id: period.id, label: period.label, divisions: period.divisions })) })));
};
