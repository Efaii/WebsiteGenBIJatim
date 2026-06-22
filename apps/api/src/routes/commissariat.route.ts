import { Router } from 'express';
import {
  getAllCommissariats,
  getCommissariatBySlug,
  getProgramKerjaById,
  getCommissariatStats,
} from '../controllers/commissariat.controller';

const router = Router();

// GET /api/commissariats — Semua komisariat
router.get('/', getAllCommissariats);

// GET /api/commissariats/stats — Statistik agregat
router.get('/stats', getCommissariatStats);

// GET /api/commissariats/proker/:id — Detail satu program kerja
router.get('/proker/:id', getProgramKerjaById);

// GET /api/commissariats/:slug — Detail komisariat + proker
router.get('/:slug', getCommissariatBySlug);

export default router;
