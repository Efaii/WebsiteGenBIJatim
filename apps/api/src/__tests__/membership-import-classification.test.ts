import assert from 'node:assert/strict';
import { ImportRowClassification } from '@prisma/client';

assert.deepEqual(Object.values(ImportRowClassification), ['NEW', 'UPDATED', 'UNCHANGED', 'INVALID', 'AMBIGUOUS_MATCH', 'DUPLICATE_IN_FILE']);
