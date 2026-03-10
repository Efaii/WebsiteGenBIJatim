import { Request, Response } from 'express';
import { HomeService } from '../services/home.service';
import { catchAsync } from '../utils/catchAsync';

/**
 * @controller HomeController
 * @description Delegates homepage data aggregation to HomeService.
 */
export const getHomeContent = catchAsync(async (req: Request, res: Response) => {
  const data = await HomeService.getHomeContent();
  res.status(200).json(data);
});
