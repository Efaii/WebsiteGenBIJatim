import assert from 'node:assert/strict';
import { divisionWriteSchema, membershipWriteSchema, periodWriteSchema } from '@repo/types';

const scope = { commissariatId: '123e4567-e89b-42d3-a456-426614174001', periodId: '123e4567-e89b-42d3-a456-426614174002', divisionId: null };
assert.equal(periodWriteSchema.safeParse({ label: '2025/2026' }).success, true);
assert.equal(periodWriteSchema.safeParse({ label: '2025' }).success, false);
assert.equal(divisionWriteSchema.safeParse({ name: 'Pendidikan', commissariatId: scope.commissariatId, periodId: scope.periodId }).success, true);
assert.equal(membershipWriteSchema.safeParse({ ...scope, name: 'A', position: 'Staff', studyProgram: 'Teknik' }).success, true);
assert.equal(membershipWriteSchema.safeParse({ ...scope, name: 'A', position: 'Staff', studyProgram: 'Teknik', clientScope: 'other' }).success, false);
