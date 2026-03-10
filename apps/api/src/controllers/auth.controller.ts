import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../lib/validations';
import { catchAsync } from '../utils/catchAsync';

/**
 * @controller AuthController
 * @description Handles login with Zod validation and delegates to AuthService.
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
  }

  const { username, password } = parsed.data;
  const result = await AuthService.login(username, password);

  if (!result) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.status(200).json({ message: 'Login successful', ...result });
});
