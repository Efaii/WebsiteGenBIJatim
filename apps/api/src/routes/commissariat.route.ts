import { Router } from 'express';
import {
  getAllCommissariats,
  getCommissariatBySlug,
  getProgramKerjaById,
} from '../controllers/commissariat.controller';

const router = Router();

// GET /api/commissariats — Semua komisariat
router.get('/', getAllCommissariats);

// GET /api/commissariats/:slug — Detail komisariat + proker
router.get('/:slug', getCommissariatBySlug);

// GET /api/commissariats/proker/:id — Detail satu program kerja
router.get('/proker/:id', getProgramKerjaById);

export default router;
