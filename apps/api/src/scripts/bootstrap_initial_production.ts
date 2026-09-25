import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  MEMBERSHIP_EXPECTED_COUNTS,
  MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS,
  MEMBERSHIP_RELEASE_DIVISIONS,
  MEMBERSHIP_RELEASE_PERIOD,
  MEMBERSHIP_SOURCE_SHA256,
} from '../domain/membership-release';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SOURCE_DATABASE = 'genbi_jatim';
const TARGET_DATABASE = 'genbi_jatim_initial_production';
const SCHEMA_APPROVAL = 'SETUJUI SCHEMA MIGRASI';
const DATA_APPROVAL = 'SETUJUI DATA MIGRASI';
const PROGRAM_PERIOD_APPROVAL = 'SETUJUI PROGRAM KERJA 2025/2026';
const PROGRAM_TOTAL = 153;
const CHILD_PHOTO_TOTAL = 431;
const PERIOD_LABEL = MEMBERSHIP_RELEASE_PERIOD;
const CANONICAL_COMMISSARIAT_SLUGS = new Set(Object.keys(MEMBERSHIP_EXPECTED_COUNTS));
const REQUIRED_LEGACY_TABLES = [
  'auditevent', 'cmsaccount', 'cmsassignment', 'cmssession', 'commissariat', 'contact_messages',
  'division', 'faq', 'membership', 'membershipimportalias', 'membershipimportpreview',
  'membershipimportrow', 'news', 'newscoverasset', 'newsrevision', 'newsslugalias', 'period',
  'program_kerja', 'testimonial', 'user',
];
const REPORT_DIR = process.env.INITIAL_PRODUCTION_REPORT_DIR
  ? path.resolve(process.env.INITIAL_PRODUCTION_REPORT_DIR)
  : path.resolve(__dirname, '../../../../artifacts/initial-production');

const databaseName = (value: string) => decodeURIComponent(new URL(value).pathname.replace(/^\//, ''));
const databaseIdentity = (value: string) => {
  const url = new URL(value);
  return `${url.hostname}:${url.port || '3306'}/${databaseName(value)}`;
};

const jsonValue = (value: Prisma.JsonValue | null): Prisma.InputJsonValue | Prisma.JsonNullValueInput =>
  value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;

const canonicalize = (value: unknown): unknown => Array.isArray(value)
  ? value.map(canonicalize)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value as Record<string, unknown>).sort().map((key) => [key, canonicalize((value as Record<string, unknown>)[key])]))
    : value;

const restoreEvidenceSha256 = (evidence: Record<string, unknown>) => {
  const { evidenceSha256: _ignored, ...unsignedEvidence } = evidence;
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(unsignedEvidence))).digest('hex');
};

