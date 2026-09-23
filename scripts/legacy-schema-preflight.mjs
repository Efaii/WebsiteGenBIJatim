import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { readRestoreEvidence, validateRestoreEvidence } from './check-schema-readiness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const requiredLegacyTables = ['program_kerja', 'commissariat'];
const approvalPhrase = 'SETUJUI SCHEMA MIGRASI';
const defaultReadinessTtlMs = 24 * 60 * 60 * 1000;
const defaultRestoreEvidenceTtlMs = 7 * 24 * 60 * 60 * 1000;
const readinessPath = () => path.resolve(process.env.SCHEMA_READINESS_PATH ?? path.join(root, 'artifacts/migration/schema-readiness.json'));
const restoreEvidencePath = () => path.resolve(process.env.RESTORE_EVIDENCE_PATH ?? path.join(root, 'artifacts/migration/restore-verification.json'));

export function parseDatabaseUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'mysql:' && url.protocol !== 'mariadb:') throw new Error('DATABASE_URL must use mysql:// or mariadb://.');
  const database = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!database) throw new Error('DATABASE_URL must include a database name.');
  if (!/^[a-zA-Z0-9_]+$/.test(database)) throw new Error('DATABASE_URL database name must contain only letters, numbers, and underscores.');
  return {
    host: url.hostname || 'localhost',
    port: url.port || '3306',
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
  };
}

export function legacyPhotoReferences(row) {
  return ['foto1', 'foto2', 'foto3', 'foto4', 'foto5', 'foto6']
    .filter((column) => row[column] !== null && row[column] !== undefined && String(row[column]).trim() !== '').length;
}

const normalizeSqlType = (value) => String(value ?? '').toLowerCase().replace(/\s+/g, '');
const normalizeColumns = (columns, tableName) => {
  const key = Object.keys(columns ?? {}).find((candidate) => candidate.toLowerCase() === tableName.toLowerCase());
  return Object.fromEntries((columns?.[key] ?? []).map((column) => {
    const name = typeof column === 'string' ? column : column.name;
    return [name.toLowerCase(), typeof column === 'string' ? { name } : column];
  }));
};
const tableExists = (tables, tableName) => tables.some((table) => table.toLowerCase() === tableName.toLowerCase());
export function missingRequiredTables(tables) {
  return requiredLegacyTables.filter((requiredTable) => !tableExists(tables, requiredTable));
}
const indexSignature = (indexes, tableName, indexName) => (indexes ?? [])
  .filter((index) => index.tableName.toLowerCase() === tableName.toLowerCase() && index.indexName.toLowerCase() === indexName.toLowerCase())
  .sort((left, right) => left.seqInIndex - right.seqInIndex);

export function compareSchemaCompatibility({ tables, columns, indexes = [], foreignKeys = [], programIdType = 'VARCHAR(191)' }) {
  const additive = [];
  const incompatible = [];
  const programColumns = normalizeColumns(columns, 'program_kerja');
  if (!Object.hasOwn(programColumns, 'datelabel')) additive.push('program_kerja.dateLabel is missing and can be added as nullable VARCHAR(191).');
  else if (!programColumns.datelabel.type || normalizeSqlType(programColumns.datelabel.type) !== 'varchar(191)' || String(programColumns.datelabel.nullable).toUpperCase() !== 'YES') {
    incompatible.push('program_kerja.dateLabel exists with an incompatible type or nullability.');
  }

  if (!tableExists(tables, 'program_kerja_photo')) {
    additive.push('program_kerja_photo is missing and can be created additively.');
    return { additive, incompatible };
  }

  const photoColumns = normalizeColumns(columns, 'program_kerja_photo');
  const expectedColumns = {
    id: 'varchar(191)',
    programkerjaid: normalizeSqlType(programIdType),
    filepath: 'varchar(191)',
    filehash: 'varchar(64)',
    createdat: 'datetime(3)',
  };
  for (const [column, expectedType] of Object.entries(expectedColumns)) {
    const actual = photoColumns[column];
    if (!actual) incompatible.push(`program_kerja_photo.${column} is missing.`);
    else if (!actual.type || normalizeSqlType(actual.type) !== expectedType || String(actual.nullable).toUpperCase() !== 'NO') incompatible.push(`program_kerja_photo.${column} has an incompatible type or nullability.`);
  }
  const expectedIndexes = [
    ['PRIMARY', 0, ['id']],
    ['program_kerja_photo_programKerjaId_fileHash_key', 0, ['programKerjaId', 'fileHash']],
    ['program_kerja_photo_programKerjaId_createdAt_idx', 1, ['programKerjaId', 'createdAt']],
  ];
  for (const [name, nonUnique, expectedColumnsForIndex] of expectedIndexes) {
    const actual = indexSignature(indexes, 'program_kerja_photo', name);
    const actualColumns = actual.map((index) => String(index.columnName).toLowerCase());
    const expectedIndexColumns = expectedColumnsForIndex.map((column) => column.toLowerCase());
    if (!actual.length || Number(actual[0].nonUnique) !== nonUnique || JSON.stringify(actualColumns) !== JSON.stringify(expectedIndexColumns)) incompatible.push(`program_kerja_photo index ${name} is missing or incompatible.`);
  }
  const expectedForeignKey = (foreignKeys ?? []).find((foreignKey) => foreignKey.tableName.toLowerCase() === 'program_kerja_photo' && foreignKey.constraintName.toLowerCase() === 'program_kerja_photo_programkerjaid_fkey');
  if (!expectedForeignKey || expectedForeignKey.columnName.toLowerCase() !== 'programkerjaid' || expectedForeignKey.referencedTableName.toLowerCase() !== 'program_kerja' || expectedForeignKey.referencedColumnName.toLowerCase() !== 'id' || expectedForeignKey.deleteRule.toUpperCase() !== 'CASCADE' || expectedForeignKey.updateRule.toUpperCase() !== 'CASCADE') incompatible.push('program_kerja_photo foreign key is missing or incompatible.');
  return { additive, incompatible };
}

