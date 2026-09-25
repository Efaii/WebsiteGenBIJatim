import crypto from 'crypto';
import path from 'path';
import XLSX from '@e965/xlsx';
import { ImportPreviewStatus, ImportRowClassification, MembershipStatus, PublicationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { CmsSession } from '../middlewares/cms-session.middleware';
import { assertScopeAccess } from './cms-scope.service';
import {
  canonicalCommissariatSlug,
  MEMBERSHIP_EXPECTED_COUNTS,
  MEMBERSHIP_RELEASE_PERIOD,
  normalizeMembershipDivision,
} from '../domain/membership-release';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 10_000;
const REQUIRED_HEADERS = ['komisariat', 'nama', 'jabatan', 'divisi', 'prodi'] as const;
const aliases: Record<string, string> = { 'nama lengkap': 'nama', 'program studi': 'prodi' };

export type ParsedRow = { rowNumber: number; rawValues: Record<string, unknown>; normalized: { komisariat: string; nama: string; jabatan: string; divisi: string | null; prodi: string } };

export { canonicalCommissariatSlug, normalizeMembershipDivision } from '../domain/membership-release';

export const EXPECTED_MEMBERSHIP_COUNTS = MEMBERSHIP_EXPECTED_COUNTS;

export const EXPECTED_MEMBERSHIP_TOTAL = 619;

const text = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value).replace(/\s+/g, ' ').trim();
  return '';
};

const normalizeHeader = (value: unknown) => aliases[text(value).toLowerCase()] ?? text(value).toLowerCase();
const identityKey = (row: Pick<ParsedRow['normalized'], 'nama' | 'prodi'>) => [row.nama.toLowerCase(), row.prodi.toLowerCase()].join('|');
type WorkbookParseOptions = { periodLabel?: string };

export const parseMembershipWorkbook = (buffer: Buffer, options: WorkbookParseOptions = {}): { rows: ParsedRow[]; hash: string; sourceSheet: string } => {
  if (buffer.length > MAX_BYTES) throw new ApiError('VALIDATION_ERROR', 'Import file exceeds 10 MB.', 400, { file: ['Maximum 10 MB'] });
  if (!buffer.subarray(0, 2).equals(Buffer.from('PK'))) throw new ApiError('UNSUPPORTED_MEDIA_TYPE', 'Only valid XLSX workbooks are supported.', 415);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const workbook = XLSX.read(buffer, { type: 'buffer', cellFormula: false, cellDates: false });
  const validSheets = workbook.SheetNames.filter((name) => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], { header: 1, blankrows: false, defval: null });
    const headers = (rows[0] ?? []).map(normalizeHeader);
    return REQUIRED_HEADERS.every((header) => headers.includes(header));
  });
  if (validSheets.length !== 1) throw new ApiError('VALIDATION_ERROR', validSheets.length ? 'Workbook contains multiple valid sheets.' : 'Workbook has no valid sheet headers.', 400, { sheet: [validSheets.length ? 'AMBIGUOUS_SHEET' : 'INVALID_HEADER'] });
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[validSheets[0]], { header: 1, blankrows: true, defval: null });
  const headers = (matrix[0] as unknown[]).map(normalizeHeader);
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length || headers.some((header) => !REQUIRED_HEADERS.includes(header as never))) throw new ApiError('VALIDATION_ERROR', 'Workbook headers are invalid.', 400, { header: ['INVALID_HEADER'] });
  const data = matrix.slice(1).flatMap((row, index) => (row as unknown[]).some((cell) => text(cell)) ? [{ row, rowNumber: index + 2 }] : []);
  if (data.length > MAX_ROWS) throw new ApiError('VALIDATION_ERROR', 'Workbook exceeds 10,000 data rows.', 400);
  return {
    hash,
    sourceSheet: validSheets[0],
    rows: data.map(({ row, rowNumber }) => {
      const values = Object.fromEntries(headers.map((header, column) => [header, (row as unknown[])[column]]));
      const commissariatSlug = canonicalCommissariatSlug(values.komisariat);
      return { rowNumber, rawValues: values, normalized: { komisariat: text(values.komisariat), nama: text(values.nama), jabatan: text(values.jabatan), divisi: normalizeMembershipDivision(values.divisi, { commissariatSlug, periodLabel: options.periodLabel ?? MEMBERSHIP_RELEASE_PERIOD }), prodi: text(values.prodi) } };
    }),
  };
};

