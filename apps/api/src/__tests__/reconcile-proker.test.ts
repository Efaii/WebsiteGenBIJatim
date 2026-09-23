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
assert.equal(reconciliationRules.statusToExecution("cancelled"), "CANCELLED");
assert.equal(reconciliationRules.statusToExecution("Cancel"), "CANCELLED");
assert.equal(reconciliationRules.statusToExecution("On Progress"), "ONGOING");
assert.equal(
  reconciliationRules.photoActionFor("UPDATE", false),
  "LEGACY_PHOTO_REGISTRATION",
);
assert.equal(
  reconciliationRules.photoActionFor("ACTIVE_INSERT", false),
  "NEW_WEBP",
);
assert.equal(reconciliationRules.photoActionFor("UPDATE", true), "DUPLICATE");

assert.equal(reconciliationRules.photoMayTarget("CANCELLED_SKIP"), false);
assert.equal(
  reconciliationRules.photoMayTarget("CANCELLED_EXISTING_DELETE"),
  false,
);
assert.equal(reconciliationRules.photoMayTarget("REVIEW"), false);
assert.equal(reconciliationRules.photoMayTarget("DATABASE_UNAVAILABLE"), false);
assert.equal(reconciliationRules.photoMayTarget("UPDATE"), true);
assert.equal(reconciliationRules.photoMayTarget("ACTIVE_INSERT"), true);
