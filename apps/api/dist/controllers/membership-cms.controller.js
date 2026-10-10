"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectMembership = exports.approveMembership = exports.listMembershipReviewQueue = exports.submitMembershipChanges = exports.updateMembership = exports.createMembership = exports.getMembershipCmsOptions = exports.listCmsMemberships = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const cms_scope_service_1 = require("../services/cms-scope.service");
/*
 * Manajemen Awardee (Membership) untuk sekretaris umum: daftar per scope,
 * tambah/ubah entri manual, dan pengajuan perubahan.
 *
 * Perubahan yang diajukan masuk status SUBMITTED; approval admin global dan
 * tampil publik setelah disetujui dijalankan lewat halaman Persetujuan
 * Awardee. Semantik status mengikuti alur impor batch yang sudah ada: entri
 * yang berubah menjadi DRAFT sampai diajukan, dan baru terbit setelah
 * disetujui.
 */
const scopeOf = (req) => {
    const assignment = req.cmsSession.cmsAccount.assignments[0];
    if (!assignment?.commissariatId || !assignment.periodId)
        throw new api_error_1.ApiError("FORBIDDEN", "No active CMS assignment.", 403);
    return {
        commissariatId: assignment.commissariatId,
        periodId: assignment.periodId,
    };
};
const normalizeText = (value, field, max = 191) => {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text || text.length > max)
        throw new api_error_1.ApiError("VALIDATION_ERROR", `${field} tidak valid.`, 400);
    return text;
};
const parseMembershipFields = async (req, scope) => {
    const body = (req.body ?? {});
    const name = normalizeText(body.name, "name");
    const position = normalizeText(body.position, "position");
    const studyProgram = normalizeText(body.studyProgram, "studyProgram");
    let divisionId = null;
    if (body.divisionId !== undefined &&
        body.divisionId !== null &&
        body.divisionId !== "") {
        if (typeof body.divisionId !== "string")
            throw new api_error_1.ApiError("VALIDATION_ERROR", "divisionId tidak valid.", 400);
        const division = await prisma_1.prisma.division.findFirst({
            where: {
                id: body.divisionId,
                commissariatId: scope.commissariatId,
                periodId: scope.periodId,
            },
            select: { id: true },
        });
        if (!division)
            throw new api_error_1.ApiError("VALIDATION_ERROR", "Divisi tidak termasuk scope akun.", 400);
        divisionId = division.id;
    }
    const membershipStatus = body.membershipStatus === undefined
        ? client_1.MembershipStatus.ACTIVE
        : body.membershipStatus;
    if (membershipStatus !== client_1.MembershipStatus.ACTIVE &&
        membershipStatus !== client_1.MembershipStatus.INACTIVE)
        throw new api_error_1.ApiError("VALIDATION_ERROR", "membershipStatus tidak valid.", 400);
    return { name, position, studyProgram, divisionId, membershipStatus };
};
const listCmsMemberships = async (req, res) => {
    const role = req.cmsSession.cmsAccount.role;
    const where = {};
    if (role === "SEKRETARIS_UMUM") {
        const scope = scopeOf(req);
        where.commissariatId = scope.commissariatId;
        where.periodId = scope.periodId;
    }
    else {
        if (typeof req.query.commissariatId === "string" &&
            req.query.commissariatId)
            where.commissariatId = req.query.commissariatId;
        if (typeof req.query.periodId === "string" && req.query.periodId)
            where.periodId = req.query.periodId;
        if (typeof req.query.status === "string" &&
            Object.values(client_1.PublicationStatus).includes(req.query.status))
            where.publicationStatus = req.query.status;
    }
    const items = await prisma_1.prisma.membership.findMany({
        where,
        include: {
            division: { select: { name: true } },
            period: { select: { label: true } },
            commissariat: { select: { name: true } },
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
    });
    return (0, request_context_middleware_1.sendSuccess)(res, items);
};
exports.listCmsMemberships = listCmsMemberships;
const getMembershipCmsOptions = async (req, res) => {
    const role = req.cmsSession.cmsAccount.role;
    if (role === "ADMIN_GLOBAL") {
        const commissariatId = typeof req.query.commissariatId === "string"
            ? req.query.commissariatId
            : "";
        const periodId = typeof req.query.periodId === "string" ? req.query.periodId : "";
        if (commissariatId && periodId) {
            const [commissariat, period] = await Promise.all([
                prisma_1.prisma.commissariat.findUnique({
                    where: { id: commissariatId },
                    select: { id: true, name: true },
                }),
                prisma_1.prisma.period.findFirst({
                    where: { id: periodId, commissariatId },
                    select: { id: true, label: true },
                }),
            ]);
            if (!commissariat || !period)
                throw new api_error_1.ApiError("VALIDATION_ERROR", "Scope tidak valid.", 400);
            const divisions = await prisma_1.prisma.division.findMany({
                where: { commissariatId, periodId },
                orderBy: { name: "asc" },
                select: { id: true, name: true },
            });
            return (0, request_context_middleware_1.sendSuccess)(res, {
                period,
                commissariat,
                divisions,
                periods: [],
            });
        }
        const periods = await prisma_1.prisma.period.findMany({
            include: { commissariat: { select: { name: true } } },
            orderBy: [{ label: "desc" }, { commissariatId: "asc" }],
        });
        return (0, request_context_middleware_1.sendSuccess)(res, {
            period: null,
            commissariat: null,
            divisions: [],
            periods: periods.map((item) => ({
                id: item.id,
                label: item.label,
                commissariatId: item.commissariatId,
                commissariatName: item.commissariat.name,
            })),
        });
    }
    const scope = scopeOf(req);
    const [divisions, period, commissariat] = await Promise.all([
        prisma_1.prisma.division.findMany({
            where: { commissariatId: scope.commissariatId, periodId: scope.periodId },
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        }),
        prisma_1.prisma.period.findUnique({
            where: { id: scope.periodId },
            select: { id: true, label: true },
        }),
        prisma_1.prisma.commissariat.findUnique({
            where: { id: scope.commissariatId },
            select: { id: true, name: true },
        }),
    ]);
    return (0, request_context_middleware_1.sendSuccess)(res, { period, commissariat, divisions, periods: [] });
};
exports.getMembershipCmsOptions = getMembershipCmsOptions;
const createMembership = async (req, res) => {
    const scope = scopeOf(req);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId: scope.commissariatId, periodId: scope.periodId }, "write");
    const fields = await parseMembershipFields(req, scope);
    const created = await prisma_1.prisma.membership.create({
        data: {
            commissariatId: scope.commissariatId,
            periodId: scope.periodId,
            ...fields,
            publicationStatus: client_1.PublicationStatus.DRAFT,
        },
    });
    await prisma_1.prisma.auditEvent.create({
        data: {
            cmsAccountId: req.cmsSession.cmsAccountId,
            action: "CREATE",
            entity: "MEMBERSHIP",
            entityId: created.id,
            newStatus: "DRAFT",
        },
    });
    return (0, request_context_middleware_1.sendSuccess)(res, created);
};
exports.createMembership = createMembership;
const updateMembership = async (req, res) => {
    const membership = await prisma_1.prisma.membership.findUnique({
        where: { id: req.params.id },
    });
    if (!membership)
        throw new api_error_1.ApiError("NOT_FOUND", "Awardee tidak ditemukan.", 404);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, {
        commissariatId: membership.commissariatId,
        periodId: membership.periodId,
    }, "write");
    const fields = await parseMembershipFields(req, {
        commissariatId: membership.commissariatId,
        periodId: membership.periodId,
    });
    const updated = await prisma_1.prisma.membership.update({
        where: { id: membership.id },
        data: {
            ...fields,
            publicationStatus: client_1.PublicationStatus.DRAFT,
            rejectionReason: null,
        },
    });
    await prisma_1.prisma.auditEvent.create({
        data: {
            cmsAccountId: req.cmsSession.cmsAccountId,
            action: "EDIT",
            entity: "MEMBERSHIP",
            entityId: membership.id,
            oldStatus: membership.publicationStatus,
            newStatus: "DRAFT",
        },
    });
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.updateMembership = updateMembership;
const submitMembershipChanges = async (req, res) => {
    const scope = scopeOf(req);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId: scope.commissariatId, periodId: scope.periodId }, "write");
    const pending = await prisma_1.prisma.membership.findMany({
        where: {
            commissariatId: scope.commissariatId,
            periodId: scope.periodId,
            publicationStatus: {
                in: [client_1.PublicationStatus.DRAFT, client_1.PublicationStatus.REJECTED],
            },
        },
        select: { id: true, publicationStatus: true },
    });
    if (!pending.length)
        throw new api_error_1.ApiError("CONFLICT", "Tidak ada perubahan untuk diajukan.", 409);
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.membership.updateMany({
            where: { id: { in: pending.map((item) => item.id) } },
            data: {
                publicationStatus: client_1.PublicationStatus.SUBMITTED,
                rejectionReason: null,
            },
        });
        await tx.auditEvent.createMany({
            data: pending.map((item) => ({
                cmsAccountId: req.cmsSession.cmsAccountId,
                action: "SUBMITTED",
                entity: "MEMBERSHIP",
                entityId: item.id,
                oldStatus: item.publicationStatus,
                newStatus: "SUBMITTED",
            })),
        });
    });
    return (0, request_context_middleware_1.sendSuccess)(res, { submitted: pending.length });
};
exports.submitMembershipChanges = submitMembershipChanges;
/*
 * Antrean Persetujuan Awardee (khusus admin global).
 *
 * Pengajuan manual dari sekretaris umum masuk status SUBMITTED. Admin global
 * menyetujui sekaligus menerbitkan (PUBLISHED) atau menolak dengan catatan
 * wajib yang dibaca pengaju di halaman Data Awardee. Batch impor diantre dan
 * diputuskan lewat endpoint /v1/membership-imports.
 */