export function buildAdditivePlan({ tables, columns, indexes = [], foreignKeys = [], programIdType = 'VARCHAR(191)' }) {
  if (!/^[A-Z0-9(), ]+$/.test(programIdType)) throw new Error('Legacy program ID type is not safe for the additive plan; refusing to generate SQL.');
  const tableSet = new Set(tables.map((table) => table.toLowerCase()));
  const compatibility = compareSchemaCompatibility({ tables, columns, indexes, foreignKeys, programIdType });
  if (compatibility.incompatible.length) throw new Error(`Existing schema is incompatible; manual review required: ${compatibility.incompatible.join(' ')}`);
  const actions = [];
  if (!tableSet.has('program_kerja')) throw new Error('Required legacy table program_kerja is missing; refusing to prepare schema changes.');
  if (compatibility.additive.some((item) => item.startsWith('program_kerja.dateLabel'))) actions.push({
    description: 'Add nullable period label for undated programs',
    sql: 'ALTER TABLE `program_kerja` ADD COLUMN `dateLabel` VARCHAR(191) NULL',
  });
  if (compatibility.additive.some((item) => item.startsWith('program_kerja_photo'))) {
    actions.push({
      description: 'Add child photo gallery table without altering legacy photo columns',
      sql: `CREATE TABLE \`program_kerja_photo\` (\`id\` VARCHAR(191) NOT NULL, \`programKerjaId\` ${programIdType} NOT NULL, \`filePath\` VARCHAR(191) NOT NULL, \`fileHash\` VARCHAR(64) NOT NULL, \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (\`id\`), UNIQUE INDEX \`program_kerja_photo_programKerjaId_fileHash_key\` (\`programKerjaId\`, \`fileHash\`), INDEX \`program_kerja_photo_programKerjaId_createdAt_idx\` (\`programKerjaId\`, \`createdAt\`), CONSTRAINT \`program_kerja_photo_programKerjaId_fkey\` FOREIGN KEY (\`programKerjaId\`) REFERENCES \`program_kerja\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    });
  }
  return actions;
}

const columnExists = (columns, tableName, columnName) => Object.hasOwn(normalizeColumns(columns, tableName), columnName.toLowerCase());
const indexExists = (indexes, tableName, indexName) => indexSignature(indexes, tableName, indexName).length > 0;
const foreignKeyExists = (foreignKeys, tableName, constraintName) => (foreignKeys ?? []).some((foreignKey) => foreignKey.tableName.toLowerCase() === tableName.toLowerCase() && foreignKey.constraintName.toLowerCase() === constraintName.toLowerCase());

export function buildProgramSchemaPlan({ tables, columns, indexes = [], foreignKeys = [], programIdType = 'VARCHAR(191)' }) {
  if (!/^[A-Z0-9(), ]+$/.test(programIdType)) throw new Error('Legacy program ID type is not safe for the additive plan; refusing to generate SQL.');
  const tableSet = new Set(tables.map((table) => table.toLowerCase()));
  if (!tableSet.has('program_kerja')) throw new Error('Required legacy table program_kerja is missing; refusing to prepare schema changes.');
  if (!tableSet.has('commissariat')) throw new Error('Required legacy table commissariat is missing; refusing to prepare schema changes.');
  const actions = [];
  const addColumn = (table, column, sql) => {
    if (!columnExists(columns, table, column)) actions.push({ description: `Add ${table}.${column}`, sql });
  };

  addColumn('program_kerja', 'periodId', 'ALTER TABLE `program_kerja` ADD COLUMN `periodId` VARCHAR(191) NULL');
  addColumn('program_kerja', 'divisionId', 'ALTER TABLE `program_kerja` ADD COLUMN `divisionId` VARCHAR(191) NULL');
  addColumn('program_kerja', 'publicationStatus', "ALTER TABLE `program_kerja` ADD COLUMN `publicationStatus` ENUM('DRAFT','SUBMITTED','APPROVED','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED'");
  addColumn('program_kerja', 'rejectionReason', 'ALTER TABLE `program_kerja` ADD COLUMN `rejectionReason` TEXT NULL');
  addColumn('program_kerja', 'authorAccountId', 'ALTER TABLE `program_kerja` ADD COLUMN `authorAccountId` VARCHAR(191) NULL');
  addColumn('program_kerja', 'objectives', 'ALTER TABLE `program_kerja` ADD COLUMN `objectives` JSON NULL');
  addColumn('program_kerja', 'startDate', 'ALTER TABLE `program_kerja` ADD COLUMN `startDate` DATETIME(3) NULL');
  addColumn('program_kerja', 'endDate', 'ALTER TABLE `program_kerja` ADD COLUMN `endDate` DATETIME(3) NULL');
  addColumn('program_kerja', 'executionStatus', "ALTER TABLE `program_kerja` ADD COLUMN `executionStatus` ENUM('PLANNED','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PLANNED'");
  addColumn('program_kerja', 'dateLabel', 'ALTER TABLE `program_kerja` ADD COLUMN `dateLabel` VARCHAR(191) NULL');

  if (!columnExists(columns, 'program_kerja', 'tanggalProker')) throw new Error('program_kerja.tanggalProker is missing; refusing to infer legacy dates.');
  if (!tableSet.has('ProgramKerjaRevision'.toLowerCase())) {
    actions.push({
      description: 'Create nullable ProgramKerjaRevision table for CMS archive/revision access',
      sql: `CREATE TABLE \`ProgramKerjaRevision\` (\`id\` VARCHAR(191) NOT NULL, \`programKerjaId\` VARCHAR(191) NOT NULL, \`namaProker\` VARCHAR(191) NOT NULL, \`divisi\` VARCHAR(191) NOT NULL, \`tanggalProker\` DATETIME(3) NULL, \`dateLabel\` VARCHAR(191) NULL, \`formatPelaksanaan\` VARCHAR(191) NOT NULL, \`deskripsiProker\` TEXT NOT NULL, \`publicationStatus\` ENUM('DRAFT','SUBMITTED','APPROVED','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'DRAFT', \`rejectionReason\` TEXT NULL, \`cancelledAt\` DATETIME(3) NULL, \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` DATETIME(3) NOT NULL, \`objectives\` JSON NULL, \`startDate\` DATETIME(3) NULL, \`endDate\` DATETIME(3) NULL, \`executionStatus\` ENUM('PLANNED','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PLANNED', PRIMARY KEY (\`id\`), INDEX \`ProgramKerjaRevision_programKerjaId_publicationStatus_idx\` (\`programKerjaId\`, \`publicationStatus\`), CONSTRAINT \`ProgramKerjaRevision_programKerjaId_fkey\` FOREIGN KEY (\`programKerjaId\`) REFERENCES \`program_kerja\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    });
  } else {
    addColumn('ProgramKerjaRevision', 'dateLabel', 'ALTER TABLE `ProgramKerjaRevision` ADD COLUMN `dateLabel` VARCHAR(191) NULL');
    const revisionDate = normalizeColumns(columns, 'ProgramKerjaRevision').tanggalproker;
    if (revisionDate && String(revisionDate.nullable).toUpperCase() !== 'YES') actions.push({ description: 'Make ProgramKerjaRevision.tanggalProker nullable', sql: 'ALTER TABLE `ProgramKerjaRevision` MODIFY `tanggalProker` DATETIME(3) NULL' });
  }
  if (!tableSet.has('ProgramArtifact'.toLowerCase())) actions.push({
    description: 'Create ProgramArtifact table for CMS documents',
    sql: 'CREATE TABLE `ProgramArtifact` (`id` VARCHAR(191) NOT NULL, `programKerjaId` VARCHAR(191) NOT NULL, `kind` VARCHAR(191) NOT NULL, `storageKey` VARCHAR(191) NOT NULL, `originalFilename` VARCHAR(191) NOT NULL, `mimeType` VARCHAR(191) NOT NULL, `byteSize` INTEGER NOT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (`id`), UNIQUE INDEX `ProgramArtifact_storageKey_key` (`storageKey`), INDEX `ProgramArtifact_programKerjaId_kind_idx` (`programKerjaId`,`kind`), CONSTRAINT `ProgramArtifact_programKerjaId_fkey` FOREIGN KEY (`programKerjaId`) REFERENCES `program_kerja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
  });

  if (!indexExists(indexes, 'program_kerja', 'program_kerja_periodId_idx')) actions.push({ description: 'Add ProgramKerja period index', sql: 'CREATE INDEX `program_kerja_periodId_idx` ON `program_kerja`(`periodId`)' });
  if (!indexExists(indexes, 'program_kerja', 'program_kerja_divisionId_idx')) actions.push({ description: 'Add ProgramKerja division index', sql: 'CREATE INDEX `program_kerja_divisionId_idx` ON `program_kerja`(`divisionId`)' });
  if (columnExists(columns, 'program_kerja', 'periodId') && tableSet.has('period') && !foreignKeyExists(foreignKeys, 'program_kerja', 'program_kerja_periodId_fkey')) actions.push({ description: 'Add ProgramKerja period foreign key', sql: 'ALTER TABLE `program_kerja` ADD CONSTRAINT `program_kerja_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `period`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE' });
  if (columnExists(columns, 'program_kerja', 'divisionId') && tableSet.has('division') && !foreignKeyExists(foreignKeys, 'program_kerja', 'program_kerja_divisionId_fkey')) actions.push({ description: 'Add ProgramKerja division foreign key', sql: 'ALTER TABLE `program_kerja` ADD CONSTRAINT `program_kerja_divisionId_fkey` FOREIGN KEY (`divisionId`) REFERENCES `division`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE' });
  if (columnExists(columns, 'program_kerja', 'authorAccountId') && tableSet.has('cmsaccount') && !foreignKeyExists(foreignKeys, 'program_kerja', 'program_kerja_authorAccountId_fkey')) actions.push({ description: 'Add ProgramKerja author foreign key', sql: 'ALTER TABLE `program_kerja` ADD CONSTRAINT `program_kerja_authorAccountId_fkey` FOREIGN KEY (`authorAccountId`) REFERENCES `cmsaccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE' });

  if (!columnExists(columns, 'cmsassignment', 'activeAccountKey')) {
    actions.push({ description: 'Add active CMS assignment guard column', sql: 'ALTER TABLE `CmsAssignment` ADD COLUMN `activeAccountKey` VARCHAR(191) NULL' });
    actions.push({ description: 'Backfill active CMS assignment guard values', sql: 'UPDATE `CmsAssignment` SET `activeAccountKey` = `cmsAccountId` WHERE `active` = true' });
    actions.push({ description: 'Add unique active CMS assignment guard', sql: 'CREATE UNIQUE INDEX `CmsAssignment_one_active_account_key` ON `CmsAssignment` (`activeAccountKey`)' });
    actions.push({ description: 'Add active CMS assignment insert trigger', sql: 'CREATE TRIGGER `CmsAssignment_set_active_key_insert` BEFORE INSERT ON `CmsAssignment` FOR EACH ROW SET NEW.`activeAccountKey` = IF(NEW.`active`, NEW.`cmsAccountId`, NULL)' });
    actions.push({ description: 'Add active CMS assignment update trigger', sql: 'CREATE TRIGGER `CmsAssignment_set_active_key_update` BEFORE UPDATE ON `CmsAssignment` FOR EACH ROW SET NEW.`activeAccountKey` = IF(NEW.`active`, NEW.`cmsAccountId`, NULL)' });
  }
  if (!tableSet.has('program_kerja_photo')) actions.push({
    description: 'Create child ProgramKerja photo gallery table',
    sql: `CREATE TABLE \`program_kerja_photo\` (\`id\` VARCHAR(191) NOT NULL, \`programKerjaId\` ${programIdType} NOT NULL, \`filePath\` VARCHAR(191) NOT NULL, \`fileHash\` VARCHAR(64) NOT NULL, \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (\`id\`), UNIQUE INDEX \`program_kerja_photo_programKerjaId_fileHash_key\` (\`programKerjaId\`, \`fileHash\`), INDEX \`program_kerja_photo_programKerjaId_createdAt_idx\` (\`programKerjaId\`, \`createdAt\`), CONSTRAINT \`program_kerja_photo_programKerjaId_fkey\` FOREIGN KEY (\`programKerjaId\`) REFERENCES \`program_kerja\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  });
  if (columnExists(columns, 'program_kerja', 'tanggalProker')) {
    const dateColumn = normalizeColumns(columns, 'program_kerja').tanggalproker;
    if (dateColumn && String(dateColumn.nullable).toUpperCase() !== 'YES') actions.push({ description: 'Make ProgramKerja.tanggalProker nullable', sql: 'ALTER TABLE `program_kerja` MODIFY `tanggalProker` DATETIME(3) NULL' });
  }
  return actions;
}

export function schemaFingerprint({ tables, columns, indexes, foreignKeys }) {
  const canonical = JSON.stringify({ tables, columns, indexes, foreignKeys });
  return createHash('sha256').update(canonical).digest('hex');
}

export function repositorySchemaDiscrepancies({ tables, columns, indexes = [], foreignKeys = [], repositoryMigrations }) {
  const discrepancies = [];
  if (!repositoryMigrations.includes('20260923120000_program_kerja_photos')) return discrepancies;
  const compatibility = compareSchemaCompatibility({ tables, columns, indexes, foreignKeys });
  const programColumns = normalizeColumns(columns, 'program_kerja');
  if (programColumns.tanggalproker && String(programColumns.tanggalproker.nullable).toUpperCase() !== 'YES') discrepancies.push('Active schema conflicts with repository migration: program_kerja.tanggalProker is NOT NULL but the additive migration expects it to be nullable.');
  discrepancies.push(...compatibility.additive.map((item) => `Repository migration expects change not present in active schema: ${item}`));
  discrepancies.push(...compatibility.incompatible.map((item) => `Active schema conflicts with repository migration: ${item}`));
  return discrepancies;
}

export function migrationPlanHash({ database, actions, schemaFingerprint: fingerprint, migrationDiscrepancies }) {
  return createHash('sha256').update(JSON.stringify({ database, actions, schemaFingerprint: fingerprint, migrationDiscrepancies })).digest('hex');
}

export function compareRestore(source, restored) {
  const differences = [];
  if (JSON.stringify(source.tables) !== JSON.stringify(restored.tables)) differences.push('table list differs');
  if (source.programCount !== restored.programCount) differences.push(`program_kerja count differs (${source.programCount} vs ${restored.programCount})`);
  if (source.programsWithLegacyPhotos !== restored.programsWithLegacyPhotos) differences.push(`programs with legacy photos differs (${source.programsWithLegacyPhotos} vs ${restored.programsWithLegacyPhotos})`);
  if (source.legacyPhotoReferenceCount !== restored.legacyPhotoReferenceCount) differences.push(`legacy photo reference count differs (${source.legacyPhotoReferenceCount} vs ${restored.legacyPhotoReferenceCount})`);
  return differences;
}

export function sanitizeBackupSql(sql, sourceDatabase) {
  const escapedDatabase = sourceDatabase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const quotedSource = '(?:`?' + escapedDatabase + '`?)';
  const sourceCreateDatabase = new RegExp('(^|\\n)\\s*CREATE\\s+(?:DATABASE|SCHEMA)\\s+(?:(?:/\\*!\\d+\\s+IF\\s+NOT\\s+EXISTS\\s*\\*/\\s*)|(?:IF\\s+NOT\\s+EXISTS\\s+))?' + quotedSource + '[^;]*;\\s*', 'gim');
  const sourceUseDatabase = new RegExp('(^|\\n)\\s*USE\\s+' + quotedSource + '\\s*;\\s*', 'gim');
  const sanitized = sql.replace(sourceCreateDatabase, '$1').replace(sourceUseDatabase, '$1');
  const unsafe = /(^|\n)\s*(?:USE\s+|CREATE\s+(?:DATABASE|SCHEMA)\b|DROP\s+(?:DATABASE|SCHEMA)\b|ALTER\s+(?:DATABASE|SCHEMA)\b|RENAME\s+DATABASE\b)/im;
  if (unsafe.test(sanitized)) throw new Error('Backup contains database-selection or database-DDL statements that do not target the configured source database; refusing to execute it in an isolated restore.');
  const qualifiedSource = new RegExp('(?:`?' + escapedDatabase + '`?)\\s*\\.', 'i');
  if (qualifiedSource.test(sanitized)) throw new Error(`Backup contains qualified references to source database ${sourceDatabase}; refusing to restore it.`);
  return sanitized;
}
async function writeReadiness(status, details = {}) {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const destination = readinessPath();
  await mkdir(path.dirname(destination), { recursive: true });
  const ttlMs = Number(process.env.SCHEMA_READINESS_TTL_MS ?? defaultReadinessTtlMs);
  const expiresAt = status === 'ready' ? new Date(Date.now() + (Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : defaultReadinessTtlMs)).toISOString() : null;
  await writeFile(destination, `${JSON.stringify({ status, updatedAt: new Date().toISOString(), database: details.database ?? null, expiresAt, ...details }, null, 2)}\n`, 'utf8');
}

async function writeRestoreEvidence(evidence) {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const destination = restoreEvidencePath();
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
}

function mysqlArgs(connection, extra = [], includeDatabase = false) {
  const args = ['--host', connection.host, '--port', connection.port, '--user', connection.user, ...extra];
  if (connection.password) args.push(`--password=${connection.password}`);
  if (includeDatabase) args.push(`--database=${connection.database}`);
  return args;
}

async function run(command, args, { input, capture = true } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: [input ? 'pipe' : 'ignore', capture ? 'pipe' : 'inherit', 'inherit'] });
    const output = [];
    if (capture) child.stdout.on('data', (chunk) => output.push(chunk));
    if (input) child.stdin.end(input);
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) reject(new Error(`${command} failed with exit code ${code}`));
      else resolve(Buffer.concat(output).toString('utf8'));
    });
  });
}

async function query(connection, sql) {
  const output = await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['--batch', '--raw', '--skip-column-names', '-e', sql]));
  return output.trim() ? output.trim().split(/\r?\n/).map((line) => line.split('\t')) : [];
}

function quoteIdentifier(identifier) {
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) throw new Error('Unsafe database identifier.');
  return `\`${identifier}\``;
}

export async function inspect(connection) {
  const tableRows = await query(connection, `SELECT table_name FROM information_schema.tables WHERE table_schema='${connection.database}' AND table_type='BASE TABLE' ORDER BY table_name`);
  const tables = tableRows.map(([name]) => name);
  const missing = missingRequiredTables(tables);
  if (missing.length) throw new Error(`Required legacy tables missing: ${missing.join(', ')}.`);
  const columns = {};
  for (const table of tables) {
    columns[table] = (await query(connection, `SELECT column_name, column_type, is_nullable FROM information_schema.columns WHERE table_schema='${connection.database}' AND table_name='${table}' ORDER BY ordinal_position`))
      .map(([name, type, nullable]) => ({ name, type, nullable }));
  }
  const indexes = (await query(connection, `SELECT table_name, index_name, non_unique, seq_in_index, column_name FROM information_schema.statistics WHERE table_schema='${connection.database}' ORDER BY table_name, index_name, seq_in_index`))
    .map(([tableName, indexName, nonUnique, seqInIndex, columnName]) => ({ tableName, indexName, nonUnique: Number(nonUnique), seqInIndex: Number(seqInIndex), columnName }));
  const foreignKeys = (await query(connection, `SELECT k.table_name, k.constraint_name, k.column_name, k.referenced_table_name, k.referenced_column_name, r.delete_rule, r.update_rule FROM information_schema.key_column_usage k LEFT JOIN information_schema.referential_constraints r ON r.constraint_schema = k.constraint_schema AND r.constraint_name = k.constraint_name AND r.table_name = k.table_name WHERE k.table_schema='${connection.database}' AND k.referenced_table_name IS NOT NULL ORDER BY k.table_name, k.constraint_name, k.ordinal_position`))
    .map(([tableName, constraintName, columnName, referencedTableName, referencedColumnName, deleteRule, updateRule]) => ({ tableName, constraintName, columnName, referencedTableName, referencedColumnName, deleteRule, updateRule }));
  const historyExists = tables.some((table) => table.toLowerCase() === '_prisma_migrations');
  const history = historyExists
    ? await query(connection, `SELECT migration_name, finished_at, rolled_back_at, logs FROM ${quoteIdentifier(connection.database)}.${quoteIdentifier('_prisma_migrations')} ORDER BY started_at`)
    : [];
  const programTable = tables.find((table) => table.toLowerCase() === 'program_kerja');
  const programColumns = new Set((columns[programTable] ?? []).map(({ name }) => name.toLowerCase()));
  const photoFields = ['foto1', 'foto2', 'foto3', 'foto4', 'foto5', 'foto6'].filter((field) => programColumns.has(field));
  const countRows = await query(connection, `SELECT COUNT(*) FROM ${quoteIdentifier(connection.database)}.${quoteIdentifier(programTable)}`);
  const photoExpr = photoFields.length ? photoFields.map((field) => `(NULLIF(TRIM(${quoteIdentifier(field)}), '') IS NOT NULL)`).join(' + ') : '0';
  const photoRows = await query(connection, `SELECT COUNT(*) FROM ${quoteIdentifier(connection.database)}.${quoteIdentifier(programTable)} WHERE (${photoExpr}) > 0`);
  const photoReferenceExpr = photoFields.length ? photoFields.map((field) => `(${quoteIdentifier(field)} IS NOT NULL AND TRIM(${quoteIdentifier(field)}) <> '')`).join(' + ') : '0';
  const photoReferenceRows = await query(connection, `SELECT COALESCE(SUM(${photoReferenceExpr}), 0) FROM ${quoteIdentifier(connection.database)}.${quoteIdentifier(programTable)}`);
  const sourceMigrations = (await readdir(path.join(root, 'apps/api/prisma/migrations'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const applied = new Set(history.filter(([, finished, rolledBack]) => finished && !rolledBack).map(([name]) => name));
  const failed = history.filter(([, finished, rolledBack]) => !finished || rolledBack).map(([name]) => name);
  const repositorySet = new Set(sourceMigrations);
  return {
    database: connection.database,
    requiredLegacyTables,
    missingRequiredTables: missing,
    tables,
    columns,
    programCount: Number(countRows[0]?.[0] ?? 0),
    programsWithLegacyPhotos: Number(photoRows[0]?.[0] ?? 0),
    legacyPhotoReferenceCount: Number(photoReferenceRows[0]?.[0] ?? 0),
    legacyPhotoColumns: photoFields,
    migrationTablePresent: historyExists,
    migrationHistory: history.map(([name, finishedAt, rolledBackAt, logs]) => ({ name, finishedAt, rolledBackAt, logs })),
    indexes,
    foreignKeys,
    schemaFingerprint: schemaFingerprint({ tables, columns, indexes, foreignKeys }),
    migrationDiscrepancies: {
      missingFromDatabase: sourceMigrations.filter((name) => !applied.has(name)),
      appliedButNotInRepository: [...applied].filter((name) => !repositorySet.has(name)),
      failedOrRolledBack: failed,
    },
    repositoryMigrations: sourceMigrations,
    repositorySchemaDiscrepancies: repositorySchemaDiscrepancies({ tables, columns, indexes, foreignKeys, repositoryMigrations: sourceMigrations }),
  };
}

async function restoreBackup(connection, dumpFile, restoreDatabase) {
  if (!/^genbi_restore_[a-zA-Z0-9_]+$/.test(restoreDatabase)) throw new Error('Restore target must use the isolated genbi_restore_ prefix.');
  if (restoreDatabase === connection.database) throw new Error('Restore database must not be the source/production database.');
  await writeRestoreEvidence({ status: 'blocked', updatedAt: new Date().toISOString(), sourceDatabase: connection.database, restoreDatabase, reason: 'Restore verification is in progress; evidence is not ready for schema or data migration.' });
  const exists = await query(connection, `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${restoreDatabase}'`);
  if (exists.length) throw new Error(`Restore target ${restoreDatabase} already exists; refusing to overwrite or drop it.`);
  const originalDump = await readFile(dumpFile);
  const dump = sanitizeBackupSql(originalDump.toString('utf8'), connection.database);
  if (!dump.length) throw new Error('Backup file is empty; refusing to restore it.');
  const sourceReport = await inspect(connection);
  const checksum = createHash('sha256').update(originalDump).digest('hex');
  await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['-e', `CREATE DATABASE ${quoteIdentifier(restoreDatabase)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`]), { capture: false });
  let verified = false;
  let restoredReport;
  try {
    await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs({ ...connection, database: restoreDatabase }, [], true), { input: Buffer.from(`USE \`${restoreDatabase}\`;\n${dump}`), capture: false });
    const report = await inspect({ ...connection, database: restoreDatabase });
    const differences = compareRestore(sourceReport, report);
    if (differences.length) throw new Error(`Restore verification mismatch: ${differences.join('; ')}.`);
    restoredReport = report;
    verified = true;
  } catch (error) {
    throw new Error(`Backup restore/verification failed. Temporary database ${restoreDatabase} was ${process.env.KEEP_RESTORE_DATABASE === '1' ? 'retained for diagnosis' : 'created only for this failed check and is eligible for cleanup'}; it was not marked ready for data migration. ${error.message}`);
  } finally {
    if (verified || process.env.KEEP_RESTORE_DATABASE !== '1') {
      await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['-e', `DROP DATABASE ${quoteIdentifier(restoreDatabase)}`]), { capture: false });
    }
  }
  const sourceAfter = await inspect(connection);
  const sourceDifferences = compareRestore(sourceReport, sourceAfter);
  if (sourceDifferences.length) throw new Error(`Source database changed during restore verification: ${sourceDifferences.join('; ')}.`);
  const restoreTtlMs = Number(process.env.RESTORE_EVIDENCE_TTL_MS ?? defaultRestoreEvidenceTtlMs);
  const evidence = { status: 'verified', verifiedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + (Number.isFinite(restoreTtlMs) && restoreTtlMs > 0 ? restoreTtlMs : defaultRestoreEvidenceTtlMs)).toISOString(), sourceDatabase: connection.database, restoreDatabase, backupSha256: checksum, source: sourceReport, restoredDatabase: restoredReport, sourceAfter };
  await writeRestoreEvidence(evidence);
  console.log(JSON.stringify(evidence, null, 2));
}

