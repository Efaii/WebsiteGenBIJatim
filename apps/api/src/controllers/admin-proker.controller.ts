
import { Request, Response } from 'express';
import { ProkerService } from '../services/proker.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

/**
 * @controller AdminProkerController
 * @description Standardized endpoints for Work Program management.
 */

export const getAllProkersForAdmin = catchAsync(async (req: Request, res: Response) => {
  const prokers = await ProkerService.getAll(undefined, true);
  res.status(200).json({
    status: 'success',
    data: prokers
  });
});

export const createProker = catchAsync(async (req: Request, res: Response) => {
  const result = await ProkerService.create(req.body);
  res.status(201).json({
    status: 'success',
    data: result
  });
});

export const updateProker = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProkerService.update(id, req.body);
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const deleteProker = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ProkerService.delete(id);
  res.status(200).json({
    status: 'success',
    message: 'Proker deleted successfully'
  });
});
