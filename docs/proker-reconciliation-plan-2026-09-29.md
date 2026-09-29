# Rencana rekonsiliasi Program Kerja (29 Sep 2026)

Rekonsiliasi ulang untuk membawa perubahan tanggal ke dataset Program Kerja:
parser awalan hari, pengisian 3 tanggal konkret, penurunan 25 rentang/rangkaian
(tanggal selesai sebagai tanggal kalender), dan koreksi 2 tahun di workbook
sumber. Jumlah program, foto, dan membership tidak berubah.

Rencana ini melengkapi runbook yang sudah ada, bukan menggantinya:

- `docs/legacy-schema-preflight.md` §1-4 (backup, schema readiness, approval)
- `docs/legacy-schema-preflight.md` §7 (snapshot promotion staging, deferred)
- `docs/staging-bootstrap.md` (urutan deploy & rollback)
- `docs/initial-production-verification.md` (verifikasi awal produksi)

## Ruang lingkup

Termasuk:

- Parser `excelDate`: toleransi awalan nama hari (`"Sabtu, 9 Mei 2026"`).
- Parser `extractScheduleRange`: rentang dan rangkaian sesi → `startDate`/`endDate`,
  tanggal selesai dipakai sebagai `tanggalProker` (ADR 0009).
- Label jadwal teks tetap di `dateLabel` dan diteruskan ke payload publik.
- Koreksi tahun di sumber: Biventure 2025 (25 Nov 2025), POBIA (27 Okt 2025),
  termasuk catatan audit di workbook.

Tidak termasuk:

- Foto (431 baris, 431 file, 207 WebP, 186 sumber) dan Membership (619): tidak
  tersentuh oleh run ini.
- Perubahan schema/migrasi: tidak ada; payload publik hanya berubah perilaku.
- UNESA "Content Matrix": rentang terbalik di sumber, menunggu koreksi.
- Staging cutover dan produksi: fase terpisah, lihat Fase E dan §6.

## Baseline metrik yang tidak boleh berubah (fail-closed)

Dicek otomatis oleh `scripts/proker-promotion.mjs` (`defaultExpected`) dan
`npm run verify:initial-production`:

| Metrik | Nilai |
|---|---|
| Program total / PUBLISHED / ARCHIVED | 153 / 139 / 14 |
| executionStatus CANCELLED | 12 |
| Child-photo rows / file tersedia / hash cocok | 431 / 431 / 431 |
| WebP baru / gambar sumber / orphan / staging leftovers | 207 / 186 / 0 / 0 |

Metrik tanggal hasil run ini (baru, untuk verifikasi manual Fase D):

| Metrik | Nilai |
|---|---|
| PUBLISHED bertanggal kalender | 115 |
| Berjadwal teks tanpa tanggal | 24 (17 berkala/kondisional/relatif, 6 periode, 1 menunggu koreksi sumber) |
| Tanggal masa depan | 0 |
| Rentang terisi | 25 (6 di antaranya perkiraan bulan/minggu) |

## Fase 0 - Prasyarat

1. **Commit/merge kode** (wajib sebelum snapshot, karena `commitSha` masuk ke
   promotion manifest): `reconcile_proker.ts`, `public-program.ts`, dua test,
   `AGENTS.md`, `CONTEXT.md`, ADR 0008/0009, `ProkerCard.tsx`,
   `app/commissariat/page.tsx`.
2. **Sumber beku (freeze marker)** baru. Field wajib dan contoh ada di
   `docs/legacy-schema-preflight.md` §7; `expectedMetrics` harus
   `programTotal: 153` dan `childPhotoRows: 431`. Simpan di luar git.
3. **Workbook sumber sudah dikoreksi** di
   `C:\Users\renoa\Downloads\Data Program Kerja Updated\` (Biventure + POBIA),
   backup `.backup-2026-09-29.xlsx` tersedia untuk rollback sumber. Salin dua
   file yang sudah dikoreksi ke sumber yang dibaca pipeline:
   `data\proker\Data Program Kerja Updated\` (gitignored; sudah disalin
   29 Sep 2026). Foto sumber: `data\proker\Dokumentasi Proker` (186 file).
4. **Lingkungan**: Laragon MySQL hidup, `mysql`/`mysqldump` di PATH atau set
   `MYSQL_BIN`/`MYSQLDUMP_BIN`, `apps/api/.env` berisi `DATABASE_URL` target
   lokal (dev `genbi_jatim` untuk iterasi, `genbi_jatim_initial_production`
   untuk acceptance). Apply TIDAK boleh diarahkan ke staging/produksi.
5. **Approval yang dibutuhkan**: `SETUJUI SCHEMA MIGRASI` (artefak readiness),
   `SETUJUI DATA MIGRASI` (apply data), `SETUJUI RESTORE STAGING` (Fase E).

## Fase A - Preview read-only (wajib, gate pertama)

```powershell
cd apps/api
$env:TS_NODE_TRANSPILE_ONLY = "1"
npx ts-node src/scripts/reconcile_proker.ts `
  --source-dir "C:\Users\renoa\dev\Projects\Genbi Jatim\WebsiteGenBIJatim\data\proker" `
  --report "..\..\docs\proker-reconciliation-2026-09-29.md"
