import assert from 'node:assert/strict';
import {
  DEFAULT_PUBLIC_PERIOD,
  PUBLIC_PERIODS,
  periodFromSlug,
  periodToSlug,
} from '../domain/public-periods';

assert.deepEqual([...PUBLIC_PERIODS], ['2025/2026', '2026/2027']);
assert.equal(DEFAULT_PUBLIC_PERIOD, '2025/2026');

assert.equal(periodToSlug('2025/2026'), '2025-2026');
assert.equal(periodToSlug('2026/2027'), '2026-2027');

assert.equal(periodFromSlug('2025-2026'), '2025/2026');
assert.equal(periodFromSlug('2026-2027'), '2026/2027');
assert.equal(periodFromSlug('2099-2100'), null);

console.log('All public-periods assertions passed successfully!');
