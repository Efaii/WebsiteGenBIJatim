"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const membership_import_service_1 = require("../services/membership-import.service");
const membership_release_1 = require("../domain/membership-release");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const SOURCE_FILE = process.env.MEMBERSHIP_SOURCE_FILE
    ? path_1.default.resolve(process.env.MEMBERSHIP_SOURCE_FILE)
    : path_1.default.resolve(__dirname, '../../../../data/anggota/data_genbi_final_db.xlsx');
const REPORT_DIR = process.env.MEMBERSHIP_REPORT_DIR
    ? path_1.default.resolve(process.env.MEMBERSHIP_REPORT_DIR)
    : path_1.default.resolve(__dirname, '../../../../artifacts/membership');
const APPROVAL = 'SETUJUI DATA MIGRASI';
const databaseName = (value) => decodeURIComponent(new URL(value).pathname.replace(/^\//, ''));
const databaseIdentity = (value) => {
    const url = new URL(value);
    return `${url.hostname}:${url.port || '3306'}/${databaseName(value)}`;
};
const assertTargetSafety = (sourceUrl, targetUrl) => {
    const source = databaseName(sourceUrl);
    const target = databaseName(targetUrl);
    const sourceUrlObject = new URL(sourceUrl);
    const targetUrlObject = new URL(targetUrl);
    if (!['localhost', '127.0.0.1'].includes(targetUrlObject.hostname) || (targetUrlObject.port && targetUrlObject.port !== '3306'))
        throw new Error('Initial-production Membership import only permits local MySQL on port 3306.');
    if (sourceUrlObject.hostname !== targetUrlObject.hostname || (sourceUrlObject.port || '3306') !== (targetUrlObject.port || '3306'))
        throw new Error('Source and initial-production target must use the same local MySQL host and port.');
    if (source !== 'genbi_jatim')
        throw new Error(`Refusing source database "${source}"; the approved development source is genbi_jatim.`);
    if (!target || target === source || target === 'genbi_jatim' || /(?:test|staging)/i.test(target)) {
        throw new Error(`Refusing to import into unsafe target database "${target}". Use a new local initial-production database.`);
    }
    if (target !== 'genbi_jatim_initial_production') {
        throw new Error(`Target database "${target}" is not the approved local initial-production database.`);
    }
    if (process.env.DATA_MIGRATION_APPROVAL !== APPROVAL)
        throw new Error(`Set DATA_MIGRATION_APPROVAL="${APPROVAL}" after reviewing the report.`);
    return { source, target };
};
const writeReport = (report, runDir) => {
    fs_1.default.mkdirSync(runDir, { recursive: true });
    const jsonPath = path_1.default.join(runDir, 'membership-2025-2026-import-report.json');
    const markdownPath = path_1.default.join(runDir, 'membership-2025-2026-import-report.md');
    const rawValidation = report.validation;
    const validation = {
        ...rawValidation,
        rejectedRows: rawValidation.rejectedRows.map(({ rowNumber, errors }) => ({ rowNumber, errors })),
    };
    const postImport = report.postImport;
    const reportCommissariatCounts = postImport?.perCommissariat ?? validation.commissariatCounts;
    const reportNoDivisionCounts = postImport?.perNoDivision ?? validation.noDivisionCounts;
    const validationDivisionCounts = validation.divisionCounts;
    const reportPerDivision = postImport?.perDivision;
    const actualDivisionCounts = new Map(Object.entries(reportPerDivision ?? {}).flatMap(([slug, divisions]) => divisions.map((division) => [`${slug}|${division.name}`, division._count.memberships])));
    fs_1.default.writeFileSync(jsonPath, `${JSON.stringify({ ...report, validation }, null, 2)}\n`, 'utf8');
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
        `- Rejected rows: ${validation.rejectedRows.length}`,
        '',
        '### Per commissariat',
        '',
        '| Slug | Expected | Actual |',
        '| --- | ---: | ---: |',
        ...Object.entries(validation.expectedCommissariatCounts).map(([slug, expected]) => `| ${slug} | ${expected} | ${reportCommissariatCounts[slug] ?? 0} |`),
        '',
        '### Per division',
        '',
        ...Object.entries(membership_release_1.MEMBERSHIP_RELEASE_DIVISIONS).flatMap(([slug, divisions]) => [
            `- ${slug}:`,
            ...divisions.map((division) => `  - ${division}: expected ${validationDivisionCounts[slug]?.[division] ?? 0}, actual ${actualDivisionCounts.get(`${slug}|${division}`) ?? 0}`),
        ]),
        '',
        '### No division by commissariat',
        '',
        ...Object.entries(membership_release_1.MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS).map(([slug, expected]) => `- ${slug}: expected ${expected}, actual ${reportNoDivisionCounts[slug] ?? 0}`),
        '',
        '## Normalization',
        '',
        ...Object.entries(validation.normalizationRules).map(([raw, rule]) => `- ${raw} -> ${rule.normalized} (${rule.count} rows: ${rule.rowNumbers.join(', ')})`),
        '',
        '## Validation errors',
        '',
        ...(validation.errors.length ? validation.errors.map((error) => `- ${error}`) : ['- None']),
    ].join('\n');
    fs_1.default.writeFileSync(markdownPath, `${markdown}\n`, 'utf8');
    return { jsonPath, markdownPath };
};
const writeCommittedReportFailureMarker = (report, runDir, error) => {
    fs_1.default.mkdirSync(runDir, { recursive: true });
    const markerPath = path_1.default.join(runDir, 'membership-2025-2026-import-report-failure.json');
    fs_1.default.writeFileSync(markerPath, `${JSON.stringify({ ...report, status: 'IMPORTED_REPORT_WRITE_FAILED', error }, null, 2)}\n`, 'utf8');
    return markerPath;
};
const main = async () => {
    const sourceUrl = process.env.DATABASE_URL;
    const targetUrl = process.env.INITIAL_PRODUCTION_DATABASE_URL;
    if (!sourceUrl)
        throw new Error('DATABASE_URL is required to identify the current development source.');
    if (!targetUrl)
        throw new Error('INITIAL_PRODUCTION_DATABASE_URL is required; the development database is never used as the import target.');
    const databases = assertTargetSafety(sourceUrl, targetUrl);
    if (!fs_1.default.existsSync(SOURCE_FILE))
        throw new Error(`Membership workbook not found: ${SOURCE_FILE}`);
    const buffer = fs_1.default.readFileSync(SOURCE_FILE);
    const parsed = (0, membership_import_service_1.parseMembershipWorkbook)(buffer, { periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD });
    const runDir = path_1.default.join(REPORT_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto_1.default.createHash('sha256').update(buffer).digest('hex').slice(0, 12)}`);
    const validation = (0, membership_import_service_1.validateMembershipSource)(parsed, {
        expectedTotalRows: 619,
        expectedCommissariatCounts: membership_release_1.MEMBERSHIP_EXPECTED_COUNTS,
        expectedNoDivisionCount: 127,
        expectedDivisionNames: membership_release_1.MEMBERSHIP_RELEASE_DIVISIONS,
        requireDivisionCatalog: true,
    });
    const sourceFileHash = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
    if (sourceFileHash !== membership_release_1.MEMBERSHIP_SOURCE_SHA256) {
        const paths = writeReport({ sourceFile: path_1.default.relative(process.cwd(), SOURCE_FILE), sourceSheet: parsed.sourceSheet, sourceFileHash, targetDatabase: databaseIdentity(targetUrl), importedAt: new Date().toISOString(), validation, status: 'REJECTED', error: 'SOURCE_HASH_MISMATCH' }, runDir);
        throw new Error(`Membership source hash ${sourceFileHash} does not match the approved release hash. See ${paths.jsonPath}`);
    }
    const reportBase = {
        sourceFile: path_1.default.relative(process.cwd(), SOURCE_FILE),
        sourceSheet: parsed.sourceSheet,
        sourceFileHash,
        period: membership_release_1.MEMBERSHIP_RELEASE_PERIOD,
        targetDatabase: databaseIdentity(targetUrl),
        importedAt: new Date().toISOString(),
        validation,
    };
    if (!validation.valid) {
        const paths = writeReport({ ...reportBase, status: 'REJECTED' }, runDir);
        throw new Error(`Membership source validation failed. See ${paths.jsonPath}`);
    }
    const target = new client_1.PrismaClient({ datasources: { db: { url: targetUrl } } });
    let importCommitted = false;
    let postImport;
    try {
        const [membershipCount, commissariatCount, periodCount, divisionCount, userCount, cmsAccountCount, cmsAssignmentCount, cmsSessionCount, auditEventCount, membershipImportAliasCount, membershipImportPreviewCount, membershipImportRowCount, programCount, programArtifactCount, programKerjaPhotoCount, programKerjaRevisionCount, newsCount, newsRevisionCount, newsCoverAssetCount, newsSlugAliasCount, faqCount, testimonialCount, contactMessageCount] = await Promise.all([
            target.membership.count(),
            target.commissariat.count(),
            target.period.count(),
            target.division.count(),
            target.user.count(),
            target.cmsAccount.count(),
            target.cmsAssignment.count(),
            target.cmsSession.count(),
            target.auditEvent.count(),
            target.membershipImportAlias.count(),
            target.membershipImportPreview.count(),
            target.membershipImportRow.count(),
            target.programKerja.count(),
            target.programArtifact.count(),
            target.programKerjaPhoto.count(),
            target.programKerjaRevision.count(),
            target.news.count(),
            target.newsRevision.count(),
            target.newsCoverAsset.count(),
            target.newsSlugAlias.count(),
            target.faq.count(),
            target.testimonial.count(),
            target.contactMessage.count(),
        ]);
        if ([membershipCount, commissariatCount, periodCount, divisionCount, userCount, cmsAccountCount, cmsAssignmentCount, cmsSessionCount, auditEventCount, membershipImportAliasCount, membershipImportPreviewCount, membershipImportRowCount, programCount, programArtifactCount, programKerjaPhotoCount, programKerjaRevisionCount, newsCount, newsRevisionCount, newsCoverAssetCount, newsSlugAliasCount, faqCount, testimonialCount, contactMessageCount].some((count) => count > 0))
            throw new Error(`Target database is not clean: memberships=${membershipCount}, commissariats=${commissariatCount}, periods=${periodCount}, divisions=${divisionCount}, users=${userCount}, cmsAccounts=${cmsAccountCount}, cmsAssignments=${cmsAssignmentCount}, cmsSessions=${cmsSessionCount}, auditEvents=${auditEventCount}, membershipAliases=${membershipImportAliasCount}, membershipPreviews=${membershipImportPreviewCount}, membershipRows=${membershipImportRowCount}, programs=${programCount}, programArtifacts=${programArtifactCount}, programPhotos=${programKerjaPhotoCount}, programRevisions=${programKerjaRevisionCount}, news=${newsCount}, newsRevisions=${newsRevisionCount}, newsCoverAssets=${newsCoverAssetCount}, newsSlugAliases=${newsSlugAliasCount}, faqs=${faqCount}, testimonials=${testimonialCount}, contacts=${contactMessageCount}.`);
        postImport = await target.$transaction(async (tx) => {
            const commissariatIds = new Map();
            const periodIds = new Map();
            const divisionIds = new Map();
            for (const item of membership_release_1.MEMBERSHIP_RELEASE_COMMISSARIATS) {
                const commissariat = await tx.commissariat.create({ data: { slug: item.slug, name: item.name, university: item.university, logo: item.logo, description: `GenBI Komisariat ${item.name}.` } });
                commissariatIds.set(item.slug, commissariat.id);
                const period = await tx.period.create({ data: { commissariatId: commissariat.id, label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD } });
                periodIds.set(item.slug, period.id);
            }
            for (const [slug, counts] of Object.entries(validation.divisionCounts)) {
                const commissariatId = commissariatIds.get(slug);
                const periodId = periodIds.get(slug);
                for (const divisionName of Object.keys(counts).filter((name) => name !== '-')) {
                    const division = await tx.division.create({ data: { commissariatId, periodId, name: divisionName } });
                    divisionIds.set(`${slug}|${divisionName}`, division.id);
                }
            }
            await tx.membership.createMany({
                data: parsed.rows.map((row) => {
                    const slug = (0, membership_import_service_1.canonicalCommissariatSlug)(row.normalized.komisariat);
                    const divisionId = row.normalized.divisi ? divisionIds.get(`${slug}|${row.normalized.divisi}`) : null;
                    if (row.normalized.divisi && !divisionId)
                        throw new Error(`Unresolved division ${row.normalized.divisi} for ${slug} at row ${row.rowNumber}.`);
                    return {
                        commissariatId: commissariatIds.get(slug),
                        periodId: periodIds.get(slug),
                        divisionId,
                        name: row.normalized.nama,
                        position: row.normalized.jabatan,
                        studyProgram: row.normalized.prodi,
                        membershipStatus: 'ACTIVE',
                        publicationStatus: 'PUBLISHED',
                    };
                }),
            });
            for (const [slug, count] of Object.entries(validation.commissariatCounts)) {
                await tx.commissariat.update({ where: { id: commissariatIds.get(slug) }, data: { memberCount: count } });
            }
            const [releasePeriodCount, totalMemberships, activeMemberships, publishedMemberships, noDivisionMemberships] = await Promise.all([
                tx.period.count({ where: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD } }),
                tx.membership.count({ where: { period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD } } }),
                tx.membership.count({ where: { period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }, membershipStatus: 'ACTIVE' } }),
                tx.membership.count({ where: { period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }, publicationStatus: 'PUBLISHED' } }),
                tx.membership.count({ where: { period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }, divisionId: null } }),
            ]);
            if (releasePeriodCount !== membership_release_1.MEMBERSHIP_RELEASE_COMMISSARIATS.length || totalMemberships !== 619 || activeMemberships !== 619 || publishedMemberships !== 619 || noDivisionMemberships !== 127) {
                throw new Error(`Post-import membership totals do not match the approved release: total=${totalMemberships}, active=${activeMemberships}, published=${publishedMemberships}, noDivision=${noDivisionMemberships}.`);
            }
            for (const [slug, expectedCount] of Object.entries(membership_release_1.MEMBERSHIP_EXPECTED_COUNTS)) {
                const actualCount = await tx.membership.count({ where: { commissariat: { slug }, period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD } } });
                if (actualCount !== expectedCount)
                    throw new Error(`Post-import commissariat count mismatch for ${slug}: ${actualCount}.`);
            }
            const importedDivisions = await tx.division.findMany({
                where: { period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD } },
                select: { commissariat: { select: { slug: true } }, name: true, _count: { select: { memberships: true } } },
            });
            const importedDivisionCounts = new Map(importedDivisions.map((division) => [`${division.commissariat.slug}|${division.name}`, division._count.memberships]));
            const expectedDivisionKeys = new Set(Object.entries(membership_release_1.MEMBERSHIP_RELEASE_DIVISIONS).flatMap(([slug, names]) => names.map((name) => `${slug}|${name}`)));
            const actualDivisionKeys = new Set(importedDivisionCounts.keys());
            if (actualDivisionKeys.size !== expectedDivisionKeys.size || [...expectedDivisionKeys].some((key) => !actualDivisionKeys.has(key))) {
                throw new Error('Post-import division catalog does not match the approved release.');
            }
            for (const [slug, divisions] of Object.entries(validation.divisionCounts)) {
                for (const [divisionName, expectedCount] of Object.entries(divisions)) {
                    if (divisionName === '-')
                        continue;
                    const actualCount = importedDivisionCounts.get(`${slug}|${divisionName}`) ?? 0;
                    if (actualCount !== expectedCount)
                        throw new Error(`Post-import division count mismatch for ${slug}/${divisionName}: ${actualCount}.`);
                }
            }
            const postImport = {
                totalMemberships: await tx.membership.count({ where: { period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD } } }),
                activeMemberships: await tx.membership.count({ where: { period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }, membershipStatus: 'ACTIVE' } }),
                publishedMemberships: await tx.membership.count({ where: { period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }, publicationStatus: 'PUBLISHED' } }),
                noDivisionMemberships: await tx.membership.count({ where: { period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }, divisionId: null } }),
                perCommissariat: Object.fromEntries(await Promise.all(membership_release_1.MEMBERSHIP_RELEASE_COMMISSARIATS.map(async (item) => [item.slug, await tx.membership.count({ where: { commissariat: { slug: item.slug }, period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD } } })]))),
                perNoDivision: Object.fromEntries(await Promise.all(membership_release_1.MEMBERSHIP_RELEASE_COMMISSARIATS.map(async (item) => [item.slug, await tx.membership.count({ where: { commissariat: { slug: item.slug }, period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }, divisionId: null } })]))),
                perDivision: Object.fromEntries(await Promise.all(membership_release_1.MEMBERSHIP_RELEASE_COMMISSARIATS.map(async (item) => [item.slug, await tx.division.findMany({ where: { commissariat: { slug: item.slug }, period: { label: membership_release_1.MEMBERSHIP_RELEASE_PERIOD } }, select: { name: true, _count: { select: { memberships: true } } }, orderBy: { name: 'asc' } })]))),
            };
            for (const [slug, expectedCount] of Object.entries(membership_release_1.MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS)) {
                if (postImport.perNoDivision[slug] !== expectedCount)
                    throw new Error(`Post-import no-division count mismatch for ${slug}: ${postImport.perNoDivision[slug]}.`);
            }
            return postImport;
        });
        importCommitted = true;
        const paths = writeReport({ ...reportBase, postImport, status: 'IMPORTED' }, runDir);
        console.log(JSON.stringify({ status: 'IMPORTED', totalRows: validation.totalRows, noDivisionCount: validation.noDivisionCount, report: paths }, null, 2));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (importCommitted) {
            try {
                const markerPath = writeCommittedReportFailureMarker({ ...reportBase, postImport }, runDir, message);
                console.error(`Membership import committed, but the final audit report failed. Marker: ${markerPath}`);
            }
            catch (reportError) {
                console.error(`Membership import committed, but audit report could not be written: ${reportError instanceof Error ? reportError.message : String(reportError)}`);
            }
        }
        else {
            writeReport({ ...reportBase, status: 'FAILED', error: message }, runDir);
        }
        throw error;
    }
    finally {
        await target.$disconnect();
    }
};
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
