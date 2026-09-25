import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { parseDatabaseUrl } from './legacy-schema-preflight.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const DEFAULT_TARGET_DATABASE_URL = 'mysql://root:@localhost:3306/genbi_jatim_initial_production';
export const DEVELOPMENT_DATABASE_NAMES = new Set(['genbi_jatim', 'genbi_jatim_shadow', 'genbi_jatim_test']);

export const APPROVED_BASELINE = Object.freeze({
  programTotal: 153,
  programPublished: 139,
  programArchived: 14,
  programExecutionCancelled: 12,
  childPhotoRows: 431,
  membershipTotal: 619,
  membershipNoDivision: 127,
  membershipByCommissariat: Object.freeze({
    its: 87,
    pens: 48,
    'uin-madura': 50,
    uinsa: 83,
    unair: 112,
    unesa: 64,
    unugiri: 50,
    upnvjt: 50,
    utm: 75,
  }),
  sourceImages: 186,
  publicProgramList: 139,
  publicAwardee: 619,
  publicMembership: 619,
});

export const assertCleanTargetDatabase = (databaseName, { allowedPrefix = 'genbi_jatim_initial_production' } = {}) => {
  if (typeof databaseName !== 'string' || databaseName === '') throw new Error('Initial-production verification requires a database name.');
  if (DEVELOPMENT_DATABASE_NAMES.has(databaseName)) throw new Error(`Refusing to verify the development database "${databaseName}" as the clean initial-production source.`);
  if (/^genbi_restore_/.test(databaseName)) throw new Error(`Refusing to verify an isolated restore database "${databaseName}".`);
  if (!databaseName.startsWith(allowedPrefix)) throw new Error(`Refusing to verify "${databaseName}": expected the clean initial-production database (prefix "${allowedPrefix}").`);
  return databaseName;
};

export const compareExpectedVsActual = (actual, baseline = APPROVED_BASELINE) => {
  const rows = [];
  const push = (metric, expected, value) => rows.push({ metric, expected, actual: value, ok: expected === value });

  push('program.total', baseline.programTotal, actual.programTotal);
  push('program.published', baseline.programPublished, actual.programPublished);
  push('program.archived', baseline.programArchived, actual.programArchived);
  push('program.executionCancelled', baseline.programExecutionCancelled, actual.programExecutionCancelled);
  push('photo.childRows', baseline.childPhotoRows, actual.childPhotoRows);
  push('photo.uniquePairs', baseline.childPhotoRows, actual.photoUniquePairs);
  push('photo.missingFiles', 0, actual.photoMissingFiles);
  push('photo.hashMismatches', 0, actual.photoHashMismatches);
  push('membership.total', baseline.membershipTotal, actual.membershipTotal);
  push('membership.activePublished', baseline.membershipTotal, actual.membershipActivePublished);
  push('membership.noDivision', baseline.membershipNoDivision, actual.membershipNoDivision);
  for (const [slug, expected] of Object.entries(baseline.membershipByCommissariat)) {
    push(`membership.byCommissariat.${slug}`, expected, actual.membershipByCommissariat?.[slug] ?? 0);
  }
  push('hygiene.testPeriod2099', 0, actual.testPeriod2099);
  push('hygiene.testCommissariatSlug', 0, actual.testCommissariatSlug);
  push('hygiene.badDivisionNames', 0, actual.badDivisionNames);
  push('hygiene.stageLeftovers', 0, actual.stageLeftovers);
  push('hygiene.sourceImages', baseline.sourceImages, actual.sourceImages);
  if (actual.idsOnlyInSource !== undefined) push('program.idsOnlyInSource', 0, actual.idsOnlyInSource);
  if (actual.idsOnlyInTarget !== undefined) push('program.idsOnlyInTarget', 0, actual.idsOnlyInTarget);
  if (actual.sourceLegacyRefs !== undefined) push('program.legacyPhotoRefs', actual.sourceLegacyRefs, actual.targetLegacyRefs);
  if (actual.publicProgramList !== undefined) push('api.publicProgramList', baseline.publicProgramList, actual.publicProgramList);
  if (actual.publicMembership !== undefined) push('api.publicMembership', baseline.publicMembership, actual.publicMembership);
  if (actual.publicAwardee !== undefined) push('api.publicAwardee', baseline.publicAwardee, actual.publicAwardee);

  const discrepancies = rows.filter((row) => !row.ok).map((row) => `${row.metric}: expected ${row.expected}, got ${row.actual}`);
  return { ok: discrepancies.length === 0, rows, discrepancies };
};

