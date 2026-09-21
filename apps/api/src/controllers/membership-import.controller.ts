import { Request, Response } from 'express';
import { CmsRequest } from '../middlewares/cms-session.middleware';
import { ApiError } from '../lib/api-error';
import { commitMembershipPreview, createMembershipPreview, transitionMembershipImport } from '../services/membership-import.service';
import { sendSuccess } from '../middlewares/request-context.middleware';
import { reviewImportAlias } from '../services/membership-import-alias.service';

export const previewMembershipImport = async (req: CmsRequest, res: Response) => {
  if (!req.file) throw new ApiError('VALIDATION_ERROR', 'An XLSX file is required.', 400, { file: ['INVALID_FILE'] });
  const { commissariatId, periodId } = req.body;
  if (typeof commissariatId !== 'string' || typeof periodId !== 'string') throw new ApiError('VALIDATION_ERROR', 'Target commissariat and period are required.', 400, { scope: ['INVALID_SCOPE'] });
  return sendSuccess(res, await createMembershipPreview(req.cmsSession!, req.file.buffer, req.file.originalname, commissariatId, periodId));
};

export const commitMembershipImport = async (req: CmsRequest, res: Response) => {
  if (typeof req.body.previewId !== 'string') throw new ApiError('VALIDATION_ERROR', 'previewId is required.', 400);
  return sendSuccess(res, await commitMembershipPreview(req.cmsSession!, req.body.previewId, { confirmLargeImport: req.body.confirmLargeImport === true, backupEvidenceId: req.body.backupEvidenceId }));
};

export const getMembershipImport = async (req: CmsRequest, res: Response) => {
  const preview = await (await import('../lib/prisma')).prisma.membershipImportPreview.findUnique({ where: { id: req.params.id }, include: { rows: true } });
  if (!preview) throw new ApiError('NOT_FOUND', 'Import preview not found.', 404);
  if (preview.cmsAccountId !== req.cmsSession!.cmsAccount.id) throw new ApiError('FORBIDDEN', 'Preview belongs to another account.', 403);
  return sendSuccess(res, preview);
};

export const submitMembershipImport = async (req: CmsRequest, res: Response) => {
  return sendSuccess(res, await transitionMembershipImport(req.cmsSession!, req.params.id, 'SUBMITTED'));
};

export const approveMembershipImport = async (req: CmsRequest, res: Response) => sendSuccess(res, await transitionMembershipImport(req.cmsSession!, req.params.id, 'APPROVED'));
export const rejectMembershipImport = async (req: CmsRequest, res: Response) => sendSuccess(res, await transitionMembershipImport(req.cmsSession!, req.params.id, 'REJECTED', req.body.reason));
export const reviewMembershipImportAlias = async (req: CmsRequest, res: Response) => sendSuccess(res, await reviewImportAlias(req.cmsSession!, req.body));
