import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildAdditivePlan, buildProgramSchemaPlan, compareRestore, legacyPhotoReferences, migrationHistoryReady, migrationPlanHash, missingRequiredTables, parseDatabaseUrl, requiredLegacyTables, sanitizeBackupSql, stagingAcceptance, stagingAcceptanceReason, structuralSchemaDiscrepancies } from './legacy-schema-preflight.mjs';
import { assertSchemaReady, prismaMigrationSet, prismaMigrationSetHash, restoreEvidenceSha256, validateRestoreEvidence, validateSchemaReadiness } from './check-schema-readiness.mjs';
import { repositorySchemaDiscrepancies } from './legacy-schema-preflight.mjs';
import { parseMysqlCommandArgs } from './mysql-command.mjs';

test('parses mysql connection details without exposing the password', () => {
  assert.deepEqual(parseDatabaseUrl('mysql://operator:p%40ss@localhost:3307/legacy_db'), {
    host: 'localhost', port: '3307', user: 'operator', password: 'p@ss', database: 'legacy_db',
  });
});

test('validates optional mysql command prefixes for private container use', () => {
  assert.deepEqual(parseMysqlCommandArgs(JSON.stringify(['compose', 'exec', '-T', 'db', 'mysql'])), ['compose', 'exec', '-T', 'db', 'mysql']);
  assert.deepEqual(parseMysqlCommandArgs(''), []);
  assert.throws(() => parseMysqlCommandArgs('not-json'), /JSON array of command-line strings/);
  assert.throws(() => parseMysqlCommandArgs('["compose",4]'), /JSON array of command-line strings/);
});

test('counts populated legacy photo references', () => {
  assert.equal(legacyPhotoReferences({ foto1: '/a.webp', foto2: '', foto3: null, foto4: '/b.webp' }), 2);
});

