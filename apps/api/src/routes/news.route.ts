import { Router } from 'express';
import { getLatestNews, getAllNewsCountAndData, createNews, updateNews, deleteNews } from '../controllers/news.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploadNewsImage } from '../middlewares/upload.middleware';

const router = Router();

// Public route for homepage
router.get('/latest', getLatestNews);

// Admin Routes (Protected)
router.get('/', verifyToken, getAllNewsCountAndData);
router.post('/', verifyToken, uploadNewsImage.single('image'), createNews);
router.put('/:id', verifyToken, uploadNewsImage.single('image'), updateNews);
router.delete('/:id', verifyToken, deleteNews);

export default router;
