import assert from "node:assert/strict";
import { reconciliationRules } from "../scripts/reconcile_proker";

assert.equal(
  reconciliationRules.normalizeDivision("Social Environment"),
  "sosling",
);
assert.equal(
  reconciliationRules.normalizeDivision("Organizational Development"),
  "psdm",
);
assert.equal(reconciliationRules.normalizeDivision("Public Relation"), "hublu");
assert.equal(reconciliationRules.normalizeCommissariat("UIN"), "uin-madura");
assert.equal(
  reconciliationRules.sameProgramTitle(
    "Aksi Sehat : Check UP Kesehatan (genBi Mancing)",
    "Aksi Sehat : Check UP Kesehatan",
  ),
  true,
);
assert.equal(reconciliationRules.statusToExecution("cancelled"), "CANCELLED");
assert.equal(reconciliationRules.statusToExecution("Cancel"), "CANCELLED");
assert.equal(reconciliationRules.statusToExecution("On Progress"), "ONGOING");
assert.equal(
  reconciliationRules.isPublicProgram({ publicationStatus: "PUBLISHED", executionStatus: "COMPLETED", status: "Cancel" }),
  false,
);
assert.equal(
  reconciliationRules.statusFromExcludedSheet({ status_excel: "cancel" }),
  "cancelled",
);
assert.equal(
  reconciliationRules.statusFromExcludedSheet({
    original_status: "On Progress",
  }),
  "ongoing",
);
assert.equal(reconciliationRules.excelDate(null, "2026-01-28"), "2026-01-28");
assert.equal(
  reconciliationRules.excelDate("28 Januari 2026", null),
  "2026-01-28",
);
assert.equal(reconciliationRules.excelDate("28-30 Januari 2026", null), null);
assert.equal(reconciliationRules.excelDate("28-01-2026", null), "2026-01-28");
assert.equal(
  reconciliationRules.excelDate("Sabtu, 9 Mei 2026", null),
  "2026-05-09",
);
assert.equal(
  reconciliationRules.excelDate("Jum'at, 30 Januari 2026", null),
  "2026-01-30",
);
assert.equal(
  reconciliationRules.excelDate("Jum'at, 5 Desember 2025", null),
  "2025-12-05",
);
assert.equal(
  reconciliationRules.excelDate(
    "Minggu, 26 Oktober 2025 dan Sabtu, 29 November 2025",
    null,
  ),
  null,
);
assert.equal(
  reconciliationRules.excelDate("Minggu ke-4 November 2025", null),
  null,
);

// Rentang dan rangkaian: tanggal mulai/selesai diambil dari teks sumber.
assert.deepEqual(reconciliationRules.extractScheduleRange("28-30 Januari 2026"), {
  start: "2026-01-28",
  end: "2026-01-30",
  approximate: false,
});
assert.deepEqual(
  reconciliationRules.extractScheduleRange("5 Oktober - 8 November 2025"),
  { start: "2025-10-05", end: "2025-11-08", approximate: false },
);
assert.deepEqual(
  reconciliationRules.extractScheduleRange(
    "15 Oktober 2025, 19 November 2025, 27 Desember 2025, 30 Januari 2026, 26 Februari 2026",
  ),
  { start: "2025-10-15", end: "2026-02-26", approximate: false },
);
assert.deepEqual(
  reconciliationRules.extractScheduleRange(
    "Minggu, 14 Desember 2025 dan 25 Januari 2026",
  ),
  { start: "2025-12-14", end: "2026-01-25", approximate: false },
);
assert.deepEqual(
  reconciliationRules.extractScheduleRange(
    "10 - 30 November 2025, 10 Desember dan 17 Desember 2025",
  ),
  { start: "2025-11-10", end: "2025-12-17", approximate: false },
);
// Salah ketik di tengah rangkaian ("18 Desember 2026") tidak menarik ujungnya.
assert.deepEqual(
  reconciliationRules.extractScheduleRange(
    "Jum'at, 14 November 2025. Kamis, 18 Desember 2026. Kamis, 15 Januari 2026. Minggu, 15 Februari 2026. Minggu, 15 Maret 2026.",
  ),
  { start: "2025-11-14", end: "2026-03-15", approximate: false },
);
assert.deepEqual(
  reconciliationRules.extractScheduleRange("Oktober 2025 - Maret 2026"),
  { start: "2025-10-01", end: "2026-03-31", approximate: true },
);
assert.deepEqual(
  reconciliationRules.extractScheduleRange("Desember 2025 - Januari 2026"),
  { start: "2025-12-01", end: "2026-01-31", approximate: true },
);
assert.deepEqual(
  reconciliationRules.extractScheduleRange("Minggu ke-4 November 2025"),
  { start: "2025-11-24", end: "2025-11-30", approximate: true },
);
assert.equal(
  reconciliationRules.extractScheduleRange("Oktober 2025 - Maret 2025"),
  null,
);
assert.equal(
  reconciliationRules.extractScheduleRange("Setiap hari Senin"),
  null,
);
assert.equal(reconciliationRules.extractScheduleRange("Berkala"), null);
assert.equal(reconciliationRules.extractScheduleRange("Menyusul"), null);
assert.equal(
  reconciliationRules.extractScheduleRange("Periode 2025/2026"),
  null,
);
assert.equal(
  reconciliationRules.extractScheduleRange("Sabtu, 9 Mei 2026"),
  null,
);
assert.equal(
  reconciliationRules.photoActionFor("UPDATE", false),
  "LEGACY_PHOTO_REGISTRATION",
);
assert.equal(
  reconciliationRules.photoActionFor("UPDATE", false, true),
  "NEW_WEBP",
);
assert.equal(
  reconciliationRules.photoActionFor("ACTIVE_INSERT", false),
  "NEW_WEBP",
);
assert.equal(reconciliationRules.photoActionFor("UPDATE", true), "DUPLICATE");

assert.equal(reconciliationRules.photoMayTarget("CANCELLED_SKIP"), false);
assert.equal(
  reconciliationRules.photoMayTarget("CANCELLED_EXISTING_ARCHIVE"),
  false,
);
assert.equal(reconciliationRules.photoMayTarget("REVIEW"), false);
assert.equal(reconciliationRules.photoMayTarget("DATABASE_UNAVAILABLE"), false);
assert.equal(reconciliationRules.photoMayTarget("UPDATE"), true);
assert.equal(reconciliationRules.photoMayTarget("ACTIVE_INSERT"), true);
assert.equal(
  reconciliationRules.legacyOnlyAction(true),
  "DOCUMENTED_DATABASE_ONLY_ARCHIVE",
);
assert.equal(
  reconciliationRules.legacyOnlyAction(false),
  "UNDOCUMENTED_DATABASE_ONLY_ARCHIVE",
);
assert.equal(
  reconciliationRules.cancelledAction(true),
  "CANCELLED_EXISTING_ARCHIVE",
);
assert.equal(reconciliationRules.isPlaceholder("—"), true);
assert.equal(reconciliationRules.isPlaceholder("-"), true);
assert.equal(reconciliationRules.isPlaceholder(""), true);
assert.equal(reconciliationRules.isPlaceholder("GenBI Sowan"), false);
