import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { listPublishedMemberships } from '../controllers/membership.controller';

const router = Router();
router.get('/', asyncHandler(listPublishedMemberships));
export default router;
