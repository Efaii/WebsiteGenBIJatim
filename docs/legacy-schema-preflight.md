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

The backup SHA-256 and both inspection reports are printed as JSON. The temporary database is removed after a successful verification. Set `KEEP_RESTORE_DATABASE=1` only when a failed verification must be investigated; a failed restore is never considered ready for data migration.

The restore connects to the configured server but imports into the isolated temporary database only. It does not write to the source database.

## 2. Inspect the active schema and migration history

```powershell
npm run preflight:legacy-schema -- inspect
npm run preflight:legacy-schema -- plan > .\docs\legacy-schema-plan.json
```

`inspect` reports the actual tables, columns, legacy photo counts, `_prisma_migrations` history when present, and repository migrations that are not recorded as successfully applied. `plan` includes the full inspection and the additive operations still required.

If a required legacy table or `program_kerja.id` is missing, the tool stops instead of guessing. Existing but incompatible photo-table shapes also require manual review rather than an unsafe alteration.

## 3. Apply the approved additive schema only

Review the plan and obtain an explicit approval. The exact phrase is required in the environment, not merely in a comment or report:

```powershell
$env:SCHEMA_MIGRATION_APPROVAL = "SETUJUI SCHEMA MIGRASI"
npm run preflight:legacy-schema -- apply
```

The apply path can only add the nullable `dateLabel` column and the additive `program_kerja_photo` child table. It contains no `DROP`, `TRUNCATE`, `DELETE`, table recreation, or production-data reset operation. The schema is inspected again afterward; if any approved operation is incomplete, the command fails and data migration remains blocked.

This approval is deliberately separate from the later `SETUJUI DATA MIGRASI` gate. A schema preflight or schema approval is not permission to reconcile Program Kerja rows or files.
