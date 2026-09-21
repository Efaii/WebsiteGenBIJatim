import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { requireCmsSession } from '../middlewares/cms-session.middleware';
import { loginCms, logoutCms } from '../controllers/cms-auth.controller';

const router = Router();
router.post('/login', asyncHandler(loginCms));
router.post('/logout', requireCmsSession, asyncHandler(logoutCms));
export default router;
