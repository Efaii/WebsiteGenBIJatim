import { Router } from 'express';
import { getAwardees } from '../controllers/awardee.controller';

const router = Router();

router.get('/', getAwardees);

export default router;
