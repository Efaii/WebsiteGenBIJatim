import { CmsRole, PublicationStatus } from '@prisma/client';
import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { CmsRequest } from '../middlewares/cms-session.middleware';
import { sendSuccess } from '../middlewares/request-context.middleware';
import { assertScopeAccess } from '../services/cms-scope.service';
import { assertPublicationTransition } from '../domain/status-transitions';
import { ensureStorageRoots, privateStoragePath } from '../lib/storage';

const fields = (body: Record<string, unknown>) => {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const divisi = typeof body.divisi === 'string' ? body.divisi.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const format = typeof body.format === 'string' ? body.format.trim() : '';
  const date = typeof body.dateIso === 'string' ? new Date(body.dateIso) : new Date('invalid');
  const objectives = Array.isArray(body.objectives) ? body.objectives.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : [];
  if (!title || !divisi || !description || !format || !objectives.length || Number.isNaN(date.getTime())) throw new ApiError('VALIDATION_ERROR', 'Program Kerja fields are invalid.', 400);
  return { title, divisi, description, format, date, objectives };
};

const scope = async (req: CmsRequest) => {
  const assignment = req.cmsSession!.cmsAccount.assignments[0];
  const isAdmin = req.cmsSession!.cmsAccount.role === CmsRole.ADMIN_GLOBAL;
  const commissariatId = isAdmin ? (typeof req.body.commissariatId === 'string' ? req.body.commissariatId : req.query.commissariatId as string) : assignment?.commissariatId;
  const periodId = isAdmin ? (typeof req.body.periodId === 'string' ? req.body.periodId : req.query.periodId as string) : assignment?.periodId;
  const divisionId = isAdmin ? (typeof req.body.divisionId === 'string' ? req.body.divisionId : req.query.divisionId as string) : assignment?.divisionId;
  if (!commissariatId || !periodId || !divisionId) throw new ApiError('VALIDATION_ERROR', 'Program scope is required.', 400);
  assertScopeAccess(req.cmsSession!, { commissariatId, periodId, divisionId }, 'write');
  const division = await prisma.division.findFirst({ where: { id: divisionId, commissariatId, periodId } });
  if (!division) throw new ApiError('VALIDATION_ERROR', 'Program scope is invalid.', 400);
  return { commissariatId, periodId, divisionId, divisionName: division.name };
};

export const createProgram = async (req: CmsRequest, res: Response) => {
  const input = fields(req.body); const target = await scope(req);
  const program = await prisma.programKerja.create({ data: { programKe: 1, commissariatId: target.commissariatId, periodId: target.periodId, divisionId: target.divisionId, namaProker: input.title, divisi: target.divisionName, tanggalProker: input.date, startDate: input.date, endDate: input.date, objectives: input.objectives, formatPelaksanaan: input.format, status: 'PLANNED', deskripsiProker: input.description, publicationStatus: 'DRAFT', authorAccountId: req.cmsSession!.cmsAccountId } });
  return sendSuccess(res, program);
};

export const previewProgram = async (req: CmsRequest, res: Response) => {
  const input = fields(req.body); const target = await scope(req);
  return sendSuccess(res, { title: input.title, description: input.description, objectives: input.objectives, dateIso: input.date.toISOString().slice(0, 10), format: input.format, divisi: target.divisionName, isPreview: true });
};

export const updateProgram = async (req: CmsRequest, res: Response) => {
  const program = await prisma.programKerja.findUnique({ where: { id: req.params.id } });
  if (!program) throw new ApiError('NOT_FOUND', 'Program Kerja not found.', 404);
  if (!['DRAFT', 'REJECTED'].includes(program.publicationStatus)) throw new ApiError('CONFLICT', 'Published programs require a revision.', 409);
  assertScopeAccess(req.cmsSession!, { commissariatId: program.commissariatId, periodId: program.periodId ?? undefined, divisionId: program.divisionId ?? undefined }, 'write');
  const input = fields(req.body);
  return sendSuccess(res, await prisma.programKerja.update({ where: { id: program.id }, data: { namaProker: input.title, deskripsiProker: input.description, objectives: input.objectives, tanggalProker: input.date, startDate: input.date, endDate: input.date, formatPelaksanaan: input.format, publicationStatus: 'DRAFT', rejectionReason: null } }));
};

export const createProgramRevision = async (req: CmsRequest, res: Response) => {
  const program = await prisma.programKerja.findUnique({ where: { id: req.params.id }, include: { revisions: { where: { cancelledAt: null, publicationStatus: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] } } } } });
  if (!program) throw new ApiError('NOT_FOUND', 'Program Kerja not found.', 404);
  if (program.publicationStatus !== 'PUBLISHED' || program.revisions.length) throw new ApiError('CONFLICT', 'An active revision already exists or program is not published.', 409);
  assertScopeAccess(req.cmsSession!, { commissariatId: program.commissariatId, periodId: program.periodId ?? undefined, divisionId: program.divisionId ?? undefined }, 'write');
  const input = fields({ title: req.body.title ?? program.namaProker, divisi: program.divisi, description: req.body.description ?? program.deskripsiProker, objectives: req.body.objectives ?? program.objectives, format: req.body.format ?? program.formatPelaksanaan, dateIso: req.body.dateIso ?? program.tanggalProker.toISOString() });
  return sendSuccess(res, await prisma.programKerjaRevision.create({ data: { programKerjaId: program.id, namaProker: input.title, divisi: program.divisi, deskripsiProker: input.description, objectives: input.objectives, tanggalProker: input.date, startDate: input.date, endDate: input.date, formatPelaksanaan: input.format } }));
};

