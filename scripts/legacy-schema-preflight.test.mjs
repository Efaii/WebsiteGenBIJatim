import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAdditivePlan, compareRestore, legacyPhotoReferences, parseDatabaseUrl } from './legacy-schema-preflight.mjs';

test('parses mysql connection details without exposing the password', () => {
  assert.deepEqual(parseDatabaseUrl('mysql://operator:p%40ss@localhost:3307/legacy_db'), {
    host: 'localhost', port: '3307', user: 'operator', password: 'p@ss', database: 'legacy_db',
  });
});

test('counts populated legacy photo references', () => {
  assert.equal(legacyPhotoReferences({ foto1: '/a.webp', foto2: '', foto3: null, foto4: '/b.webp' }), 2);
});

test('prepares only additive operations and never destructive SQL', () => {
  const actions = buildAdditivePlan({ tables: ['program_kerja', 'commissariat'], columns: { program_kerja: ['id', 'foto1'] } });
  assert.equal(actions.length, 2);
  assert.ok(actions.every(({ sql }) => /^\s*(ALTER TABLE|CREATE TABLE)/i.test(sql)));
  assert.ok(actions.every(({ sql }) => !/^\s*(DROP|TRUNCATE|DELETE|RENAME|ALTER TABLE .*\b(MODIFY|DROP|RENAME)\b)/i.test(sql)));
  assert.deepEqual(buildAdditivePlan({ tables: ['program_kerja', 'program_kerja_photo'], columns: {
    program_kerja: ['id', 'dateLabel'],
    program_kerja_photo: ['id', 'programKerjaId', 'filePath', 'fileHash', 'createdAt'],
  } }), []);
  assert.throws(() => buildAdditivePlan({ tables: ['program_kerja', 'program_kerja_photo'], columns: {
    program_kerja: ['id'], program_kerja_photo: ['id'],
  } }), /incompatible/);
  assert.throws(() => buildAdditivePlan({ tables: ['commissariat'], columns: {} }), /program_kerja is missing/);
});

test('compares restored counts and required table inventory', () => {
  const source = { tables: ['commissariat', 'program_kerja'], programCount: 148, programsWithLegacyPhotos: 50, legacyPhotoReferenceCount: 224 };
  assert.deepEqual(compareRestore(source, { ...source }), []);
  assert.match(compareRestore(source, { ...source, programCount: 147 })[0], /count differs/);
});
