import { Router } from 'express';
import { CmsRole } from '@prisma/client';
import { asyncHandler } from '../middlewares/asyncHandler';
import { requireCmsRole, requireCmsSession } from '../middlewares/cms-session.middleware';
import { listPublishedMemberships } from '../controllers/membership.controller';
import { createMembership, getMembershipCmsOptions, listCmsMemberships, submitMembershipChanges, updateMembership } from '../controllers/membership-cms.controller';

const router = Router();
router.get('/', asyncHandler(listPublishedMemberships));
router.get('/cms', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_UMUM), asyncHandler(listCmsMemberships));
router.get('/cms/options', requireCmsSession, requireCmsRole(CmsRole.ADMIN_GLOBAL, CmsRole.SEKRETARIS_UMUM), asyncHandler(getMembershipCmsOptions));
router.post('/cms', requireCmsSession, requireCmsRole(CmsRole.SEKRETARIS_UMUM), asyncHandler(createMembership));
router.post('/cms/submit', requireCmsSession, requireCmsRole(CmsRole.SEKRETARIS_UMUM), asyncHandler(submitMembershipChanges));
router.patch('/cms/:id', requireCmsSession, requireCmsRole(CmsRole.SEKRETARIS_UMUM), asyncHandler(updateMembership));
export default router;