export type MembershipSourceValidation = {
  valid: boolean;
  errors: string[];
  totalRows: number;
  expectedTotalRows: number | null;
  commissariatCounts: Record<string, number>;
  expectedCommissariatCounts: Record<string, number> | null;
  divisionCounts: Record<string, Record<string, number>>;
  noDivisionCount: number;
  duplicateRows: number[];
  rejectedRows: Array<{ rowNumber: number; errors: string[]; normalized: ParsedRow['normalized'] }>;
  normalizationRules: Record<string, { normalized: string; count: number; rowNumbers: number[] }>;
  noDivisionCounts: Record<string, number>;
};

export const validateMembershipSource = (
  parsed: { rows: ParsedRow[]; sourceSheet: string },
  options: { expectedTotalRows?: number | null; expectedCommissariatCounts?: Record<string, number> | null } = {},
): MembershipSourceValidation => {
  const expectedTotalRows = options.expectedTotalRows ?? null;
  const expectedCommissariatCounts = options.expectedCommissariatCounts ?? null;
  const errors: string[] = [];
  const commissariatCounts: Record<string, number> = {};
  const divisionCounts: Record<string, Record<string, number>> = {};
  const duplicateRows: number[] = [];
  const rejectedRows: MembershipSourceValidation['rejectedRows'] = [];
  const seen = new Map<string, number>();
  const normalizationRules: MembershipSourceValidation['normalizationRules'] = {};
  const noDivisionCounts: Record<string, number> = {};

  if (parsed.sourceSheet !== 'Data Final') errors.push(`INVALID_SOURCE_SHEET:${parsed.sourceSheet}`);
  if (expectedTotalRows !== null && parsed.rows.length !== expectedTotalRows) errors.push(`ROW_COUNT_MISMATCH:${parsed.rows.length}`);

  parsed.rows.forEach((row) => {
    const rowErrors: string[] = [];
    const slug = canonicalCommissariatSlug(row.normalized.komisariat);
    if (!slug) rowErrors.push('INVALID_COMMISSARIAT');
    if (!row.normalized.nama) rowErrors.push('INVALID_NAME');
    if (!row.normalized.jabatan) rowErrors.push('INVALID_POSITION');
    if (!row.normalized.prodi) rowErrors.push('INVALID_STUDY_PROGRAM');

    if (slug) {
      commissariatCounts[slug] = (commissariatCounts[slug] ?? 0) + 1;
      divisionCounts[slug] ??= {};
      const division = row.normalized.divisi ?? '-';
      divisionCounts[slug][division] = (divisionCounts[slug][division] ?? 0) + 1;
      if (!row.normalized.divisi) noDivisionCounts[slug] = (noDivisionCounts[slug] ?? 0) + 1;
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
    } else {
      seen.set(identity, row.rowNumber);
    }

    if (rowErrors.length) rejectedRows.push({ rowNumber: row.rowNumber, errors: rowErrors, normalized: row.normalized });
  });

  if (expectedCommissariatCounts) {
    for (const [slug, expected] of Object.entries(expectedCommissariatCounts)) {
      if ((commissariatCounts[slug] ?? 0) !== expected) errors.push(`COMMISSARIAT_COUNT_MISMATCH:${slug}:${commissariatCounts[slug] ?? 0}`);
    }
    for (const slug of Object.keys(commissariatCounts)) {
      if (!(slug in expectedCommissariatCounts)) errors.push(`UNEXPECTED_COMMISSARIAT:${slug}`);
    }
  }

  if (rejectedRows.length) errors.push(`REJECTED_ROWS:${rejectedRows.length}`);

  return {
    valid: errors.length === 0,
    errors,
    totalRows: parsed.rows.length,
    expectedTotalRows,
    commissariatCounts,
    expectedCommissariatCounts,
    divisionCounts,
    noDivisionCount: parsed.rows.filter((row) => row.normalized.divisi === null).length,
    noDivisionCounts,
    duplicateRows,
    rejectedRows,
    normalizationRules,
  };
};

const assertImportScope = async (session: CmsSession, commissariatId: string, periodId: string) => {
  assertScopeAccess(session, { commissariatId, periodId }, 'write');
  const [commissariat, period] = await Promise.all([
    prisma.commissariat.findUnique({ where: { id: commissariatId } }),
    prisma.period.findFirst({ where: { id: periodId, commissariatId } }),
  ]);
  if (!commissariat || !period) throw new ApiError('VALIDATION_ERROR', 'Import scope is invalid.', 400, { scope: ['INVALID_SCOPE'] });
  return { commissariat, period };
};

