import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { CmsSession } from '../middlewares/cms-session.middleware';

export const reviewImportAlias = async (session: CmsSession, input: { kind: string; rawValue: string; commissariatId?: string; periodId?: string; divisionId?: string }) => {
  if (session.cmsAccount.role !== 'ADMIN_GLOBAL') throw new ApiError('FORBIDDEN', 'Only ADMIN_GLOBAL can review import mappings.', 403);
  const where = { kind: input.kind, rawValue: input.rawValue.trim(), commissariatId: input.commissariatId ?? null, periodId: input.periodId ?? null };
  const existing = await prisma.membershipImportAlias.findFirst({ where });
  const alias = existing
    ? await prisma.membershipImportAlias.update({ where: { id: existing.id }, data: { divisionId: input.divisionId, approved: true, reviewedBy: session.cmsAccount.id, reviewedAt: new Date() } })
    : await prisma.membershipImportAlias.create({ data: { ...input, rawValue: input.rawValue.trim(), approved: true, reviewedBy: session.cmsAccount.id, reviewedAt: new Date() } });
  await prisma.auditEvent.create({ data: { cmsAccountId: session.cmsAccount.id, action: 'IMPORT_MAPPING_REVIEWED', entity: 'MEMBERSHIP_IMPORT_ALIAS', entityId: alias.id, newStatus: 'APPROVED' } });
  return alias;
};
