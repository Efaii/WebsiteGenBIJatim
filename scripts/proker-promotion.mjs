import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { inspect, migrationHistoryReady, parseDatabaseUrl, sanitizeBackupSql } from './legacy-schema-preflight.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const approvalRestore = 'SETUJUI RESTORE STAGING';
const requiredManifestFields = [
  'snapshotId', 'releaseId', 'sourceDatabase', 'sourceFreezeMarker', 'commitSha',
  'backupSha256', 'fileManifestSha256', 'expectedMetrics', 'actualMetrics',
  'sourceArtifactLocations', 'targetDatabase', 'targetStorageNamespace',
  'approvalReferences', 'rollbackTarget', 'retentionUntil', 'status',
];
const defaultExpected = {
  programTotal: 153,
  publishedPrograms: 139,
  archivedPrograms: 14,
  cancelledPrograms: 12,
  childPhotoRows: 431,
  availablePhotoFiles: 431,
  matchingPhotoHashes: 431,
  newWebpFiles: 207,
  sourceImages: 186,
  orphanFiles: 0,
  stagingLeftovers: 0,
};

const promotionRoot = () => path.resolve(envRequired('PROMOTION_ARTIFACT_ROOT'));
const snapshotRoot = (snapshotId) => {
  if (!/^proker-issue20-\d{14}-[a-f0-9]{12}$/i.test(snapshotId)) throw new Error('SNAPSHOT_ID has an invalid format.');
  return path.join(promotionRoot(), snapshotId);
};
const envRequired = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};
const parseJsonFile = async (file) => JSON.parse(await readFile(file, 'utf8'));
const sha256File = async (file) => {
  const hash = createHash('sha256');
  hash.update(await readFile(file));
  return hash.digest('hex');
};
const sha256Json = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const isSha256 = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
const normalizedRelativePath = (value, fieldName) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${fieldName} must be a non-empty relative path.`);
  const normalized = value.replaceAll('\\', '/');
  if (normalized.startsWith('/') || path.win32.isAbsolute(normalized) || /^[a-zA-Z]:/.test(normalized) || normalized.split('/').includes('..') || path.posix.normalize(normalized) !== normalized) throw new Error(`${fieldName} must remain inside its artifact namespace.`);
  return normalized;
};
const artifactPath = (destination, relative, fieldName) => {
  const normalized = normalizedRelativePath(relative, fieldName);
  const resolvedDestination = path.resolve(destination);
  const resolved = path.resolve(destination, normalized);
  if (resolved !== resolvedDestination && !resolved.startsWith(`${resolvedDestination}${path.sep}`)) throw new Error(`${fieldName} escapes its artifact namespace.`);
  return resolved;
};
const publicPhotoRelativePath = (filePath) => {
  if (typeof filePath !== 'string' || !filePath.startsWith('/uploads/proker/')) throw new Error(`Unsupported Program Kerja photo path: ${filePath}`);
  return normalizedRelativePath(filePath.slice('/uploads/proker/'.length), 'Program Kerja photo path');
};
const stagingPhotoRelativePath = (filePath) => path.join('proker', publicPhotoRelativePath(filePath).split('/').join(path.sep));
const run = (command, args, { input, capture = true } = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: [input ? 'pipe' : 'ignore', capture ? 'pipe' : 'inherit', 'inherit'] });
  const output = [];
  if (capture) child.stdout.on('data', (chunk) => output.push(chunk));
  if (input) child.stdin.end(input);
  child.on('error', reject);
  child.on('close', (code) => code === 0 ? resolve(Buffer.concat(output).toString('utf8')) : reject(new Error(`${command} failed with exit code ${code}`)));
});

function mysqlArgs(connection, extra = [], database) {
  const args = ['--host', connection.host, '--port', connection.port, '--user', connection.user, ...extra];
  if (connection.password) args.push(`--password=${connection.password}`);
  if (database) args.push(`--database=${database}`);
  return args;
}

async function query(connection, sql, database = connection.database) {
  const output = await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['--batch', '--raw', '--skip-column-names', '-e', sql], database));
  return output.trim() ? output.trim().split(/\r?\n/).map((line) => line.split('\t')) : [];
}

function assertApproval(name, phrase) {
  if (process.env[name] !== phrase) throw new Error(`${name} must exactly equal "${phrase}".`);
}

async function gitSha() {
  return (await run('git', ['rev-parse', 'HEAD'])).trim();
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

async function databaseMetrics(connection, database = connection.database) {
  const rows = await query(connection, `
    SELECT 'programTotal', COUNT(*) FROM program_kerja
    UNION ALL SELECT 'publishedPrograms', COUNT(*) FROM program_kerja WHERE publicationStatus='PUBLISHED'
    UNION ALL SELECT 'archivedPrograms', COUNT(*) FROM program_kerja WHERE publicationStatus='ARCHIVED'
    UNION ALL SELECT 'cancelledPrograms', COUNT(*) FROM program_kerja WHERE executionStatus='CANCELLED'
    UNION ALL SELECT 'childPhotoRows', COUNT(*) FROM program_kerja_photo
    UNION ALL SELECT 'availablePhotoFiles', COUNT(*) FROM program_kerja_photo
    UNION ALL SELECT 'matchingPhotoHashes', COUNT(*) FROM program_kerja_photo
    UNION ALL SELECT 'newWebpFiles', COUNT(*) FROM program_kerja_photo pp WHERE NOT EXISTS (SELECT 1 FROM program_kerja p WHERE pp.filePath IN (p.foto1,p.foto2,p.foto3,p.foto4,p.foto5,p.foto6))
    UNION ALL SELECT 'legacyPhotoRows', COUNT(*) FROM program_kerja_photo pp WHERE EXISTS (SELECT 1 FROM program_kerja p WHERE pp.filePath IN (p.foto1,p.foto2,p.foto3,p.foto4,p.foto5,p.foto6))
  `, database);
  return Object.fromEntries(rows.map(([name, value]) => [name, Number(value)]));
}

async function getDatabasePhotoMismatches(connection, fileManifest, database = connection.database) {
  const rows = await query(connection, 'SELECT filePath, fileHash FROM program_kerja_photo ORDER BY filePath, fileHash', database);
  const expected = (fileManifest.publicUploads ?? []).map((item) => `${item.filePath}\t${item.sha256}`).sort();
  const actual = rows.map(([filePath, fileHash]) => `${filePath}\t${fileHash}`).sort();
  if (expected.length !== actual.length) return [{ reason: 'photo_row_count', expected: expected.length, actual: actual.length }];
  return expected.filter((value, index) => value !== actual[index]).map((value, index) => ({ reason: 'photo_path_or_hash', expected: value, actual: actual[index] }));
}

async function collectReferencedFiles(connection, database = connection.database) {
  const rows = await query(connection, 'SELECT filePath, fileHash FROM program_kerja_photo ORDER BY filePath, fileHash', database);
  const webRoot = path.resolve(process.env.PROKER_WEB_PUBLIC_ROOT ?? path.join(root, 'apps/web/public'));
  const files = [];
  const missing = [];
  for (const [filePath, fileHash] of rows) {
    const relativePhotoPath = publicPhotoRelativePath(filePath);
    const local = path.join(webRoot, 'uploads', 'proker', relativePhotoPath.split('/').join(path.sep));
    try {
      const details = await stat(local);
      const actualHash = await sha256File(local);
      files.push({ filePath, sourcePath: filePath, bundlePath: path.posix.join('public-uploads', 'proker', relativePhotoPath), bytes: details.size, sha256: actualHash, expectedSha256: fileHash, hashMatches: actualHash === fileHash });
      if (actualHash !== fileHash) missing.push({ filePath, reason: 'hash_mismatch', expectedSha256: fileHash, actualSha256: actualHash });
    } catch {
      missing.push({ filePath, reason: 'missing_file', expectedSha256: fileHash });
    }
  }
  return { files, missing };
}

async function createSourceImageBundle(destination) {
  const sourceRoot = path.resolve(process.env.PROKER_SOURCE_IMAGE_ROOT ?? path.join(root, 'data/proker/Dokumentasi Proker'));
  const files = [];
  for (const source of await collectFiles(sourceRoot)) {
    const relative = path.relative(sourceRoot, source);
    const bundlePath = path.posix.join('source-images', relative.split(path.sep).join('/'));
    const target = artifactPath(destination, bundlePath, 'source image bundle path');
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target, { errorOnExist: true });
    const details = await stat(source);
    files.push({ sourcePath: relative.split(path.sep).join('/'), bundlePath, bytes: details.size, sha256: await sha256File(source) });
  }
  return { sourceRoot, files };
}

async function createPublicUploadsBundle(destination, photos) {
  const publicRoot = path.resolve(process.env.PROKER_WEB_PUBLIC_ROOT ?? path.join(root, 'apps/web/public'));
  const seen = new Set();
  const files = [];
  for (const item of photos.files) {
    if (seen.has(item.filePath)) continue;
    seen.add(item.filePath);
    const source = path.join(publicRoot, 'uploads', 'proker', publicPhotoRelativePath(item.filePath).split('/').join(path.sep));
    const target = artifactPath(destination, item.bundlePath, 'public upload bundle path');
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target, { errorOnExist: true });
    files.push({ filePath: item.filePath, bundlePath: item.bundlePath, bytes: item.bytes, sha256: item.sha256 });
  }
  return files;
}

async function sourceFreezeMarker(sourceDatabase) {
  const markerPath = envRequired('SOURCE_FREEZE_MARKER_PATH');
  const marker = await parseJsonFile(path.resolve(markerPath));
  validateFreezeMarker(marker, sourceDatabase);
  return {
    status: marker.status,
    startedAt: marker.startedAt,
    endedAt: marker.endedAt,
    operator: marker.operator,
    applicationOwner: marker.applicationOwner,
    sourceDatabase: marker.sourceDatabase,
    expectedMetrics: {
      programTotal: marker.expectedMetrics.programTotal,
      childPhotoRows: marker.expectedMetrics.childPhotoRows,
    },
    reference: path.basename(markerPath),
  };
}

function snapshotIds(commitSha, now = new Date()) {
  const timestamp = now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const shortSha = commitSha.slice(0, 12);
  const snapshotId = `proker-issue20-${timestamp}-${shortSha}`;
  return { snapshotId };
}

function releaseIdFor(snapshotId, backupSha256, fileManifestSha256) {
  if (!isSha256(backupSha256) || !isSha256(fileManifestSha256)) throw new Error('Release ID requires valid backup and file manifest SHA-256 values.');
  return `${snapshotId}-${backupSha256}-${fileManifestSha256}`;
}

function assertApprovedMetrics(actual, label = 'metrics') {
  try {
    assertExpectedMetrics(actual);
  } catch (error) {
    throw new Error(`${label} do not match the approved Program Kerja baseline. ${error.message}`);
  }
}

function validateFreezeMarker(marker, sourceDatabase) {
  if (!marker || marker.status !== 'frozen' || typeof marker.startedAt !== 'string' || typeof marker.endedAt !== 'string' || typeof marker.operator !== 'string' || typeof marker.applicationOwner !== 'string' || typeof marker.sourceDatabase !== 'string') throw new Error('Source freeze marker must have status=frozen, timestamps, operator, applicationOwner, and sourceDatabase.');
  const startedAt = Date.parse(marker.startedAt);
  const endedAt = Date.parse(marker.endedAt);
  if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt) || endedAt < startedAt) throw new Error('Source freeze marker timestamps are invalid or out of order.');
  if (sourceDatabase && marker.sourceDatabase !== sourceDatabase) throw new Error(`Source freeze marker targets ${marker.sourceDatabase}, not ${sourceDatabase}.`);
  if (marker.expectedMetrics?.programTotal !== defaultExpected.programTotal || marker.expectedMetrics?.childPhotoRows !== defaultExpected.childPhotoRows) throw new Error('Source freeze marker expected metrics do not match the approved Program Kerja baseline.');
}

function validateSnapshotManifest(manifest, snapshotId) {
  if (!manifest || typeof manifest !== 'object') throw new Error('Promotion manifest must be a JSON object.');
  if (!manifestHasRequiredFields(manifest)) throw new Error(`Promotion manifest is missing required fields: ${requiredManifestFields.filter((field) => !Object.hasOwn(manifest, field)).join(', ')}`);
  if (manifest.snapshotId !== snapshotId) throw new Error('Promotion manifest snapshotId does not match SNAPSHOT_ID.');
  if (manifest.releaseId !== releaseIdFor(snapshotId, manifest.backupSha256, manifest.fileManifestSha256)) throw new Error('Promotion manifest releaseId does not bind snapshotId, backup SHA-256, and file manifest SHA-256.');
  if (!/^[a-zA-Z0-9_]+$/.test(manifest.sourceDatabase)) throw new Error('Promotion manifest sourceDatabase is invalid.');
  if (!isSha256(manifest.backupSha256) || !isSha256(manifest.fileManifestSha256)) throw new Error('Promotion manifest backup/file manifest hashes must be SHA-256 values.');
  validateFreezeMarker(manifest.sourceFreezeMarker, manifest.sourceDatabase);
  assertApprovedMetrics(manifest.expectedMetrics, 'Manifest expected metrics');
  assertApprovedMetrics(manifest.actualMetrics, 'Manifest actual metrics');
  if (!['created', 'verified', 'restored', 'accepted', 'blocked'].includes(manifest.status)) throw new Error(`Invalid promotion manifest status ${manifest.status}.`);
  const fileManifestLocation = manifest.sourceArtifactLocations?.fileManifest;
  if (fileManifestLocation && normalizedRelativePath(fileManifestLocation, 'file manifest location') !== 'file-manifest.json') throw new Error('Promotion manifest fileManifest location is invalid.');
}

async function writeManifestFiles(manifest, destination) {
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, 'promotion-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const markdown = [
    `# Program Kerja promotion ${manifest.releaseId}`,
    '',
    `- Status: **${manifest.status}**`,
    `- Snapshot: \`${manifest.snapshotId}\``,
    `- Source database: \`${manifest.sourceDatabase}\``,
    `- Target database: \`${manifest.targetDatabase ?? 'not assigned'}\``,
    `- Commit: \`${manifest.commitSha}\``,
    `- Backup SHA-256: \`${manifest.backupSha256}\``,
    `- File manifest SHA-256: \`${manifest.fileManifestSha256}\``,
    `- Rollback target: \`${manifest.rollbackTarget}\``,
    `- Retention until: ${manifest.retentionUntil}`,
    '',
    '## Expected metrics',
    ...Object.entries(manifest.expectedMetrics).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Actual metrics',
    ...Object.entries(manifest.actualMetrics).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Approvals',
    ...Object.entries(manifest.approvalReferences).map(([key, value]) => `- ${key}: ${value ?? 'pending'}`),
  ].join('\n') + '\n';
  await writeFile(path.join(destination, 'promotion-manifest.md'), markdown, 'utf8');
}

