import { Router } from 'express';
import multer from 'multer';
import { CmsRole } from '@prisma/client';
import { asyncHandler } from '../middlewares/asyncHandler';
import { requireCmsRole, requireCmsSession } from '../middlewares/cms-session.middleware';
import { createProgram, downloadProgramArtifact, listCmsPrograms, transitionProgram, uploadProgramArtifact } from '../controllers/program.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
router.get('/', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_UMUM, CmsRole.SEKRETARIS_DIVISI), asyncHandler(listCmsPrograms));
router.post('/', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_DIVISI), asyncHandler(createProgram));
router.post('/:id/transition', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_DIVISI), asyncHandler(transitionProgram));
router.post('/:id/artifacts', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_DIVISI), upload.single('file'), asyncHandler(uploadProgramArtifact));
router.get('/:id/artifacts/:artifactId', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_UMUM, CmsRole.SEKRETARIS_DIVISI), asyncHandler(downloadProgramArtifact));
export default router;