export const createMembershipPreview = async (session: CmsSession, buffer: Buffer, sourceFilename: string, commissariatId: string, periodId: string) => {
  const { commissariat, period } = await assertImportScope(session, commissariatId, periodId);
  const parsed = parseMembershipWorkbook(buffer, { periodLabel: period.label });
  const [divisions, approvedAliases] = await Promise.all([
    prisma.division.findMany({ where: { commissariatId, periodId } }),
    prisma.membershipImportAlias.findMany({ where: { approved: true, OR: [{ commissariatId, periodId }, { commissariatId: null, periodId: null }] } }),
  ]);
  const existing = await prisma.membership.findMany({ where: { commissariatId, periodId } });
  const seen = new Set<string>();
  const results = parsed.rows.map((row) => {
    const errors: string[] = [];
    const commissariatAlias = approvedAliases.find((alias) => alias.kind === 'COMMISSARIAT' && alias.rawValue.toLowerCase() === row.normalized.komisariat.toLowerCase());
    if (row.normalized.komisariat.toLowerCase() !== commissariat.name.toLowerCase() && row.normalized.komisariat.toLowerCase() !== commissariat.slug.toLowerCase() && !commissariatAlias) errors.push('INVALID_COMMISSARIAT');
    if (!row.normalized.nama) errors.push('INVALID_ROW');
    if (!row.normalized.jabatan) errors.push('INVALID_ROW');
    if (!row.normalized.prodi) errors.push('INVALID_ROW');
    const divisionAlias = row.normalized.divisi ? approvedAliases.find((alias) => alias.kind === 'DIVISION' && alias.rawValue.toLowerCase() === row.normalized.divisi!.toLowerCase()) : null;
    const division = row.normalized.divisi ? divisions.find((item) => item.name.toLowerCase() === row.normalized.divisi!.toLowerCase() || item.id === divisionAlias?.divisionId) : null;
    if (row.normalized.divisi && !division) errors.push('UNMAPPED_DIVISION');
    const rowKey = identityKey(row.normalized);
    if (seen.has(rowKey)) errors.push('DUPLICATE_IN_FILE');
    seen.add(rowKey);
    const matches = existing.filter((item) => identityKey({ nama: item.name, prodi: item.studyProgram }) === identityKey(row.normalized));
    if (matches.length > 1) errors.push('AMBIGUOUS_MATCH');
    const matched = matches[0];
    const unchanged = matched && matched.name === row.normalized.nama && matched.position === row.normalized.jabatan && matched.studyProgram === row.normalized.prodi && (matched.divisionId ?? null) === (division?.id ?? null);
    const classification: ImportRowClassification = errors.includes('DUPLICATE_IN_FILE') ? 'DUPLICATE_IN_FILE' : errors.includes('AMBIGUOUS_MATCH') ? 'AMBIGUOUS_MATCH' : errors.length ? 'INVALID' : !matched ? 'NEW' : unchanged ? 'UNCHANGED' : 'UPDATED';
    return { row, errors, classification, matched, division };
  });
  const counts = results.reduce((acc, item) => {
    const countKey: Record<ImportRowClassification, keyof typeof acc> = {
      NEW: 'newCount', UPDATED: 'updatedCount', UNCHANGED: 'unchangedCount', INVALID: 'invalidCount', AMBIGUOUS_MATCH: 'ambiguousCount', DUPLICATE_IN_FILE: 'duplicateCount',
    };
    acc[countKey[item.classification]]++;
    return acc;
  }, { newCount: 0, updatedCount: 0, unchangedCount: 0, invalidCount: 0, ambiguousCount: 0, duplicateCount: 0 });
  const preview = await prisma.membershipImportPreview.create({ data: { cmsAccountId: session.cmsAccount.id, commissariatId, periodId, sourceFilename: path.basename(sourceFilename), sourceFileHash: parsed.hash, status: 'PREVIEW_READY', totalRows: results.length, ...counts, expiresAt: new Date(Date.now() + 30 * 60 * 1000), rows: { create: results.map((item) => ({ rowNumber: item.row.rowNumber, rawValues: item.row.rawValues as object, normalizedValues: item.row.normalized as object, classification: item.classification, errorCode: item.errors[0], errorMessage: item.errors.join(', '), matchedMembershipId: item.matched?.id, mappedDivisionId: item.division?.id, baselineUpdatedAt: item.matched?.updatedAt })) } } });
  return { previewId: preview.id, sourceFileHash: parsed.hash, sourceSheet: parsed.sourceSheet, totalRows: results.length, ...counts, rows: results.map((item) => ({ rowNumber: item.row.rowNumber, classification: item.classification, errors: item.errors, rawValues: item.row.rawValues, normalizedValues: item.row.normalized, matchedMembershipId: item.matched?.id, mappedDivisionId: item.division?.id })) };
};

