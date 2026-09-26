import { Router } from 'express';
import { listPublicAwardees } from '../controllers/public-awardee.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/', asyncHandler(listPublicAwardees));

export default router;
