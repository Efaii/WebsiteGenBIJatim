import { Router } from 'express';
import { AdminDocumentController } from '../controllers/admin-document.controller';
import { verifyToken } from '../middlewares/auth.middleware';

/**
 * @route admin-docs.route
 * @description Administrative routes for document management.
 */

const router = Router();

import { uploadDocument } from '../middlewares/upload.middleware';

// Admin Document routes (Protected)
router.get('/', verifyToken, AdminDocumentController.getAll);
router.post('/', verifyToken, uploadDocument.single('file'), AdminDocumentController.create);
router.put('/:id', verifyToken, uploadDocument.single('file'), AdminDocumentController.update);
router.delete('/:id', verifyToken, AdminDocumentController.delete);

export default router;
