import assert from 'node:assert/strict';
import { adaptLegacyProgram, adaptLegacyPrograms } from '../domain/legacy-adapter';

const adapted = adaptLegacyProgram({ id: 7, namaProker: 'Legacy', status: 'Completed', dateIso: '2025-01-01', divisi: 'Pendidikan' });
assert.equal(adapted.legacyId, '7');
assert.equal(adapted.executionStatus, 'COMPLETED');
assert.equal(adapted.ambiguous, false);
assert.equal(adaptLegacyProgram({ id: 'x', title: 'Missing date', status: 'unknown' }).ambiguous, true);
assert.equal(adaptLegacyPrograms([{ id: '1', title: 'A' }]).length, 1);
assert.throws(() => adaptLegacyPrograms({}), /array/);
