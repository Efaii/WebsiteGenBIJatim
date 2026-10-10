"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsSlug = exports.normalizeNewsText = exports.resolveNewsAuthor = exports.assertNewsRoleTransition = exports.assertNewsTransition = void 0;
const client_1 = require("@prisma/client");
const api_error_1 = require("../lib/api-error");
const transitions = {
    DRAFT: ["SUBMITTED"],
    SUBMITTED: ["APPROVED", "REJECTED"],
    APPROVED: ["PUBLISHED"],
    PUBLISHED: ["DRAFT", "ARCHIVED"],
    REJECTED: ["DRAFT"],
    ARCHIVED: [],
};
const assertNewsTransition = (from, to, reason) => {
    if (!transitions[from].includes(to))
        throw new api_error_1.ApiError("CONFLICT", `Cannot transition News from ${from} to ${to}.`, 409);
    if (to === "REJECTED" && !reason?.trim())
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Rejection reason is required.", 400, { rejectionReason: ["Required"] });
};
exports.assertNewsTransition = assertNewsTransition;
/**
 * Transisi yang boleh dijalankan per peran (ADR 0016): admin global
 * menjalankan seluruh lifecycle; sekretaris hanya mengajukan
 * (DRAFT -> SUBMITTED). Persetujuan dan penerbitan tetap milik admin global.
 */
const assertNewsRoleTransition = (role, from, to, reason) => {
    (0, exports.assertNewsTransition)(from, to, reason);
    if (role !== client_1.CmsRole.ADMIN_GLOBAL && to !== "SUBMITTED")
        throw new api_error_1.ApiError("FORBIDDEN", "Only the publisher can move News to this status.", 403);
};
exports.assertNewsRoleTransition = assertNewsRoleTransition;
/**
 * Nama penerbit Berita (field `author`): isian penginput bila ada; selain itu
 * nama orang pada akun untuk sekretaris, atau kanal "GenBI Jatim" untuk admin
 * global. Isian dinormalisasi seperti teks Berita lain (tanpa HTML).
 */
const resolveNewsAuthor = (provided, role, accountName) => {
    if (provided !== undefined)
        return (0, exports.normalizeNewsText)(provided, "author", 120);
    if (role === client_1.CmsRole.ADMIN_GLOBAL)
        return "GenBI Jatim";
    const name = typeof accountName === "string" ? accountName.trim() : "";
    return name.length > 0 ? name : "GenBI Jatim";
};
exports.resolveNewsAuthor = resolveNewsAuthor;
const normalizeNewsText = (value, field, max) => {
    if (typeof value !== "string")
        throw new api_error_1.ApiError("VALIDATION_ERROR", `${field} must be text.`, 400);
    if (/<[^>]+>/.test(value))
        throw new api_error_1.ApiError("VALIDATION_ERROR", `${field} must be plain text.`, 400, { [field]: ["HTML_NOT_ALLOWED"] });
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized || normalized.length > max)
        throw new api_error_1.ApiError("VALIDATION_ERROR", `${field} is invalid.`, 400, {
            [field]: [`Must be 1-${max} characters`],
        });
    return normalized;
};
exports.normalizeNewsText = normalizeNewsText;
const newsSlug = (title) => title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
exports.newsSlug = newsSlug;
