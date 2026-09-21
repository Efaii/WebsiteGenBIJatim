import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { CmsSession } from '../middlewares/cms-session.middleware';

export const reviewImportAlias = async (session: CmsSession, input: { kind: string; rawValue: string; commissariatId?: string; periodId?: string; divisionId?: string }) => {
  if (session.cmsAccount.role !== 'ADMIN_GLOBAL') throw new ApiError('FORBIDDEN', 'Only ADMIN_GLOBAL can review import mappings.', 403);
  if (input.kind === 'DIVISION') {
    if (!input.commissariatId || !input.periodId || !input.divisionId) throw new ApiError('VALIDATION_ERROR', 'Division mappings require commissariat, period, and division scope.', 400, { scope: ['INVALID_SCOPE'] });
    const division = await prisma.division.findFirst({ where: { id: input.divisionId, commissariatId: input.commissariatId, periodId: input.periodId } });
    if (!division) throw new ApiError('VALIDATION_ERROR', 'Division mapping is outside the selected scope.', 400, { divisionId: ['INVALID_DIVISION'] });
  }
  if (input.periodId && input.commissariatId) {
    const period = await prisma.period.findFirst({ where: { id: input.periodId, commissariatId: input.commissariatId } });
    if (!period) throw new ApiError('VALIDATION_ERROR', 'Alias scope is invalid.', 400, { scope: ['INVALID_SCOPE'] });
  }
  const where = { kind: input.kind, rawValue: input.rawValue.trim(), commissariatId: input.commissariatId ?? null, periodId: input.periodId ?? null };
  const existing = await prisma.membershipImportAlias.findFirst({ where });
  const alias = existing
    ? await prisma.membershipImportAlias.update({ where: { id: existing.id }, data: { divisionId: input.divisionId, approved: true, reviewedBy: session.cmsAccount.id, reviewedAt: new Date() } })
    : await prisma.membershipImportAlias.create({ data: { ...input, rawValue: input.rawValue.trim(), approved: true, reviewedBy: session.cmsAccount.id, reviewedAt: new Date() } });
  await prisma.auditEvent.create({ data: { cmsAccountId: session.cmsAccount.id, action: 'IMPORT_MAPPING_REVIEWED', entity: 'MEMBERSHIP_IMPORT_ALIAS', entityId: alias.id, newStatus: 'APPROVED' } });
  return alias;
};
