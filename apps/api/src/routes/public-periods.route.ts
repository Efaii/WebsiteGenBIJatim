import { Router } from 'express';
import { listPublicPeriods } from '../controllers/public-periods.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/', asyncHandler(listPublicPeriods));

export default router;
