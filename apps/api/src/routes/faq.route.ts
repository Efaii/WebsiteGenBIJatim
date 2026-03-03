import { Router } from 'express';
import { getAdminFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faq.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply verifyToken middleware to all FAQ management routes
router.get('/', verifyToken, getAdminFaqs);
router.post('/', verifyToken, createFaq);
router.put('/:id', verifyToken, updateFaq);
router.delete('/:id', verifyToken, deleteFaq);

export default router;
