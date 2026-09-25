import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SOURCE_DATABASE = 'genbi_jatim';
const TARGET_DATABASE = 'genbi_jatim_initial_production';
const SCHEMA_APPROVAL = 'SETUJUI SCHEMA MIGRASI';
const DATA_APPROVAL = 'SETUJUI DATA MIGRASI';
const PROGRAM_TOTAL = 153;
const CHILD_PHOTO_TOTAL = 431;
const PERIOD_LABEL = '2025/2026';
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
  if (evidence.status !== 'ready' || evidence.database !== target || evidence.migrationApplied !== true || evidence.dataMigrationReady !== true || evidence.schemaApproval !== SCHEMA_APPROVAL) {
    throw new Error(`Initial-production schema evidence is not ready for ${target}.`);
  }
  if (typeof evidence.expiresAt !== 'string' || Date.parse(evidence.expiresAt) <= Date.now()) {
    throw new Error('Initial-production schema evidence is expired or missing an expiry.');
  }
  return { evidencePath, planHash: evidence.planHash };
};

const hashFile = (filePath: string) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

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

const main = async () => {
  const sourceUrl = process.env.DATABASE_URL;
  const targetUrl = process.env.INITIAL_PRODUCTION_DATABASE_URL;
  if (!sourceUrl) throw new Error('DATABASE_URL is required for the development source.');
  if (!targetUrl) throw new Error('INITIAL_PRODUCTION_DATABASE_URL is required for the clean target.');
  const databases = assertDatabaseTargets(sourceUrl, targetUrl);
  const schema = assertSchemaReadiness(databases.target);
  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });

  try {
    const sourcePrograms = await source.programKerja.findMany({
      include: { commissariat: true, period: true, division: true, photos: true, artifacts: true, revisions: true },
      orderBy: [{ commissariatId: 'asc' }, { programKe: 'asc' }, { id: 'asc' }],
    });
    const sourceChildPhotos = sourcePrograms.reduce((total, program) => total + program.photos.length, 0);
    if (sourcePrograms.length !== PROGRAM_TOTAL || sourceChildPhotos !== CHILD_PHOTO_TOTAL) {
      throw new Error(`Source Program Kerja metrics mismatch: programs=${sourcePrograms.length}, childPhotos=${sourceChildPhotos}.`);
    }
    const sourcePhotoHashes = sourcePrograms.flatMap((program) => program.photos.map((photo) => {
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
    if (sourceCommissariatSlugs.size !== 9 || [...sourceCommissariatSlugs].some((slug) => !targetCommissariatBySlug.has(slug))) {
      throw new Error('Source and target canonical commissariat sets do not match.');
    }

    await target.$transaction(async (tx) => {
      for (const program of sourcePrograms) {
        const commissariatId = targetCommissariatBySlug.get(program.commissariat.slug);
        if (!commissariatId) throw new Error(`Target commissariat is missing: ${program.commissariat.slug}`);
        const periodId = targetPeriodByScope.get(`${commissariatId}|${PERIOD_LABEL}`) ?? null;
        const divisionId = program.division && periodId
          ? targetDivisionByScope.get(`${commissariatId}|${periodId}|${program.division.name.toLowerCase()}`) ?? null
          : null;
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
            divisionId,
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
      photoFilesVerified: sourcePhotoHashes.length,
      schemaEvidencePath: schema.evidencePath,
      schemaPlanHash: schema.planHash,
      schemaApproval: SCHEMA_APPROVAL,
      dataApproval: DATA_APPROVAL,
      sourceUntouched: true,
      membershipPreserved: targetMemberships === 619,
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
