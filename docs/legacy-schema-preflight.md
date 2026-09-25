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

The backup SHA-256 and both inspection reports are printed as JSON. The temporary database is removed after a successful verification. Set `KEEP_RESTORE_DATABASE=1` only when a failed verification must be investigated; a failed restore is never considered ready for data migration. Standard `mysqldump` `CREATE DATABASE`/`USE` directives for the configured source are stripped before import; directives for another database or qualified source references are rejected.

Successful verification writes `artifacts/migration/restore-verification.json` with the backup SHA-256, source/restored reports, source-after-restore check, target database, and an expiry. A new restore attempt first replaces older evidence with `status: "blocked"`, so stale successful evidence cannot authorize a later schema apply.

The restore connects to the configured server but imports into the isolated temporary database only. It does not write to the source database.

## 2. Inspect the active schema and migration history

```powershell
npm run preflight:legacy-schema -- inspect
npm run preflight:legacy-schema -- plan > .\docs\legacy-schema-plan.json
```

`inspect` reports the actual tables, columns, indexes, foreign keys, legacy photo counts, `_prisma_migrations` history when present, and migration discrepancies in both directions: repository migrations missing from the database, applied database migrations absent from the repository, failed/rolled-back history rows, and structural differences such as the legacy non-null `tanggalProker` versus the repository's nullable expectation. `plan` includes the full inspection and the additive operations still required. Structural conflicts are reported for review; they are not silently modified.

The required legacy inventory is the 20-table legacy snapshot used by this migration: `auditevent`, `cmsaccount`, `cmsassignment`, `cmssession`, `commissariat`, `contact_messages`, `division`, `faq`, `membership`, `membershipimportalias`, `membershipimportpreview`, `membershipimportrow`, `news`, `newscoverasset`, `newsrevision`, `newsslugalias`, `period`, `program_kerja`, `testimonial`, and `user`. If a required table or `program_kerja.id` is missing, the tool stops instead of guessing. Existing but incompatible photo-table shapes also require manual review rather than an unsafe alteration.

## 3. Review and verify the migration baseline

Before any baseline decision, generate the immutable review report:

```powershell
npm run preflight:legacy-schema -- baseline
```

This writes `artifacts/migration/legacy-schema-baseline.json`. It never runs `prisma migrate resolve`, never marks a migration applied, and never changes the database. The report records the schema fingerprint, all migration discrepancies, the Program Kerja forward scope, and the empty list of auto-resolved migrations. A database owner must review it before any baseline decision.

The report is always `review_required`; it is not a production baseline, and it does not authorize `prisma migrate resolve`. Review all missing migration-history entries against the actual restored schema with the database owner. Existing non-null `program_kerja.tanggalProker` is a structural discrepancy that requires explicit application and database-owner approval before changing nullability. `ProgramKerjaRevision` and `ProgramArtifact` are part of the earlier `20260922180000_program_cms_artifacts` migration; that migration and the separate CMS-assignment migration must be reconciled independently. Do not mark either as applied based only on the latest schema snapshot.

After the owner-approved Prisma migrations have been deployed through the normal migration flow, run `verify` to check actual schema and migration history:

```powershell
$env:SCHEMA_PLAN_HASH = "<planHash from the reviewed plan>"
$env:SCHEMA_MIGRATION_APPROVAL = "SETUJUI SCHEMA MIGRASI"
npm run preflight:legacy-schema -- verify
```

`verify` writes readiness only when the gallery schema is complete, there are no unresolved schema discrepancies, every repository migration is recorded as successful, and the exact current plan hash and approval phrase are present.

## 4. Apply the approved additive schema only

The direct `apply` command is limited to development/test databases; it is not the staging/production deployment path. Review the plan and obtain explicit approval. The exact phrase is required in the environment, not merely in a comment or report:

```powershell
$env:SCHEMA_MIGRATION_APPROVAL = "SETUJUI SCHEMA MIGRASI"
npm run preflight:legacy-schema -- apply
```