const assertValidRestoreEvidence = (evidence: Record<string, unknown>, target: string) => {
  const expiry = typeof evidence.expiresAt === 'string' ? Date.parse(evidence.expiresAt) : Number.NaN;
  const verifiedAt = typeof evidence.verifiedAt === 'string' ? Date.parse(evidence.verifiedAt) : Number.NaN;
  const reports = [evidence.source, evidence.restoredDatabase, evidence.sourceAfter] as Array<Record<string, unknown> | undefined>;
  const hasRequiredInventory = (report: Record<string, unknown> | undefined) => {
    const tables = report?.requiredLegacyTables;
    const missing = report?.missingRequiredTables;
    const inventory = report?.tables;
    const required = Array.isArray(tables) ? tables.map((table) => String(table).toLowerCase()) : [];
    const actual = Array.isArray(inventory) ? new Set(inventory.map((table) => String(table).toLowerCase())) : new Set<string>();
    return required.length === REQUIRED_LEGACY_TABLES.length
      && new Set(required).size === REQUIRED_LEGACY_TABLES.length
      && REQUIRED_LEGACY_TABLES.every((table) => required.includes(table))
      && REQUIRED_LEGACY_TABLES.every((table) => actual.has(table))
      && Array.isArray(missing)
      && missing.length === 0;
  };
  if (evidence.status !== 'verified' || evidence.sourceDatabase !== target || typeof evidence.restoreDatabase !== 'string' || !/^genbi_restore_[a-zA-Z0-9_]+$/.test(evidence.restoreDatabase) || typeof evidence.backupSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(evidence.backupSha256) || typeof evidence.evidenceSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(evidence.evidenceSha256) || evidence.evidenceSha256 !== restoreEvidenceSha256(evidence) || !Number.isFinite(verifiedAt) || !Number.isFinite(expiry) || expiry <= Date.now() || reports.some((report) => !report || report.database !== (report === evidence.restoredDatabase ? evidence.restoreDatabase : target) || !hasRequiredInventory(report) || typeof report.programCount !== 'number' || typeof report.programsWithLegacyPhotos !== 'number' || typeof report.legacyPhotoReferenceCount !== 'number')) {
    throw new Error(`Initial-production restore evidence is invalid, expired, or targets another database: ${target}.`);
  }
  for (const metric of ['programCount', 'programsWithLegacyPhotos', 'legacyPhotoReferenceCount']) {
    if (reports[0]?.[metric] !== reports[1]?.[metric] || reports[0]?.[metric] !== reports[2]?.[metric]) throw new Error(`Initial-production restore evidence ${metric} does not match across reports.`);
  }
};

type PreflightPlan = {
  inspection: {
    database: string;
    migrationTablePresent: boolean;
    migrationDiscrepancies: { missingFromDatabase?: string[]; appliedButNotInRepository?: string[]; failedOrRolledBack?: string[] };
    repositorySchemaDiscrepancies: string[];
  };
  plan: { database: string; planHash: string };
};

