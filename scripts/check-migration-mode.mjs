const environment = process.env.NODE_ENV ?? 'development';
const databaseUrl = process.env.DATABASE_URL ?? '';

if (environment === 'staging' || environment === 'production') {
  if (!databaseUrl || databaseUrl.includes('genbi_jatim_test')) throw new Error('Staging/production deployment preflight requires a non-test DATABASE_URL.');
  const expectedDatabaseName = process.env.MIGRATION_GUARD_DATABASE_NAME?.trim();
  if (!expectedDatabaseName) throw new Error('MIGRATION_GUARD_DATABASE_NAME must be set in staging/production.');
  const actualDatabaseName = decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ''));
  if (actualDatabaseName !== expectedDatabaseName) throw new Error('DATABASE_URL does not match MIGRATION_GUARD_DATABASE_NAME.');
  if (process.env.USE_DB_PUSH?.trim().toLowerCase() === 'true') throw new Error('db push is forbidden for staging/production.');
  if (process.env.SCHEMA_MIGRATION_APPROVAL?.trim()) throw new Error('SCHEMA_MIGRATION_APPROVAL must be unset; this deployment preflight is read-only and never applies schema changes.');
}

if (process.env.USE_DB_PUSH === 'true' && environment !== 'development' && environment !== 'test') throw new Error('db push is only allowed for development/test disposable databases.');
console.log(`Migration mode accepted for NODE_ENV=${environment}.`);
