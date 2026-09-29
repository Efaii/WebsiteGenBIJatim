"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.membershipImportErrorCodeSchema = exports.newsWriteSchema = exports.newsCategorySchema = exports.canonicalResourceIdSchema = exports.divisionWriteSchema = exports.periodWriteSchema = exports.membershipWriteSchema = exports.errorEnvelopeSchema = exports.successEnvelopeSchema = exports.apiErrorSchema = exports.responseMetaSchema = exports.paginationMetaSchema = exports.membershipStatusSchema = exports.publicationStatusSchema = exports.cmsRoleSchema = exports.MEMBERSHIP_STATUSES = exports.PUBLICATION_STATUSES = exports.CMS_ROLES = void 0;
const zod_1 = require("zod");
exports.CMS_ROLES = ["ADMIN_GLOBAL", "SEKRETARIS_UMUM", "SEKRETARIS_DIVISI"];
exports.PUBLICATION_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"];
exports.MEMBERSHIP_STATUSES = ["ACTIVE", "INACTIVE"];
exports.cmsRoleSchema = zod_1.z.enum(exports.CMS_ROLES);
exports.publicationStatusSchema = zod_1.z.enum(exports.PUBLICATION_STATUSES);
exports.membershipStatusSchema = zod_1.z.enum(exports.MEMBERSHIP_STATUSES);
exports.paginationMetaSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive(),
    pageSize: zod_1.z.number().int().positive().max(100),
    total: zod_1.z.number().int().nonnegative(),
    hasNextPage: zod_1.z.boolean(),
});
exports.responseMetaSchema = zod_1.z.object({
    requestId: zod_1.z.string().min(1),
    pagination: exports.paginationMetaSchema.optional(),
});
exports.apiErrorSchema = zod_1.z.object({
    code: zod_1.z.enum([
        "VALIDATION_ERROR",
        "UNAUTHENTICATED",
        "FORBIDDEN",
        "NOT_FOUND",
        "CONFLICT",
        "UNSUPPORTED_MEDIA_TYPE",
        "RATE_LIMITED",
        "INTERNAL_ERROR",
    ]),
    message: zod_1.z.string().min(1),
    fields: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string())).optional(),
});
const successEnvelopeSchema = (data) => zod_1.z.object({ data, meta: exports.responseMetaSchema });
exports.successEnvelopeSchema = successEnvelopeSchema;
exports.errorEnvelopeSchema = zod_1.z.object({
    error: exports.apiErrorSchema,
    meta: zod_1.z.object({ requestId: zod_1.z.string().min(1) }),
});
const canonicalScopeSchema = zod_1.z.object({
    commissariatId: zod_1.z.string().uuid(),
    periodId: zod_1.z.string().uuid(),
    divisionId: zod_1.z.string().uuid().nullable(),
});
exports.membershipWriteSchema = canonicalScopeSchema.extend({
    name: zod_1.z.string().trim().min(1),
    position: zod_1.z.string().trim().min(1),
    studyProgram: zod_1.z.string().trim().min(1),
    publicationStatus: exports.publicationStatusSchema.optional(),
    membershipStatus: exports.membershipStatusSchema.optional(),
}).strict();
exports.periodWriteSchema = zod_1.z.object({
    label: zod_1.z.string().trim().regex(/^\d{4}\/\d{4}$/),
}).strict();
exports.divisionWriteSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1),
    commissariatId: zod_1.z.string().uuid(),
    periodId: zod_1.z.string().uuid(),
}).strict();
exports.canonicalResourceIdSchema = zod_1.z.string().uuid();
exports.newsCategorySchema = zod_1.z.enum(["KEGIATAN", "WEBINAR", "SOSIAL", "EDUKASI", "PELATIHAN"]);
exports.newsWriteSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).max(160),
    excerpt: zod_1.z.string().trim().max(280),
    content: zod_1.z.string().trim().max(50000),
    category: exports.newsCategorySchema.nullable().optional(),
}).strict();
exports.membershipImportErrorCodeSchema = zod_1.z.enum([
    "INVALID_FILE", "INVALID_HEADER", "INVALID_ROW", "INVALID_SCOPE", "INVALID_COMMISSARIAT", "INVALID_DIVISION",
    "UNMAPPED_DIVISION", "AMBIGUOUS_MATCH", "DUPLICATE_IN_FILE", "AMBIGUOUS_SHEET", "PREVIEW_EXPIRED", "PREVIEW_STALE", "PREVIEW_ALREADY_COMMITTED",
]);