export const expireMembershipImportPreviews = async (now = new Date()) => {
  const expired = await prisma.membershipImportPreview.findMany({ where: { status: 'PREVIEW_READY', expiresAt: { lt: now } }, select: { id: true, cmsAccountId: true } });
  if (!expired.length) return 0;
  await prisma.$transaction(async (tx) => {
    await tx.membershipImportPreview.updateMany({ where: { id: { in: expired.map((item) => item.id) } }, data: { status: 'EXPIRED' } });
    await tx.auditEvent.createMany({ data: expired.map((item) => ({ cmsAccountId: item.cmsAccountId, action: 'IMPORT_EXPIRED', entity: 'MEMBERSHIP_IMPORT', entityId: item.id, newStatus: 'EXPIRED' })) });
  });
  return expired.length;
};

export const purgeMembershipImportReports = async (cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) => {
  const result = await prisma.membershipImportPreview.deleteMany({ where: { updatedAt: { lt: cutoff }, status: { in: ['EXPIRED', 'FAILED', 'APPROVED', 'REJECTED', 'COMMITTED', 'SUBMITTED'] } } });
  return result.count;
};

export const commitMembershipPreview = async (session: CmsSession, previewId: string, options: { confirmLargeImport?: boolean; backupEvidenceId?: string } = {}) => {
  const preview = await prisma.membershipImportPreview.findUnique({ where: { id: previewId }, include: { rows: true } });
  if (!preview) throw new ApiError('NOT_FOUND', 'Import preview not found.', 404);
  if (preview.cmsAccountId !== session.cmsAccount.id) throw new ApiError('FORBIDDEN', 'Preview belongs to another account.', 403);
  if (preview.status === 'COMMITTED' || preview.status === 'SUBMITTED') return { previewId, status: preview.status, idempotent: true };
  if (preview.status === 'APPROVED') throw new ApiError('CONFLICT', 'Import batch is already approved.', 409);
  if (preview.status !== 'PREVIEW_READY' && preview.status !== 'REJECTED') throw new ApiError('CONFLICT', 'Import preview cannot be committed.', 409);
  if (preview.expiresAt <= new Date()) throw new ApiError('CONFLICT', 'Import preview has expired.', 409, { preview: ['PREVIEW_EXPIRED'] });
  if (preview.totalRows > 100 && (!options.confirmLargeImport || !options.backupEvidenceId?.trim())) throw new ApiError('VALIDATION_ERROR', 'Imports above 100 rows require explicit confirmation and backup evidence.', 400, { backupEvidenceId: ['REQUIRED_FOR_LARGE_IMPORT'], confirmLargeImport: ['REQUIRED_FOR_LARGE_IMPORT'] });
  if (preview.invalidCount || preview.ambiguousCount || preview.duplicateCount) throw new ApiError('VALIDATION_ERROR', 'Preview contains invalid rows.', 400);
  const matchedIds = preview.rows.map((row) => row.matchedMembershipId).filter((id): id is string => Boolean(id));
  if (matchedIds.length) {
    const current = await prisma.membership.findMany({ where: { id: { in: matchedIds } }, select: { id: true, updatedAt: true } });
    const currentById = new Map(current.map((item) => [item.id, item.updatedAt.getTime()]));
    if (preview.rows.some((row) => row.matchedMembershipId && currentById.get(row.matchedMembershipId) !== row.baselineUpdatedAt?.getTime())) {
      await prisma.membershipImportPreview.update({ where: { id: preview.id }, data: { status: ImportPreviewStatus.STALE } });
      throw new ApiError('CONFLICT', 'Import preview is stale and must be recreated.', 409, { preview: ['PREVIEW_STALE'] });
    }
  }
  const result = await prisma.$transaction(async (tx) => {
    for (const row of preview.rows) {
      const normalized = row.normalizedValues as { nama: string; jabatan: string; prodi: string };
      if (row.classification === 'NEW') {
        const created = await tx.membership.create({ data: { commissariatId: preview.commissariatId, periodId: preview.periodId, divisionId: row.mappedDivisionId, name: normalized.nama, position: normalized.jabatan, studyProgram: normalized.prodi, publicationStatus: PublicationStatus.DRAFT, membershipStatus: MembershipStatus.ACTIVE } });
        await tx.membershipImportRow.update({ where: { id: row.id }, data: { createdMembershipId: created.id } });
      }
      if (row.classification === 'UPDATED' && row.matchedMembershipId) await tx.membership.update({ where: { id: row.matchedMembershipId, updatedAt: row.baselineUpdatedAt! }, data: { divisionId: row.mappedDivisionId, name: normalized.nama, position: normalized.jabatan, studyProgram: normalized.prodi, publicationStatus: PublicationStatus.DRAFT } });
    }
    return tx.membershipImportPreview.update({ where: { id: preview.id }, data: { status: ImportPreviewStatus.COMMITTED, committedAt: new Date(), finalReport: { committed: true, backupEvidenceId: options.backupEvidenceId ?? null, largeImportConfirmed: Boolean(options.confirmLargeImport) } } });
  });
  await prisma.auditEvent.create({ data: { cmsAccountId: session.cmsAccount.id, action: 'IMPORT_COMMITTED', entity: 'MEMBERSHIP_IMPORT', entityId: preview.id, newStatus: result.status } });
  return { previewId: result.id, status: result.status, idempotent: false };
};

