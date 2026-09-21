import { Router } from 'express';
import multer from 'multer';
import { CmsRole } from '@prisma/client';
import { asyncHandler } from '../middlewares/asyncHandler';
import { requireCmsRole, requireCmsSession } from '../middlewares/cms-session.middleware';
import { approveMembershipImport, commitMembershipImport, getMembershipImport, previewMembershipImport, rejectMembershipImport, reviewMembershipImportAlias, submitMembershipImport } from '../controllers/membership-import.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.originalname.toLowerCase().endsWith('.xlsx')) });
router.post('/preview', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_UMUM), upload.single('file'), asyncHandler(previewMembershipImport));
router.post('/commit', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_UMUM), asyncHandler(commitMembershipImport));
router.get('/:id', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_UMUM), asyncHandler(getMembershipImport));
router.post('/:id/submit', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_UMUM), asyncHandler(submitMembershipImport));
router.post('/:id/approve', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL), asyncHandler(approveMembershipImport));
router.post('/:id/reject', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL), asyncHandler(rejectMembershipImport));
router.post('/aliases/review', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL), asyncHandler(reviewMembershipImportAlias));
export default router;
