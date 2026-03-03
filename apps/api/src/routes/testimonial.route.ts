import { Router } from 'express';
import { getAdminTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonial.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploadTestimonialImage } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', verifyToken, getAdminTestimonials);
router.post('/', verifyToken, uploadTestimonialImage.single('image'), createTestimonial);
router.put('/:id', verifyToken, uploadTestimonialImage.single('image'), updateTestimonial);
router.delete('/:id', verifyToken, deleteTestimonial);

export default router;
