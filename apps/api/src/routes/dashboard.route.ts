import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect the dashboard stats endpoint
router.get('/stats', verifyToken, getDashboardStats);

export default router;
