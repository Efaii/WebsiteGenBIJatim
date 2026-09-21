const environment = process.env.NODE_ENV ?? 'development';
const databaseUrl = process.env.DATABASE_URL ?? '';

if (environment === 'staging' || environment === 'production') {
  if (!databaseUrl || databaseUrl.includes('genbi_jatim_test')) throw new Error('Staging/production migration guard requires a non-test DATABASE_URL.');
  if (process.env.USE_DB_PUSH === 'true') throw new Error('db push is forbidden for staging/production; use prisma migrate deploy.');
}

if (process.env.USE_DB_PUSH === 'true' && environment !== 'development' && environment !== 'test') throw new Error('db push is only allowed for development/test disposable databases.');
console.log(`Migration mode accepted for NODE_ENV=${environment}.`);