const mysqlArgs = (connection, extra = [], database) => {
  const args = ['--host', connection.host, '--port', connection.port, '--user', connection.user, '--protocol', 'TCP'];
  if (connection.password) args.push(`--password=${connection.password}`);
  if (database ?? connection.database) args.push(database ?? connection.database);
  return [...args, ...extra];
};

const run = (command, args, { input } = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
  const stdout = [];
  const stderr = [];
  child.stdout.on('data', (chunk) => stdout.push(chunk));
  child.stderr.on('data', (chunk) => stderr.push(chunk));
  child.on('error', reject);
  child.on('close', (code) => {
    if (code !== 0) return reject(new Error(`${command} exited with code ${code}: ${Buffer.concat(stderr).toString().trim()}`));
    resolve(Buffer.concat(stdout).toString());
  });
  if (input) child.stdin.end(input); else child.stdin.end();
});

const queryRows = async (connection, sql) => {
  const output = await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['--batch', '--raw', '--skip-column-names', '-e', sql]));
  return output.split(/\r?\n/).filter((line) => line !== '').map((line) => line.split('\t'));
};

const sha256File = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

const walkFiles = (dir, acc = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
};

export const collectDatabaseMetrics = async (connection) => {
  const scalar = async (sql) => Number((await queryRows(connection, sql))[0]?.[0] ?? 0);
  const [programTotal, programPublished, programArchived, programExecutionCancelled, childPhotoRows, photoUniquePairs, membershipTotal, membershipActivePublished, membershipNoDivision, testPeriod2099, testCommissariatSlug, badDivisionNames] = await Promise.all([
    scalar('SELECT COUNT(*) FROM program_kerja'),
    scalar("SELECT COUNT(*) FROM program_kerja WHERE publicationStatus='PUBLISHED'"),
    scalar("SELECT COUNT(*) FROM program_kerja WHERE publicationStatus='ARCHIVED'"),
    scalar("SELECT COUNT(*) FROM program_kerja WHERE executionStatus='CANCELLED'"),
    scalar('SELECT COUNT(*) FROM program_kerja_photo'),
    scalar('SELECT COUNT(DISTINCT programKerjaId, fileHash) FROM program_kerja_photo'),
    scalar('SELECT COUNT(*) FROM membership'),
    scalar("SELECT COUNT(*) FROM membership WHERE membershipStatus='ACTIVE' AND publicationStatus='PUBLISHED'"),
    scalar('SELECT COUNT(*) FROM membership WHERE divisionId IS NULL'),
    scalar("SELECT COUNT(*) FROM period WHERE label LIKE '2099%'"),
    scalar("SELECT COUNT(*) FROM commissariat WHERE slug IN ('test','testing')"),
    scalar("SELECT COUNT(*) FROM division WHERE name LIKE 'BPH %' OR name LIKE '%Linkungan%'"),
  ]);
  const byCommissariatRows = await queryRows(connection, 'SELECT c.slug, COUNT(*) FROM membership m JOIN commissariat c ON c.id=m.commissariatId GROUP BY c.slug');
  const membershipByCommissariat = Object.fromEntries(byCommissariatRows.map(([slug, count]) => [slug, Number(count)]));
  const photoRows = await queryRows(connection, 'SELECT filePath, fileHash FROM program_kerja_photo ORDER BY filePath');
  const legacyRows = await queryRows(connection, "SELECT foto1 FROM program_kerja WHERE foto1 IS NOT NULL AND foto1<>'' UNION ALL SELECT foto2 FROM program_kerja WHERE foto2 IS NOT NULL AND foto2<>'' UNION ALL SELECT foto3 FROM program_kerja WHERE foto3 IS NOT NULL AND foto3<>'' UNION ALL SELECT foto4 FROM program_kerja WHERE foto4 IS NOT NULL AND foto4<>'' UNION ALL SELECT foto5 FROM program_kerja WHERE foto5 IS NOT NULL AND foto5<>'' UNION ALL SELECT foto6 FROM program_kerja WHERE foto6 IS NOT NULL AND foto6<>''");
  return { programTotal, programPublished, programArchived, programExecutionCancelled, childPhotoRows, photoUniquePairs, membershipTotal, membershipActivePublished, membershipNoDivision, testPeriod2099, testCommissariatSlug, badDivisionNames, membershipByCommissariat, photoRows, legacyRows };
};

