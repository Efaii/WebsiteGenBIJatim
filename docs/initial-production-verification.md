# Initial-production verification

Read-only verification of the clean local initial-production source (`genbi_jatim_initial_production`). It never writes to the database, never moves or deletes files, and refuses to run against the development database.

## Run

```powershell
$env:MYSQL_BIN = "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe"
$env:INITIAL_PRODUCTION_DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim_initial_production"
$env:INITIAL_PRODUCTION_SOURCE_DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim"   # optional, enables stable-ID comparison
$env:INITIAL_PRODUCTION_API_URL = "http://localhost:5000"                                   # optional, enables public API checks
npm run verify:initial-production
```

Artifacts are written to the gitignored `artifacts/initial-production/`:

- `initial-production-verification.json`
- `initial-production-verification.md`

The command exits non-zero when any expected-versus-actual metric differs.

## What it checks

Program Kerja: total 153, PUBLISHED 139, ARCHIVED 14, executionStatus CANCELLED 12. When a source database is supplied, it also confirms the target ID set is identical to the source (no IDs only in source or only in target) and that legacy `foto1`–`foto6` reference counts match.

Photos: 431 child rows, 431 distinct `(programKerjaId, fileHash)` pairs, 0 missing files, 0 SHA-256 mismatches, all stored as WebP.

Membership: 619 records, all `ACTIVE` and `PUBLISHED`, 127 without a division, and per-commissariat counts matching the approved baseline (ITS 87, PENS 48, UIN Madura 50, UINSA 83, UNAIR 112, UNESA 64, UNUGIRI 50, UPN Veteran Jatim 50, UTM 75).

Hygiene: no test period `2099/2100`, no test commissariat slug, no `BPH 1/2/3` or `Linkungan` division names, no leftover `.proker-stage-*` directories, and the 186 source images under `data/proker/Dokumentasi Proker` are preserved.

Public API (when `INITIAL_PRODUCTION_API_URL` is set): `/health`, `/api/commissariats/proker` list (139) and detail, `/api/v1/memberships` (619), and `/api/awardee` (619). Awardee is projected from Membership, so mock Awardee data is not used.

## Orphan files

Unreferenced files under `apps/web/public/uploads/proker` are counted and reported. They are never deleted automatically. The current run reports stale leftovers from an earlier import generation that live in program-ID directories outside the 153 target programs; the target program directories themselves contain zero orphans.

## Recovery using the clean-source backup

The clean-source backup is `artifacts/migration/initial-production-final-source.sql` with SHA-256 `41132498b72d4f0c8071122188d65c8cfaed0e9f91f7cb894c0c6bd5c46d94c7`, which matches the verified restore evidence `artifacts/migration/initial-production-final-restore-verification.json`.

Recovery is forward-only and manual: restore the dump into a new isolated database, compare it against this verification report, and only then decide on any replacement. No automated step overwrites production, and this repository contains no destructive reset path for the initial-production source.

## Staging

Formal staging acceptance and staging cutover are intentionally deferred for this release, not silently skipped. The staging tooling (`scripts/proker-promotion.mjs`, `docs/legacy-schema-preflight.md` §7) remains available for a future production lifecycle. This issue requires no staging restore, staging API, staging CMS account, or staging cutover.

## Direct production follow-up

When a production server exists, use this local acceptance report plus: a production backup, a reviewed forward-only schema migration, deployment approval, a production smoke test, and a rollback plan. Production remains out of scope until then.
