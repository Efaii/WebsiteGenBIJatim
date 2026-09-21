import { Router } from 'express';
import { createContactMessage } from '../controllers/contact.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.post('/', asyncHandler(createContactMessage));

export default router;
