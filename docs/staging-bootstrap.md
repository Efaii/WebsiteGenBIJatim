# Staging bootstrap and smoke gate

This document is the reproducible operational contract for local, E2E, and staging environments.

## Local

1. Copy `apps/api/.env.example` to `apps/api/.env` and replace every `replace-with-*` value.
2. Copy `apps/web/.env.example` to `apps/web/.env.local`.
3. Run `npm ci`.
4. Run `cd apps/api; npx prisma generate; npx prisma db push` (`db push` is local/disposable only).
5. Run `npm run seed:local --workspace api`.
6. Start the API on port `5000`, then start the Web app on port `3000`.
7. Run `npm run test:e2e` with `API_URL=http://127.0.0.1:5000` and explicit admin credentials.

## E2E / CI

Use an isolated MySQL database named `genbi_jatim_test`, never a developer database:

```powershell
$env:DATABASE_URL = 'mysql://root:root@127.0.0.1:3306/genbi_jatim_test'
$env:NODE_ENV = 'test'
$env:ADMIN_USERNAME = 'ci-admin'
$env:ADMIN_PASSWORD = '<generated secret>'
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run seed:e2e --workspace api
npm run test:integration --workspace api
```

The E2E profile is idempotent and only upserts deterministic master data. It never runs the destructive Program kerja importer.

## Staging deployment order and rollback

1. Verify a database backup ID and restore verification ID.
2. Deploy the API artifact.
3. Run `prisma migrate deploy` and verify migration output.
4. Run `seed:staging` only with `NODE_ENV=staging` and explicit secrets.
5. Verify `/ready`, then run the E2E smoke gate.
6. Deploy Web after API readiness succeeds.

Migrations must be backward-compatible with the previous application during rollout. Rollback means rolling the application artifact back while retaining applied forward-compatible migrations; destructive down migrations are not automated.

The staging reset guard refuses to run unless `NODE_ENV=staging`, `ALLOW_STAGING_RESET=true`, and `BACKUP_EVIDENCE_ID` are present:

```powershell
npm run guard:staging-reset
```

The CI backup/restore verification runs `mysqldump` against the isolated `genbi_jatim_test`, restores into a run-specific isolated database, and compares the table names and row counts. Local use requires `mysqldump` and `mysql` on `PATH`. The staging reset guard does not itself execute a reset and never stores backup contents in the repository.

## Evidence

`npm run evidence:readiness` writes `artifacts/readiness/latest.json` containing only commit SHA, migration, seed profile, test names, backup ID, sanitized request IDs, and timestamp. It does not include credentials, database URLs, XLSX contents, or private artifacts.
