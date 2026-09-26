import { Router } from 'express';
import { getCommissariatStructure } from '../controllers/public-structure.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/:slug/structure', asyncHandler(getCommissariatStructure));

export default router;
