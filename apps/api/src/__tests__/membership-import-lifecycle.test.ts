import assert from 'node:assert/strict';
import { ImportPreviewStatus } from '@prisma/client';

assert.deepEqual(Object.values(ImportPreviewStatus), ['PREVIEW_READY', 'COMMITTED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'STALE', 'EXPIRED', 'FAILED']);
assert.equal(30 * 60 * 1000, 1800000);
assert.equal(90 * 24 * 60 * 60 * 1000, 7776000000);
