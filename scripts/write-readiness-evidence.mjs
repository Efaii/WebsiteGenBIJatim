import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const output = process.env.READINESS_EVIDENCE_PATH ?? 'artifacts/readiness/latest.json';
const commit = process.env.GITHUB_SHA ?? (() => { try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { return 'unknown'; } })();
const evidence = {
  commit,
  migration: process.env.MIGRATION_ID ?? 'prisma-migrate-deploy',
  seedProfile: process.env.SEED_PROFILE ?? 'e2e',
  tests: (process.env.READINESS_TESTS ?? 'health,ready,e2e-smoke').split(',').map((test) => test.trim()).filter(Boolean),
  backupId: process.env.BACKUP_EVIDENCE_ID ?? 'not-provided',
  requestIds: (process.env.READINESS_REQUEST_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean),
  generatedAt: new Date().toISOString(),
};
await mkdir(output.replace(/[\\/][^\\/]+$/, ''), { recursive: true });
await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
console.log(`Wrote sanitized readiness evidence to ${output}`);
