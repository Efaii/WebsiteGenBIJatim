import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readinessPath = path.resolve(process.env.SCHEMA_READINESS_PATH ?? path.join(root, 'artifacts/migration/schema-readiness.json'));

export async function readSchemaReadiness() {
  try {
    return JSON.parse(await readFile(readinessPath, 'utf8'));
  } catch {
    throw new Error(`Schema readiness evidence is missing or invalid at ${readinessPath}; data migration is blocked.`);
  }
}

export async function assertSchemaReady() {
  const readiness = await readSchemaReadiness();
  if (readiness.status !== 'ready') throw new Error(`Schema readiness is ${String(readiness.status ?? 'unknown')}; data migration is blocked. Resolve the schema preflight first.`);
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required to bind schema readiness evidence; data migration is blocked.');
  const database = decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ''));
  if (readiness.database !== database) throw new Error(`Schema readiness targets ${String(readiness.database ?? 'unknown')}, not ${database}; data migration is blocked.`);
  return readiness;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assertSchemaReady().then((readiness) => console.log(JSON.stringify({ schemaReady: true, updatedAt: readiness.updatedAt }, null, 2)))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
