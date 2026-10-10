import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readinessPath = path.resolve(process.env.SCHEMA_READINESS_PATH ?? path.join(root, 'artifacts/migration/schema-readiness.json'));
const restoreEvidencePath = path.resolve(process.env.RESTORE_EVIDENCE_PATH ?? path.join(root, 'artifacts/migration/restore-verification.json'));
const migrationDirectory = path.resolve(process.env.PRISMA_MIGRATIONS_PATH ?? path.join(root, 'apps/api/prisma/migrations'));
const requiredLegacyTables = [
  'auditevent', 'cmsaccount', 'cmsassignment', 'cmssession', 'commissariat', 'contact_messages',
  'division', 'faq', 'membership', 'membershipimportalias', 'membershipimportpreview',
  'membershipimportrow', 'news', 'newscoverasset', 'newsrevision', 'newsslugalias', 'period',
  'program_kerja', 'testimonial', 'user',
];

const canonicalize = (value) => Array.isArray(value)
  ? value.map(canonicalize)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
    : value;

export const restoreEvidenceSha256 = (evidence) => {
  const { evidenceSha256: _ignored, ...unsignedEvidence } = evidence;
  return createHash('sha256').update(JSON.stringify(canonicalize(unsignedEvidence))).digest('hex');
};

export async function prismaMigrationSet(directory = migrationDirectory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const migrations = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const sqlPath = path.join(directory, entry.name, 'migration.sql');
    let sql;
    try { sql = await readFile(sqlPath, 'utf8'); }
    catch (error) { if (error?.code === 'ENOENT') throw new Error(`Prisma migration ${entry.name} is missing migration.sql; deployment is blocked.`); throw error; }
    migrations.push({ name: entry.name, sha256: createHash('sha256').update(sql).digest('hex') });
  }
  if (migrations.length === 0) throw new Error('No Prisma migration SQL found in the runtime image; deployment is blocked.');
  return migrations.sort((left, right) => left.name.localeCompare(right.name));
}

export function prismaMigrationSetHash(migrations) {
  return createHash('sha256').update(JSON.stringify(migrations)).digest('hex');
}

