import { Router } from 'express';
import { getPublicProfile } from '../controllers/profile.controller';

/**
 * @route profile.route
 * @description Public read-only routes for organization profile data.
 */

const router = Router();

router.get('/', getPublicProfile);

export default router;