export const transitionMembershipImport = async (session: CmsSession, previewId: string, target: 'SUBMITTED' | 'APPROVED' | 'REJECTED', reason?: string) => {
  if (session.cmsAccount.role !== 'ADMIN_GLOBAL' && target === 'APPROVED') throw new ApiError('FORBIDDEN', 'Only ADMIN_GLOBAL can approve imports.', 403);
  const preview = await prisma.membershipImportPreview.findUnique({ where: { id: previewId }, include: { rows: true } });
  if (!preview) throw new ApiError('NOT_FOUND', 'Import batch not found.', 404);
  if (session.cmsAccount.role !== 'ADMIN_GLOBAL') {
    if (preview.cmsAccountId !== session.cmsAccount.id) throw new ApiError('FORBIDDEN', 'Import batch belongs to another CMS account.', 403);
    assertScopeAccess(session, { commissariatId: preview.commissariatId, periodId: preview.periodId }, 'write');
  }
  if (target === 'SUBMITTED' && preview.status !== 'COMMITTED') throw new ApiError('CONFLICT', 'Only committed imports can be submitted.', 409);
  if (target === 'REJECTED' && (!reason || !reason.trim())) throw new ApiError('VALIDATION_ERROR', 'Rejection reason is required.', 400);
  if (target === 'APPROVED' && preview.status !== 'SUBMITTED') throw new ApiError('CONFLICT', 'Only submitted imports can be approved.', 409);
  const updated = await prisma.$transaction(async (tx) => {
    if (target === 'APPROVED') {
      const matchedRows = preview.rows.filter((row) => row.matchedMembershipId);
      if (matchedRows.length) {
        const current = await tx.membership.findMany({ where: { id: { in: matchedRows.map((row) => row.matchedMembershipId!) } }, select: { id: true, updatedAt: true } });
        const currentById = new Map(current.map((item) => [item.id, item.updatedAt.getTime()]));
        if (matchedRows.some((row) => currentById.get(row.matchedMembershipId!) !== row.baselineUpdatedAt?.getTime())) {
          await tx.membershipImportPreview.update({ where: { id: preview.id }, data: { status: ImportPreviewStatus.STALE } });
          throw new ApiError('CONFLICT', 'Import batch is stale and must be recreated.', 409, { preview: ['PREVIEW_STALE'] });
        }
      }
    }
    const next = await tx.membershipImportPreview.update({ where: { id: preview.id }, data: { status: target, finalReport: target === 'REJECTED' ? { rejectionReason: reason } : preview.finalReport ?? undefined } });
    if (target === 'APPROVED') {
      for (const row of preview.rows) {
        const membershipId = row.createdMembershipId ?? row.matchedMembershipId;
        if (membershipId) await tx.membership.update({ where: { id: membershipId }, data: { publicationStatus: PublicationStatus.PUBLISHED } });
      }
    }
    return next;
  });
  await prisma.auditEvent.create({ data: { cmsAccountId: session.cmsAccount.id, action: `IMPORT_${target}`, entity: 'MEMBERSHIP_IMPORT', entityId: preview.id, oldStatus: preview.status, newStatus: updated.status } });
  return updated;
};
