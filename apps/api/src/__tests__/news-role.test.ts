import assert from "node:assert/strict";
import { CmsRole } from "@prisma/client";
import {
  assertNewsRoleTransition,
  resolveNewsAuthor,
} from "../domain/news-lifecycle";

// Admin global menjalankan seluruh lifecycle.
assert.doesNotThrow(() =>
  assertNewsRoleTransition(CmsRole.ADMIN_GLOBAL, "DRAFT", "SUBMITTED"),
);
assert.doesNotThrow(() =>
  assertNewsRoleTransition(CmsRole.ADMIN_GLOBAL, "SUBMITTED", "APPROVED"),
);
assert.doesNotThrow(() =>
  assertNewsRoleTransition(CmsRole.ADMIN_GLOBAL, "APPROVED", "PUBLISHED"),
);
assert.doesNotThrow(() =>
  assertNewsRoleTransition(
    CmsRole.ADMIN_GLOBAL,
    "SUBMITTED",
    "REJECTED",
    "catatan redaksi",
  ),
);
assert.doesNotThrow(() =>
  assertNewsRoleTransition(CmsRole.ADMIN_GLOBAL, "PUBLISHED", "DRAFT"),
);

// Sekretaris hanya mengajukan.
assert.doesNotThrow(() =>
  assertNewsRoleTransition(CmsRole.SEKRETARIS_UMUM, "DRAFT", "SUBMITTED"),
);
assert.doesNotThrow(() =>
  assertNewsRoleTransition(CmsRole.SEKRETARIS_DIVISI, "DRAFT", "SUBMITTED"),
);
assert.throws(
  () =>
    assertNewsRoleTransition(CmsRole.SEKRETARIS_UMUM, "SUBMITTED", "APPROVED"),
  /publisher/,
);
assert.throws(
  () =>
    assertNewsRoleTransition(
      CmsRole.SEKRETARIS_DIVISI,
      "APPROVED",
      "PUBLISHED",
    ),
  /publisher/,
);
assert.throws(
  () =>
    assertNewsRoleTransition(
      CmsRole.SEKRETARIS_UMUM,
      "SUBMITTED",
      "REJECTED",
      "alasan",
    ),
  /publisher/,
);
assert.throws(
  () => assertNewsRoleTransition(CmsRole.SEKRETARIS_UMUM, "PUBLISHED", "DRAFT"),
  /publisher/,
);

// Transisi di luar peta tetap ditolak sebagai konflik.
assert.throws(
  () => assertNewsRoleTransition(CmsRole.ADMIN_GLOBAL, "DRAFT", "PUBLISHED"),
  /Cannot transition/,
);
assert.throws(
  () => assertNewsRoleTransition(CmsRole.SEKRETARIS_UMUM, "DRAFT", "APPROVED"),
  /Cannot transition/,
);

// Penolakan wajib alasan tetap berlaku untuk admin global.
assert.throws(
  () => assertNewsRoleTransition(CmsRole.ADMIN_GLOBAL, "SUBMITTED", "REJECTED"),
  /Rejection reason/,
);

// Nama penerbit: isian menang; fallback nama akun untuk sekretaris, kanal untuk admin.
assert.equal(
  resolveNewsAuthor("Nama Orang", CmsRole.SEKRETARIS_UMUM, "Nama Akun"),
  "Nama Orang",
);
assert.equal(
  resolveNewsAuthor(undefined, CmsRole.SEKRETARIS_UMUM, "Nama Akun"),
  "Nama Akun",
);
assert.equal(
  resolveNewsAuthor(undefined, CmsRole.SEKRETARIS_DIVISI, "Nama Divisi"),
  "Nama Divisi",
);
assert.equal(
  resolveNewsAuthor(undefined, CmsRole.ADMIN_GLOBAL, "Nama Akun"),
  "GenBI Jatim",
);
assert.equal(
  resolveNewsAuthor(undefined, CmsRole.SEKRETARIS_UMUM, "  "),
  "GenBI Jatim",
);
assert.throws(
  () => resolveNewsAuthor("<b>Nama</b>", CmsRole.SEKRETARIS_UMUM, "Nama Akun"),
  /plain text/,
);
