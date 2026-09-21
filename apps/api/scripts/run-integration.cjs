const { spawnSync } = require('node:child_process');

if (!process.env.DATABASE_URL?.match(/genbi_jatim_test(?:$|[?])/i)) {
  throw new Error('Refusing integration tests: DATABASE_URL must target genbi_jatim_test.');
}

for (const file of ['dist/__tests__/integration-guard.test.js', 'dist/__tests__/schema-constraints.integration.test.js']) {
  const result = spawnSync(process.execPath, [file], { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test', RUN_INTEGRATION_TESTS: '1' } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