```

Gate kelulusan (dari laporan `...dry-run`/dated + JSON):

- 0 baris `REVIEW`, `POSSIBLE_MATCH`, `CONFLICT` pada `programs`.
- Perubahan tanggal terlihat: 2 koreksi tahun, 3 tanggal konkret, 25
  rentang/rangkaian dengan `startDate`/`endDate` terisi.
- Ringkasan foto tetap: 207 `NEW_WEBP`, 186 sumber, 0 orphan.
- 24 baris berjadwal teks tetap tanpa tanggal (17 berkala, 6 periode,
  1 Content Matrix).

Kalau ada REVIEW: berhenti, selesaikan review di report dulu. Apply diblokir.

## Hasil Fase A (29 Sep 2026, sudah dijalankan)

- Laporan: `docs/proker-reconciliation-2026-09-29.md` (+ `.json`), fingerprint
  input `7c85c79ff4ca4d988f009fc2755f49ec92dfc40d55df0e7687f84f1c521af45a`.
- Verdict gate: **REVIEW 0, CONFLICT 0, POSSIBLE_MATCH 0, UPDATE 0,
  UNCHANGED 139**; foto **DUPLICATE 210, ORPHAN 0**; 154 record sumber,
  186 file foto, 51 folder proker.
- Artinya: database yang dibaca (`.env` saat ini menunjuk
  `genbi_jatim_initial_production`) **sudah identik dengan hasil komputasi
  pipeline**, termasuk 25 rentang/rangkaian. Contoh terverifikasi di JSON:
  GenBI Identity 2025-10-05 → 2025-11-08; GenBI Store 2025-11-14 → 2026-03-15;
  Collab Forum 2025-11-24 → 2025-11-30 (minggu ke-4); Content Matrix tetap
  tanpa tanggal; Biventure 2025 = 2025-11-25. Tidak ada UPDATE karena semua
  sudah selaras.
- Temuan environment:
  - `genbi_jatim_initial_production` (target `.env`, dilayani API): 139
    PUBLISHED, **115 bertanggal, 25 rentang, 0 masa depan** (dataset baru).
  - `genbi_jatim` (dev): masih dataset lama, **87 bertanggal, 0 rentang,
    2 tanggal masa depan**.
- Konsekuensi urutan: jangan bootstrap acceptance dari dev sebelum dev
  di-apply (akan meregresi acceptance). Jalankan Fase C ke dev dulu.
- 2 baris LEGACY_ONLY (Regenerasi/ITS, GenBI Connect/UNAIR; keduanya sudah
  non-publik) dan 12 SOURCE_EXCLUDED_ARCHIVE tetap seperti baseline; 3
  NEW_PROGRAM berstatus excluded/cancelled di-skip (tidak di-insert).
- Preview terhadap DB **dev** (`genbi_jatim`, `DATABASE_URL` di-override) juga
  sudah dijalankan: **UPDATE 30, UNCHANGED 109, REVIEW 0**
  (`docs/proker-reconciliation-dev-2026-09-29.md` + `.json`). Ke-30 UPDATE
  persis: 25 rentang/rangkaian + 3 tanggal konkret + 2 koreksi tahun.

## Status Fase B-D (29 Sep 2026, selesai)

Dieksekusi dengan approval pemilik:

1. **Readiness schema**: `npm run preflight:legacy-schema -- verify` → status
   `ready`; `npm run check:schema-readiness` → `schemaReady: true`.
2. **Fase C apply ke dev** (`genbi_jatim`): `applied: true`, 156 plan,
   30 UPDATE, 0 file baru. Dev pasca-apply: 153/139/**115 bertanggal,
   25 rentang, 0 masa depan**; preview ulang → **UPDATE 0, UNCHANGED 139**
   (idempoten). Laporan as-executed: `docs/proker-reconciliation-dev-2026-09-29.md`;
   pemeriksaan pasca-apply: `backups/proker-reconciliation-dev-post-apply-2026-09-29.md`.
3. **Fase D verifikasi acceptance**: `npm run verify:initial-production` →
   status **verified**, `discrepancies: []`, 31 metrik ok (153/139/14/12;
   431/431/0/0 foto; 619 membership; 186 gambar sumber), cek API ok
   (`artifacts/initial-production/initial-production-verification.json`).

Catatan deviasi: bootstrap rebuild acceptance **tidak** dijalankan karena
acceptance sudah identik dengan hasil pipeline (terbukti di Fase A) dan
verifikasi lulus tanpa rebuild; jalankan `bootstrap:initial-production` bila
prosedur internal mensyaratkan provenance "build from dev" formal (butuh
bukti readiness + restore khusus target dan laporan import membership).

Bukti kunci:

- Backup dev: `backups/genbi_jatim-pre-apply-2026-09-29.sql`, SHA-256
  `036e036183a8861c466619a0d3cfa50efb2dfbf82228a95a29020a571508d2cd`.
- Bukti restore: `artifacts/migration/restore-verification.json`,
  status `verified`, restore `genbi_restore_devcheck01`, evidence SHA-256
  `4c49789e24e48d2ae6ba34e3986a22bb147a5c93719f301fdb430f778846465e`,
  berlaku sampai 6 Okt 2026.
- Readiness: `artifacts/migration/schema-readiness.json` (status `ready`).
- Plan schema: `docs/legacy-schema-plan-2026-09-29.json`, planHash
  `95e73872514875296b9df8bbce0f4aead1253dd7f886eb276657dc2dd67cba67`,
  `actions: []`, `destructiveOperations: 0`.

## Fase B - Bukti backup & schema (wajib sebelum apply)

1. Backup database target sebelum apply (mysqldump; simpan path-nya untuk
   `--backup`).
2. Verifikasi restore:
   ```powershell
   $env:MYSQL_BIN = "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe"
   $env:DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim"
   npm run verify:backup-restore
   ```
   Menghasilkan evidence backup/restore (id + hash).
3. Refresh dan validasi artefak gate apply:
   ```powershell
   npm run check:schema-readiness
   ```
   Memvalidasi `artifacts/migration/schema-readiness.json` (termasuk
   `schemaApproval: "SETUJUI SCHEMA MIGRASI"`, database cocok, belum
   kedaluwarsa) dan `artifacts/migration/restore-verification.json`
   (status `verified`, `backupSha256` cocok, belum kedaluwarsa). Detail alur:
   `docs/legacy-schema-preflight.md` §1-4.

4. Bukti khusus acceptance initial-production (terpisah dari bukti dev di atas;
   dipakai Fase D): `artifacts/migration/initial-production-schema-readiness.json`
   dan `artifacts/migration/initial-production-final-restore-verification.json`,
   dengan `database`/`restoreDatabase` = `genbi_jatim_initial_production`,
   `SCHEMA_PLAN_HASH` dicatat, dan laporan import membership tersedia di
   `artifacts/membership` (kalau belum ada untuk sumber saat ini, jalankan alur
   import membership awal lebih dulu). Pola run sebelumnya:
   `docs/initial-production-verification.md`.

## Fase C - Apply lokal (transaksional)

```powershell
cd apps/api
$env:TS_NODE_TRANSPILE_ONLY = "1"
$env:DATA_MIGRATION_APPROVAL = "SETUJUI DATA MIGRASI"
$env:DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim"   # target apply = dev
npx ts-node src/scripts/reconcile_proker.ts `
  --source-dir "C:\Users\renoa\dev\Projects\Genbi Jatim\WebsiteGenBIJatim\data\proker" `
  --report "..\..\docs\proker-reconciliation-2026-09-29.md" `
  --apply `
  --backup "<dump dari Fase B>"
