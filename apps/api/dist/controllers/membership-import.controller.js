"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMembershipImports = exports.reviewMembershipImportAlias = exports.rejectMembershipImport = exports.approveMembershipImport = exports.submitMembershipImport = exports.getMembershipImport = exports.commitMembershipImport = exports.previewMembershipImport = exports.downloadMembershipImportTemplate = void 0;
const api_error_1 = require("../lib/api-error");
const membership_import_service_1 = require("../services/membership-import.service");
const membership_import_template_1 = require("../services/membership-import-template");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const membership_import_alias_service_1 = require("../services/membership-import-alias.service");
const downloadMembershipImportTemplate = async (_req, res) => {
    const buffer = (0, membership_import_template_1.buildMembershipImportTemplate)();
    res
        .status(200)
        .set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        .set("Content-Disposition", 'attachment; filename="template-impor-awardee.xlsx"')
        .send(buffer);
};
exports.downloadMembershipImportTemplate = downloadMembershipImportTemplate;
const previewMembershipImport = async (req, res) => {
    if (!req.file)
        throw new api_error_1.ApiError("VALIDATION_ERROR", "An XLSX file is required.", 400, {
            file: ["INVALID_FILE"],
        });
    const { commissariatId, periodId } = req.body;
    if (typeof commissariatId !== "string" || typeof periodId !== "string")
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Target commissariat and period are required.", 400, { scope: ["INVALID_SCOPE"] });
    return (0, request_context_middleware_1.sendSuccess)(res, await (0, membership_import_service_1.createMembershipPreview)(req.cmsSession, req.file.buffer, req.file.originalname, commissariatId, periodId));
};
exports.previewMembershipImport = previewMembershipImport;
const commitMembershipImport = async (req, res) => {
    if (typeof req.body.previewId !== "string")
        throw new api_error_1.ApiError("VALIDATION_ERROR", "previewId is required.", 400);
    return (0, request_context_middleware_1.sendSuccess)(res, await (0, membership_import_service_1.commitMembershipPreview)(req.cmsSession, req.body.previewId, {
        confirmLargeImport: req.body.confirmLargeImport === true,
        backupEvidenceId: req.body.backupEvidenceId,
    }));
};
exports.commitMembershipImport = commitMembershipImport;
const getMembershipImport = async (req, res) => {
    const preview = await (await Promise.resolve().then(() => __importStar(require("../lib/prisma")))).prisma.membershipImportPreview.findUnique({
        where: { id: req.params.id },
        include: { rows: true },
    });
    if (!preview)
        throw new api_error_1.ApiError("NOT_FOUND", "Import preview not found.", 404);
    if (req.cmsSession.cmsAccount.role !== "ADMIN_GLOBAL" &&
        preview.cmsAccountId !== req.cmsSession.cmsAccount.id)
        throw new api_error_1.ApiError("FORBIDDEN", "Preview belongs to another account.", 403);
    return (0, request_context_middleware_1.sendSuccess)(res, preview);
};
exports.getMembershipImport = getMembershipImport;
const submitMembershipImport = async (req, res) => {
    return (0, request_context_middleware_1.sendSuccess)(res, await (0, membership_import_service_1.transitionMembershipImport)(req.cmsSession, req.params.id, "SUBMITTED"));
};
exports.submitMembershipImport = submitMembershipImport;
const approveMembershipImport = async (req, res) => (0, request_context_middleware_1.sendSuccess)(res, await (0, membership_import_service_1.transitionMembershipImport)(req.cmsSession, req.params.id, "APPROVED"));
exports.approveMembershipImport = approveMembershipImport;
const rejectMembershipImport = async (req, res) => (0, request_context_middleware_1.sendSuccess)(res, await (0, membership_import_service_1.transitionMembershipImport)(req.cmsSession, req.params.id, "REJECTED", req.body.reason));
exports.rejectMembershipImport = rejectMembershipImport;
const reviewMembershipImportAlias = async (req, res) => (0, request_context_middleware_1.sendSuccess)(res, await (0, membership_import_alias_service_1.reviewImportAlias)(req.cmsSession, req.body));
exports.reviewMembershipImportAlias = reviewMembershipImportAlias;
/** Antrean batch impor untuk admin global, default status SUBMITTED. */
const listMembershipImports = async (req, res) => {
    const { prisma } = await Promise.resolve().then(() => __importStar(require("../lib/prisma")));
    const requested = typeof req.query.status === "string" ? req.query.status : "SUBMITTED";
    const allowed = [
        "PREVIEW_READY",
        "COMMITTED",
        "SUBMITTED",
        "APPROVED",
        "REJECTED",
        "EXPIRED",
        "FAILED",
    ];
    if (!allowed.includes(requested))
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Status filter is invalid.", 400, {
            status: ["INVALID_STATUS"],
        });
    const previews = await prisma.membershipImportPreview.findMany({
        where: { status: requested },
        include: {
            cmsAccount: {
                select: { user: { select: { name: true, username: true } } },
            },
            commissariat: { select: { name: true } },
            period: { select: { label: true } },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return (0, request_context_middleware_1.sendSuccess)(res, previews.map((preview) => ({
        id: preview.id,
        sourceFilename: preview.sourceFilename,
        status: preview.status,
        totalRows: preview.totalRows,
        newCount: preview.newCount,
        updatedCount: preview.updatedCount,
        unchangedCount: preview.unchangedCount,
        invalidCount: preview.invalidCount,
        ambiguousCount: preview.ambiguousCount,
        duplicateCount: preview.duplicateCount,
        committedAt: preview.committedAt,
        createdAt: preview.createdAt,
        uploaderName: preview.cmsAccount.user.name || preview.cmsAccount.user.username,
        commissariatName: preview.commissariat.name,
        periodLabel: preview.period.label,
    })));
};
exports.listMembershipImports = listMembershipImports;
