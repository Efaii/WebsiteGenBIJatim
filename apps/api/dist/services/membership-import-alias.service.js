"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewImportAlias = void 0;
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const reviewImportAlias = async (session, input) => {
    if (session.cmsAccount.role !== 'ADMIN_GLOBAL')
        throw new api_error_1.ApiError('FORBIDDEN', 'Only ADMIN_GLOBAL can review import mappings.', 403);
    if (input.kind === 'DIVISION') {
        if (!input.commissariatId || !input.periodId || !input.divisionId)
            throw new api_error_1.ApiError('VALIDATION_ERROR', 'Division mappings require commissariat, period, and division scope.', 400, { scope: ['INVALID_SCOPE'] });
        const division = await prisma_1.prisma.division.findFirst({ where: { id: input.divisionId, commissariatId: input.commissariatId, periodId: input.periodId } });
        if (!division)
            throw new api_error_1.ApiError('VALIDATION_ERROR', 'Division mapping is outside the selected scope.', 400, { divisionId: ['INVALID_DIVISION'] });
    }
    if (input.periodId && input.commissariatId) {
        const period = await prisma_1.prisma.period.findFirst({ where: { id: input.periodId, commissariatId: input.commissariatId } });
        if (!period)
            throw new api_error_1.ApiError('VALIDATION_ERROR', 'Alias scope is invalid.', 400, { scope: ['INVALID_SCOPE'] });
    }
    const where = { kind: input.kind, rawValue: input.rawValue.trim(), commissariatId: input.commissariatId ?? null, periodId: input.periodId ?? null };
    const existing = await prisma_1.prisma.membershipImportAlias.findFirst({ where });
    const alias = existing
        ? await prisma_1.prisma.membershipImportAlias.update({ where: { id: existing.id }, data: { divisionId: input.divisionId, approved: true, reviewedBy: session.cmsAccount.id, reviewedAt: new Date() } })
        : await prisma_1.prisma.membershipImportAlias.create({ data: { ...input, rawValue: input.rawValue.trim(), approved: true, reviewedBy: session.cmsAccount.id, reviewedAt: new Date() } });
    await prisma_1.prisma.auditEvent.create({ data: { cmsAccountId: session.cmsAccount.id, action: 'IMPORT_MAPPING_REVIEWED', entity: 'MEMBERSHIP_IMPORT_ALIAS', entityId: alias.id, newStatus: 'APPROVED' } });
    return alias;
};
exports.reviewImportAlias = reviewImportAlias;
