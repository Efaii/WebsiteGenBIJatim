import assert from 'node:assert/strict';
import { assertExecutionTransition, assertProgramRoleTransition, assertPublicationTransition } from '../domain/status-transitions';

assert.doesNotThrow(() => assertPublicationTransition('DRAFT', 'SUBMITTED'));
assert.throws(() => assertPublicationTransition('PUBLISHED', 'APPROVED'));
assert.throws(() => assertPublicationTransition('SUBMITTED', 'REJECTED'));
assert.doesNotThrow(() => assertPublicationTransition('SUBMITTED', 'REJECTED', 'Needs correction'));
assert.doesNotThrow(() => assertExecutionTransition('PLANNED', 'ONGOING'));
assert.throws(() => assertExecutionTransition('COMPLETED', 'ONGOING'));

// Program Kerja: sekretaris hanya boleh mengajukan; admin global seluruh alur.
assert.doesNotThrow(() => assertProgramRoleTransition('SEKRETARIS_DIVISI', 'SUBMITTED'));
assert.doesNotThrow(() => assertProgramRoleTransition('SEKRETARIS_UMUM', 'SUBMITTED'));
assert.doesNotThrow(() => assertProgramRoleTransition('ADMIN_GLOBAL', 'APPROVED'));
assert.doesNotThrow(() => assertProgramRoleTransition('ADMIN_GLOBAL', 'PUBLISHED'));
assert.doesNotThrow(() => assertProgramRoleTransition('ADMIN_GLOBAL', 'ARCHIVED'));
assert.throws(() => assertProgramRoleTransition('SEKRETARIS_DIVISI', 'APPROVED'), /publisher/);
assert.throws(() => assertProgramRoleTransition('SEKRETARIS_DIVISI', 'PUBLISHED'), /publisher/);
assert.throws(() => assertProgramRoleTransition('SEKRETARIS_UMUM', 'ARCHIVED'), /publisher/);
assert.throws(() => assertProgramRoleTransition('SEKRETARIS_DIVISI', 'REJECTED'), /publisher/);
