import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';

/**
 * Get public organization profile
 * @route GET /api/public/profile
 */
export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const data = await profileService.getPublicProfile();
    res.status(200).json(data);
  } catch (error) {
    console.error('[Profile Controller] Error fetching profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch public profile' });
  }
};
