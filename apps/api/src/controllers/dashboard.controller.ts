import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { catchAsync } from '../utils/catchAsync';

/**
 * @controller DashboardController
 * @description Delegates dashboard statistics to DashboardService.
 */
export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await DashboardService.getStats();
  res.status(200).json(stats);
});
