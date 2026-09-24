import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readinessPath = path.resolve(process.env.SCHEMA_READINESS_PATH ?? path.join(root, 'artifacts/migration/schema-readiness.json'));
const restoreEvidencePath = path.resolve(process.env.RESTORE_EVIDENCE_PATH ?? path.join(root, 'artifacts/migration/restore-verification.json'));

export function databaseNameFromUrl(value) {
  const database = decodeURIComponent(new URL(value).pathname.replace(/^\//, ''));
  if (!database) throw new Error('DATABASE_URL must include a database name; data migration is blocked.');
  return database;
}

export function validateSchemaReadiness(readiness, { database, planHash, now = Date.now() }) {
  if (readiness.status !== 'ready') throw new Error(`Schema readiness is ${String(readiness.status ?? 'unknown')}; data migration is blocked. Resolve the schema preflight first.`);
  if (readiness.database !== database) throw new Error(`Schema readiness targets ${String(readiness.database ?? 'unknown')}, not ${database}; data migration is blocked.`);
  if (readiness.dataMigrationReady !== true || readiness.migrationApplied !== true) throw new Error('Schema readiness does not confirm deployed migration history; data migration is blocked.');
  if (readiness.schemaApproval !== 'SETUJUI SCHEMA MIGRASI') throw new Error('Schema readiness is missing exact schema approval evidence; data migration is blocked.');
  if (!readiness.expiresAt || Date.parse(readiness.expiresAt) <= now) throw new Error('Schema readiness evidence is expired or missing an expiry; data migration is blocked.');
  if (!readiness.planHash) throw new Error('Schema readiness evidence is missing planHash; data migration is blocked.');
  if (planHash && readiness.planHash !== planHash) throw new Error('Schema readiness planHash does not match the approved plan; data migration is blocked.');
  const recordedRestore = readiness.restoreEvidence;
  if (!recordedRestore || recordedRestore.status !== 'verified' || recordedRestore.sourceDatabase !== database || !recordedRestore.backupSha256 || !/^[a-f0-9]{64}$/i.test(recordedRestore.backupSha256) || !recordedRestore.expiresAt || Date.parse(recordedRestore.expiresAt) <= now) throw new Error('Schema readiness does not bind a current restore verification; data migration is blocked.');
  return readiness;
}

export function validateRestoreEvidence(evidence, { database, now = Date.now() }) {
  if (evidence.status !== 'verified') throw new Error(`Backup restore evidence is ${String(evidence.status ?? 'missing')}; data migration is blocked.`);
  if (evidence.sourceDatabase !== database) throw new Error(`Backup restore evidence targets ${String(evidence.sourceDatabase ?? 'unknown')}, not ${database}; data migration is blocked.`);
  if (!evidence.backupSha256 || !/^[a-f0-9]{64}$/i.test(evidence.backupSha256)) throw new Error('Backup restore evidence is missing a valid SHA-256; data migration is blocked.');
  if (!evidence.expiresAt || Date.parse(evidence.expiresAt) <= now) throw new Error('Backup restore evidence is expired or missing an expiry; data migration is blocked.');
  return evidence;
}

export async function readSchemaReadiness() {
  try {
    return JSON.parse(await readFile(readinessPath, 'utf8'));
  } catch {
    throw new Error(`Schema readiness evidence is missing or invalid at ${readinessPath}; data migration is blocked.`);
  }
}

export async function readRestoreEvidence() {
  try {
    return JSON.parse(await readFile(restoreEvidencePath, 'utf8'));
  } catch {
    throw new Error(`Backup restore evidence is missing or invalid at ${restoreEvidencePath}; data migration is blocked.`);
  }
}

export async function assertSchemaReady() {
  const readiness = await readSchemaReadiness();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Schema readiness evidence is missing a DATABASE_URL binding; data migration is blocked.');
  const database = databaseNameFromUrl(databaseUrl);
  const validatedReadiness = validateSchemaReadiness(readiness, { database, planHash: process.env.SCHEMA_PLAN_HASH });
  const restoreEvidence = validateRestoreEvidence(await readRestoreEvidence(), { database });
  return { readiness: validatedReadiness, restoreEvidence };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assertSchemaReady().then(({ readiness, restoreEvidence }) => console.log(JSON.stringify({ schemaReady: true, updatedAt: readiness.updatedAt, restoreVerifiedAt: restoreEvidence.verifiedAt }, null, 2)))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
