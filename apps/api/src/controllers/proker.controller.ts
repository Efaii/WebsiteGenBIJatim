import { Request, Response } from 'express';
import { ProkerService } from '../services/proker.service';

/**
 * @controller ProkerController
 * @description Public endpoints for Work Programs.
 */
export const getPublicProkers = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.query;
    const prokers = await ProkerService.getAll(orgId as string, false);
    res.status(200).json({
      status: 'success',
      data: prokers
    });
  } catch (error) {
    console.error('[Proker Controller] Error fetching public prokers:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch prokers' });
  }
};

/**
 * Get a single work program by ID
 */
export const getProkerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proker = await ProkerService.getById(id);
    
    if (!proker) {
      return res.status(404).json({ status: 'error', message: 'Proker not found' });
    }

    res.status(200).json({
      status: 'success',
      data: proker
    });
  } catch (error) {
    console.error('[Proker Controller] Error fetching proker by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch proker' });
  }
};