const runPreflightPlan = (targetUrl: string): PreflightPlan => {
  const scriptPath = path.resolve(__dirname, '../../../../scripts/legacy-schema-preflight.mjs');
  const result = spawnSync(process.execPath, [scriptPath, 'plan'], {
    env: { ...process.env, DATABASE_URL: targetUrl },
    encoding: 'utf8',
    timeout: 120000,
    killSignal: 'SIGTERM',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw new Error(`Initial-production schema plan inspection failed: ${result.error.message}`);
  if (result.signal) throw new Error(`Initial-production schema plan inspection stopped by ${result.signal}.`);
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Initial-production schema plan inspection failed.');
  try {
    return JSON.parse(result.stdout) as PreflightPlan;
  } catch {
    throw new Error('Initial-production schema plan inspection returned invalid JSON.');
  }
};

const migrationHistoryIsReady = (inspection: PreflightPlan['inspection']) => inspection.migrationTablePresent === true
  && (inspection.migrationDiscrepancies.missingFromDatabase ?? []).length === 0
  && (inspection.migrationDiscrepancies.appliedButNotInRepository ?? []).length === 0
  && (inspection.migrationDiscrepancies.failedOrRolledBack ?? []).length === 0;

const assertDatabaseTargets = (sourceUrl: string, targetUrl: string) => {
  const source = databaseName(sourceUrl);
  const target = databaseName(targetUrl);
  const sourceUrlObject = new URL(sourceUrl);
  const targetUrlObject = new URL(targetUrl);
  if (source !== SOURCE_DATABASE) throw new Error(`Refusing source database "${source}"; expected ${SOURCE_DATABASE}.`);
  if (target !== TARGET_DATABASE) throw new Error(`Refusing target database "${target}"; expected ${TARGET_DATABASE}.`);
  if (sourceUrlObject.hostname !== targetUrlObject.hostname || (sourceUrlObject.port || '3306') !== (targetUrlObject.port || '3306')) {
    throw new Error('Source and target must use the same local MySQL host and port.');
  }
  if (!['localhost', '127.0.0.1'].includes(targetUrlObject.hostname) || (targetUrlObject.port && targetUrlObject.port !== '3306')) {
    throw new Error('Initial-production bootstrap only permits local MySQL on port 3306.');
  }
  if (process.env.SCHEMA_MIGRATION_APPROVAL !== SCHEMA_APPROVAL) {
    throw new Error(`Set SCHEMA_MIGRATION_APPROVAL="${SCHEMA_APPROVAL}" after reviewing the target schema evidence.`);
  }
  if (process.env.DATA_MIGRATION_APPROVAL !== DATA_APPROVAL) {
    throw new Error(`Set DATA_MIGRATION_APPROVAL="${DATA_APPROVAL}" after reviewing the data migration report.`);
  }
  return { source, target };
};

const assertSchemaReadiness = (target: string) => {
  const evidencePath = process.env.INITIAL_PRODUCTION_SCHEMA_READINESS_PATH
    ? path.resolve(process.env.INITIAL_PRODUCTION_SCHEMA_READINESS_PATH)
    : path.resolve(__dirname, '../../../../artifacts/migration/initial-production-schema-readiness.json');
  if (!fs.existsSync(evidencePath)) throw new Error(`Initial-production schema evidence is missing at ${evidencePath}.`);
  let evidence: Record<string, unknown>;
  try {
    evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8')) as Record<string, unknown>;
  } catch {
    throw new Error(`Initial-production schema evidence is invalid at ${evidencePath}.`);
  }
  const expectedPlanHash = process.env.SCHEMA_PLAN_HASH?.trim();
  if (!expectedPlanHash) throw new Error('SCHEMA_PLAN_HASH is required for initial-production bootstrap.');
  if (evidence.status !== 'ready' || evidence.database !== target || evidence.migrationApplied !== true || evidence.dataMigrationReady !== true || evidence.schemaApproval !== SCHEMA_APPROVAL || evidence.planHash !== expectedPlanHash) {
    throw new Error(`Initial-production schema evidence is not ready for ${target}.`);
  }
  if (typeof evidence.expiresAt !== 'string' || !Number.isFinite(Date.parse(evidence.expiresAt)) || Date.parse(evidence.expiresAt) <= Date.now()) {
    throw new Error('Initial-production schema evidence is expired or missing an expiry.');
  }
  const restoreEvidencePath = process.env.INITIAL_PRODUCTION_RESTORE_EVIDENCE_PATH
    ? path.resolve(process.env.INITIAL_PRODUCTION_RESTORE_EVIDENCE_PATH)
    : path.resolve(__dirname, '../../../../artifacts/migration/initial-production-final-restore-verification.json');
  if (!fs.existsSync(restoreEvidencePath)) throw new Error(`Initial-production restore evidence is missing at ${restoreEvidencePath}.`);
  const restoreEvidence = JSON.parse(fs.readFileSync(restoreEvidencePath, 'utf8')) as Record<string, unknown>;
  assertValidRestoreEvidence(restoreEvidence, target);
  const embeddedRestore = evidence.restoreEvidence as Record<string, unknown> | undefined;
  if (!embeddedRestore || ['status', 'sourceDatabase', 'restoreDatabase', 'backupSha256', 'verifiedAt', 'expiresAt', 'evidenceSha256'].some((field) => embeddedRestore[field] !== restoreEvidence[field])) {
    throw new Error('Initial-production schema evidence is not bound to the current restore evidence.');
  }
  return { evidencePath, restoreEvidencePath, planHash: evidence.planHash };
};

const hashFile = (filePath: string) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

const latestMembershipReportPath = () => {
  const reportRoot = path.resolve(__dirname, '../../../../artifacts/membership');
  if (!fs.existsSync(reportRoot)) return null;
  const candidates = fs.readdirSync(reportRoot)
    .map((entry) => path.join(reportRoot, entry, 'membership-2025-2026-import-report.json'))
    .filter((entry) => fs.existsSync(entry))
    .sort()
    .reverse();
  return candidates[0] ?? null;
};

const localPhotoPath = (filePath: string) => {
  if (!filePath.startsWith('/uploads/proker/')) throw new Error(`Unsupported Program Kerja photo path: ${filePath}`);
  const publicRoot = path.resolve(process.env.PROKER_WEB_PUBLIC_ROOT ?? path.resolve(__dirname, '../../../web/public'));
  const resolved = path.resolve(publicRoot, filePath.slice(1));
  if (resolved !== publicRoot && !resolved.startsWith(`${publicRoot}${path.sep}`)) throw new Error(`Photo path escapes public root: ${filePath}`);
  return resolved;
};

const writeReport = (report: Record<string, unknown>) => {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(REPORT_DIR, `initial-production-bootstrap-${timestamp}.json`);
  const markdownPath = path.join(REPORT_DIR, `initial-production-bootstrap-${timestamp}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  const source = report.source as Record<string, unknown>;
  const target = report.target as Record<string, unknown>;
  const markdown = [
    '# Initial-production bootstrap report',
    '',
    `- Status: ${report.status}`,
    `- Source database: ${source.database}`,
    `- Target database: ${target.database}`,
    `- Schema evidence: ${report.schemaEvidencePath}`,
    `- Schema plan hash: ${report.schemaPlanHash}`,
    '',
    '## Program Kerja',
    '',
    `- Source programs: ${source.programs}`,
    `- Source child-photo rows: ${source.childPhotoRows}`,
    `- Target programs: ${target.programs}`,
    `- Target child-photo rows: ${target.childPhotoRows}`,
    `- Target published programs: ${target.publishedPrograms}`,
    `- Target archived programs: ${target.archivedPrograms}`,
    `- Target cancelled programs: ${target.cancelledPrograms}`,
    `- Photo files verified: ${report.photoFilesVerified}`,
    '',
    '## Safety',
    '',
    '- Source database was read-only during this bootstrap.',
    '- Target was required to contain no existing Program Kerja, revision, artifact, or child-photo rows.',
    '- Membership rows were not modified by this bootstrap.',
  ].join('\n') + '\n';
  fs.writeFileSync(markdownPath, markdown, 'utf8');
  return { jsonPath, markdownPath };
};

const assertMembershipRelease = async (target: PrismaClient, reportPath: string) => {
  if (!fs.existsSync(reportPath)) throw new Error(`Membership import report is missing at ${reportPath}.`);
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as Record<string, any>;
  if (report.status !== 'IMPORTED' || report.sourceFileHash !== MEMBERSHIP_SOURCE_SHA256 || report.sourceSheet !== 'Data Final' || report.period !== MEMBERSHIP_RELEASE_PERIOD || report.targetDatabase !== databaseIdentity(process.env.INITIAL_PRODUCTION_DATABASE_URL ?? '')) {
    throw new Error('Membership import report is not the approved 2025/2026 release report.');
  }
  if (report.validation?.valid !== true || report.validation?.totalRows !== 619 || report.validation?.rejectedRows?.length !== 0 || report.postImport?.totalMemberships !== 619 || report.postImport?.activeMemberships !== 619 || report.postImport?.publishedMemberships !== 619 || report.postImport?.noDivisionMemberships !== 127) {
    throw new Error('Membership import report does not prove the approved 619-row release.');
  }
  const [total, active, published, noDivision, periods, commissariats, targetCommissariats, targetDivisions] = await Promise.all([
    target.membership.count(),
    target.membership.count({ where: { membershipStatus: 'ACTIVE' } }),
    target.membership.count({ where: { publicationStatus: 'PUBLISHED' } }),
    target.membership.count({ where: { divisionId: null } }),
    target.period.count({ where: { label: MEMBERSHIP_RELEASE_PERIOD } }),
    target.commissariat.count(),
    target.commissariat.findMany({ select: { slug: true } }),
    target.division.findMany({
      where: { period: { label: MEMBERSHIP_RELEASE_PERIOD } },
      select: { name: true, commissariat: { select: { slug: true } }, _count: { select: { memberships: true } } },
    }),
  ]);
  if (total !== 619 || active !== 619 || published !== 619 || noDivision !== 127 || periods !== 9 || commissariats !== 9) {
    throw new Error(`Target Membership release mismatch: total=${total}, active=${active}, published=${published}, noDivision=${noDivision}, periods=${periods}, commissariats=${commissariats}.`);
  }
  const actualSlugs = new Set(targetCommissariats.map(({ slug }) => slug));
  if (actualSlugs.size !== CANONICAL_COMMISSARIAT_SLUGS.size || [...CANONICAL_COMMISSARIAT_SLUGS].some((slug) => !actualSlugs.has(slug))) {
    throw new Error('Target Membership commissariat catalog does not match the approved release.');
  }
  const actualDivisionCounts = new Map(targetDivisions.map((division) => [`${division.commissariat.slug}|${division.name}`, division._count.memberships]));
  const reportDivisionCounts = report.validation?.divisionCounts as Record<string, Record<string, number>>;
  const expectedDivisionKeys = new Set(Object.entries(MEMBERSHIP_RELEASE_DIVISIONS).flatMap(([slug, names]) => names.map((name) => `${slug}|${name}`)));
  if (actualDivisionCounts.size !== expectedDivisionKeys.size || [...expectedDivisionKeys].some((key) => !actualDivisionCounts.has(key))) {
    throw new Error('Target Membership division catalog does not match the approved release.');
  }
  for (const [slug, divisionNames] of Object.entries(MEMBERSHIP_RELEASE_DIVISIONS)) {
    for (const divisionName of divisionNames) {
      const key = `${slug}|${divisionName}`;
      const expected = reportDivisionCounts?.[slug]?.[divisionName];
      const actual = actualDivisionCounts.get(key);
      if (expected === undefined || actual === undefined || actual !== expected) {
        throw new Error(`Target division count mismatch for ${key}: expected=${expected ?? 'missing'}, actual=${actual ?? 'missing'}.`);
      }
    }
  }
  for (const [slug, expected] of Object.entries(MEMBERSHIP_EXPECTED_COUNTS)) {
    const actual = await target.membership.count({ where: { commissariat: { slug }, period: { label: MEMBERSHIP_RELEASE_PERIOD } } });
    if (actual !== expected) throw new Error(`Target Membership count mismatch for ${slug}: ${actual}.`);
    const expectedNoDivision = MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS[slug] ?? 0;
    const actualNoDivision = await target.membership.count({ where: { commissariat: { slug }, period: { label: MEMBERSHIP_RELEASE_PERIOD }, divisionId: null } });
    if (actualNoDivision !== expectedNoDivision) throw new Error(`Target no-division count mismatch for ${slug}: ${actualNoDivision}.`);
  }
  return { reportPath, sourceFileHash: report.sourceFileHash, total, active, published, noDivision };
};

const main = async () => {
  const sourceUrl = process.env.DATABASE_URL;
  const targetUrl = process.env.INITIAL_PRODUCTION_DATABASE_URL;
  if (!sourceUrl) throw new Error('DATABASE_URL is required for the development source.');
  if (!targetUrl) throw new Error('INITIAL_PRODUCTION_DATABASE_URL is required for the clean target.');
  const databases = assertDatabaseTargets(sourceUrl, targetUrl);
  const schema = assertSchemaReadiness(databases.target);
  const currentPlan = runPreflightPlan(targetUrl);
  if (currentPlan.inspection.database !== databases.target || currentPlan.plan.database !== databases.target || !migrationHistoryIsReady(currentPlan.inspection) || currentPlan.inspection.repositorySchemaDiscrepancies.length || currentPlan.plan.planHash !== schema.planHash) {
    throw new Error('Initial-production active schema/migration history does not match the approved readiness evidence.');
  }
  const membershipReportPath = process.env.MEMBERSHIP_IMPORT_REPORT_PATH
    ? path.resolve(process.env.MEMBERSHIP_IMPORT_REPORT_PATH)
    : latestMembershipReportPath();
  if (!membershipReportPath) throw new Error('Membership import report is missing; set MEMBERSHIP_IMPORT_REPORT_PATH or run the approved import first.');
  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });

  try {
    const membership = await assertMembershipRelease(target, membershipReportPath);
    const sourcePrograms = await source.programKerja.findMany({
      include: { commissariat: true, period: true, division: true, photos: true, artifacts: true, revisions: true },
      orderBy: [{ commissariatId: 'asc' }, { programKe: 'asc' }, { id: 'asc' }],
    });
    const sourceChildPhotos = sourcePrograms.reduce((total, program) => total + program.photos.length, 0);
    if (sourcePrograms.length !== PROGRAM_TOTAL || sourceChildPhotos !== CHILD_PHOTO_TOTAL) {
      throw new Error(`Source Program Kerja metrics mismatch: programs=${sourcePrograms.length}, childPhotos=${sourceChildPhotos}.`);
    }
    const sourcePeriods = new Set(sourcePrograms.map((program) => program.period?.label ?? null));
    if (sourcePeriods.size !== 1 || (!sourcePeriods.has(null) && !sourcePeriods.has(PERIOD_LABEL)) || sourcePrograms.some((program) => !CANONICAL_COMMISSARIAT_SLUGS.has(program.commissariat.slug) || (program.period && (program.period.label !== PERIOD_LABEL || program.period.commissariatId !== program.commissariatId)) || (program.division && (program.division.commissariatId !== program.commissariatId || program.division.periodId !== program.periodId)))) {
      throw new Error('Source Program Kerja contains a non-canonical commissariat or ambiguous period scope; refusing to copy it.');
    }
    if (sourcePeriods.has(null) && process.env.PROGRAM_PERIOD_APPROVAL !== PROGRAM_PERIOD_APPROVAL) {
      throw new Error(`Source Program Kerja has null period relations. Set PROGRAM_PERIOD_APPROVAL="${PROGRAM_PERIOD_APPROVAL}" only after reviewing the approved 2025/2026 source mapping.`);
    }
    if (sourcePrograms.some((program) => program.division && program.divisi.trim().toLowerCase() !== program.division.name.trim().toLowerCase())) {
      throw new Error('Source Program Kerja division relation does not match its legacy divisi value; refusing to copy it.');
    }
    const verifiedPhotoPaths = sourcePrograms.flatMap((program) => program.photos.map((photo) => {
      const filePath = localPhotoPath(photo.filePath);
      if (!fs.existsSync(filePath)) throw new Error(`Missing Program Kerja photo file: ${photo.filePath}`);
      const actualHash = hashFile(filePath);
      if (actualHash !== photo.fileHash) throw new Error(`Program Kerja photo hash mismatch: ${photo.filePath}`);
      return photo.filePath;
    }));

    const [targetPrograms, targetPhotos, targetArtifacts, targetRevisions, targetMemberships, targetCommissariats, targetPeriods, targetDivisions] = await Promise.all([
      target.programKerja.count(),
      target.programKerjaPhoto.count(),
      target.programArtifact.count(),
      target.programKerjaRevision.count(),
      target.membership.count({ where: { period: { label: PERIOD_LABEL } } }),
      target.commissariat.findMany({ select: { id: true, slug: true } }),
      target.period.findMany({ select: { id: true, label: true, commissariatId: true } }),
      target.division.findMany({ select: { id: true, name: true, commissariatId: true, periodId: true } }),
    ]);
    if (targetPrograms || targetPhotos || targetArtifacts || targetRevisions) {
      throw new Error(`Target Program Kerja area is not empty: programs=${targetPrograms}, photos=${targetPhotos}, artifacts=${targetArtifacts}, revisions=${targetRevisions}.`);
    }
    if (targetMemberships !== 619 || targetCommissariats.length !== 9 || targetPeriods.length !== 9) {
      throw new Error(`Target Membership foundation is invalid: memberships=${targetMemberships}, commissariats=${targetCommissariats.length}, periods=${targetPeriods.length}.`);
    }

    const targetCommissariatBySlug = new Map(targetCommissariats.map((item) => [item.slug, item.id]));
    const targetPeriodByScope = new Map(targetPeriods.map((item) => [`${item.commissariatId}|${item.label}`, item.id]));
    const targetDivisionByScope = new Map(targetDivisions.map((item) => [`${item.commissariatId}|${item.periodId}|${item.name.toLowerCase()}`, item.id]));
    const sourceCommissariatSlugs = new Set(sourcePrograms.map((program) => program.commissariat.slug));
    if (sourceCommissariatSlugs.size !== CANONICAL_COMMISSARIAT_SLUGS.size || [...sourceCommissariatSlugs].some((slug) => !CANONICAL_COMMISSARIAT_SLUGS.has(slug) || !targetCommissariatBySlug.has(slug))) {
      throw new Error('Source and target canonical commissariat allowlists do not match.');
    }

    await target.$transaction(async (tx) => {
      for (const program of sourcePrograms) {
        const commissariatId = targetCommissariatBySlug.get(program.commissariat.slug);
        if (!commissariatId) throw new Error(`Target commissariat is missing: ${program.commissariat.slug}`);
        const periodId = targetPeriodByScope.get(`${commissariatId}|${PERIOD_LABEL}`);
        if (!periodId) throw new Error(`Target period ${PERIOD_LABEL} is missing for ${program.commissariat.slug}.`);
        const divisionId = program.division
          ? targetDivisionByScope.get(`${commissariatId}|${periodId}|${program.division.name.trim().toLowerCase()}`)
          : undefined;
        if (program.division && !divisionId) throw new Error(`Target division is missing for ${program.commissariat.slug}/${program.division.name}; refusing to create an unapproved division.`);
        await tx.programKerja.create({
          data: {
            id: program.id,
            programKe: program.programKe,
            namaProker: program.namaProker,
            divisi: program.divisi,
            tanggalProker: program.tanggalProker,
            dateLabel: program.dateLabel,
            formatPelaksanaan: program.formatPelaksanaan,
            status: program.status,
            deskripsiProker: program.deskripsiProker,
            kpiTukTarget: program.kpiTukTarget,
            dampak: program.dampak,
            evaluasi: program.evaluasi,
            foto1: program.foto1,
            foto2: program.foto2,
            foto3: program.foto3,
            foto4: program.foto4,
            foto5: program.foto5,
            foto6: program.foto6,
            createdAt: program.createdAt,
            updatedAt: program.updatedAt,
            periodId,
            divisionId: divisionId ?? null,
            publicationStatus: program.publicationStatus,
            rejectionReason: program.rejectionReason,
            authorAccountId: null,
            objectives: jsonValue(program.objectives),
            startDate: program.startDate,
            endDate: program.endDate,
            executionStatus: program.executionStatus,
            commissariatId,
          },
        });
        if (program.revisions.length) {
          await tx.programKerjaRevision.createMany({ data: program.revisions.map((revision) => ({
            id: revision.id,
            programKerjaId: program.id,
            namaProker: revision.namaProker,
            divisi: revision.divisi,
            tanggalProker: revision.tanggalProker,
            dateLabel: revision.dateLabel,
            formatPelaksanaan: revision.formatPelaksanaan,
            deskripsiProker: revision.deskripsiProker,
            publicationStatus: revision.publicationStatus,
            rejectionReason: revision.rejectionReason,
            cancelledAt: revision.cancelledAt,
            createdAt: revision.createdAt,
            updatedAt: revision.updatedAt,
            objectives: jsonValue(revision.objectives),
            startDate: revision.startDate,
            endDate: revision.endDate,
            executionStatus: revision.executionStatus,
          })) });
        }
        if (program.artifacts.length) {
          await tx.programArtifact.createMany({ data: program.artifacts.map((artifact) => ({
            id: artifact.id,
            programKerjaId: program.id,
            kind: artifact.kind,
            storageKey: artifact.storageKey,
            originalFilename: artifact.originalFilename,
            mimeType: artifact.mimeType,
            byteSize: artifact.byteSize,
            createdAt: artifact.createdAt,
          })) });
        }
        if (program.photos.length) {
          await tx.programKerjaPhoto.createMany({ data: program.photos.map((photo) => ({
            id: photo.id,
            programKerjaId: program.id,
            filePath: photo.filePath,
            fileHash: photo.fileHash,
            createdAt: photo.createdAt,
          })) });
        }
      }

      const [committedPrograms, committedPhotos, committedPublished, committedArchived, committedCancelled] = await Promise.all([
        tx.programKerja.count(),
        tx.programKerjaPhoto.count(),
        tx.programKerja.count({ where: { publicationStatus: 'PUBLISHED' } }),
        tx.programKerja.count({ where: { publicationStatus: 'ARCHIVED' } }),
        tx.programKerja.count({ where: { executionStatus: 'CANCELLED' } }),
      ]);
      if (committedPrograms !== PROGRAM_TOTAL || committedPhotos !== CHILD_PHOTO_TOTAL || committedPublished !== 139 || committedArchived !== 14 || committedCancelled !== 12) {
        throw new Error(`Target Program Kerja metrics mismatch before commit: programs=${committedPrograms}, photos=${committedPhotos}, published=${committedPublished}, archived=${committedArchived}, cancelled=${committedCancelled}.`);
      }
    }, { maxWait: 10000, timeout: 120000 });

    const [actualPrograms, actualPhotos, actualArtifacts, actualRevisions, publishedPrograms, archivedPrograms, cancelledPrograms] = await Promise.all([
      target.programKerja.count(),
      target.programKerjaPhoto.count(),
      target.programArtifact.count(),
      target.programKerjaRevision.count(),
      target.programKerja.count({ where: { publicationStatus: 'PUBLISHED' } }),
      target.programKerja.count({ where: { publicationStatus: 'ARCHIVED' } }),
      target.programKerja.count({ where: { executionStatus: 'CANCELLED' } }),
    ]);
    if (actualPrograms !== PROGRAM_TOTAL || actualPhotos !== CHILD_PHOTO_TOTAL || publishedPrograms !== 139 || archivedPrograms !== 14 || cancelledPrograms !== 12) {
      throw new Error(`Target Program Kerja metrics mismatch after bootstrap: programs=${actualPrograms}, photos=${actualPhotos}, published=${publishedPrograms}, archived=${archivedPrograms}, cancelled=${cancelledPrograms}.`);
    }
    const report = {
      status: 'IMPORTED',
      generatedAt: new Date().toISOString(),
      source: { database: databaseIdentity(sourceUrl), programs: sourcePrograms.length, childPhotoRows: sourceChildPhotos },
      target: { database: databaseIdentity(targetUrl), programs: actualPrograms, childPhotoRows: actualPhotos, artifacts: actualArtifacts, revisions: actualRevisions, publishedPrograms, archivedPrograms, cancelledPrograms },
      photoFilesVerified: verifiedPhotoPaths.length,
      schemaEvidencePath: schema.evidencePath,
      schemaPlanHash: schema.planHash,
      schemaApproval: SCHEMA_APPROVAL,
      dataApproval: DATA_APPROVAL,
      programPeriodApproval: sourcePeriods.has(null) ? PROGRAM_PERIOD_APPROVAL : null,
      sourceUntouched: true,
      membershipPreserved: targetMemberships === 619,
      membershipRelease: membership,
    };
    const paths = writeReport(report);
    console.log(JSON.stringify({ ...report, report: paths }, null, 2));
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
