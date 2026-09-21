import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { getCanonicalMasters } from '../controllers/master.controller';

const router = Router();
router.get('/', asyncHandler(getCanonicalMasters));
export default router;
