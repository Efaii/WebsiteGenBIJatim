"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transitionMembershipImport = exports.commitMembershipPreview = exports.purgeMembershipImportReports = exports.expireMembershipImportPreviews = exports.createMembershipPreview = exports.validateMembershipSource = exports.parseMembershipWorkbook = exports.EXPECTED_MEMBERSHIP_TOTAL = exports.EXPECTED_MEMBERSHIP_COUNTS = exports.normalizeMembershipDivision = exports.canonicalCommissariatSlug = void 0;
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const xlsx_1 = __importDefault(require("@e965/xlsx"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const cms_scope_service_1 = require("./cms-scope.service");
const membership_release_1 = require("../domain/membership-release");
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 10000;
const REQUIRED_HEADERS = ['komisariat', 'nama', 'jabatan', 'divisi', 'prodi'];
const aliases = { 'nama lengkap': 'nama', 'program studi': 'prodi' };
var membership_release_2 = require("../domain/membership-release");
Object.defineProperty(exports, "canonicalCommissariatSlug", { enumerable: true, get: function () { return membership_release_2.canonicalCommissariatSlug; } });
Object.defineProperty(exports, "normalizeMembershipDivision", { enumerable: true, get: function () { return membership_release_2.normalizeMembershipDivision; } });
exports.EXPECTED_MEMBERSHIP_COUNTS = membership_release_1.MEMBERSHIP_EXPECTED_COUNTS;
exports.EXPECTED_MEMBERSHIP_TOTAL = 619;
const text = (value) => {
    if (typeof value === 'string' || typeof value === 'number')
        return String(value).replace(/\s+/g, ' ').trim();
    return '';
};
const normalizeHeader = (value) => aliases[text(value).toLowerCase()] ?? text(value).toLowerCase();
const identityKey = (row) => [row.nama.toLowerCase(), row.prodi.toLowerCase()].join('|');
const parseMembershipWorkbook = (buffer, options = {}) => {
    if (buffer.length > MAX_BYTES)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Import file exceeds 10 MB.', 400, { file: ['Maximum 10 MB'] });
    if (!buffer.subarray(0, 2).equals(Buffer.from('PK')))
        throw new api_error_1.ApiError('UNSUPPORTED_MEDIA_TYPE', 'Only valid XLSX workbooks are supported.', 415);
    const hash = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
    const workbook = xlsx_1.default.read(buffer, { type: 'buffer', cellFormula: false, cellDates: false });
    const validSheets = workbook.SheetNames.filter((name) => {
        const rows = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[name], { header: 1, blankrows: false, defval: null });
        const headers = (rows[0] ?? []).map(normalizeHeader);
        return REQUIRED_HEADERS.every((header) => headers.includes(header));
    });
    if (validSheets.length !== 1)
        throw new api_error_1.ApiError('VALIDATION_ERROR', validSheets.length ? 'Workbook contains multiple valid sheets.' : 'Workbook has no valid sheet headers.', 400, { sheet: [validSheets.length ? 'AMBIGUOUS_SHEET' : 'INVALID_HEADER'] });
    const matrix = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[validSheets[0]], { header: 1, blankrows: true, defval: null });
    const headers = matrix[0].map(normalizeHeader);
    const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
    if (duplicateHeaders.length || headers.some((header) => !REQUIRED_HEADERS.includes(header)))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Workbook headers are invalid.', 400, { header: ['INVALID_HEADER'] });
    const data = matrix.slice(1).flatMap((row, index) => row.some((cell) => text(cell)) ? [{ row, rowNumber: index + 2 }] : []);
    if (data.length > MAX_ROWS)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Workbook exceeds 10,000 data rows.', 400);
    return {
        hash,
        sourceSheet: validSheets[0],
        rows: data.map(({ row, rowNumber }) => {
            const values = Object.fromEntries(headers.map((header, column) => [header, row[column]]));
            const commissariatSlug = (0, membership_release_1.canonicalCommissariatSlug)(values.komisariat);
            return { rowNumber, rawValues: values, normalized: { komisariat: text(values.komisariat), nama: text(values.nama), jabatan: text(values.jabatan), divisi: (0, membership_release_1.normalizeMembershipDivision)(values.divisi, { commissariatSlug, periodLabel: options.periodLabel }), prodi: text(values.prodi) } };
        }),
    };
};
exports.parseMembershipWorkbook = parseMembershipWorkbook;
const validateMembershipSource = (parsed, options = {}) => {
    const expectedTotalRows = options.expectedTotalRows ?? null;
    const expectedCommissariatCounts = options.expectedCommissariatCounts ?? null;
    const expectedNoDivisionCount = options.expectedNoDivisionCount ?? null;
    const expectedDivisionNames = options.expectedDivisionNames ?? null;
    const errors = [];
    const commissariatCounts = {};
    const divisionCounts = {};
    const duplicateRows = [];
    const rejectedRows = [];
    const seen = new Map();
    const normalizationRules = {};
    const noDivisionCounts = {};
    if (parsed.sourceSheet !== 'Data Final')
        errors.push(`INVALID_SOURCE_SHEET:${parsed.sourceSheet}`);
    if (expectedTotalRows !== null && parsed.rows.length !== expectedTotalRows)
        errors.push(`ROW_COUNT_MISMATCH:${parsed.rows.length}`);
    if (options.requireDivisionCatalog && !expectedDivisionNames)
        errors.push('DIVISION_CATALOG_REQUIRED');
    parsed.rows.forEach((row) => {
        const rowErrors = [];
        const slug = (0, membership_release_1.canonicalCommissariatSlug)(row.normalized.komisariat);
        if (!slug)
            rowErrors.push('INVALID_COMMISSARIAT');
        if (!row.normalized.nama)
            rowErrors.push('INVALID_NAME');
        if (!row.normalized.jabatan)
            rowErrors.push('INVALID_POSITION');
        if (!row.normalized.prodi)
            rowErrors.push('INVALID_STUDY_PROGRAM');
        if (slug) {
            commissariatCounts[slug] = (commissariatCounts[slug] ?? 0) + 1;
            divisionCounts[slug] ?? (divisionCounts[slug] = {});
            const division = row.normalized.divisi ?? '-';
            divisionCounts[slug][division] = (divisionCounts[slug][division] ?? 0) + 1;
            noDivisionCounts[slug] ?? (noDivisionCounts[slug] = 0);
            if (!row.normalized.divisi)
                noDivisionCounts[slug] = (noDivisionCounts[slug] ?? 0) + 1;
            if (row.normalized.divisi && expectedDivisionNames && (!expectedDivisionNames[slug] || !expectedDivisionNames[slug].includes(row.normalized.divisi)))
                rowErrors.push('INVALID_DIVISION');
        }
        const rawDivision = text(row.rawValues.divisi);
        if (rawDivision && row.normalized.divisi && rawDivision !== row.normalized.divisi) {
            const current = normalizationRules[rawDivision] ?? { normalized: row.normalized.divisi, count: 0, rowNumbers: [] };
            current.count += 1;
            current.rowNumbers.push(row.rowNumber);
            normalizationRules[rawDivision] = current;
        }
        const identity = `${slug ?? row.normalized.komisariat.toLowerCase()}|${row.normalized.nama.toLowerCase()}|${row.normalized.prodi.toLowerCase()}`;
        const previousRow = seen.get(identity);
        if (previousRow) {
            rowErrors.push('DUPLICATE_ROW');
            duplicateRows.push(row.rowNumber);
        }
        else {
            seen.set(identity, row.rowNumber);
        }
        if (rowErrors.length)
            rejectedRows.push({ rowNumber: row.rowNumber, errors: rowErrors, normalized: row.normalized });
    });
    if (expectedCommissariatCounts) {
        for (const [slug, expected] of Object.entries(expectedCommissariatCounts)) {
            if ((commissariatCounts[slug] ?? 0) !== expected)
                errors.push(`COMMISSARIAT_COUNT_MISMATCH:${slug}:${commissariatCounts[slug] ?? 0}`);
        }
        for (const slug of Object.keys(commissariatCounts)) {
            if (!(slug in expectedCommissariatCounts))
                errors.push(`UNEXPECTED_COMMISSARIAT:${slug}`);
        }
    }
    if (rejectedRows.length)
        errors.push(`REJECTED_ROWS:${rejectedRows.length}`);
    const noDivisionCount = parsed.rows.filter((row) => row.normalized.divisi === null).length;
    if (expectedNoDivisionCount !== null && noDivisionCount !== expectedNoDivisionCount)
        errors.push(`NO_DIVISION_COUNT_MISMATCH:${noDivisionCount}`);
    return {
        valid: errors.length === 0,
        errors,
        totalRows: parsed.rows.length,
        expectedTotalRows,
        commissariatCounts,
        expectedCommissariatCounts,
        divisionCounts,
        noDivisionCount,
        noDivisionCounts,
        duplicateRows,
        rejectedRows,
        normalizationRules,
    };
};
exports.validateMembershipSource = validateMembershipSource;
const assertImportScope = async (session, commissariatId, periodId) => {
    (0, cms_scope_service_1.assertScopeAccess)(session, { commissariatId, periodId }, 'write');
    const [commissariat, period] = await Promise.all([
        prisma_1.prisma.commissariat.findUnique({ where: { id: commissariatId } }),
        prisma_1.prisma.period.findFirst({ where: { id: periodId, commissariatId } }),
    ]);
    if (!commissariat || !period)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Import scope is invalid.', 400, { scope: ['INVALID_SCOPE'] });
    return { commissariat, period };
};
const createMembershipPreview = async (session, buffer, sourceFilename, commissariatId, periodId) => {
    const { commissariat, period } = await assertImportScope(session, commissariatId, periodId);
    const parsed = (0, exports.parseMembershipWorkbook)(buffer, { periodLabel: period.label });
    const [divisions, approvedAliases] = await Promise.all([
        prisma_1.prisma.division.findMany({ where: { commissariatId, periodId } }),
        prisma_1.prisma.membershipImportAlias.findMany({ where: { approved: true, OR: [{ commissariatId, periodId }, { commissariatId: null, periodId: null }] } }),
    ]);
    const existing = await prisma_1.prisma.membership.findMany({ where: { commissariatId, periodId } });
    const seen = new Set();
    const results = parsed.rows.map((row) => {
        const errors = [];
        const commissariatAlias = approvedAliases.find((alias) => alias.kind === 'COMMISSARIAT' && alias.rawValue.toLowerCase() === row.normalized.komisariat.toLowerCase());
        if (row.normalized.komisariat.toLowerCase() !== commissariat.name.toLowerCase() && row.normalized.komisariat.toLowerCase() !== commissariat.slug.toLowerCase() && !commissariatAlias)
            errors.push('INVALID_COMMISSARIAT');
        if (!row.normalized.nama)
            errors.push('INVALID_ROW');
        if (!row.normalized.jabatan)
            errors.push('INVALID_ROW');
        if (!row.normalized.prodi)
            errors.push('INVALID_ROW');
        const divisionAlias = row.normalized.divisi ? approvedAliases.find((alias) => alias.kind === 'DIVISION' && alias.rawValue.toLowerCase() === row.normalized.divisi.toLowerCase()) : null;
        const division = row.normalized.divisi ? divisions.find((item) => item.name.toLowerCase() === row.normalized.divisi.toLowerCase() || item.id === divisionAlias?.divisionId) : null;
        if (row.normalized.divisi && !division)
            errors.push('UNMAPPED_DIVISION');
        const rowKey = identityKey(row.normalized);
        if (seen.has(rowKey))
            errors.push('DUPLICATE_IN_FILE');
        seen.add(rowKey);
        const matches = existing.filter((item) => identityKey({ nama: item.name, prodi: item.studyProgram }) === identityKey(row.normalized));
        if (matches.length > 1)
            errors.push('AMBIGUOUS_MATCH');
        const matched = matches[0];
        const unchanged = matched && matched.name === row.normalized.nama && matched.position === row.normalized.jabatan && matched.studyProgram === row.normalized.prodi && (matched.divisionId ?? null) === (division?.id ?? null);
        const classification = errors.includes('DUPLICATE_IN_FILE') ? 'DUPLICATE_IN_FILE' : errors.includes('AMBIGUOUS_MATCH') ? 'AMBIGUOUS_MATCH' : errors.length ? 'INVALID' : !matched ? 'NEW' : unchanged ? 'UNCHANGED' : 'UPDATED';
        return { row, errors, classification, matched, division };
    });
    const counts = results.reduce((acc, item) => {
        const countKey = {
            NEW: 'newCount', UPDATED: 'updatedCount', UNCHANGED: 'unchangedCount', INVALID: 'invalidCount', AMBIGUOUS_MATCH: 'ambiguousCount', DUPLICATE_IN_FILE: 'duplicateCount',
        };
        acc[countKey[item.classification]]++;
        return acc;
    }, { newCount: 0, updatedCount: 0, unchangedCount: 0, invalidCount: 0, ambiguousCount: 0, duplicateCount: 0 });
    const preview = await prisma_1.prisma.membershipImportPreview.create({ data: { cmsAccountId: session.cmsAccount.id, commissariatId, periodId, sourceFilename: path_1.default.basename(sourceFilename), sourceFileHash: parsed.hash, status: 'PREVIEW_READY', totalRows: results.length, ...counts, expiresAt: new Date(Date.now() + 30 * 60 * 1000), rows: { create: results.map((item) => ({ rowNumber: item.row.rowNumber, rawValues: item.row.rawValues, normalizedValues: item.row.normalized, classification: item.classification, errorCode: item.errors[0], errorMessage: item.errors.join(', '), matchedMembershipId: item.matched?.id, mappedDivisionId: item.division?.id, baselineUpdatedAt: item.matched?.updatedAt })) } } });
    return { previewId: preview.id, sourceFileHash: parsed.hash, sourceSheet: parsed.sourceSheet, totalRows: results.length, ...counts, rows: results.map((item) => ({ rowNumber: item.row.rowNumber, classification: item.classification, errors: item.errors, rawValues: item.row.rawValues, normalizedValues: item.row.normalized, matchedMembershipId: item.matched?.id, mappedDivisionId: item.division?.id })) };
};
exports.createMembershipPreview = createMembershipPreview;
const expireMembershipImportPreviews = async (now = new Date()) => {
    const expired = await prisma_1.prisma.membershipImportPreview.findMany({ where: { status: 'PREVIEW_READY', expiresAt: { lt: now } }, select: { id: true, cmsAccountId: true } });
    if (!expired.length)
        return 0;
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.membershipImportPreview.updateMany({ where: { id: { in: expired.map((item) => item.id) } }, data: { status: 'EXPIRED' } });
        await tx.auditEvent.createMany({ data: expired.map((item) => ({ cmsAccountId: item.cmsAccountId, action: 'IMPORT_EXPIRED', entity: 'MEMBERSHIP_IMPORT', entityId: item.id, newStatus: 'EXPIRED' })) });
    });
    return expired.length;
};
exports.expireMembershipImportPreviews = expireMembershipImportPreviews;
const purgeMembershipImportReports = async (cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) => {
    const result = await prisma_1.prisma.membershipImportPreview.deleteMany({ where: { updatedAt: { lt: cutoff }, status: { in: ['EXPIRED', 'FAILED', 'APPROVED', 'REJECTED', 'COMMITTED', 'SUBMITTED'] } } });
    return result.count;
};
exports.purgeMembershipImportReports = purgeMembershipImportReports;
const commitMembershipPreview = async (session, previewId, options = {}) => {
    const preview = await prisma_1.prisma.membershipImportPreview.findUnique({ where: { id: previewId }, include: { rows: true } });
    if (!preview)
        throw new api_error_1.ApiError('NOT_FOUND', 'Import preview not found.', 404);
    if (preview.cmsAccountId !== session.cmsAccount.id)
        throw new api_error_1.ApiError('FORBIDDEN', 'Preview belongs to another account.', 403);
    if (preview.status === 'COMMITTED' || preview.status === 'SUBMITTED')
        return { previewId, status: preview.status, idempotent: true };
    if (preview.status === 'APPROVED')
        throw new api_error_1.ApiError('CONFLICT', 'Import batch is already approved.', 409);
    if (preview.status !== 'PREVIEW_READY' && preview.status !== 'REJECTED')
        throw new api_error_1.ApiError('CONFLICT', 'Import preview cannot be committed.', 409);
    if (preview.expiresAt <= new Date())
        throw new api_error_1.ApiError('CONFLICT', 'Import preview has expired.', 409, { preview: ['PREVIEW_EXPIRED'] });
    if (preview.totalRows > 100 && (!options.confirmLargeImport || !options.backupEvidenceId?.trim()))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Imports above 100 rows require explicit confirmation and backup evidence.', 400, { backupEvidenceId: ['REQUIRED_FOR_LARGE_IMPORT'], confirmLargeImport: ['REQUIRED_FOR_LARGE_IMPORT'] });
    if (preview.invalidCount || preview.ambiguousCount || preview.duplicateCount)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Preview contains invalid rows.', 400);
    const matchedIds = preview.rows.map((row) => row.matchedMembershipId).filter((id) => Boolean(id));
    if (matchedIds.length) {
        const current = await prisma_1.prisma.membership.findMany({ where: { id: { in: matchedIds } }, select: { id: true, updatedAt: true } });
        const currentById = new Map(current.map((item) => [item.id, item.updatedAt.getTime()]));
        if (preview.rows.some((row) => row.matchedMembershipId && currentById.get(row.matchedMembershipId) !== row.baselineUpdatedAt?.getTime())) {
            await prisma_1.prisma.membershipImportPreview.update({ where: { id: preview.id }, data: { status: client_1.ImportPreviewStatus.STALE } });
            throw new api_error_1.ApiError('CONFLICT', 'Import preview is stale and must be recreated.', 409, { preview: ['PREVIEW_STALE'] });
        }
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        for (const row of preview.rows) {
            const normalized = row.normalizedValues;
            if (row.classification === 'NEW') {
                const created = await tx.membership.create({ data: { commissariatId: preview.commissariatId, periodId: preview.periodId, divisionId: row.mappedDivisionId, name: normalized.nama, position: normalized.jabatan, studyProgram: normalized.prodi, publicationStatus: client_1.PublicationStatus.DRAFT, membershipStatus: client_1.MembershipStatus.ACTIVE } });
                await tx.membershipImportRow.update({ where: { id: row.id }, data: { createdMembershipId: created.id } });
            }
            if (row.classification === 'UPDATED' && row.matchedMembershipId)
                await tx.membership.update({ where: { id: row.matchedMembershipId, updatedAt: row.baselineUpdatedAt }, data: { divisionId: row.mappedDivisionId, name: normalized.nama, position: normalized.jabatan, studyProgram: normalized.prodi, publicationStatus: client_1.PublicationStatus.DRAFT } });
        }
        return tx.membershipImportPreview.update({ where: { id: preview.id }, data: { status: client_1.ImportPreviewStatus.COMMITTED, committedAt: new Date(), finalReport: { committed: true, backupEvidenceId: options.backupEvidenceId ?? null, largeImportConfirmed: Boolean(options.confirmLargeImport) } } });
    });
    await prisma_1.prisma.auditEvent.create({ data: { cmsAccountId: session.cmsAccount.id, action: 'IMPORT_COMMITTED', entity: 'MEMBERSHIP_IMPORT', entityId: preview.id, newStatus: result.status } });
    return { previewId: result.id, status: result.status, idempotent: false };
};
exports.commitMembershipPreview = commitMembershipPreview;
const transitionMembershipImport = async (session, previewId, target, reason) => {
    if (session.cmsAccount.role !== 'ADMIN_GLOBAL' && target === 'APPROVED')
        throw new api_error_1.ApiError('FORBIDDEN', 'Only ADMIN_GLOBAL can approve imports.', 403);
    const preview = await prisma_1.prisma.membershipImportPreview.findUnique({ where: { id: previewId }, include: { rows: true } });
    if (!preview)
        throw new api_error_1.ApiError('NOT_FOUND', 'Import batch not found.', 404);
    if (session.cmsAccount.role !== 'ADMIN_GLOBAL') {
        if (preview.cmsAccountId !== session.cmsAccount.id)
            throw new api_error_1.ApiError('FORBIDDEN', 'Import batch belongs to another CMS account.', 403);
        (0, cms_scope_service_1.assertScopeAccess)(session, { commissariatId: preview.commissariatId, periodId: preview.periodId }, 'write');
    }
    if (target === 'SUBMITTED' && preview.status !== 'COMMITTED')
        throw new api_error_1.ApiError('CONFLICT', 'Only committed imports can be submitted.', 409);
    if (target === 'REJECTED' && (!reason || !reason.trim()))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Rejection reason is required.', 400);
    if (target === 'APPROVED' && preview.status !== 'SUBMITTED')
        throw new api_error_1.ApiError('CONFLICT', 'Only submitted imports can be approved.', 409);
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        if (target === 'APPROVED') {
            const matchedRows = preview.rows.filter((row) => row.matchedMembershipId);
            if (matchedRows.length) {
                const current = await tx.membership.findMany({ where: { id: { in: matchedRows.map((row) => row.matchedMembershipId) } }, select: { id: true, updatedAt: true } });
                const currentById = new Map(current.map((item) => [item.id, item.updatedAt.getTime()]));
                if (matchedRows.some((row) => currentById.get(row.matchedMembershipId) !== row.baselineUpdatedAt?.getTime())) {
                    await tx.membershipImportPreview.update({ where: { id: preview.id }, data: { status: client_1.ImportPreviewStatus.STALE } });
                    throw new api_error_1.ApiError('CONFLICT', 'Import batch is stale and must be recreated.', 409, { preview: ['PREVIEW_STALE'] });
                }
            }
        }
        const next = await tx.membershipImportPreview.update({ where: { id: preview.id }, data: { status: target, finalReport: target === 'REJECTED' ? { rejectionReason: reason } : preview.finalReport ?? undefined } });
        if (target === 'APPROVED') {
            for (const row of preview.rows) {
                const membershipId = row.createdMembershipId ?? row.matchedMembershipId;
                if (membershipId)
                    await tx.membership.update({ where: { id: membershipId }, data: { publicationStatus: client_1.PublicationStatus.PUBLISHED } });
            }
        }
        return next;
    });
    await prisma_1.prisma.auditEvent.create({ data: { cmsAccountId: session.cmsAccount.id, action: `IMPORT_${target}`, entity: 'MEMBERSHIP_IMPORT', entityId: preview.id, oldStatus: preview.status, newStatus: updated.status } });
    return updated;
};
exports.transitionMembershipImport = transitionMembershipImport;
