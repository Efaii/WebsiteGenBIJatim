import assert from 'node:assert/strict';

if (process.env.RUN_INTEGRATION_TESTS !== '1') throw new Error('Integration tests require RUN_INTEGRATION_TESTS=1.');
assert.match(process.env.DATABASE_URL ?? '', /genbi_jatim_test(?:$|[?])/i, 'integration tests must use genbi_jatim_test');
assert.equal(process.env.NODE_ENV, 'test', 'integration tests must run with NODE_ENV=test');
