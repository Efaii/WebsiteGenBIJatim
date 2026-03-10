import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * @service AuthService
 * @description Authentication logic: user lookup, password verification, token generation.
 */

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

export const AuthService = {
  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    };
  },
};
