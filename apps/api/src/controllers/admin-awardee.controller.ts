import { Request, Response } from 'express';
import * as awardeeService from '../services/awardee.service';

/**
 * Get all awardees
 * @route GET /api/awardees
 */
export const getAwardees = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.query;
    const awardees = await awardeeService.getAllAwardees(orgId as string);
    res.status(200).json({
      status: 'success',
      data: awardees
    });
  } catch (error) {
    console.error('[Admin Awardee Controller] Error fetching awardees:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch awardees' });
  }
};

/**
 * Create Awardee
 * @route POST /api/awardees
 */
export const createAwardee = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    if (!data.name || !data.organizationProfileId || !data.university) {
      return res.status(400).json({ status: 'error', message: 'Name, University, and Organization Profile ID are required' });
    }

    const awardee = await awardeeService.createAwardee(data);
    res.status(201).json({
      status: 'success',
      data: awardee
    });
  } catch (error) {
    console.error('[Admin Awardee Controller] Error creating awardee:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create awardee' });
  }
};

/**
 * Update Awardee
 * @route PUT /api/awardees/:id
 */
export const updateAwardee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await awardeeService.updateAwardee(id, data);
    res.status(200).json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    console.error('[Admin Awardee Controller] Error updating awardee:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update awardee' });
  }
};

/**
 * Delete Awardee
 * @route DELETE /api/awardees/:id
 */
export const deleteAwardee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await awardeeService.deleteAwardee(id);
    res.status(200).json({
      status: 'success',
      message: 'Awardee deleted successfully'
    });
  } catch (error) {
    console.error('[Admin Awardee Controller] Error deleting awardee:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete awardee' });
  }
};
