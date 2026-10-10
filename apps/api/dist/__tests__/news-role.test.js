"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const client_1 = require("@prisma/client");
const news_lifecycle_1 = require("../domain/news-lifecycle");
// Admin global menjalankan seluruh lifecycle.
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.ADMIN_GLOBAL, "DRAFT", "SUBMITTED"));
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.ADMIN_GLOBAL, "SUBMITTED", "APPROVED"));
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.ADMIN_GLOBAL, "APPROVED", "PUBLISHED"));
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.ADMIN_GLOBAL, "SUBMITTED", "REJECTED", "catatan redaksi"));
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.ADMIN_GLOBAL, "PUBLISHED", "DRAFT"));
// Sekretaris hanya mengajukan.
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.SEKRETARIS_UMUM, "DRAFT", "SUBMITTED"));
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.SEKRETARIS_DIVISI, "DRAFT", "SUBMITTED"));
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.SEKRETARIS_UMUM, "SUBMITTED", "APPROVED"), /publisher/);
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.SEKRETARIS_DIVISI, "APPROVED", "PUBLISHED"), /publisher/);
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.SEKRETARIS_UMUM, "SUBMITTED", "REJECTED", "alasan"), /publisher/);
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.SEKRETARIS_UMUM, "PUBLISHED", "DRAFT"), /publisher/);
// Transisi di luar peta tetap ditolak sebagai konflik.
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.ADMIN_GLOBAL, "DRAFT", "PUBLISHED"), /Cannot transition/);
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.SEKRETARIS_UMUM, "DRAFT", "APPROVED"), /Cannot transition/);
// Penolakan wajib alasan tetap berlaku untuk admin global.
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsRoleTransition)(client_1.CmsRole.ADMIN_GLOBAL, "SUBMITTED", "REJECTED"), /Rejection reason/);
// Nama penerbit: isian menang; fallback nama akun untuk sekretaris, kanal untuk admin.
strict_1.default.equal((0, news_lifecycle_1.resolveNewsAuthor)("Nama Orang", client_1.CmsRole.SEKRETARIS_UMUM, "Nama Akun"), "Nama Orang");
strict_1.default.equal((0, news_lifecycle_1.resolveNewsAuthor)(undefined, client_1.CmsRole.SEKRETARIS_UMUM, "Nama Akun"), "Nama Akun");
strict_1.default.equal((0, news_lifecycle_1.resolveNewsAuthor)(undefined, client_1.CmsRole.SEKRETARIS_DIVISI, "Nama Divisi"), "Nama Divisi");
strict_1.default.equal((0, news_lifecycle_1.resolveNewsAuthor)(undefined, client_1.CmsRole.ADMIN_GLOBAL, "Nama Akun"), "GenBI Jatim");
strict_1.default.equal((0, news_lifecycle_1.resolveNewsAuthor)(undefined, client_1.CmsRole.SEKRETARIS_UMUM, "  "), "GenBI Jatim");
strict_1.default.throws(() => (0, news_lifecycle_1.resolveNewsAuthor)("<b>Nama</b>", client_1.CmsRole.SEKRETARIS_UMUM, "Nama Akun"), /plain text/);