Schema apply also requires a current successful `restore-verification.json` for the same database and an exact `SCHEMA_PLAN_HASH`. Apply is refused when restore evidence is missing, expired, invalid, targeted at another database, or when structural schema conflicts need database-owner review.

The apply path is limited to the nullable `dateLabel` column and `program_kerja_photo` table. The legacy `tanggalProker NOT NULL` conflict is never modified by this helper; it remains a structural blocker until the reviewed Prisma forward migration is deployed. The helper contains no `DROP`, `TRUNCATE`, `DELETE`, table recreation, or production-data reset operation. Schema is inspected again afterward. This local helper does not reconcile Prisma migration history; for legacy environments, data migration stays blocked until reviewed Prisma migrations are deployed and `verify` succeeds.

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

## 5. Local Issue #18 acceptance

Issue #18 is accepted through the local schema-safety gate. Formal staging execution is **deferred**, not removed: the repository keeps the staging/promotion capability for future production hardening, but staging is not a current development or local-acceptance dependency.

Run the flow against the configured local development database or an isolated local legacy copy. Provide `DATABASE_URL` and `MYSQL_BIN` through the runner environment; do not commit or paste credentials:

```powershell
$env:DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim"
$env:MYSQL_BIN = "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe"
$env:BASELINE_REPORT_PATH = ".\artifacts\migration\issue18-legacy-schema-baseline.json"
$env:RESTORE_EVIDENCE_PATH = ".\artifacts\migration\issue18-restore-verification.json"

npm run preflight:legacy-schema -- restore `
  .\backups\approved-local-backup.sql `
  genbi_restore_issue18_local
npm run preflight:legacy-schema -- inspect
npm run preflight:legacy-schema -- baseline
```

The local acceptance evidence must show all 20 required tables, unchanged source counts after restore, a matching backup SHA-256, `autoResolveAppliedMigrations: []`, and `status: "review_required"` for the baseline. After the reviewed forward-only Prisma migrations have been deployed locally, run `verify` with the exact plan hash and approval phrase:

```powershell
$env:SCHEMA_PLAN_HASH = "<planHash from the reviewed local plan>"
$env:SCHEMA_MIGRATION_APPROVAL = "SETUJUI SCHEMA MIGRASI"
npm run preflight:legacy-schema -- verify
npm run check:schema-readiness
```

No automatic `prisma migrate resolve` is performed. A missing, expired, mismatched, blocked, or partial evidence file fails closed and cannot authorize a data migration. The current development database must remain untouched when creating the separate clean initial-production source.

When no local backup is available, the schema gate remains incomplete; do not substitute a staging run or mark the issue complete based only on unit tests.

After the clean target passes the schema gate, bootstrap the verified local source with separate schema and data approvals:

```powershell
$env:DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim"
$env:INITIAL_PRODUCTION_DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim_initial_production"
$env:INITIAL_PRODUCTION_SCHEMA_READINESS_PATH = ".\artifacts\migration\initial-production-schema-readiness.json"
$env:SCHEMA_MIGRATION_APPROVAL = "SETUJUI SCHEMA MIGRASI"
$env:DATA_MIGRATION_APPROVAL = "SETUJUI DATA MIGRASI"
npm run bootstrap:initial-production --workspace apps/api
```

The bootstrap is verification-first and writes only to the new clean target. It refuses a target that already contains Program Kerja, child-photo, artifact, or revision rows, preserves Membership rows already imported into the target, verifies the 153/431 Program Kerja baseline and all referenced photo hashes, and writes its report under ignored `artifacts/initial-production/`. It never copies the development test commissariat or test period.

## 6. Deferred staging and future production hardening

When a production server becomes available, the same forward-only schema evidence may be reviewed for direct initial production. Production backup, deployment approval, API/UI smoke tests, and rollback planning remain mandatory. Staging may be introduced later as an additional safety layer, but it is not required for the current release.