const listMembershipReviewQueue = async (_req, res) => {
    const items = await prisma_1.prisma.membership.findMany({
        where: { publicationStatus: client_1.PublicationStatus.SUBMITTED },
        include: {
            commissariat: { select: { name: true } },
            period: { select: { label: true } },
            division: { select: { name: true } },
        },
        orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
    });
    return (0, request_context_middleware_1.sendSuccess)(res, items);
};
exports.listMembershipReviewQueue = listMembershipReviewQueue;
const approveMembership = async (req, res) => {
    const membership = await prisma_1.prisma.membership.findUnique({
        where: { id: req.params.id },
    });
    if (!membership)
        throw new api_error_1.ApiError("NOT_FOUND", "Awardee tidak ditemukan.", 404);
    if (membership.publicationStatus !== client_1.PublicationStatus.SUBMITTED)
        throw new api_error_1.ApiError("CONFLICT", "Hanya pengajuan berstatus menunggu yang dapat disetujui.", 409);
    const updated = await prisma_1.prisma.membership.update({
        where: { id: membership.id },
        data: {
            publicationStatus: client_1.PublicationStatus.PUBLISHED,
            rejectionReason: null,
        },
    });
    await prisma_1.prisma.auditEvent.create({
        data: {
            cmsAccountId: req.cmsSession.cmsAccountId,
            action: "APPROVED",
            entity: "MEMBERSHIP",
            entityId: membership.id,
            oldStatus: membership.publicationStatus,
            newStatus: "PUBLISHED",
        },
    });
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.approveMembership = approveMembership;
const rejectMembership = async (req, res) => {
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (!reason)
        throw new api_error_1.ApiError("VALIDATION_ERROR", "Catatan penolakan wajib diisi.", 400, {
            reason: ["REQUIRED"],
        });
    const membership = await prisma_1.prisma.membership.findUnique({
        where: { id: req.params.id },
    });
    if (!membership)
        throw new api_error_1.ApiError("NOT_FOUND", "Awardee tidak ditemukan.", 404);
    if (membership.publicationStatus !== client_1.PublicationStatus.SUBMITTED)
        throw new api_error_1.ApiError("CONFLICT", "Hanya pengajuan berstatus menunggu yang dapat ditolak.", 409);
    const updated = await prisma_1.prisma.membership.update({
        where: { id: membership.id },
        data: {
            publicationStatus: client_1.PublicationStatus.REJECTED,
            rejectionReason: reason.slice(0, 2000),
        },
    });
    await prisma_1.prisma.auditEvent.create({
        data: {
            cmsAccountId: req.cmsSession.cmsAccountId,
            action: "REJECTED",
            entity: "MEMBERSHIP",
            entityId: membership.id,
            oldStatus: membership.publicationStatus,
            newStatus: "REJECTED",
        },
    });
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.rejectMembership = rejectMembership;
