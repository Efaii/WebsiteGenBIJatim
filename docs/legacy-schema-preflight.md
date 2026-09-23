# Legacy schema preflight

This is an operator-only preparation workflow for the active legacy MySQL database. It is read-only unless the explicit schema approval gate is supplied. It does not run data reconciliation and it never resets, truncates, drops, recreates, or overwrites production tables.

## 1. Restore and verify a backup

Use a temporary database name with the required `genbi_restore_` prefix. The target must not already exist.

```powershell
$env:DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim"
npm run preflight:legacy-schema -- restore .\backups\legacy.sql genbi_restore_issue18
```

The command compares the source and restored database for:

- the complete base-table list;
- `program_kerja` row count;
- programs with populated `foto1`–`foto6` references; and
- the total number of populated legacy photo references.

The backup SHA-256 and both inspection reports are printed as JSON. The temporary database is removed after a successful verification. Set `KEEP_RESTORE_DATABASE=1` only when a failed verification must be investigated; a failed restore is never considered ready for data migration. Dumps containing `USE`, database DDL, or qualified source-database references are rejected so the restore cannot redirect writes to the source database.

Successful verification writes `artifacts/migration/restore-verification.json` with the backup SHA-256, source/restored reports, source-after-restore check, target database, and an expiry. A new restore attempt first replaces older evidence with `status: "blocked"`, so stale successful evidence cannot authorize a later schema apply.

The restore connects to the configured server but imports into the isolated temporary database only. It does not write to the source database.

## 2. Inspect the active schema and migration history

```powershell
npm run preflight:legacy-schema -- inspect
npm run preflight:legacy-schema -- plan > .\docs\legacy-schema-plan.json
```

`inspect` reports the actual tables, columns, indexes, foreign keys, legacy photo counts, `_prisma_migrations` history when present, and migration discrepancies in both directions: repository migrations missing from the database, applied database migrations absent from the repository, failed/rolled-back history rows, and structural differences such as the legacy non-null `tanggalProker` versus the repository's nullable expectation. `plan` includes the full inspection and the additive operations still required. Structural conflicts are reported for review; they are not silently modified.

If a required legacy table or `program_kerja.id` is missing, the tool stops instead of guessing. Existing but incompatible photo-table shapes also require manual review rather than an unsafe alteration.

## 3. Apply the approved additive schema only

Review the plan and obtain an explicit approval. The exact phrase is required in the environment, not merely in a comment or report:

```powershell
$env:SCHEMA_MIGRATION_APPROVAL = "SETUJUI SCHEMA MIGRASI"
npm run preflight:legacy-schema -- apply
```

Schema apply also requires a current successful `restore-verification.json` for the same database. Apply is refused when restore evidence is missing, expired, invalid, or targeted at another database.

The apply path can only add the nullable `dateLabel` column and the additive `program_kerja_photo` child table. It contains no `DROP`, `TRUNCATE`, `DELETE`, table recreation, or production-data reset operation. The schema is inspected again afterward; if any approved operation is incomplete or fails, the command writes a blocked readiness record to `artifacts/migration/schema-readiness.json` and data migration remains blocked. A successful run writes `status: "ready"`; operators must check that record before starting data migration.

Before any data-migration command, enforce the readiness gate:

```powershell
npm run check:schema-readiness
```

The command fails closed when evidence is missing, invalid, or blocked. The preflight deliberately refuses direct schema execution under `NODE_ENV=staging` or `production`; those environments must use a reviewed Prisma migration through the repository's `check:migration-mode` and `prisma migrate deploy` flow.

The destructive legacy importer has a second independent gate. It requires both readiness evidence for the same database and:

```powershell
$env:DATA_MIGRATION_APPROVAL = "SETUJUI DATA MIGRASI"
```

This approval is deliberately separate from the later `SETUJUI DATA MIGRASI` gate. A schema preflight or schema approval is not permission to reconcile Program Kerja rows or files.