```

Disarankan: ulangi Fase A dengan `DATABASE_URL` dev lebih dulu untuk melihat
daftar UPDATE yang akan ditulis (preview di atas membaca acceptance, bukan dev).

Yang terjadi: satu transaksi Prisma (update/insert per plan, arsip baris
legacy-only, upsert 431 foto anak, staging file WebP), lalu laporan ditulis
ulang. Fail-closed bila ada REVIEW, bila artefak approval tidak valid, atau
bila hash backup tidak cocok. Apply menggantikan efek patch manual sebelumnya
(patch lokal untuk 2 tahun + 3 tanggal + 25 rentang akan dihitung ulang dari
sumber + parser).

## Fase D - Acceptance lokal (bukti rilis)

1. Bangun sumber initial-production bersih dari hasil Fase C (script
   memverifikasi total 153 program dan 431 child-photo rows, menegakkan
   approval, lalu menulis laporan ke `artifacts/initial-production/`):

```powershell
cd apps/api
$env:DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim"
$env:INITIAL_PRODUCTION_DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim_initial_production"
$env:SCHEMA_MIGRATION_APPROVAL = "SETUJUI SCHEMA MIGRASI"
$env:DATA_MIGRATION_APPROVAL = "SETUJUI DATA MIGRASI"
npm run bootstrap:initial-production
```

2. Verifikasi read-only terhadap hasil (menolak database development; target
   default `genbi_jatim_initial_production`):

```powershell
$env:MYSQL_BIN = "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe"
$env:INITIAL_PRODUCTION_DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim_initial_production"
$env:INITIAL_PRODUCTION_SOURCE_DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim"
$env:INITIAL_PRODUCTION_API_URL = "http://localhost:5000"
npm run verify:initial-production
```

3. Tambahan wajib:

- `GET /health` 200; `GET /api/commissariats/proker` mengembalikan 139 baris,
  115 `dateIso`, 0 tanggal masa depan.
- Sampel rentang `GET /api/commissariats/proker/{id}`: `date` = tanggal selesai,
  `dateLabel` = teks rentang utuh (mis. "5 Oktober - 8 November 2025").
- UI: `/program` menampilkan kartu rentang apa adanya; `/commissariat` memuat
  kegiatan rentang/rangkaian (mis. GenStory 18 Mei 2026, G-NEWS 18 Apr 2026).
- Opsional: `npm run test:e2e` (butuh kredensial admin).
- Simpan laporan: `docs/proker-reconciliation-2026-09-29.md` (+ JSON) dan
  artefak verifikasi di `artifacts/initial-production/`.

## Fase E - Snapshot & promosi (saat staging dibutuhkan)

Staging sengaja ditunda untuk rilis berjalan (`docs/legacy-schema-preflight.md`
§6); urutan ini disiapkan dan baru dijalankan ketika ada environment-nya.
Tooling mempromosikan hasil lokal yang sudah diverifikasi, bukan menjalankan
ulang rekonsiliasi.

```powershell
$env:SOURCE_FREEZE_MARKER_PATH = "<freeze marker Fase 0>"
$env:PROMOTION_ARTIFACT_ROOT = "<secure artifacts>"
$env:SOURCE_DATABASE_URL = "mysql://root:@localhost:3306/genbi_jatim_initial_production"  # hasil yang sudah diverifikasi
npm run proker-promotion -- create-snapshot
npm run proker-promotion -- verify-snapshot

