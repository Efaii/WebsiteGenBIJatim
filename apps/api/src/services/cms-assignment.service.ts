import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';

export const assertOneActiveAssignment = async (cmsAccountId: string, excludeId?: string) => {
  const existing = await prisma.cmsAssignment.findFirst({ where: { cmsAccountId, active: true, ...(excludeId ? { id: { not: excludeId } } : {}) } });
  if (existing) throw new ApiError('CONFLICT', 'A CMS account may have only one active assignment.', 409);
};

export const getActiveAssignment = async (cmsAccountId: string) => {
  const assignments = await prisma.cmsAssignment.findMany({ where: { cmsAccountId, active: true }, take: 2 });
  if (assignments.length > 1) throw new ApiError('CONFLICT', 'CMS account has multiple active assignments.', 409);
  return assignments[0] ?? null;
};
