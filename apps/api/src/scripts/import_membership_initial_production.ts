import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import {
  canonicalCommissariatSlug,
  parseMembershipWorkbook,
  validateMembershipSource,
} from '../services/membership-import.service';
import {
  MEMBERSHIP_EXPECTED_COUNTS,
  MEMBERSHIP_RELEASE_COMMISSARIATS,
  MEMBERSHIP_RELEASE_PERIOD,
  MEMBERSHIP_SOURCE_SHA256,
} from '../domain/membership-release';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SOURCE_FILE = process.env.MEMBERSHIP_SOURCE_FILE
  ? path.resolve(process.env.MEMBERSHIP_SOURCE_FILE)
  : path.resolve(__dirname, '../../../../data/anggota/data_genbi_final_db.xlsx');
const REPORT_DIR = process.env.MEMBERSHIP_REPORT_DIR
  ? path.resolve(process.env.MEMBERSHIP_REPORT_DIR)
  : path.resolve(__dirname, '../../../../artifacts/membership');
const APPROVAL = 'SETUJUI DATA MIGRASI';

const databaseName = (value: string) => decodeURIComponent(new URL(value).pathname.replace(/^\//, ''));
const databaseIdentity = (value: string) => {
  const url = new URL(value);
  return `${url.hostname}:${url.port || '3306'}/${databaseName(value)}`;
};

const assertTargetSafety = (sourceUrl: string, targetUrl: string) => {
  const source = databaseName(sourceUrl);
  const target = databaseName(targetUrl);
  const sourceUrlObject = new URL(sourceUrl);
  const targetUrlObject = new URL(targetUrl);
  if (!['localhost', '127.0.0.1'].includes(targetUrlObject.hostname) || (targetUrlObject.port && targetUrlObject.port !== '3306')) throw new Error('Initial-production Membership import only permits local MySQL on port 3306.');
  if (sourceUrlObject.hostname !== targetUrlObject.hostname || (sourceUrlObject.port || '3306') !== (targetUrlObject.port || '3306')) throw new Error('Source and initial-production target must use the same local MySQL host and port.');
  if (source !== 'genbi_jatim') throw new Error(`Refusing source database "${source}"; the approved development source is genbi_jatim.`);
  if (!target || target === source || target === 'genbi_jatim' || /(?:test|staging)/i.test(target)) {
    throw new Error(`Refusing to import into unsafe target database "${target}". Use a new local initial-production database.`);
  }
  if (target !== 'genbi_jatim_initial_production') {
    throw new Error(`Target database "${target}" is not the approved local initial-production database.`);
  }
  if (process.env.DATA_MIGRATION_APPROVAL !== APPROVAL) throw new Error(`Set DATA_MIGRATION_APPROVAL="${APPROVAL}" after reviewing the report.`);
  return { source, target };
};

const writeReport = (report: Record<string, unknown>, runDir: string) => {
  fs.mkdirSync(runDir, { recursive: true });
  const jsonPath = path.join(runDir, 'membership-2025-2026-import-report.json');
  const markdownPath = path.join(runDir, 'membership-2025-2026-import-report.md');
  const rawValidation = report.validation as Record<string, unknown>;
  const validation: Record<string, unknown> = {
    ...rawValidation,
    rejectedRows: (rawValidation.rejectedRows as Array<{ rowNumber: number; errors: string[] }>).map(({ rowNumber, errors }) => ({ rowNumber, errors })),
  };
  fs.writeFileSync(jsonPath, `${JSON.stringify({ ...report, validation }, null, 2)}\n`, 'utf8');
  const markdown = [
    '# Membership 2025/2026 Import Report',
    '',
    `- Source: ${report.sourceFile}`,
    `- Sheet: ${report.sourceSheet}`,
    `- SHA-256: ${report.sourceFileHash}`,
    `- Target database: ${report.targetDatabase}`,
    `- Status: ${report.status}`,
    `- Imported at: ${report.importedAt}`,
    '',
    '## Counts',
    '',
    `- Total rows: ${validation.totalRows}`,
    `- No-division rows: ${validation.noDivisionCount}`,
    `- Rejected rows: ${(validation.rejectedRows as unknown[]).length}`,
    '',
    '### Per commissariat',
    '',
    '| Slug | Expected | Actual |',
    '| --- | ---: | ---: |',
    ...Object.entries(validation.expectedCommissariatCounts as Record<string, number>).map(([slug, expected]) => `| ${slug} | ${expected} | ${(validation.commissariatCounts as Record<string, number>)[slug] ?? 0} |`),
    '',
    '### Per division',
    '',
    ...Object.entries(validation.divisionCounts as Record<string, Record<string, number>>).flatMap(([slug, divisions]) => [
      `- ${slug}:`,
      ...Object.entries(divisions).map(([division, count]) => `  - ${division}: ${count}`),
    ]),
    '',
    '### No division by commissariat',
    '',
    ...Object.entries(validation.noDivisionCounts as Record<string, number>).map(([slug, count]) => `- ${slug}: ${count}`),
    '',
    '## Normalization',
    '',
    ...Object.entries(validation.normalizationRules as Record<string, { normalized: string; count: number; rowNumbers: number[] }>).map(([raw, rule]) => `- ${raw} -> ${rule.normalized} (${rule.count} rows: ${rule.rowNumbers.join(', ')})`),
    '',
    '## Validation errors',
    '',
    ...((validation.errors as string[]).length ? (validation.errors as string[]).map((error) => `- ${error}`) : ['- None']),
  ].join('\n');
  fs.writeFileSync(markdownPath, `${markdown}\n`, 'utf8');
  return { jsonPath, markdownPath };
};

const main = async () => {
  const sourceUrl = process.env.DATABASE_URL;
  const targetUrl = process.env.INITIAL_PRODUCTION_DATABASE_URL;
  if (!sourceUrl) throw new Error('DATABASE_URL is required to identify the current development source.');
  if (!targetUrl) throw new Error('INITIAL_PRODUCTION_DATABASE_URL is required; the development database is never used as the import target.');
  const databases = assertTargetSafety(sourceUrl, targetUrl);
  if (!fs.existsSync(SOURCE_FILE)) throw new Error(`Membership workbook not found: ${SOURCE_FILE}`);

  const buffer = fs.readFileSync(SOURCE_FILE);
  const parsed = parseMembershipWorkbook(buffer);
  const runDir = path.join(REPORT_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12)}`);
  const validation = validateMembershipSource(parsed, {
    expectedTotalRows: 619,
    expectedCommissariatCounts: MEMBERSHIP_EXPECTED_COUNTS,
  });
  const sourceFileHash = crypto.createHash('sha256').update(buffer).digest('hex');
  if (sourceFileHash !== MEMBERSHIP_SOURCE_SHA256) {
    const paths = writeReport({ sourceFile: path.relative(process.cwd(), SOURCE_FILE), sourceSheet: parsed.sourceSheet, sourceFileHash, targetDatabase: databaseIdentity(targetUrl), importedAt: new Date().toISOString(), validation, status: 'REJECTED', error: 'SOURCE_HASH_MISMATCH' }, runDir);
    throw new Error(`Membership source hash ${sourceFileHash} does not match the approved release hash. See ${paths.jsonPath}`);
  }
  const reportBase = {
    sourceFile: path.relative(process.cwd(), SOURCE_FILE),
    sourceSheet: parsed.sourceSheet,
    sourceFileHash,
    period: MEMBERSHIP_RELEASE_PERIOD,
    targetDatabase: databaseIdentity(targetUrl),
    importedAt: new Date().toISOString(),
    validation,
  };
  if (!validation.valid) {
    const paths = writeReport({ ...reportBase, status: 'REJECTED' }, runDir);
    throw new Error(`Membership source validation failed. See ${paths.jsonPath}`);
  }

  const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });
  try {
    const [membershipCount, commissariatCount, periodCount, divisionCount, userCount, cmsAccountCount, programCount, programArtifactCount, programKerjaPhotoCount, programKerjaRevisionCount, newsCount, faqCount, testimonialCount, contactMessageCount] = await Promise.all([
      target.membership.count(),
      target.commissariat.count(),
      target.period.count(),
      target.division.count(),
      target.user.count(),
      target.cmsAccount.count(),
      target.programKerja.count(),
      target.programArtifact.count(),
      target.programKerjaPhoto.count(),
      target.programKerjaRevision.count(),
      target.news.count(),
      target.faq.count(),
      target.testimonial.count(),
      target.contactMessage.count(),
    ]);
    if ([membershipCount, commissariatCount, periodCount, divisionCount, userCount, cmsAccountCount, programCount, programArtifactCount, programKerjaPhotoCount, programKerjaRevisionCount, newsCount, faqCount, testimonialCount, contactMessageCount].some((count) => count > 0)) throw new Error(`Target database is not clean: memberships=${membershipCount}, commissariats=${commissariatCount}, periods=${periodCount}, divisions=${divisionCount}, users=${userCount}, cmsAccounts=${cmsAccountCount}, programs=${programCount}, programArtifacts=${programArtifactCount}, programPhotos=${programKerjaPhotoCount}, programRevisions=${programKerjaRevisionCount}, news=${newsCount}, faqs=${faqCount}, testimonials=${testimonialCount}, contacts=${contactMessageCount}.`);

    await target.$transaction(async (tx) => {
      const commissariatIds = new Map<string, string>();
      const periodIds = new Map<string, string>();
      const divisionIds = new Map<string, string>();
      for (const item of MEMBERSHIP_RELEASE_COMMISSARIATS) {
        const commissariat = await tx.commissariat.create({ data: { slug: item.slug, name: item.name, university: item.university, logo: item.logo, description: `GenBI Komisariat ${item.name}.` } });
        commissariatIds.set(item.slug, commissariat.id);
        const period = await tx.period.create({ data: { commissariatId: commissariat.id, label: '2025/2026' } });
        periodIds.set(item.slug, period.id);
      }
      for (const [slug, counts] of Object.entries(validation.divisionCounts)) {
        const commissariatId = commissariatIds.get(slug)!;
        const periodId = periodIds.get(slug)!;
        for (const divisionName of Object.keys(counts).filter((name) => name !== '-')) {
          const division = await tx.division.create({ data: { commissariatId, periodId, name: divisionName } });
          divisionIds.set(`${slug}|${divisionName}`, division.id);
        }
      }
      await tx.membership.createMany({
          data: parsed.rows.map((row) => {
            const slug = canonicalCommissariatSlug(row.normalized.komisariat)!;
            const divisionId = row.normalized.divisi ? divisionIds.get(`${slug}|${row.normalized.divisi}`) : null;
            if (row.normalized.divisi && !divisionId) throw new Error(`Unresolved division ${row.normalized.divisi} for ${slug} at row ${row.rowNumber}.`);
            return {
            commissariatId: commissariatIds.get(slug)!,
            periodId: periodIds.get(slug)!,
            divisionId,
            name: row.normalized.nama,
            position: row.normalized.jabatan,
            studyProgram: row.normalized.prodi,
            membershipStatus: 'ACTIVE' as const,
            publicationStatus: 'PUBLISHED' as const,
          };
        }),
      });
      for (const [slug, count] of Object.entries(validation.commissariatCounts)) {
        await tx.commissariat.update({ where: { id: commissariatIds.get(slug)! }, data: { memberCount: count } });
      }
    });

    const postImport = {
      totalMemberships: await target.membership.count(),
      activeMemberships: await target.membership.count({ where: { membershipStatus: 'ACTIVE' } }),
      publishedMemberships: await target.membership.count({ where: { publicationStatus: 'PUBLISHED' } }),
      noDivisionMemberships: await target.membership.count({ where: { divisionId: null } }),
      perCommissariat: Object.fromEntries(await Promise.all(MEMBERSHIP_RELEASE_COMMISSARIATS.map(async (item: (typeof MEMBERSHIP_RELEASE_COMMISSARIATS)[number]) => [item.slug, await target.membership.count({ where: { commissariat: { slug: item.slug } } })]))),
      perDivision: Object.fromEntries(await Promise.all(MEMBERSHIP_RELEASE_COMMISSARIATS.map(async (item: (typeof MEMBERSHIP_RELEASE_COMMISSARIATS)[number]) => [item.slug, await target.division.findMany({ where: { commissariat: { slug: item.slug }, period: { label: MEMBERSHIP_RELEASE_PERIOD } }, select: { name: true, _count: { select: { memberships: true } } }, orderBy: { name: 'asc' } })]))),
    };
    const paths = writeReport({ ...reportBase, postImport, status: 'IMPORTED' }, runDir);
    console.log(JSON.stringify({ status: 'IMPORTED', totalRows: validation.totalRows, noDivisionCount: validation.noDivisionCount, report: paths }, null, 2));
  } catch (error) {
    writeReport({ ...reportBase, status: 'FAILED', error: error instanceof Error ? error.message : String(error) }, runDir);
    throw error;
  } finally {
    await target.$disconnect();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
