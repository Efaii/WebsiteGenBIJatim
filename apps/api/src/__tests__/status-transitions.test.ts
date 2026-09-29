import assert from 'node:assert/strict';
import { assertExecutionTransition, assertPublicationTransition } from '../domain/status-transitions';

assert.doesNotThrow(() => assertPublicationTransition('DRAFT', 'SUBMITTED'));
assert.throws(() => assertPublicationTransition('PUBLISHED', 'APPROVED'));
assert.throws(() => assertPublicationTransition('SUBMITTED', 'REJECTED'));
assert.doesNotThrow(() => assertPublicationTransition('SUBMITTED', 'REJECTED', 'Needs correction'));
assert.doesNotThrow(() => assertExecutionTransition('PLANNED', 'ONGOING'));
assert.throws(() => assertExecutionTransition('COMPLETED', 'ONGOING'));
