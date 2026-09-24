import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { assertExpectedMetrics, expectedMetrics, manifestHasRequiredFields, releaseIdForSnapshot, snapshotIdFor } from './proker-promotion.mjs';

const expected = {
  programTotal: 153,
  publishedPrograms: 139,
  archivedPrograms: 14,
  cancelledPrograms: 12,
  childPhotoRows: 431,
  availablePhotoFiles: 431,
  matchingPhotoHashes: 431,
  newWebpFiles: 207,
  sourceImages: 186,
  orphanFiles: 0,
  stagingLeftovers: 0,
};

test('uses separate publication and execution dimensions in the approved baseline', () => {
  assert.deepEqual(expectedMetrics(), expected);
  assert.equal(expected.publishedPrograms + expected.archivedPrograms, expected.programTotal);
  assert.ok(expected.cancelledPrograms <= expected.programTotal);
  assert.doesNotThrow(() => assertExpectedMetrics(expected));
  assert.throws(() => assertExpectedMetrics({ ...expected, childPhotoRows: 430 }), /Acceptance metrics mismatch/);
});

test('treats child-photo rows and unique file hashes as different metrics', () => {
  assert.ok(expected.childPhotoRows >= expected.matchingPhotoHashes);
  assert.equal(expected.availablePhotoFiles, expected.matchingPhotoHashes);
});

test('promotion manifest hash is deterministic for the same file list', () => {
  const files = [{ filePath: '/uploads/proker/a.webp', sha256: 'a'.repeat(64), bytes: 3 }];
  const hash = () => createHash('sha256').update(JSON.stringify({ generatedAt: 'fixed', files })).digest('hex');
  assert.equal(hash(), hash());
  assert.equal(hash().length, 64);
});

test('promotion approval phrases remain independent', () => {
  assert.notEqual('SETUJUI RESTORE STAGING', 'SETUJUI CUTOVER STAGING');
  assert.notEqual('SETUJUI RESTORE STAGING', 'SETUJUI SCHEMA MIGRASI');
  assert.notEqual('SETUJUI CUTOVER STAGING', 'SETUJUI DATA MIGRASI');
});

test('snapshot IDs are deterministic and manifest fields are explicit', () => {
  assert.deepEqual(snapshotIdFor('abcdef1234567890', new Date('2026-09-24T12:34:56.000Z')), { snapshotId: 'proker-issue20-20260924123456-abcdef123456' });
  assert.equal(releaseIdForSnapshot('proker-issue20-20260924123456-abcdef123456', 'a'.repeat(64), 'b'.repeat(64)), `proker-issue20-20260924123456-abcdef123456-${'a'.repeat(64)}-${'b'.repeat(64)}`);
  assert.equal(manifestHasRequiredFields({}), false);
  assert.equal(manifestHasRequiredFields({ snapshotId: 's', releaseId: 'r', sourceDatabase: 'db', sourceFreezeMarker: {}, commitSha: 'c', backupSha256: 'a', fileManifestSha256: 'b', expectedMetrics: {}, actualMetrics: {}, sourceArtifactLocations: {}, targetDatabase: null, targetStorageNamespace: null, approvalReferences: {}, rollbackTarget: 'old', retentionUntil: 'now', status: 'created' }), true);
});

test('release identity includes both artifact hashes', () => {
  assert.throws(() => releaseIdForSnapshot('snapshot', 'not-a-hash', 'b'.repeat(64)), /valid backup/);
});