test('enforces the explicit required legacy table set', () => {
  assert.equal(requiredLegacyTables.length, 20);
  assert.deepEqual(missingRequiredTables(['program_kerja']), requiredLegacyTables.filter((table) => table !== 'program_kerja'));
  assert.deepEqual(missingRequiredTables(requiredLegacyTables), []);
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

test('hashes the exact sorted SQL files in the Prisma migration inventory', async () => {
  const migrations = await prismaMigrationSet(fileURLToPath(new URL('../apps/api/prisma/migrations', import.meta.url)));
  assert.equal(migrations.length, 13);
  assert.deepEqual(migrations.map(({ name }) => name), [...migrations.map(({ name }) => name)].sort());
  assert.ok(migrations.every(({ sha256 }) => /^[a-f0-9]{64}$/.test(sha256)));
  assert.match(prismaMigrationSetHash(migrations), /^[a-f0-9]{64}$/);
});

test('schema plan hash binds exact Prisma migration set digest', () => {
  const base = { database: 'db', actions: [], schemaFingerprint: 'schema', migrationDiscrepancies: {}, migrationSetHash: 'a'.repeat(64) };
  assert.notEqual(migrationPlanHash(base), migrationPlanHash({ ...base, migrationSetHash: 'b'.repeat(64) }));
});

test('fails closed when schema readiness evidence is absent', async () => {
  await assert.rejects(() => assertSchemaReady(), /Schema readiness evidence is missing|Schema readiness is/);
});

test('rejects expired or mismatched readiness and restore evidence', () => {
  const now = Date.parse('2026-09-23T00:00:00.000Z');
  const legacyTables = ['auditevent', 'cmsaccount', 'cmsassignment', 'cmssession', 'commissariat', 'contact_messages', 'division', 'faq', 'membership', 'membershipimportalias', 'membershipimportpreview', 'membershipimportrow', 'news', 'newscoverasset', 'newsrevision', 'newsslugalias', 'period', 'program_kerja', 'testimonial', 'user'];
  const validRestoreUnsigned = { status: 'verified', sourceDatabase: 'db', restoreDatabase: 'genbi_restore_test', backupSha256: 'a'.repeat(64), verifiedAt: '2026-09-22T00:00:00.000Z', expiresAt: '2026-09-24T00:00:00.000Z', source: { database: 'db', requiredLegacyTables: legacyTables, missingRequiredTables: [], tables: legacyTables.map((table) => table.toUpperCase()), programCount: 1, programsWithLegacyPhotos: 1, legacyPhotoReferenceCount: 1 }, restoredDatabase: { database: 'genbi_restore_test', requiredLegacyTables: legacyTables, missingRequiredTables: [], tables: legacyTables, programCount: 1, programsWithLegacyPhotos: 1, legacyPhotoReferenceCount: 1 }, sourceAfter: { database: 'db', requiredLegacyTables: legacyTables, missingRequiredTables: [], tables: legacyTables, programCount: 1, programsWithLegacyPhotos: 1, legacyPhotoReferenceCount: 1 } };
  const validRestore = { ...validRestoreUnsigned, evidenceSha256: restoreEvidenceSha256(validRestoreUnsigned) };
  const validReadiness = { status: 'ready', planHash: 'abc', migrationApplied: true, dataMigrationReady: true, schemaApproval: 'SETUJUI SCHEMA MIGRASI', restoreEvidence: { status: validRestore.status, sourceDatabase: validRestore.sourceDatabase, restoreDatabase: validRestore.restoreDatabase, backupSha256: validRestore.backupSha256, verifiedAt: validRestore.verifiedAt, expiresAt: validRestore.expiresAt, evidenceSha256: validRestore.evidenceSha256 } };
  const migrationSet = [{ name: '20260222133426_init_genbi_schema', sha256: 'c'.repeat(64) }];
  const migrationReadiness = { migrationSet, migrationSetHash: prismaMigrationSetHash(migrationSet) };
  assert.throws(() => validateSchemaReadiness({ ...validReadiness, database: 'db', expiresAt: '2026-09-22T23:59:00.000Z' }, { database: 'db', now }), /expired/);
  assert.throws(() => validateSchemaReadiness({ ...validReadiness, database: 'db', expiresAt: 'not-a-date' }, { database: 'db', now }), /expired|invalid/);
  assert.throws(() => validateSchemaReadiness({ ...validReadiness, database: 'other', expiresAt: '2026-09-24T00:00:00.000Z' }, { database: 'db', now }), /targets/);
  const expiredRestore = { ...validRestoreUnsigned, expiresAt: '2026-09-22T23:59:00.000Z' };
  assert.throws(() => validateRestoreEvidence({ ...expiredRestore, evidenceSha256: restoreEvidenceSha256(expiredRestore) }, { database: 'db', now }), /expired/);
  const invalidTimestampRestore = { ...validRestoreUnsigned, verifiedAt: 'not-a-date' };
  assert.throws(() => validateRestoreEvidence({ ...invalidTimestampRestore, evidenceSha256: restoreEvidenceSha256(invalidTimestampRestore) }, { database: 'db', now }), /timestamp/);
  assert.doesNotThrow(() => validateRestoreEvidence(validRestore, { database: 'db', now }));
  const partialRestore = { ...validRestoreUnsigned, source: { ...validRestoreUnsigned.source, tables: undefined } };
  assert.throws(() => validateRestoreEvidence({ ...partialRestore, evidenceSha256: restoreEvidenceSha256(partialRestore) }, { database: 'db', now }), /partial/);
  assert.throws(() => validateSchemaReadiness({ ...validReadiness, ...migrationReadiness, database: 'db', expiresAt: '2026-09-24T00:00:00.000Z' }, { database: 'db', restoreEvidence: { ...validRestore, backupSha256: 'b'.repeat(64) }, now }), /does not match/);
  assert.throws(() => validateSchemaReadiness({ status: 'ready', database: 'db', planHash: 'abc', expiresAt: '2026-09-24T00:00:00.000Z' }, { database: 'db', now }), /does not confirm deployed migration history/);
  assert.throws(() => validateSchemaReadiness({ status: 'ready', ...migrationReadiness, database: 'db', planHash: 'abc', expiresAt: '2026-09-24T00:00:00.000Z', migrationApplied: true, dataMigrationReady: true }, { database: 'db', now }), /missing exact schema approval/);
  assert.throws(() => validateSchemaReadiness({ ...validReadiness, database: 'db', expiresAt: '2026-09-24T00:00:00.000Z' }, { database: 'db', restoreEvidence: validRestore, now }), /migration inventory/);
  assert.doesNotThrow(() => validateSchemaReadiness({ ...validReadiness, ...migrationReadiness, database: 'db', expiresAt: '2026-09-24T00:00:00.000Z' }, { database: 'db', restoreEvidence: validRestore, now }));
  assert.throws(() => validateSchemaReadiness({ ...validReadiness, ...migrationReadiness, database: 'db', expiresAt: '2026-09-24T00:00:00.000Z' }, { database: 'db', planHash: 'different-reviewed-plan', restoreEvidence: validRestore, now }), /planHash/);
  assert.throws(() => validateSchemaReadiness({ ...validReadiness, ...migrationReadiness, migrationSet: [{ ...migrationSet[0], sha256: 'd'.repeat(64) }], database: 'db', expiresAt: '2026-09-24T00:00:00.000Z' }, { database: 'db', restoreEvidence: validRestore, now }), /inventory digest/);
});

test('reports nullable-date migration discrepancies without auto-modifying legacy columns', () => {
  const discrepancies = repositorySchemaDiscrepancies({
    tables: ['program_kerja', 'commissariat'],
    columns: { program_kerja: [{ name: 'tanggalProker', type: 'datetime(3)', nullable: 'NO' }] },
    repositoryMigrations: ['20260923120000_program_kerja_photos'],
  });
  assert.ok(discrepancies.some((item) => item.includes('tanggalProker is NOT NULL')));
});

test('keeps Program Kerja preflight scoped to legacy-compatible additive changes', () => {
  const actions = buildProgramSchemaPlan({
    tables: requiredLegacyTables,
    columns: {
      program_kerja: [
        { name: 'id', type: 'varchar(191)', nullable: 'NO' },
        { name: 'tanggalProker', type: 'datetime(3)', nullable: 'NO' },
      ],
      cmsassignment: [{ name: 'active', type: 'tinyint(1)', nullable: 'NO' }],
    },
    indexes: [],
    foreignKeys: [],
    triggers: [],
  });
  assert.ok(!actions.some(({ sql }) => sql.includes('MODIFY `tanggalProker` DATETIME(3) NULL')));
  assert.ok(actions.some(({ sql }) => sql.includes('CREATE TABLE `program_kerja_photo`')));
  assert.ok(!actions.some(({ sql }) => sql.includes('ProgramKerjaRevision')));
  assert.ok(!actions.some(({ sql }) => sql.includes('CmsAssignment')));
  assert.ok(actions.every(({ sql }) => !/^\s*(DROP|TRUNCATE|DELETE|RENAME)\b/i.test(sql)));
});

test('blocks schema verification when Prisma migration history is absent or incomplete', () => {
  assert.equal(migrationHistoryReady({ migrationTablePresent: false, migrationDiscrepancies: {} }), false);
  assert.equal(migrationHistoryReady({ migrationTablePresent: true, migrationDiscrepancies: { missingFromDatabase: ['pending'], appliedButNotInRepository: [], failedOrRolledBack: [] } }), false);
  assert.equal(migrationHistoryReady({ migrationTablePresent: true, migrationDiscrepancies: { missingFromDatabase: [], appliedButNotInRepository: [], failedOrRolledBack: [] } }), true);
  assert.deepEqual(structuralSchemaDiscrepancies(['Active schema conflicts: incompatible date', 'Repository migration expects a nullable field']), ['Active schema conflicts: incompatible date']);
});

test('keeps staging deferred without treating it as a failed local schema gate', () => {
  assert.equal(stagingAcceptance, 'deferred');
  assert.match(stagingAcceptanceReason, /retained staging tooling/);
});