const legacyReferenceCountSql = (table = 'program_kerja') => `SELECT COALESCE(SUM((foto1 IS NOT NULL AND foto1<>'')+(foto2 IS NOT NULL AND foto2<>'')+(foto3 IS NOT NULL AND foto3<>'')+(foto4 IS NOT NULL AND foto4<>'')+(foto5 IS NOT NULL AND foto5<>'')+(foto6 IS NOT NULL AND foto6<>'')),0) FROM ${table}`;

export const collectSourceComparison = async (targetConnection, sourceConnection) => {
  const scalar = async (connection, sql) => Number((await queryRows(connection, sql))[0]?.[0] ?? 0);
  const target = `\`${targetConnection.database}\``;
  const source = `\`${sourceConnection.database}\``;
  const [idsOnlyInSource, idsOnlyInTarget, sourceLegacyRefs, targetLegacyRefs] = await Promise.all([
    scalar(sourceConnection, `SELECT COUNT(*) FROM ${source}.program_kerja WHERE id NOT IN (SELECT id FROM ${target}.program_kerja)`),
    scalar(sourceConnection, `SELECT COUNT(*) FROM ${target}.program_kerja WHERE id NOT IN (SELECT id FROM ${source}.program_kerja)`),
    scalar(sourceConnection, legacyReferenceCountSql(`${source}.program_kerja`)),
    scalar(sourceConnection, legacyReferenceCountSql(`${target}.program_kerja`)),
  ]);
  return { idsOnlyInSource, idsOnlyInTarget, sourceLegacyRefs, targetLegacyRefs };
};

export const collectPhotoMetrics = (photoRows, legacyRows) => {
  const publicRoot = path.resolve(process.env.PROKER_WEB_PUBLIC_ROOT ?? path.join(root, 'apps/web/public'));
  const uploadRoot = path.join(publicRoot, 'uploads/proker');
  const referenced = new Set();
  let missingFiles = 0;
  let hashMismatches = 0;
  for (const [filePath, fileHash] of photoRows) {
    const disk = path.join(publicRoot, filePath.replace(/^\/+/, ''));
    referenced.add(path.resolve(disk));
    if (!existsSync(disk)) { missingFiles += 1; continue; }
    if (sha256File(disk) !== fileHash) hashMismatches += 1;
  }
  for (const [legacyPath] of legacyRows) {
    if (!legacyPath) continue;
    referenced.add(path.resolve(path.join(publicRoot, legacyPath.replace(/^\/+/, ''))));
  }
  const filesOnDisk = existsSync(uploadRoot) ? walkFiles(uploadRoot).map((file) => path.resolve(file)) : [];
  const orphanFiles = filesOnDisk.filter((file) => !referenced.has(file));
  return { photoMissingFiles: missingFiles, photoHashMismatches: hashMismatches, filesOnDisk: filesOnDisk.length, orphanFiles: orphanFiles.length };
};

export const collectHygieneMetrics = () => {
  const stageLeftovers = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name.startsWith('.proker-stage-')).length;
  const sourceRoot = path.join(root, 'data/proker/Dokumentasi Proker');
  let sourceImages = 0;
  if (existsSync(sourceRoot)) {
    const stack = [sourceRoot];
    while (stack.length) {
      const dir = stack.pop();
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) stack.push(full);
        else if (/\.(png|jpe?g)$/i.test(entry.name)) sourceImages += 1;
      }
    }
  }
  return { stageLeftovers, sourceImages };
};

