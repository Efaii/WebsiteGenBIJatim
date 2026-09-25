import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPROVED_BASELINE,
  assertCleanTargetDatabase,
  compareExpectedVsActual,
} from './verify-initial-production.mjs';

const approvedActual = () => ({
  programTotal: APPROVED_BASELINE.programTotal,
  programPublished: APPROVED_BASELINE.programPublished,
  programArchived: APPROVED_BASELINE.programArchived,
  programExecutionCancelled: APPROVED_BASELINE.programExecutionCancelled,
  childPhotoRows: APPROVED_BASELINE.childPhotoRows,
  photoUniquePairs: APPROVED_BASELINE.childPhotoRows,
  photoMissingFiles: 0,
  photoHashMismatches: 0,
  membershipTotal: APPROVED_BASELINE.membershipTotal,
  membershipActivePublished: APPROVED_BASELINE.membershipTotal,
  membershipNoDivision: APPROVED_BASELINE.membershipNoDivision,
  membershipByCommissariat: { ...APPROVED_BASELINE.membershipByCommissariat },
  testPeriod2099: 0,
  testCommissariatSlug: 0,
  badDivisionNames: 0,
  stageLeftovers: 0,
  sourceImages: APPROVED_BASELINE.sourceImages,
});

test('accepts the clean initial-production database and rejects development names', () => {
  assert.equal(assertCleanTargetDatabase('genbi_jatim_initial_production'), 'genbi_jatim_initial_production');
  assert.throws(() => assertCleanTargetDatabase('genbi_jatim'), /development database/);
  assert.throws(() => assertCleanTargetDatabase('genbi_jatim_shadow'), /development database/);
  assert.throws(() => assertCleanTargetDatabase('genbi_jatim_test'), /development database/);
  assert.throws(() => assertCleanTargetDatabase('genbi_restore_initial_final'), /isolated restore database/);
  assert.throws(() => assertCleanTargetDatabase('some_other_db'), /expected the clean initial-production database/);
});

test('approved baseline produces no discrepancies', () => {
  const result = compareExpectedVsActual(approvedActual());
  assert.equal(result.ok, true);
  assert.deepEqual(result.discrepancies, []);
  assert.ok(result.rows.length >= 20);
});

test('reports discrepancies for membership, photos, archives, and hygiene drift', () => {
  const drifted = approvedActual();
  drifted.membershipTotal = 618;
  drifted.membershipByCommissariat.its = 86;
  drifted.childPhotoRows = 430;
  drifted.photoUniquePairs = 429;
  drifted.photoHashMismatches = 1;
  drifted.programArchived = 13;
  drifted.programExecutionCancelled = 11;
  drifted.testPeriod2099 = 1;
  drifted.sourceImages = 185;

  const result = compareExpectedVsActual(drifted);
  assert.equal(result.ok, false);
  const metrics = result.discrepancies.map((row) => row.split(':')[0]);
  for (const metric of [
    'membership.total',
    'membership.byCommissariat.its',
    'photo.childRows',
    'photo.uniquePairs',
    'photo.hashMismatches',
    'program.archived',
    'program.executionCancelled',
    'hygiene.testPeriod2099',
    'hygiene.sourceImages',
  ]) {
    assert.ok(metrics.includes(metric), `expected discrepancy for ${metric}`);
  }
});

test('checks optional public API counts only when provided', () => {
  const withoutApi = compareExpectedVsActual(approvedActual());
  assert.equal(withoutApi.rows.some((row) => row.metric.startsWith('api.')), false);

  const withApi = approvedActual();
  withApi.publicProgramList = 138;
  withApi.publicMembership = APPROVED_BASELINE.publicMembership;
  withApi.publicAwardee = APPROVED_BASELINE.publicAwardee;
  const result = compareExpectedVsActual(withApi);
  assert.equal(result.ok, false);
  assert.deepEqual(result.discrepancies, ['api.publicProgramList: expected 139, got 138']);
});
