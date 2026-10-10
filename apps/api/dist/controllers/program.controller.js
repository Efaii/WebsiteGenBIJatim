"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadProgramArtifact = exports.uploadProgramArtifact = exports.transitionProgramExecution = exports.transitionProgram = exports.listCmsPrograms = exports.transitionProgramRevision = exports.previewProgramRevision = exports.createProgramRevision = exports.updateProgram = exports.previewProgram = exports.createProgram = void 0;
const client_1 = require("@prisma/client");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const cms_scope_service_1 = require("../services/cms-scope.service");
const status_transitions_1 = require("../domain/status-transitions");
const cms_program_status_1 = require("../domain/cms-program-status");
const storage_1 = require("../lib/storage");
const fields = (body) => {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    // `divisi` tidak diwajibkan: nilai sebenarnya diambil dari scope akun atau
    // dari data tersimpan (lihat createProgram/updateProgram).
    const divisi = typeof body.divisi === 'string' ? body.divisi.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const format = typeof body.format === 'string' ? body.format.trim() : '';
    const date = typeof body.startDate === 'string' ? new Date(body.startDate) : typeof body.dateIso === 'string' ? new Date(body.dateIso) : new Date('invalid');
    const endDate = typeof body.endDate === 'string' ? new Date(body.endDate) : date;
    const objectives = Array.isArray(body.objectives) ? body.objectives.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : [];
    if (!title || !description || !format || !objectives.length || Number.isNaN(date.getTime()) || Number.isNaN(endDate.getTime()) || endDate < date)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Program Kerja fields are invalid.', 400);
    return { title, divisi, description, format, date, endDate, objectives };
};
const scope = async (req) => {
    const assignment = req.cmsSession.cmsAccount.assignments[0];
    const isAdmin = req.cmsSession.cmsAccount.role === client_1.CmsRole.ADMIN_GLOBAL;
    const commissariatId = isAdmin ? (typeof req.body.commissariatId === 'string' ? req.body.commissariatId : req.query.commissariatId) : assignment?.commissariatId;
    const periodId = isAdmin ? (typeof req.body.periodId === 'string' ? req.body.periodId : req.query.periodId) : assignment?.periodId;
    const divisionId = isAdmin ? (typeof req.body.divisionId === 'string' ? req.body.divisionId : req.query.divisionId) : assignment?.divisionId;
    if (!commissariatId || !periodId || !divisionId)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Program scope is required.', 400);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId, periodId, divisionId }, 'write');
    const division = await prisma_1.prisma.division.findFirst({ where: { id: divisionId, commissariatId, periodId } });
    if (!division)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Program scope is invalid.', 400);
    return { commissariatId, periodId, divisionId, divisionName: division.name };
};
const createProgram = async (req, res) => {
    const input = fields(req.body);
    const target = await scope(req);
    const program = await prisma_1.prisma.programKerja.create({ data: { programKe: 1, commissariatId: target.commissariatId, periodId: target.periodId, divisionId: target.divisionId, namaProker: input.title, divisi: target.divisionName, tanggalProker: input.date, startDate: input.date, endDate: input.endDate, objectives: input.objectives, formatPelaksanaan: input.format, status: 'PLANNED', deskripsiProker: input.description, publicationStatus: 'DRAFT', authorAccountId: req.cmsSession.cmsAccountId } });
    return (0, request_context_middleware_1.sendSuccess)(res, program);
};
exports.createProgram = createProgram;
const previewProgram = async (req, res) => {
    const input = fields(req.body);
    const target = await scope(req);
    return (0, request_context_middleware_1.sendSuccess)(res, { title: input.title, description: input.description, objectives: input.objectives, dateIso: input.date.toISOString().slice(0, 10), format: input.format, divisi: target.divisionName, isPreview: true });
};
exports.previewProgram = previewProgram;
const updateProgram = async (req, res) => {
    const program = await prisma_1.prisma.programKerja.findUnique({ where: { id: req.params.id } });
    if (!program)
        throw new api_error_1.ApiError('NOT_FOUND', 'Program Kerja not found.', 404);
    if (!['DRAFT', 'REJECTED'].includes(program.publicationStatus))
        throw new api_error_1.ApiError('CONFLICT', 'Published programs require a revision.', 409);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId: program.commissariatId, periodId: program.periodId ?? undefined, divisionId: program.divisionId ?? undefined }, 'write');
    const input = fields(req.body);
    return (0, request_context_middleware_1.sendSuccess)(res, await prisma_1.prisma.programKerja.update({ where: { id: program.id }, data: { namaProker: input.title, deskripsiProker: input.description, objectives: input.objectives, tanggalProker: input.date, startDate: input.date, endDate: input.endDate, formatPelaksanaan: input.format, publicationStatus: 'DRAFT', rejectionReason: null } }));
};
exports.updateProgram = updateProgram;
const createProgramRevision = async (req, res) => {
    const program = await prisma_1.prisma.programKerja.findUnique({ where: { id: req.params.id }, include: { revisions: { where: { cancelledAt: null, publicationStatus: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] } } } } });
    if (!program)
        throw new api_error_1.ApiError('NOT_FOUND', 'Program Kerja not found.', 404);
    if (program.publicationStatus !== 'PUBLISHED' || program.revisions.length)
        throw new api_error_1.ApiError('CONFLICT', 'An active revision already exists or program is not published.', 409);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId: program.commissariatId, periodId: program.periodId ?? undefined, divisionId: program.divisionId ?? undefined }, 'write');
    const input = fields({ title: req.body.title ?? program.namaProker, divisi: program.divisi, description: req.body.description ?? program.deskripsiProker, objectives: req.body.objectives ?? program.objectives, format: req.body.format ?? program.formatPelaksanaan, dateIso: req.body.dateIso ?? program.tanggalProker?.toISOString() });
    return (0, request_context_middleware_1.sendSuccess)(res, await prisma_1.prisma.programKerjaRevision.create({ data: { programKerjaId: program.id, namaProker: input.title, divisi: program.divisi, deskripsiProker: input.description, objectives: input.objectives, tanggalProker: input.date, startDate: input.date, endDate: input.date, formatPelaksanaan: input.format } }));
};
exports.createProgramRevision = createProgramRevision;
const previewProgramRevision = async (req, res) => {
    const revision = await prisma_1.prisma.programKerjaRevision.findUnique({ where: { id: req.params.revisionId }, include: { programKerja: true } });
    if (!revision)
        throw new api_error_1.ApiError('NOT_FOUND', 'Program revision not found.', 404);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId: revision.programKerja.commissariatId, periodId: revision.programKerja.periodId ?? undefined, divisionId: revision.programKerja.divisionId ?? undefined }, 'read');
    return (0, request_context_middleware_1.sendSuccess)(res, { title: revision.namaProker, description: revision.deskripsiProker, objectives: revision.objectives, dateIso: revision.tanggalProker?.toISOString().slice(0, 10) ?? null, dateLabel: revision.dateLabel, format: revision.formatPelaksanaan, divisi: revision.divisi, isPreview: true });
};
exports.previewProgramRevision = previewProgramRevision;
const transitionProgramRevision = async (req, res) => {
    const revision = await prisma_1.prisma.programKerjaRevision.findUnique({ where: { id: req.params.revisionId }, include: { programKerja: true } });
    if (!revision || revision.cancelledAt)
        throw new api_error_1.ApiError('NOT_FOUND', 'Program revision not found.', 404);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId: revision.programKerja.commissariatId, periodId: revision.programKerja.periodId ?? undefined, divisionId: revision.programKerja.divisionId ?? undefined }, 'write');
    const to = req.body.status;
    if (!Object.values(client_1.PublicationStatus).includes(to))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Invalid publication status.', 400);
    if (['APPROVED', 'PUBLISHED', 'ARCHIVED'].includes(to) && req.cmsSession.cmsAccount.role !== client_1.CmsRole.ADMIN_GLOBAL)
        throw new api_error_1.ApiError('FORBIDDEN', 'Only ADMIN_GLOBAL can approve, publish, or archive revisions.', 403);
    (0, status_transitions_1.assertPublicationTransition)(revision.publicationStatus, to, req.body.rejectionReason);
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        const next = await tx.programKerjaRevision.update({ where: { id: revision.id }, data: { publicationStatus: to, rejectionReason: to === 'REJECTED' ? req.body.rejectionReason : null } });
        if (to === 'PUBLISHED') {
            await tx.programKerja.update({ where: { id: revision.programKerjaId }, data: { namaProker: revision.namaProker, divisi: revision.divisi, tanggalProker: revision.tanggalProker, dateLabel: revision.dateLabel, startDate: revision.startDate, endDate: revision.endDate, objectives: revision.objectives ?? undefined, formatPelaksanaan: revision.formatPelaksanaan, deskripsiProker: revision.deskripsiProker, publicationStatus: 'PUBLISHED' } });
        }
        return next;
    });
    await prisma_1.prisma.auditEvent.create({ data: { cmsAccountId: req.cmsSession.cmsAccount.id, action: to, entity: 'PROGRAM_REVISION', entityId: revision.id, oldStatus: revision.publicationStatus, newStatus: to } });
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.transitionProgramRevision = transitionProgramRevision;
const listCmsPrograms = async (req, res) => {
    const where = {};
    const requestedStatus = (0, cms_program_status_1.cmsPublicationStatus)(req.query.status);
    if (requestedStatus)
        where.publicationStatus = requestedStatus;
    /*
     * `scope=all` membuka daftar lintas komisariat untuk ketiga peran (keputusan
     * Korkom: koordinasi lintas komisariat). Tanpa parameter itu daftar tetap
     * dibatasi scope akun (Riwayat divisi sekretaris).
     */
    if (req.query.scope !== 'all' && req.cmsSession.cmsAccount.role !== client_1.CmsRole.ADMIN_GLOBAL) {
        const assignment = req.cmsSession.cmsAccount.assignments[0];
        if (!assignment?.commissariatId || !assignment.periodId)
            throw new api_error_1.ApiError('FORBIDDEN', 'No active CMS assignment.', 403);
        where.commissariatId = assignment.commissariatId;
        where.periodId = assignment.periodId;
        if (req.cmsSession.cmsAccount.role === client_1.CmsRole.SEKRETARIS_DIVISI)
            where.divisionId = assignment.divisionId ?? undefined;
    }
    return (0, request_context_middleware_1.sendSuccess)(res, await prisma_1.prisma.programKerja.findMany({ where, include: { artifacts: true, commissariat: { select: { name: true, slug: true } } }, orderBy: { updatedAt: 'desc' } }));
};
exports.listCmsPrograms = listCmsPrograms;
const transitionProgram = async (req, res) => {
    const program = await prisma_1.prisma.programKerja.findUnique({ where: { id: req.params.id } });
    if (!program)
        throw new api_error_1.ApiError('NOT_FOUND', 'Program Kerja not found.', 404);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId: program.commissariatId, periodId: program.periodId ?? undefined, divisionId: program.divisionId ?? undefined }, 'write');
    const to = req.body.status;
    if (!Object.values(client_1.PublicationStatus).includes(to))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Invalid publication status.', 400);
    (0, status_transitions_1.assertPublicationTransition)(program.publicationStatus, to, req.body.rejectionReason);
    (0, status_transitions_1.assertProgramRoleTransition)(req.cmsSession.cmsAccount.role, to);
    const updated = await prisma_1.prisma.programKerja.update({ where: { id: program.id }, data: { publicationStatus: to, rejectionReason: to === 'REJECTED' ? req.body.rejectionReason : null } });
    await prisma_1.prisma.auditEvent.create({ data: { cmsAccountId: req.cmsSession.cmsAccountId, action: to, entity: 'PROGRAM', entityId: program.id, oldStatus: program.publicationStatus, newStatus: to } });
    return (0, request_context_middleware_1.sendSuccess)(res, updated);
};
exports.transitionProgram = transitionProgram;
const transitionProgramExecution = async (req, res) => {
    const program = await prisma_1.prisma.programKerja.findUnique({ where: { id: req.params.id } });
    if (!program)
        throw new api_error_1.ApiError('NOT_FOUND', 'Program Kerja not found.', 404);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId: program.commissariatId, periodId: program.periodId ?? undefined, divisionId: program.divisionId ?? undefined }, 'write');
    const target = req.body.executionStatus;
    const allowed = { PLANNED: ['ONGOING', 'CANCELLED'], ONGOING: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [] };
    if (!Object.values(client_1.ExecutionStatus).includes(target) || !allowed[program.executionStatus].includes(target))
        throw new api_error_1.ApiError('CONFLICT', 'Invalid execution status transition.', 409);
    return (0, request_context_middleware_1.sendSuccess)(res, await prisma_1.prisma.programKerja.update({ where: { id: program.id }, data: { executionStatus: target } }));
};
exports.transitionProgramExecution = transitionProgramExecution;
const uploadProgramArtifact = async (req, res) => {
    if (!req.file || !['proposal', 'lpj'].includes(String(req.body.kind)))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'A proposal or LPJ file is required.', 400);
    if (req.file.size > 10 * 1024 * 1024 || req.file.mimetype !== 'application/pdf' || path_1.default.extname(req.file.originalname).toLowerCase() !== '.pdf' || !req.file.buffer.subarray(0, 5).equals(Buffer.from('%PDF-')))
        throw new api_error_1.ApiError('UNSUPPORTED_MEDIA_TYPE', 'Only valid PDF artifacts up to 10 MB are allowed.', 415);
    const program = await prisma_1.prisma.programKerja.findUnique({ where: { id: req.params.id } });
    if (!program)
        throw new api_error_1.ApiError('NOT_FOUND', 'Program Kerja not found.', 404);
    (0, cms_scope_service_1.assertScopeAccess)(req.cmsSession, { commissariatId: program.commissariatId, periodId: program.periodId ?? undefined, divisionId: program.divisionId ?? undefined }, 'write');
    const kind = String(req.body.kind);
    /*
     * Berkas hanya untuk Program Kerja yang lahir lewat CMS: Program Kerja lama
     * hasil rekonsiliasi tidak dapat diubah dari mana pun. Proposal diunggah
     * pada fase draft; LPJ menyusul setelah Program Kerja disetujui.
     */
    if (!program.authorAccountId)
        throw new api_error_1.ApiError('FORBIDDEN', 'Program Kerja lama tidak dapat diubah.', 403);
    if (kind === 'proposal' && !['DRAFT', 'REJECTED'].includes(program.publicationStatus))
        throw new api_error_1.ApiError('FORBIDDEN', 'Proposal hanya dapat diunggah pada Program Kerja draft.', 403);
    if (kind === 'lpj' && !['APPROVED', 'PUBLISHED'].includes(program.publicationStatus))
        throw new api_error_1.ApiError('FORBIDDEN', 'LPJ hanya dapat diunggah setelah Program Kerja disetujui.', 403);
    await (0, storage_1.ensureStorageRoots)();
    const storageKey = `private/program/${program.id}/${crypto_1.default.randomUUID()}${path_1.default.extname(req.file.originalname).toLowerCase()}`;
    await promises_1.default.mkdir(path_1.default.dirname((0, storage_1.privateStoragePath)(storageKey)), { recursive: true });
    await promises_1.default.writeFile((0, storage_1.privateStoragePath)(storageKey), req.file.buffer);
    const artifact = await prisma_1.prisma.programArtifact.create({ data: { programKerjaId: program.id, kind, storageKey, originalFilename: req.file.originalname, mimeType: req.file.mimetype, byteSize: req.file.size } });
    return (0, request_context_middleware_1.sendSuccess)(res, { id: artifact.id, kind: artifact.kind, filename: artifact.originalFilename });
};
exports.uploadProgramArtifact = uploadProgramArtifact;
const downloadProgramArtifact = async (req, res) => {
    const artifact = await prisma_1.prisma.programArtifact.findFirst({ where: { id: req.params.artifactId, programKerjaId: req.params.id }, include: { programKerja: true } });
    if (!artifact)
        throw new api_error_1.ApiError('NOT_FOUND', 'Artifact not found.', 404);
    if (artifact.programKerja.publicationStatus !== 'APPROVED' && artifact.programKerja.publicationStatus !== 'PUBLISHED')
        throw new api_error_1.ApiError('FORBIDDEN', 'Artifact is not available.', 403);
    return res.download((0, storage_1.privateStoragePath)(artifact.storageKey), artifact.originalFilename);
};
exports.downloadProgramArtifact = downloadProgramArtifact;
