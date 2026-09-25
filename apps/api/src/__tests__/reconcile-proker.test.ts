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