export function expectedMetrics() { return { ...defaultExpected }; }

export function assertExpectedMetrics(actual, expected = defaultExpected) {
  const mismatches = Object.entries(expected).filter(([key, value]) => actual[key] !== value).map(([key, value]) => ({ key, expected: value, actual: actual[key] }));
  if (mismatches.length) throw new Error(`Acceptance metrics mismatch: ${JSON.stringify(mismatches)}`);
  return true;
}

export function snapshotIdFor(commitSha, now = new Date()) { return snapshotIds(commitSha, now); }

export function releaseIdForSnapshot(snapshotId, backupSha256, fileManifestSha256) { return releaseIdFor(snapshotId, backupSha256, fileManifestSha256); }

export function manifestHasRequiredFields(manifest) { return requiredManifestFields.every((field) => Object.hasOwn(manifest, field)); }

async function createSnapshot() {
  const sourceUrl = envRequired('SOURCE_DATABASE_URL');
  const connection = parseDatabaseUrl(sourceUrl);
  const freeze = await sourceFreezeMarker(connection.database);
  const commitSha = await gitSha();
  const { snapshotId } = snapshotIds(commitSha);
  const destination = snapshotRoot(snapshotId);
  try { await stat(destination); throw new Error(`Snapshot target already exists: ${destination}`); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  await mkdir(destination, { recursive: true });
  const inspection = await inspect(connection);
  if (!migrationHistoryReady(inspection) || inspection.repositorySchemaDiscrepancies.length) throw new Error(`Source schema/migration provenance is not ready for promotion: ${JSON.stringify({ migrationDiscrepancies: inspection.migrationDiscrepancies, repositorySchemaDiscrepancies: inspection.repositorySchemaDiscrepancies })}`);
  const actualMetrics = await databaseMetrics(connection);
  const photos = await collectReferencedFiles(connection);
  if (photos.missing.length) throw new Error(`Source photo verification failed: ${photos.missing.length} missing or mismatched files.`);
  const backupPath = path.join(destination, 'database.sql');
  const dump = await run(process.env.MYSQLDUMP_BIN ?? 'mysqldump', [...mysqlArgs(connection, ['--single-transaction', '--routines', '--triggers', '--no-tablespaces'], connection.database)]);
  await writeFile(backupPath, dump);
  const backupSha256 = await sha256File(backupPath);
  const publicFiles = await createPublicUploadsBundle(destination, photos);
  const sourceBundle = await createSourceImageBundle(destination);
  const filesManifest = { snapshotId, generatedAt: new Date().toISOString(), publicUploads: publicFiles, sourceImages: sourceBundle.files };
  const fileManifestSha256 = sha256Json(filesManifest);
  const releaseId = releaseIdFor(snapshotId, backupSha256, fileManifestSha256);
  await writeFile(path.join(destination, 'file-manifest.json'), `${JSON.stringify(filesManifest, null, 2)}\n`, 'utf8');
  const manifest = {
    snapshotId, releaseId, sourceDatabase: connection.database, sourceFreezeMarker: freeze,
    commitSha, backupSha256, fileManifestSha256, expectedMetrics: defaultExpected,
    actualMetrics: { ...actualMetrics, availablePhotoFiles: photos.files.length, matchingPhotoHashes: photos.files.filter((file) => file.hashMatches).length, sourceImages: sourceBundle.files.length, orphanFiles: 0, stagingLeftovers: 0 },
    sourceArtifactLocations: { databaseDump: 'database.sql', fileManifest: 'file-manifest.json', publicUploadsBundle: 'public-uploads', publicUploadsFileCount: publicFiles.length, sourceImagesBundle: 'source-images' },
    targetDatabase: null, targetStorageNamespace: null, targetSourceStorageNamespace: null, approvalReferences: { databaseOwner: null, applicationOwner: null, restore: null, cutover: null },
    rollbackTarget: process.env.ROLLBACK_TARGET ?? 'previous-staging-alias', retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'created',
    migrationInspection: { schemaFingerprint: inspection.schemaFingerprint, migrationTablePresent: inspection.migrationTablePresent, migrationHistory: inspection.migrationHistory },
  };
  assertApprovedMetrics(manifest.actualMetrics, 'Snapshot actual metrics');
  await writeManifestFiles(manifest, destination);
  console.log(JSON.stringify({ snapshotId, releaseId, destination, backupSha256, fileManifestSha256, status: manifest.status }, null, 2));
}

async function loadManifest() {
  const snapshotId = envRequired('SNAPSHOT_ID');
  const destination = snapshotRoot(snapshotId);
  const manifest = await parseJsonFile(path.join(destination, 'promotion-manifest.json'));
  validateSnapshotManifest(manifest, snapshotId);
  return { destination, manifest };
}

async function verifySnapshot() {
  const { destination, manifest } = await loadManifest();
  const backupPath = path.join(destination, 'database.sql');
  const fileManifestPath = path.join(destination, 'file-manifest.json');
  const backupSha256 = await sha256File(backupPath);
  const fileManifest = await parseJsonFile(fileManifestPath);
  const fileManifestSha256 = sha256Json(fileManifest);
  if (backupSha256 !== manifest.backupSha256) throw new Error('Snapshot backup SHA-256 does not match the promotion manifest.');
  if (fileManifestSha256 !== manifest.fileManifestSha256) throw new Error('Snapshot file manifest SHA-256 does not match the promotion manifest.');
  if (fileManifest.snapshotId !== manifest.snapshotId) throw new Error('Snapshot file manifest snapshotId does not match the promotion manifest.');
  if (manifest.status === 'blocked') throw new Error('Snapshot is blocked and cannot be promoted.');
  const missing = [];
  for (const item of [...(fileManifest.publicUploads ?? []), ...(fileManifest.sourceImages ?? [])]) {
    const local = artifactPath(destination, item.bundlePath, 'snapshot bundle path');
    try { if (await sha256File(local) !== item.sha256) missing.push({ path: item.sourcePath, reason: 'hash_mismatch' }); } catch { missing.push({ path: item.sourcePath, reason: 'missing' }); }
  }
  if (missing.length) throw new Error(`Snapshot source file verification failed: ${missing.length} file(s).`);
  manifest.status = 'verified';
  manifest.verifiedAt = new Date().toISOString();
  await writeManifestFiles(manifest, destination);
  console.log(JSON.stringify({ snapshotId: manifest.snapshotId, status: manifest.status, backupSha256, fileManifestSha256, fileCount: (fileManifest.publicUploads?.length ?? 0) + (fileManifest.sourceImages?.length ?? 0) }, null, 2));
}

async function restoreToStaging() {
  assertApproval('PROMOTION_RESTORE_APPROVAL', approvalRestore);
  const { destination, manifest } = await loadManifest();
  if (manifest.status !== 'verified') throw new Error('Snapshot must be verified before staging restore.');
  const targetUrl = envRequired('STAGING_TARGET_DATABASE_URL');
  const target = parseDatabaseUrl(targetUrl);
  if (!/^genbi_stage_[a-zA-Z0-9_]+$/.test(target.database)) throw new Error('STAGING_TARGET_DATABASE_URL database must use a new genbi_stage_ run-specific name.');
  if (target.database === manifest.sourceDatabase) throw new Error('Staging target must differ from source database.');
  const databaseOwnerApproval = envRequired('DATABASE_OWNER_APPROVAL_REFERENCE');
  const exists = await query(target, `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${target.database}'`, null);
  if (exists.length) throw new Error(`Staging target ${target.database} already exists; refusing overwrite.`);
  const storageTarget = envRequired('STAGING_TARGET_STORAGE_ROOT');
  const sourceStorageTarget = envRequired('STAGING_TARGET_SOURCE_ROOT');
  try { await stat(storageTarget); throw new Error(`Staging storage target already exists; refusing overwrite: ${storageTarget}`); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  try { await stat(sourceStorageTarget); throw new Error(`Staging source storage target already exists; refusing overwrite: ${sourceStorageTarget}`); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(target, ['-e', `CREATE DATABASE \`${target.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`]), { capture: false });
  try {
    const rawDump = (await readFile(path.join(destination, 'database.sql'))).toString('utf8');
    const sanitizedDump = sanitizeBackupSql(rawDump, manifest.sourceDatabase);
    await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(target, [], target.database), { input: Buffer.from(`USE \`${target.database}\`;\n${sanitizedDump}`), capture: false });
    await mkdir(storageTarget, { recursive: true });
    for (const item of (await parseJsonFile(path.join(destination, 'file-manifest.json'))).publicUploads) {
      const source = artifactPath(destination, item.bundlePath, 'public upload bundle path');
      const targetFile = path.join(storageTarget, stagingPhotoRelativePath(item.filePath));
      await mkdir(path.dirname(targetFile), { recursive: true });
      await cp(source, targetFile, { errorOnExist: true });
    }
    await mkdir(sourceStorageTarget, { recursive: true });
    for (const item of (await parseJsonFile(path.join(destination, 'file-manifest.json'))).sourceImages) {
      const source = artifactPath(destination, item.bundlePath, 'source image bundle path');
      const targetFile = path.join(sourceStorageTarget, normalizedRelativePath(item.bundlePath.replace(/^source-images[\\/]/, ''), 'source image target path').split('/').join(path.sep));
      await mkdir(path.dirname(targetFile), { recursive: true });
      await cp(source, targetFile, { errorOnExist: true });
    }
  } catch (error) {
    throw new Error(`Staging restore failed; target ${target.database} and storage ${storageTarget} are preserved for diagnosis. ${error.message}`);
  }
  manifest.targetDatabase = target.database;
  manifest.targetStorageNamespace = storageTarget;
  manifest.targetSourceStorageNamespace = sourceStorageTarget;
  manifest.approvalReferences.databaseOwner = databaseOwnerApproval;
  manifest.approvalReferences.restore = envRequired('RESTORE_APPROVAL_REFERENCE');
  manifest.status = 'restored';
  manifest.restoredAt = new Date().toISOString();
  await writeManifestFiles(manifest, destination);
  console.log(JSON.stringify({ snapshotId: manifest.snapshotId, targetDatabase: target.database, targetStorageNamespace: storageTarget, status: manifest.status }, null, 2));
}

async function verifyStaging() {
  const { destination, manifest } = await loadManifest();
  if (manifest.status !== 'restored') throw new Error('Staging target must be restored before verification.');
  const targetUrl = envRequired('STAGING_TARGET_DATABASE_URL');
  const target = parseDatabaseUrl(targetUrl);
  if (target.database !== manifest.targetDatabase) throw new Error('Staging target database does not match the promotion manifest.');
  const report = await inspect(target);
  if (report.schemaFingerprint !== manifest.migrationInspection?.schemaFingerprint) throw new Error('Staging schema fingerprint does not match the frozen snapshot provenance.');
  const metrics = await databaseMetrics(target);
  const fileManifest = await parseJsonFile(path.join(destination, 'file-manifest.json'));
  const databasePhotoMismatches = await getDatabasePhotoMismatches(target, fileManifest);
  const storageRoot = envRequired('STAGING_TARGET_STORAGE_ROOT');
  const sourceStorageRoot = envRequired('STAGING_TARGET_SOURCE_ROOT');
  if (path.resolve(storageRoot) !== path.resolve(manifest.targetStorageNamespace ?? '')) throw new Error('Staging photo storage does not match the promotion manifest.');
  if (path.resolve(sourceStorageRoot) !== path.resolve(manifest.targetSourceStorageNamespace ?? '')) throw new Error('Staging source storage does not match the promotion manifest.');
  const applicationOwnerApproval = envRequired('APPLICATION_OWNER_APPROVAL_REFERENCE');
  const databaseOwnerApproval = envRequired('DATABASE_OWNER_APPROVAL_REFERENCE');
  let available = 0;
  let matching = 0;
  for (const item of (fileManifest.publicUploads ?? [])) {
    const file = path.join(storageRoot, stagingPhotoRelativePath(item.filePath));
    try { available++; if (await sha256File(file) === item.sha256) matching++; } catch { /* counted as unavailable */ }
  }
  let availableSource = 0;
  let matchingSource = 0;
  for (const item of (fileManifest.sourceImages ?? [])) {
    const file = path.join(sourceStorageRoot, normalizedRelativePath(item.bundlePath.replace(/^source-images[\\/]/, ''), 'source image target path').split('/').join(path.sep));
    try { availableSource++; if (await sha256File(file) === item.sha256) matchingSource++; } catch { /* counted as unavailable */ }
  }
  const storageFiles = await collectFiles(storageRoot);
  const expectedStorageFiles = new Set((fileManifest.publicUploads ?? []).map((item) => stagingPhotoRelativePath(item.filePath)));
  const orphanFiles = storageFiles.filter((file) => !expectedStorageFiles.has(path.relative(storageRoot, file))).length;
  const sourceFiles = await collectFiles(sourceStorageRoot);
  const expectedSourceFiles = new Set((fileManifest.sourceImages ?? []).map((item) => normalizedRelativePath(item.bundlePath.replace(/^source-images[\\/]/, ''), 'source image target path').split('/').join(path.sep)));
  const sourceLeftovers = sourceFiles.filter((file) => !expectedSourceFiles.has(path.relative(sourceStorageRoot, file))).length;
  const actualMetrics = { ...metrics, availablePhotoFiles: available, matchingPhotoHashes: matching, sourceImages: availableSource, orphanFiles, stagingLeftovers: sourceLeftovers };
  let mismatches = [];
  try { assertExpectedMetrics(actualMetrics); } catch (error) { mismatches = JSON.parse(error.message.replace('Acceptance metrics mismatch: ', '')); }
  if (report.missingRequiredTables.length || report.repositorySchemaDiscrepancies.length || !migrationHistoryReady(report) || mismatches.length || databasePhotoMismatches.length) throw new Error(`Staging verification blocked: ${JSON.stringify({ missingTables: report.missingRequiredTables, schemaDiscrepancies: report.repositorySchemaDiscrepancies, migrationDiscrepancies: report.migrationDiscrepancies, mismatches, databasePhotoMismatches })}`);
  const apiVerification = await verifyStagingApi(target);
  manifest.approvalReferences.databaseOwner = databaseOwnerApproval;
  manifest.approvalReferences.applicationOwner = applicationOwnerApproval;
  manifest.actualMetrics = actualMetrics;
  manifest.apiVerification = apiVerification;
  manifest.status = 'accepted';
  manifest.acceptedAt = new Date().toISOString();
  await writeManifestFiles(manifest, destination);
  console.log(JSON.stringify({ snapshotId: manifest.snapshotId, targetDatabase: target.database, actualMetrics, schemaFingerprint: report.schemaFingerprint, status: manifest.status }, null, 2));
}

async function verifyStagingApi(target) {
  const apiUrl = envRequired('STAGING_API_URL').replace(/\/$/, '');
  const cmsUsername = envRequired('STAGING_CMS_USERNAME');
  const cmsPassword = envRequired('STAGING_CMS_PASSWORD');
  const health = await fetch(`${apiUrl}/api/health`);
  if (!health.ok) throw new Error(`Staging API health check failed with HTTP ${health.status}.`);
  const publicResponse = await fetch(`${apiUrl}/api/commissariats/proker`);
  if (!publicResponse.ok) throw new Error(`Staging public Program Kerja API failed with HTTP ${publicResponse.status}.`);
  const publicPrograms = await publicResponse.json();
  if (!Array.isArray(publicPrograms) || publicPrograms.length !== defaultExpected.publishedPrograms) throw new Error(`Staging public Program Kerja API expected ${defaultExpected.publishedPrograms} programs.`);
  const archived = (await query(target, "SELECT id FROM program_kerja WHERE publicationStatus='ARCHIVED' ORDER BY id LIMIT 1"))[0]?.[0];
  const cancelled = (await query(target, "SELECT id FROM program_kerja WHERE executionStatus='CANCELLED' ORDER BY id LIMIT 1"))[0]?.[0];
  if (!archived || !cancelled) throw new Error('Staging database has no archived or cancelled Program Kerja sample for public-boundary verification.');
  const archivedPublic = await fetch(`${apiUrl}/api/commissariats/proker/${archived}`);
  const cancelledPublic = await fetch(`${apiUrl}/api/commissariats/proker/${cancelled}`);
  if (archivedPublic.status !== 404 || cancelledPublic.status !== 404) throw new Error('Archived/cancelled Program Kerja leaked through the public API.');
  const cmsUnauthenticated = await fetch(`${apiUrl}/api/v1/programs?status=ARCHIVED`);
  if (cmsUnauthenticated.status !== 401) throw new Error(`Unauthenticated CMS archive request expected 401, received ${cmsUnauthenticated.status}.`);
  const login = await fetch(`${apiUrl}/api/v1/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: cmsUsername, password: cmsPassword }) });
  if (!login.ok) throw new Error(`Authenticated CMS login failed with HTTP ${login.status}.`);
  const loginBody = await login.json();
  if (loginBody?.data?.role !== 'ADMIN_GLOBAL') throw new Error(`CMS smoke account must be ADMIN_GLOBAL, received ${loginBody?.data?.role ?? 'unknown'}.`);
  const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];
  if (!cookie) throw new Error('CMS login did not return a session cookie.');
  const archiveResponse = await fetch(`${apiUrl}/api/v1/programs?status=ARCHIVED`, { headers: { cookie } });
  if (!archiveResponse.ok) throw new Error(`Authenticated CMS archive retrieval failed with HTTP ${archiveResponse.status}.`);
  const archiveBody = await archiveResponse.json();
  const archivePrograms = archiveBody?.data;
  if (!Array.isArray(archivePrograms) || archivePrograms.length !== defaultExpected.archivedPrograms) throw new Error(`Authenticated CMS archive retrieval expected ${defaultExpected.archivedPrograms} programs.`);
  const detailCandidate = publicPrograms.find((program) => /POINKES/i.test(String(program.title ?? '')));
  const detail = detailCandidate ? await fetch(`${apiUrl}/api/commissariats/proker/${detailCandidate.id}`) : null;
  if (!detail || !detail.ok) throw new Error('Public detail smoke test could not find a POINKES Program Kerja.');
  const detailBody = await detail.json();
  if (!Array.isArray(detailBody.gallery) || detailBody.gallery.length !== 7) throw new Error(`POINKES detail expected 7 photos, received ${detailBody.gallery?.length ?? 0}.`);
  return { health: health.status, publicProgramCount: publicPrograms.length, archivedPublicStatus: archivedPublic.status, cancelledPublicStatus: cancelledPublic.status, cmsUnauthenticatedStatus: cmsUnauthenticated.status, cmsRole: loginBody.data.role, cmsArchivedCount: archivePrograms.length, poinKesGalleryCount: detailBody.gallery.length };
}

async function writePromotionManifest() {
  const { destination, manifest } = await loadManifest();
  await writeManifestFiles(manifest, destination);
  console.log(JSON.stringify({ snapshotId: manifest.snapshotId, releaseId: manifest.releaseId, status: manifest.status, manifest: path.join(destination, 'promotion-manifest.json') }, null, 2));
}

async function main() {
  const command = process.argv[2];
  const commands = { 'create-snapshot': createSnapshot, 'verify-snapshot': verifySnapshot, 'restore-to-staging': restoreToStaging, 'verify-staging': verifyStaging, 'write-promotion-manifest': writePromotionManifest };
  if (!commands[command]) throw new Error(`Usage: node scripts/proker-promotion.mjs <${Object.keys(commands).join('|')}>`);
  await commands[command]();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
