import { Router } from 'express';
import { getHomeContent } from '../controllers/home.controller';

const router = Router();

// GET /api/home
router.get('/', getHomeContent);

export default router;