export const verifyPublicApi = async (apiUrl, { fetchImpl = fetch } = {}) => {
  const request = async (endpoint) => {
    const response = await fetchImpl(`${apiUrl}${endpoint}`);
    const body = await response.json().catch(() => null);
    const data = Array.isArray(body) ? body : body?.data;
    return { status: response.status, ok: response.ok, data };
  };
  const endpoints = {};
  const health = await request('/health');
  if (!health.ok || !health.data) throw new Error(`/health failed: ${health.status}`);
  endpoints.health = health.status;
  const programList = await request('/api/commissariats/proker');
  if (!programList.ok || !Array.isArray(programList.data)) throw new Error(`/api/commissariats/proker failed: ${programList.status}`);
  endpoints.publicProgramList = programList.data.length;
  const detail = await request(`/api/commissariats/proker/${programList.data[0]?.id}`);
  if (!detail.ok) throw new Error(`/api/commissariats/proker/:id failed: ${detail.status}`);
  endpoints.programDetail = detail.status;
  const membership = await request('/api/v1/memberships');
  if (!membership.ok || !Array.isArray(membership.data)) throw new Error(`/api/v1/memberships failed: ${membership.status}`);
  endpoints.publicMembership = membership.data.length;
  const awardee = await request('/api/awardee');
  if (!awardee.ok || !Array.isArray(awardee.data)) throw new Error(`/api/awardee failed: ${awardee.status}`);
  endpoints.publicAwardee = awardee.data.length;
  const noDivision = awardee.data.filter((item) => item.division === '-').length;
  endpoints.awardeeNoDivisionDash = noDivision;
  return endpoints;
};

const renderMarkdown = (report) => {
  const lines = [];
  lines.push('# Initial-production verification');
  lines.push('');
  lines.push(`- Target database: \`${report.targetDatabase}\``);
  lines.push(`- Status: **${report.status}**`);
  lines.push(`- Orphan files (not deleted): ${report.photo.orphanFiles}`);
  lines.push('');
  lines.push('## Expected vs actual');
  lines.push('');
  lines.push('| Metric | Expected | Actual | OK |');
  lines.push('|---|---:|---:|:--:|');
  for (const row of report.rows) lines.push(`| ${row.metric} | ${row.expected} | ${row.actual} | ${row.ok ? 'yes' : 'NO'} |`);
  lines.push('');
  if (report.discrepancies.length) {
    lines.push('## Discrepancies');
    lines.push('');
    for (const row of report.discrepancies) lines.push(`- ${row}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
};

const main = async () => {
  const targetUrl = process.env.INITIAL_PRODUCTION_DATABASE_URL ?? DEFAULT_TARGET_DATABASE_URL;
  const connection = parseDatabaseUrl(targetUrl);
  assertCleanTargetDatabase(connection.database);
  const database = await collectDatabaseMetrics(connection);
  const photos = collectPhotoMetrics(database.photoRows, database.legacyRows);
  const hygiene = collectHygieneMetrics();
  const actual = { ...database, ...photos, ...hygiene };
  const sourceUrl = process.env.INITIAL_PRODUCTION_SOURCE_DATABASE_URL;
  if (sourceUrl) {
    const sourceConnection = parseDatabaseUrl(sourceUrl);
    Object.assign(actual, await collectSourceComparison(connection, sourceConnection));
  }
  const apiUrl = process.env.INITIAL_PRODUCTION_API_URL;
  let apiEndpoints = null;
  if (apiUrl) {
    apiEndpoints = await verifyPublicApi(apiUrl);
    Object.assign(actual, apiEndpoints);
  }
  const result = compareExpectedVsActual(actual);
  const report = {
    targetDatabase: connection.database,
    generatedAt: new Date().toISOString(),
    status: result.ok ? 'verified' : 'failed',
    rows: result.rows,
    discrepancies: result.discrepancies,
    photo: { filesOnDisk: photos.filesOnDisk, orphanFiles: photos.orphanFiles, orphansDeleted: false },
    api: apiUrl ? { url: apiUrl, checked: true, endpoints: apiEndpoints } : { checked: false },
    stagingDeferred: true,
  };
  const reportDir = path.resolve(process.env.INITIAL_PRODUCTION_REPORT_DIR ?? path.join(root, 'artifacts/initial-production'));
  mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, 'initial-production-verification.json');
  const mdPath = path.join(reportDir, 'initial-production-verification.md');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeFileSync(mdPath, renderMarkdown(report));
  console.log(JSON.stringify({ status: report.status, targetDatabase: report.targetDatabase, discrepancies: report.discrepancies, orphans: photos.orphanFiles, report: jsonPath }, null, 2));
  if (!result.ok) process.exitCode = 1;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
