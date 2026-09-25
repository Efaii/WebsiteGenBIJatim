import { Router } from 'express';
import { getAwardees } from '../controllers/awardee.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getAwardees));

export default router;
