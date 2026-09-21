const { spawnSync } = require('node:child_process');
const profile = process.argv[2] || 'local';
if (profile === 'e2e' && !process.env.DATABASE_URL?.match(/genbi_jatim_test(?:$|[?])/i)) {
  throw new Error('seed:e2e requires DATABASE_URL to target genbi_jatim_test.');
}
if (profile === 'staging' && process.env.NODE_ENV !== 'staging') {
  throw new Error('seed:staging requires NODE_ENV=staging.');
}
if (profile === 'staging' && (!process.env.DATABASE_URL?.includes('_staging') || !process.env.BACKUP_EVIDENCE_ID?.trim())) {
  throw new Error('seed:staging requires a staging-only database URL and verified BACKUP_EVIDENCE_ID.');
}
const result = spawnSync('npx', ['prisma', 'db', 'seed'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, SEED_PROFILE: profile },
});
process.exit(result.status ?? 1);