export const listCmsPrograms = async (req: CmsRequest, res: Response) => {
  const where: { publicationStatus?: PublicationStatus; commissariatId?: string; periodId?: string; divisionId?: string } = {};
  if (typeof req.query.status === 'string' && Object.values(PublicationStatus).includes(req.query.status as PublicationStatus)) where.publicationStatus = req.query.status as PublicationStatus;
  if (req.cmsSession!.cmsAccount.role !== CmsRole.ADMIN_GLOBAL) {
    const assignment = req.cmsSession!.cmsAccount.assignments[0];
    if (!assignment?.commissariatId || !assignment.periodId) throw new ApiError('FORBIDDEN', 'No active CMS assignment.', 403);
    where.commissariatId = assignment.commissariatId; where.periodId = assignment.periodId;
  }
  return sendSuccess(res, await prisma.programKerja.findMany({ where, include: { artifacts: true }, orderBy: { updatedAt: 'desc' } }));
};

export const transitionProgram = async (req: CmsRequest, res: Response) => {
  const program = await prisma.programKerja.findUnique({ where: { id: req.params.id } });
  if (!program) throw new ApiError('NOT_FOUND', 'Program Kerja not found.', 404);
  assertScopeAccess(req.cmsSession!, { commissariatId: program.commissariatId, periodId: program.periodId ?? undefined, divisionId: program.divisionId ?? undefined }, 'write');
  const to = req.body.status as PublicationStatus;
  if (!Object.values(PublicationStatus).includes(to)) throw new ApiError('VALIDATION_ERROR', 'Invalid publication status.', 400);
  if (to === 'APPROVED' && req.cmsSession!.cmsAccount.role !== CmsRole.ADMIN_GLOBAL) throw new ApiError('FORBIDDEN', 'Only ADMIN_GLOBAL can approve programs.', 403);
  assertPublicationTransition(program.publicationStatus, to, req.body.rejectionReason);
  const updated = await prisma.programKerja.update({ where: { id: program.id }, data: { publicationStatus: to, rejectionReason: to === 'REJECTED' ? req.body.rejectionReason : null } });
  return sendSuccess(res, updated);
};

export const uploadProgramArtifact = async (req: CmsRequest, res: Response) => {
  if (!req.file || !['proposal', 'lpj'].includes(String(req.body.kind))) throw new ApiError('VALIDATION_ERROR', 'A proposal or LPJ file is required.', 400);
  if (req.file.size > 10 * 1024 * 1024 || req.file.mimetype !== 'application/pdf' || path.extname(req.file.originalname).toLowerCase() !== '.pdf' || !req.file.buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new ApiError('UNSUPPORTED_MEDIA_TYPE', 'Only valid PDF artifacts up to 10 MB are allowed.', 415);
  const program = await prisma.programKerja.findUnique({ where: { id: req.params.id } });
  if (!program) throw new ApiError('NOT_FOUND', 'Program Kerja not found.', 404);
  assertScopeAccess(req.cmsSession!, { commissariatId: program.commissariatId, periodId: program.periodId ?? undefined, divisionId: program.divisionId ?? undefined }, 'read');
  await ensureStorageRoots();
  const storageKey = `private/program/${program.id}/${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;
  await fs.mkdir(path.dirname(privateStoragePath(storageKey)), { recursive: true });
  await fs.writeFile(privateStoragePath(storageKey), req.file.buffer);
  const artifact = await prisma.programArtifact.create({ data: { programKerjaId: program.id, kind: String(req.body.kind), storageKey, originalFilename: req.file.originalname, mimeType: req.file.mimetype, byteSize: req.file.size } });
  return sendSuccess(res, { id: artifact.id, kind: artifact.kind, filename: artifact.originalFilename });
};

export const downloadProgramArtifact = async (req: CmsRequest, res: Response) => {
  const artifact = await prisma.programArtifact.findFirst({ where: { id: req.params.artifactId, programKerjaId: req.params.id }, include: { programKerja: true } });
  if (!artifact) throw new ApiError('NOT_FOUND', 'Artifact not found.', 404);
  if (artifact.programKerja.publicationStatus !== 'APPROVED' && artifact.programKerja.publicationStatus !== 'PUBLISHED') throw new ApiError('FORBIDDEN', 'Artifact is not available.', 403);
  assertScopeAccess(req.cmsSession!, { commissariatId: artifact.programKerja.commissariatId, periodId: artifact.programKerja.periodId ?? undefined, divisionId: artifact.programKerja.divisionId ?? undefined }, 'read');
  return res.download(privateStoragePath(artifact.storageKey), artifact.originalFilename);
};
