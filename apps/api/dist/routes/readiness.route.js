"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const runtime_config_1 = require("../lib/runtime-config");
const storage_1 = require("../lib/storage");
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => (0, request_context_middleware_1.sendSuccess)(res, { status: 'ok' }));
router.get('/ready', async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        (0, runtime_config_1.assertRuntimeConfig)();
        await (0, storage_1.ensureStorageRoots)();
        return (0, request_context_middleware_1.sendSuccess)(res, { status: 'ready' });
    }
    catch {
        res.status(503).json({ error: { code: 'INTERNAL_ERROR', message: 'Service is not ready.' }, meta: { requestId: res.locals.requestId } });
    }
});
exports.default = router;
