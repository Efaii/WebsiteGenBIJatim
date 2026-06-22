import { Router } from 'express';
import * as awardeeController from '../controllers/admin-awardee.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/awardees
 * @description Get all awardees (Admin/Public use cases)
 */
router.get('/', awardeeController.getAwardees);

/**
 * @route POST /api/awardees
 * @description Create new awardee (Protected)
 */
router.post('/', verifyToken, awardeeController.createAwardee);

/**
 * @route PUT /api/awardees/:id
 * @description Update awardee (Protected)
 */
router.put('/:id', verifyToken, awardeeController.updateAwardee);

/**
 * @route DELETE /api/awardees/:id
 * @description Delete awardee (Protected)
 */
router.delete('/:id', verifyToken, awardeeController.deleteAwardee);

export default router;