async function assertRestoreEvidenceForApply(database) {
  try {
    validateRestoreEvidence(await readRestoreEvidence(), { database });
  } catch (error) {
    throw new Error(`Schema apply blocked until backup restore verification succeeds for ${database}. ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const connection = parseDatabaseUrl(process.env.DATABASE_URL ?? '');
  if (command === 'restore') {
    const [dumpFile, restoreDatabase] = args;
    if (!dumpFile || !restoreDatabase) throw new Error('Usage: node scripts/legacy-schema-preflight.mjs restore <backup.sql> <genbi_restore_name>');
    await restoreBackup(connection, path.resolve(dumpFile), restoreDatabase);
    return;
  }
  if (command !== 'inspect' && command !== 'plan' && command !== 'apply') throw new Error('Usage: node scripts/legacy-schema-preflight.mjs <restore|inspect|plan|apply> ...');
  if (command === 'apply') {
    await writeReadiness('blocked', { database: connection.database, reason: 'Schema apply has not completed.' });
    await assertRestoreEvidenceForApply(connection.database).catch(async (error) => {
      await writeReadiness('blocked', { database: connection.database, reason: error instanceof Error ? error.message : String(error) });
      throw error;
    });
  }
  const report = await inspect(connection);
  if (command === 'inspect') {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const program = report.tables.find((table) => table.toLowerCase() === 'program_kerja');
  const idColumn = report.columns[program].find(({ name }) => name.toLowerCase() === 'id');
  if (!idColumn) throw new Error('Legacy program_kerja.id is missing; refusing automatic schema changes.');
  const actions = buildProgramSchemaPlan({ tables: report.tables, columns: report.columns, indexes: report.indexes, foreignKeys: report.foreignKeys, programIdType: idColumn.type.toUpperCase() });
  const planHash = migrationPlanHash({ database: report.database, actions, schemaFingerprint: report.schemaFingerprint, migrationDiscrepancies: report.migrationDiscrepancies });
  const plan = { generatedAt: new Date().toISOString(), database: report.database, schemaFingerprint: report.schemaFingerprint, planHash, destructiveOperations: 0, actions, migrationDiscrepancies: report.migrationDiscrepancies, repositorySchemaDiscrepancies: report.repositorySchemaDiscrepancies };
  if (command === 'plan') {
    console.log(JSON.stringify({ inspection: report, plan }, null, 2));
    return;
  }
  if (!['development', 'test'].includes(process.env.NODE_ENV ?? '')) {
    throw new Error('Direct schema apply is blocked for staging/production. Review this plan, add it as a Prisma migration, run check:migration-mode, then use prisma migrate deploy.');
  }
  if (process.env.SCHEMA_MIGRATION_APPROVAL !== approvalPhrase) {
    await writeReadiness('blocked', { database: connection.database, reason: 'Explicit schema approval is missing.' });
    throw new Error(`Schema execution blocked. Review the plan, then set SCHEMA_MIGRATION_APPROVAL="${approvalPhrase}" explicitly.`);
  }
  await writeReadiness('blocked', { database: connection.database, reason: 'Schema execution is in progress; data migration is blocked.', actions, planHash, schemaFingerprint: report.schemaFingerprint });
  try {
    for (const action of actions) await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['-e', action.sql]), { capture: false });
    const verified = await inspect(connection);
    const remaining = buildProgramSchemaPlan({ tables: verified.tables, columns: verified.columns, indexes: verified.indexes, foreignKeys: verified.foreignKeys, programIdType: idColumn.type.toUpperCase() });
    if (remaining.length) throw new Error(`Schema execution incomplete; ${remaining.length} approved additive operation(s) remain. Data migration is blocked.`);
    await writeReadiness('ready', { database: connection.database, applied: actions.map(({ description }) => description), migrationDiscrepancies: verified.migrationDiscrepancies, planHash, schemaFingerprint: verified.schemaFingerprint });
    console.log(JSON.stringify({ schemaReady: true, applied: actions.map(({ description }) => description), verifiedAt: new Date().toISOString(), migrationDiscrepancies: verified.migrationDiscrepancies }, null, 2));
  } catch (error) {
    await writeReadiness('blocked', { database: connection.database, reason: error instanceof Error ? error.message : String(error), actions, planHash, schemaFingerprint: report.schemaFingerprint });
    throw new Error(`Schema execution failed; data migration is blocked. ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
