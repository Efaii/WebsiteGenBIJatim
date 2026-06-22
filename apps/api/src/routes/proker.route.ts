import { Router } from 'express';
import { getPublicProkers, getProkerById } from '../controllers/proker.controller';
import { 
  getAllProkersForAdmin,
  createProker, 
  updateProker, 
  deleteProker 
} from '../controllers/admin-proker.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploadProkerImage } from '../middlewares/upload.middleware';

/**
 * @route proker.route
 * @description Work Program management routes.
 */

const router = Router();

// Public routes
router.get('/', getPublicProkers);

// Admin listing (must be above dynamic :id)
router.get('/admin', verifyToken, getAllProkersForAdmin);

// Dynamic routes and management
router.get('/:id', getProkerById);
router.post('/', verifyToken, uploadProkerImage.single('image'), createProker);
router.put('/:id', verifyToken, uploadProkerImage.single('image'), updateProker);
router.delete('/:id', verifyToken, deleteProker);

export default router;
