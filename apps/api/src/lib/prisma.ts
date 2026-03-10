import { PrismaClient } from '@prisma/client';

/**
 * @module prisma
 * @description Shared PrismaClient singleton to prevent multiple DB connections.
 */
const prisma = new PrismaClient();

export default prisma;
