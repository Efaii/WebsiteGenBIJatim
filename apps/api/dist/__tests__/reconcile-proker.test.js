"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const reconcile_proker_1 = require("../scripts/reconcile_proker");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.normalizeDivision("Social Environment"), "sosling");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.normalizeDivision("Organizational Development"), "psdm");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.normalizeDivision("Public Relation"), "hublu");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.normalizeCommissariat("UIN"), "uin-madura");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.sameProgramTitle("Aksi Sehat : Check UP Kesehatan (genBi Mancing)", "Aksi Sehat : Check UP Kesehatan"), true);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.statusToExecution("cancelled"), "CANCELLED");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.statusToExecution("Cancel"), "CANCELLED");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.statusToExecution("On Progress"), "ONGOING");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.isPublicProgram({ publicationStatus: "PUBLISHED", executionStatus: "COMPLETED", status: "Cancel" }), false);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.statusFromExcludedSheet({ status_excel: "cancel" }), "cancelled");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.statusFromExcludedSheet({
    original_status: "On Progress",
}), "ongoing");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.excelDate(null, "2026-01-28"), "2026-01-28");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.excelDate("28 Januari 2026", null), "2026-01-28");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.excelDate("28-30 Januari 2026", null), null);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.excelDate("28-01-2026", null), "2026-01-28");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.excelDate("Sabtu, 9 Mei 2026", null), "2026-05-09");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.excelDate("Jum'at, 30 Januari 2026", null), "2026-01-30");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.excelDate("Jum'at, 5 Desember 2025", null), "2025-12-05");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.excelDate("Minggu, 26 Oktober 2025 dan Sabtu, 29 November 2025", null), null);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.excelDate("Minggu ke-4 November 2025", null), null);
// Rentang dan rangkaian: tanggal mulai/selesai diambil dari teks sumber.
strict_1.default.deepEqual(reconcile_proker_1.reconciliationRules.extractScheduleRange("28-30 Januari 2026"), {
    start: "2026-01-28",
    end: "2026-01-30",
    approximate: false,
});
strict_1.default.deepEqual(reconcile_proker_1.reconciliationRules.extractScheduleRange("5 Oktober - 8 November 2025"), { start: "2025-10-05", end: "2025-11-08", approximate: false });
strict_1.default.deepEqual(reconcile_proker_1.reconciliationRules.extractScheduleRange("15 Oktober 2025, 19 November 2025, 27 Desember 2025, 30 Januari 2026, 26 Februari 2026"), { start: "2025-10-15", end: "2026-02-26", approximate: false });
strict_1.default.deepEqual(reconcile_proker_1.reconciliationRules.extractScheduleRange("Minggu, 14 Desember 2025 dan 25 Januari 2026"), { start: "2025-12-14", end: "2026-01-25", approximate: false });
strict_1.default.deepEqual(reconcile_proker_1.reconciliationRules.extractScheduleRange("10 - 30 November 2025, 10 Desember dan 17 Desember 2025"), { start: "2025-11-10", end: "2025-12-17", approximate: false });
// Salah ketik di tengah rangkaian ("18 Desember 2026") tidak menarik ujungnya.
strict_1.default.deepEqual(reconcile_proker_1.reconciliationRules.extractScheduleRange("Jum'at, 14 November 2025. Kamis, 18 Desember 2026. Kamis, 15 Januari 2026. Minggu, 15 Februari 2026. Minggu, 15 Maret 2026."), { start: "2025-11-14", end: "2026-03-15", approximate: false });
strict_1.default.deepEqual(reconcile_proker_1.reconciliationRules.extractScheduleRange("Oktober 2025 - Maret 2026"), { start: "2025-10-01", end: "2026-03-31", approximate: true });
strict_1.default.deepEqual(reconcile_proker_1.reconciliationRules.extractScheduleRange("Desember 2025 - Januari 2026"), { start: "2025-12-01", end: "2026-01-31", approximate: true });
strict_1.default.deepEqual(reconcile_proker_1.reconciliationRules.extractScheduleRange("Minggu ke-4 November 2025"), { start: "2025-11-24", end: "2025-11-30", approximate: true });
strict_1.default.equal(reconcile_proker_1.reconciliationRules.extractScheduleRange("Oktober 2025 - Maret 2025"), null);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.extractScheduleRange("Setiap hari Senin"), null);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.extractScheduleRange("Berkala"), null);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.extractScheduleRange("Menyusul"), null);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.extractScheduleRange("Periode 2025/2026"), null);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.extractScheduleRange("Sabtu, 9 Mei 2026"), null);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoActionFor("UPDATE", false), "LEGACY_PHOTO_REGISTRATION");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoActionFor("UPDATE", false, true), "NEW_WEBP");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoActionFor("ACTIVE_INSERT", false), "NEW_WEBP");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoActionFor("UPDATE", true), "DUPLICATE");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoMayTarget("CANCELLED_SKIP"), false);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoMayTarget("CANCELLED_EXISTING_ARCHIVE"), false);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoMayTarget("REVIEW"), false);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoMayTarget("DATABASE_UNAVAILABLE"), false);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoMayTarget("UPDATE"), true);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.photoMayTarget("ACTIVE_INSERT"), true);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.legacyOnlyAction(true), "DOCUMENTED_DATABASE_ONLY_ARCHIVE");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.legacyOnlyAction(false), "UNDOCUMENTED_DATABASE_ONLY_ARCHIVE");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.cancelledAction(true), "CANCELLED_EXISTING_ARCHIVE");
strict_1.default.equal(reconcile_proker_1.reconciliationRules.isPlaceholder("—"), true);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.isPlaceholder("-"), true);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.isPlaceholder(""), true);
strict_1.default.equal(reconcile_proker_1.reconciliationRules.isPlaceholder("GenBI Sowan"), false);
