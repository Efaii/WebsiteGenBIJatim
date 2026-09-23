import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAdditivePlan, compareRestore, legacyPhotoReferences, missingRequiredTables, parseDatabaseUrl, requiredLegacyTables, sanitizeBackupSql } from './legacy-schema-preflight.mjs';
import { assertSchemaReady, validateRestoreEvidence, validateSchemaReadiness } from './check-schema-readiness.mjs';
import { compareSchemaCompatibility, repositorySchemaDiscrepancies } from './legacy-schema-preflight.mjs';

test('parses mysql connection details without exposing the password', () => {
  assert.deepEqual(parseDatabaseUrl('mysql://operator:p%40ss@localhost:3307/legacy_db'), {
    host: 'localhost', port: '3307', user: 'operator', password: 'p@ss', database: 'legacy_db',
  });
});

test('counts populated legacy photo references', () => {
  assert.equal(legacyPhotoReferences({ foto1: '/a.webp', foto2: '', foto3: null, foto4: '/b.webp' }), 2);
});

test('enforces the explicit required legacy table set', () => {
  assert.deepEqual(requiredLegacyTables, ['program_kerja', 'commissariat']);
  assert.deepEqual(missingRequiredTables(['program_kerja']), ['commissariat']);
  assert.deepEqual(missingRequiredTables(['program_kerja', 'commissariat']), []);
});

test('prepares only additive operations and never destructive SQL', () => {
  const actions = buildAdditivePlan({ tables: ['program_kerja', 'commissariat'], columns: { program_kerja: ['id', 'foto1'] } });
  assert.equal(actions.length, 2);
  assert.ok(actions.every(({ sql }) => /^\s*(ALTER TABLE|CREATE TABLE)/i.test(sql)));
  assert.ok(actions.every(({ sql }) => !/^\s*(DROP|TRUNCATE|DELETE|RENAME|ALTER TABLE .*\b(MODIFY|DROP|RENAME)\b)/i.test(sql)));
  const compatibleColumns = {
    program_kerja: [{ name: 'id', type: 'varchar(191)', nullable: 'NO' }, { name: 'dateLabel', type: 'varchar(191)', nullable: 'YES' }],
    program_kerja_photo: [
      { name: 'id', type: 'varchar(191)', nullable: 'NO' }, { name: 'programKerjaId', type: 'varchar(191)', nullable: 'NO' },
      { name: 'filePath', type: 'varchar(191)', nullable: 'NO' }, { name: 'fileHash', type: 'varchar(64)', nullable: 'NO' }, { name: 'createdAt', type: 'datetime(3)', nullable: 'NO' },
    ],
  };
  const compatibleIndexes = [
    { tableName: 'program_kerja_photo', indexName: 'PRIMARY', nonUnique: 0, seqInIndex: 1, columnName: 'id' },
    { tableName: 'program_kerja_photo', indexName: 'program_kerja_photo_programKerjaId_fileHash_key', nonUnique: 0, seqInIndex: 1, columnName: 'programKerjaId' },
    { tableName: 'program_kerja_photo', indexName: 'program_kerja_photo_programKerjaId_fileHash_key', nonUnique: 0, seqInIndex: 2, columnName: 'fileHash' },
    { tableName: 'program_kerja_photo', indexName: 'program_kerja_photo_programKerjaId_createdAt_idx', nonUnique: 1, seqInIndex: 1, columnName: 'programKerjaId' },
    { tableName: 'program_kerja_photo', indexName: 'program_kerja_photo_programKerjaId_createdAt_idx', nonUnique: 1, seqInIndex: 2, columnName: 'createdAt' },
  ];
  const compatibleForeignKeys = [{ tableName: 'program_kerja_photo', constraintName: 'program_kerja_photo_programKerjaId_fkey', columnName: 'programKerjaId', referencedTableName: 'program_kerja', referencedColumnName: 'id', deleteRule: 'CASCADE', updateRule: 'CASCADE' }];
  assert.deepEqual(buildAdditivePlan({ tables: ['program_kerja', 'program_kerja_photo'], columns: compatibleColumns, indexes: compatibleIndexes, foreignKeys: compatibleForeignKeys }), []);
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

test('rejects backup directives that could redirect a restore to production', () => {
  assert.equal(sanitizeBackupSql('CREATE DATABASE /*!32312 IF NOT EXISTS*/ `genbi_jatim` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;\nUSE `genbi_jatim`;\nINSERT INTO program_kerja VALUES (1);', 'genbi_jatim'), 'INSERT INTO program_kerja VALUES (1);');
  assert.throws(() => sanitizeBackupSql('USE `other_db`; INSERT INTO program_kerja VALUES (1);', 'genbi_jatim'), /database-selection/);
  assert.throws(() => sanitizeBackupSql('CREATE DATABASE `other_db`;', 'genbi_jatim'), /database-selection/);
  assert.throws(() => sanitizeBackupSql('INSERT INTO `genbi_jatim`.`program_kerja` VALUES (1);', 'genbi_jatim'), /qualified references/);
  assert.throws(() => sanitizeBackupSql('INSERT INTO genbi_jatim.program_kerja VALUES (1);', 'genbi_jatim'), /qualified references/);
  assert.throws(() => sanitizeBackupSql('INSERT INTO genbi_jatim . program_kerja VALUES (1);', 'genbi_jatim'), /qualified references/);
  assert.equal(sanitizeBackupSql('INSERT INTO program_kerja VALUES (1);', 'genbi_jatim'), 'INSERT INTO program_kerja VALUES (1);');
});

test('fails closed when schema readiness evidence is absent', async () => {
  await assert.rejects(() => assertSchemaReady(), /Schema readiness evidence is missing|Schema readiness is/);
});

test('rejects expired or mismatched readiness and restore evidence', () => {
  const now = Date.parse('2026-09-23T00:00:00.000Z');
  assert.throws(() => validateSchemaReadiness({ status: 'ready', database: 'db', planHash: 'abc', expiresAt: '2026-09-22T23:59:00.000Z' }, { database: 'db', now }), /expired/);
  assert.throws(() => validateSchemaReadiness({ status: 'ready', database: 'other', planHash: 'abc', expiresAt: '2026-09-24T00:00:00.000Z' }, { database: 'db', now }), /targets/);
  assert.throws(() => validateRestoreEvidence({ status: 'verified', sourceDatabase: 'db', backupSha256: 'a'.repeat(64), expiresAt: '2026-09-22T23:59:00.000Z' }, { database: 'db', now }), /expired/);
  assert.doesNotThrow(() => validateRestoreEvidence({ status: 'verified', sourceDatabase: 'db', backupSha256: 'a'.repeat(64), expiresAt: '2026-09-24T00:00:00.000Z' }, { database: 'db', now }));
});

test('reports nullable-date migration discrepancies without auto-modifying legacy columns', () => {
  const discrepancies = repositorySchemaDiscrepancies({
    tables: ['program_kerja', 'commissariat'],
    columns: { program_kerja: [{ name: 'tanggalProker', type: 'datetime(3)', nullable: 'NO' }] },
    repositoryMigrations: ['20260923120000_program_kerja_photos'],
  });
  assert.ok(discrepancies.some((item) => item.includes('tanggalProker is NOT NULL')));
});