The retained staging acceptance flow, when intentionally activated for a future release, must use an authorized database and secret runner. It must show `status: "verified"`, all 20 required tables, unchanged source counts after restore, a matching backup SHA-256, `autoResolveAppliedMigrations: []`, and `status: "review_required"` for the baseline. No automatic `prisma migrate resolve` is performed.

## 7. Program Kerja snapshot promotion (future staging capability)

Issue #20's local result is promoted without rerunning the data reconciliation. The promotion tool is verification-first and does not perform cutover. It uses the approved baseline: 153 programs, 139 published, 14 archived, 12 cancelled execution statuses, 431 child-photo rows, 431 available/matching files, 207 new WebP files, 186 preserved source images, zero orphan files, and zero staging leftovers.

Create a source freeze marker signed by the operator and application owner, then run:

Example marker (store outside git/secure it with the promotion artifacts):

```json
{
  "status": "frozen",
  "startedAt": "2026-09-24T10:00:00.000Z",
  "endedAt": "2026-09-24T10:15:00.000Z",
  "operator": "<operator identity>",
  "applicationOwner": "<application owner identity>",
  "sourceDatabase": "<source database name>",
  "expectedMetrics": {
    "programTotal": 153,
    "childPhotoRows": 431
  }
}
```

```powershell
$env:SOURCE_FREEZE_MARKER_PATH = ".\secure\issue20-freeze-marker.json"
$env:PROMOTION_ARTIFACT_ROOT = "D:\secure-artifacts\genbi\promotion"
npm run proker-promotion -- create-snapshot
npm run proker-promotion -- verify-snapshot
```

The snapshot writes a SQL dump and file manifest under secure artifact storage and produces `promotion-manifest.json` plus `promotion-manifest.md`. It never stores credentials or dumps in git. The source is not changed.

Restore requires a new run-specific target and the exact independent approval phrase:

```powershell
$env:SNAPSHOT_ID = "<snapshot id>"
$env:STAGING_TARGET_DATABASE_URL = "mysql://<staging-user>@staging-host:3306/genbi_stage_<run_id>"
$env:STAGING_TARGET_STORAGE_ROOT = "D:\staging-storage\<run_id>"
$env:STAGING_TARGET_SOURCE_ROOT = "D:\staging-source\<run_id>"
$env:STAGING_API_URL = "https://staging.example.invalid"
$env:STAGING_CMS_USERNAME = $env:STAGING_ADMIN_USERNAME
$env:STAGING_CMS_PASSWORD = $env:STAGING_ADMIN_PASSWORD
$env:PROMOTION_RESTORE_APPROVAL = "SETUJUI RESTORE STAGING"
$env:RESTORE_APPROVAL_REFERENCE = "<approved restore record reference>"
$env:DATABASE_OWNER_APPROVAL_REFERENCE = "<database owner approval reference>"
$env:APPLICATION_OWNER_APPROVAL_REFERENCE = "<application owner approval reference>"
npm run proker-promotion -- restore-to-staging
npm run proker-promotion -- verify-staging
npm run proker-promotion -- write-promotion-manifest
```

`verify-staging` requires the staging API and an `ADMIN_GLOBAL` test account through the secret runner. It checks `/api/health`, the public Program Kerja count and visibility boundary, a detail gallery of seven photos, unauthenticated CMS archive access (`401`), and authenticated archive retrieval. It never performs a connection-alias switch; `SETUJUI CUTOVER STAGING` remains a separate deployment operation.

The target database and storage namespace must not already exist. Any mismatch or existing target fails closed and preserves evidence for diagnosis. `verify-staging` only verifies; it never performs `SETUJUI CUTOVER STAGING` or changes a connection alias. Cutover remains a separate deployment-owner operation after database/application-owner approvals and a complete authenticated `ADMIN_GLOBAL` CMS smoke test.