$env:SNAPSHOT_ID = "<snapshot id>"
$env:STAGING_TARGET_DATABASE_URL = "mysql://<user>@<host>:3306/genbi_stage_<run_id>"
$env:STAGING_TARGET_STORAGE_ROOT = "<target storage>"
$env:STAGING_TARGET_SOURCE_ROOT = "<target source storage>"
$env:PROMOTION_RESTORE_APPROVAL = "SETUJUI RESTORE STAGING"
$env:RESTORE_APPROVAL_REFERENCE = "<referensi approval restore>"
$env:DATABASE_OWNER_APPROVAL_REFERENCE = "<referensi approval database>"
$env:APPLICATION_OWNER_APPROVAL_REFERENCE = "<referensi approval aplikasi>"
npm run proker-promotion -- restore-to-staging

$env:STAGING_API_URL = "<url staging>"
$env:STAGING_CMS_USERNAME = "<akun test ADMIN_GLOBAL via secret runner>"
$env:STAGING_CMS_PASSWORD = "<secret>"
npm run proker-promotion -- verify-staging
npm run proker-promotion -- write-promotion-manifest
```

Cutover staging tetap operasi terpisah milik deployment owner
(`SETUJUI CUTOVER STAGING`), tidak dilakukan tooling ini. Produksi menyusul
sesuai `docs/initial-production-verification.md` (backup, migrasi forward,
approval deploy, smoke, rollback plan).

## Rollback

- **Database**: restore dump Fase B ke database target; forward-only, jangan
  down-migration. Bukti restore sudah diverifikasi di Fase B.
- **Sumber**: kembalikan workbook dari `.backup-2026-09-29.xlsx` bila koreksi
  tahun dibatalkan, lalu jalankan ulang Fase A-C.
- **Kode**: revert commit perubahan (murni metadata + proyeksi; tidak ada
  perubahan schema).

## Risiko & catatan

- Baseline `defaultExpected` di tooling masih valid untuk run ini (tidak ada
  perubahan jumlah). Bila snapshot melaporkan metrik berbeda, proses
  fail-closed dan wajib investigasi sebelum lanjut.
- `dateLabel` terisi saat tanggal ada hanya menambah informasi; konsumen lama
  yang memakai `dateLabel || date` tetap aman.
- "GenBI Store" memuat salah ketik "18 Desember 2026" di tengah rangkaian;
  start/selesai tetap benar karena urutan penyebutan dipakai. Koreksi sumber
  opsional.
- Dua baris workbook (Biventure, POBIA) membawa catatan audit koreksi; jangan
  hapus catatan itu saat mengedit workbook lagi.
