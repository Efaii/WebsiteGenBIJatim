import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { sendSuccess } from '../middlewares/request-context.middleware';
import { assertRuntimeConfig } from '../lib/runtime-config';
import { ensureStorageRoots } from '../lib/storage';

const router = Router();

router.get('/health', (_req, res) => sendSuccess(res, { status: 'ok' }));

router.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    assertRuntimeConfig();
    await ensureStorageRoots();
    return sendSuccess(res, { status: 'ready' });
  } catch {
    res.status(503).json({ error: { code: 'INTERNAL_ERROR', message: 'Service is not ready.' }, meta: { requestId: res.locals.requestId } });
  }
});

export default router;