export function databaseNameFromUrl(value) {
  const database = decodeURIComponent(new URL(value).pathname.replace(/^\//, ''));
  if (!database) throw new Error('DATABASE_URL must include a database name; deployment is blocked.');
  return database;
}

const restoreEvidenceFields = ['status', 'sourceDatabase', 'restoreDatabase', 'backupSha256', 'verifiedAt', 'expiresAt', 'evidenceSha256'];

const assertSameRestoreEvidence = (left, right) => {
  if (restoreEvidenceFields.some((field) => left?.[field] !== right?.[field])) throw new Error('Schema readiness restore evidence does not match the current restore verification; deployment is blocked.');
};

export function validateSchemaReadiness(readiness, { database, planHash, restoreEvidence, now = Date.now() }) {
  if (readiness.status !== 'ready') throw new Error(`Schema readiness is ${String(readiness.status ?? 'unknown')}; deployment is blocked. Resolve the schema preflight first.`);
  if (readiness.database !== database) throw new Error(`Schema readiness targets ${String(readiness.database ?? 'unknown')}, not ${database}; deployment is blocked.`);
  if (readiness.dataMigrationReady !== true || readiness.migrationApplied !== true) throw new Error('Schema readiness does not confirm deployed migration history; deployment is blocked.');
  if (readiness.schemaApproval !== 'SETUJUI SCHEMA MIGRASI') throw new Error('Schema readiness is missing exact schema approval evidence; deployment is blocked.');
  const readinessExpiry = Date.parse(readiness.expiresAt ?? '');
  if (!readiness.expiresAt || !Number.isFinite(readinessExpiry) || readinessExpiry <= now) throw new Error('Schema readiness evidence is expired, invalid, or missing an expiry; deployment is blocked.');
  if (!readiness.planHash) throw new Error('Schema readiness evidence is missing planHash; deployment is blocked.');
  if (planHash && readiness.planHash !== planHash) throw new Error('Schema readiness planHash does not match the approved plan; deployment is blocked.');
  if (!Array.isArray(readiness.migrationSet) || readiness.migrationSet.length === 0) throw new Error('Schema readiness is missing the reviewed Prisma migration inventory; deployment is blocked.');
  if (readiness.migrationSetHash !== prismaMigrationSetHash(readiness.migrationSet)) throw new Error('Schema readiness Prisma migration inventory digest is invalid; deployment is blocked.');
  const recordedRestore = readiness.restoreEvidence;
  const recordedRestoreExpiry = Date.parse(recordedRestore?.expiresAt ?? '');
  if (!recordedRestore || recordedRestore.status !== 'verified' || recordedRestore.sourceDatabase !== database || !recordedRestore.backupSha256 || !/^[a-f0-9]{64}$/i.test(recordedRestore.backupSha256) || !recordedRestore.restoreDatabase || !/^genbi_restore_[a-zA-Z0-9_]+$/.test(recordedRestore.restoreDatabase) || !recordedRestore.verifiedAt || !Number.isFinite(Date.parse(recordedRestore.verifiedAt)) || !recordedRestore.expiresAt || !Number.isFinite(recordedRestoreExpiry) || recordedRestoreExpiry <= now || !recordedRestore.evidenceSha256 || !/^[a-f0-9]{64}$/i.test(recordedRestore.evidenceSha256)) throw new Error('Schema readiness does not bind a current restore verification; deployment is blocked.');
  if (!restoreEvidence) throw new Error('Schema readiness is missing current restore verification; deployment is blocked.');
  assertSameRestoreEvidence(recordedRestore, restoreEvidence);
  return readiness;
}

export function validateRestoreEvidence(evidence, { database, now = Date.now() }) {
  if (evidence.status !== 'verified') throw new Error(`Backup restore evidence is ${String(evidence.status ?? 'missing')}; deployment is blocked.`);
  if (evidence.sourceDatabase !== database) throw new Error(`Backup restore evidence targets ${String(evidence.sourceDatabase ?? 'unknown')}, not ${database}; deployment is blocked.`);
  if (!evidence.backupSha256 || !/^[a-f0-9]{64}$/i.test(evidence.backupSha256)) throw new Error('Backup restore evidence is missing a valid SHA-256; deployment is blocked.');
  if (!evidence.restoreDatabase || !/^genbi_restore_[a-zA-Z0-9_]+$/.test(evidence.restoreDatabase)) throw new Error('Backup restore evidence is missing a valid isolated restore database; deployment is blocked.');
  if (!evidence.verifiedAt || !Number.isFinite(Date.parse(evidence.verifiedAt))) throw new Error('Backup restore evidence is missing a valid verification timestamp; deployment is blocked.');
  if (!evidence.evidenceSha256 || !/^[a-f0-9]{64}$/i.test(evidence.evidenceSha256) || evidence.evidenceSha256 !== restoreEvidenceSha256(evidence)) throw new Error('Backup restore evidence digest is missing or invalid; deployment is blocked.');
  const expiry = Date.parse(evidence.expiresAt ?? '');
  if (!evidence.expiresAt || !Number.isFinite(expiry) || expiry <= now) throw new Error('Backup restore evidence is expired, invalid, or missing an expiry; deployment is blocked.');
  const reports = [evidence.source, evidence.restoredDatabase, evidence.sourceAfter];
  const hasRequiredInventory = (report) => {
    const required = Array.isArray(report?.requiredLegacyTables) ? report.requiredLegacyTables.map((table) => String(table).toLowerCase()) : [];
    const inventory = Array.isArray(report?.tables) ? new Set(report.tables.map((table) => String(table).toLowerCase())) : new Set();
    return required.length === requiredLegacyTables.length
      && new Set(required).size === requiredLegacyTables.length
      && requiredLegacyTables.every((table) => required.includes(table))
      && requiredLegacyTables.every((table) => inventory.has(table))
    && Array.isArray(report.missingRequiredTables)
      && report.missingRequiredTables.length === 0;
  };
  if (reports.some((report) => !hasRequiredInventory(report) || typeof report.programCount !== 'number' || typeof report.programsWithLegacyPhotos !== 'number' || typeof report.legacyPhotoReferenceCount !== 'number')) throw new Error('Backup restore evidence is partial; required inventory and metric reports are missing.');
  if (evidence.source.database !== database || evidence.sourceAfter.database !== database || evidence.restoredDatabase.database !== evidence.restoreDatabase) throw new Error('Backup restore evidence report databases do not match the source or isolated restore database; deployment is blocked.');
  for (const metric of ['programCount', 'programsWithLegacyPhotos', 'legacyPhotoReferenceCount']) {
    if (evidence.source[metric] !== evidence.restoredDatabase[metric] || evidence.source[metric] !== evidence.sourceAfter[metric]) throw new Error(`Backup restore evidence ${metric} does not match across source, restore, and source-after reports; deployment is blocked.`);
  }
  return evidence;
}

export async function readSchemaReadiness() {
  try {
    return JSON.parse(await readFile(readinessPath, 'utf8'));
  } catch {
    throw new Error(`Schema readiness evidence is missing or invalid at ${readinessPath}; deployment is blocked.`);
  }
}

export async function readRestoreEvidence() {
  try {
    return JSON.parse(await readFile(restoreEvidencePath, 'utf8'));
  } catch {
    throw new Error(`Backup restore evidence is missing or invalid at ${restoreEvidencePath}; deployment is blocked.`);
  }
}

export async function assertSchemaReady() {
  const readiness = await readSchemaReadiness();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Schema readiness evidence is missing a DATABASE_URL binding; deployment is blocked.');
  const database = databaseNameFromUrl(databaseUrl);
  const planHash = process.env.SCHEMA_PLAN_HASH?.trim();
  if (!planHash) throw new Error('SCHEMA_PLAN_HASH is required to validate the reviewed schema plan; deployment is blocked.');
  const deployedMigrationSet = await prismaMigrationSet();
  const deployedMigrationSetHash = prismaMigrationSetHash(deployedMigrationSet);
  if (JSON.stringify(readiness.migrationSet) !== JSON.stringify(deployedMigrationSet) || readiness.migrationSetHash !== deployedMigrationSetHash) throw new Error('Schema readiness does not match the exact Prisma migration SQL shipped in this image; deployment is blocked.');
  const restoreEvidence = validateRestoreEvidence(await readRestoreEvidence(), { database });
  const validatedReadiness = validateSchemaReadiness(readiness, { database, planHash, restoreEvidence });
  return { readiness: validatedReadiness, restoreEvidence };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assertSchemaReady().then(({ readiness, restoreEvidence }) => console.log(JSON.stringify({ schemaReady: true, updatedAt: readiness.updatedAt, restoreVerifiedAt: restoreEvidence.verifiedAt }, null, 2)))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
