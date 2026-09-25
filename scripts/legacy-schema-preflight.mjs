import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { readRestoreEvidence, restoreEvidenceSha256, validateRestoreEvidence } from './check-schema-readiness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const requiredLegacyTables = [
  'auditevent',
  'cmsaccount',
  'cmsassignment',
  'cmssession',
  'commissariat',
  'contact_messages',
  'division',
  'faq',
  'membership',
  'membershipimportalias',
  'membershipimportpreview',
  'membershipimportrow',
  'news',
  'newscoverasset',
  'newsrevision',
  'newsslugalias',
  'period',
  'program_kerja',
  'testimonial',
  'user',
];
const approvalPhrase = 'SETUJUI SCHEMA MIGRASI';
const programPhotoMigration = '20260923120000_program_kerja_photos';
export const stagingAcceptance = 'deferred';
export const stagingAcceptanceReason = 'Formal staging execution is deferred for the current local development release; retained staging tooling is available for future production hardening.';
const defaultReadinessTtlMs = 24 * 60 * 60 * 1000;
const defaultRestoreEvidenceTtlMs = 7 * 24 * 60 * 60 * 1000;
const readinessPath = () => path.resolve(process.env.SCHEMA_READINESS_PATH ?? path.join(root, 'artifacts/migration/schema-readiness.json'));
const restoreEvidencePath = () => path.resolve(process.env.RESTORE_EVIDENCE_PATH ?? path.join(root, 'artifacts/migration/restore-verification.json'));
const baselinePath = () => path.resolve(process.env.BASELINE_REPORT_PATH ?? path.join(root, 'artifacts/migration/legacy-schema-baseline.json'));

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

export function buildProgramSchemaPlan({ tables, columns, indexes = [], foreignKeys = [], triggers = [], programIdType = 'VARCHAR(191)' }) {
  if (!/^[A-Z0-9(), ]+$/.test(programIdType)) throw new Error('Legacy program ID type is not safe for the additive plan; refusing to generate SQL.');
  const tableSet = new Set(tables.map((table) => table.toLowerCase()));
  if (!tableSet.has('program_kerja')) throw new Error('Required legacy table program_kerja is missing; refusing to prepare schema changes.');
  if (!tableSet.has('commissariat')) throw new Error('Required legacy table commissariat is missing; refusing to prepare schema changes.');
  const actions = [];
  const addColumn = (table, column, sql) => {
    if (!columnExists(columns, table, column)) actions.push({ description: `Add ${table}.${column}`, sql });
  };

  // This preflight owns only the two #17 compatibility fields; CMS migrations remain separate.
  if (!columnExists(columns, 'program_kerja', 'tanggalProker')) throw new Error('program_kerja.tanggalProker is missing; refusing to infer legacy dates.');
  addColumn('program_kerja', 'dateLabel', 'ALTER TABLE `program_kerja` ADD COLUMN `dateLabel` VARCHAR(191) NULL');

  if (!tableSet.has('program_kerja_photo')) actions.push({
    description: 'Create child ProgramKerja photo gallery table',
    sql: `CREATE TABLE \`program_kerja_photo\` (\`id\` VARCHAR(191) NOT NULL, \`programKerjaId\` ${programIdType} NOT NULL, \`filePath\` VARCHAR(191) NOT NULL, \`fileHash\` VARCHAR(64) NOT NULL, \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (\`id\`), UNIQUE INDEX \`program_kerja_photo_programKerjaId_fileHash_key\` (\`programKerjaId\`, \`fileHash\`), INDEX \`program_kerja_photo_programKerjaId_createdAt_idx\` (\`programKerjaId\`, \`createdAt\`), CONSTRAINT \`program_kerja_photo_programKerjaId_fkey\` FOREIGN KEY (\`programKerjaId\`) REFERENCES \`program_kerja\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  });
  return actions;
}

export function schemaFingerprint({ tables, columns, indexes, foreignKeys }) {
  const canonical = JSON.stringify({ tables, columns, indexes, foreignKeys });
  return createHash('sha256').update(canonical).digest('hex');
}

export function repositorySchemaDiscrepancies({ tables, columns, indexes = [], foreignKeys = [], repositoryMigrations }) {
  const discrepancies = [];
  if (!repositoryMigrations.includes(programPhotoMigration)) return discrepancies;
  const compatibility = compareSchemaCompatibility({ tables, columns, indexes, foreignKeys });
  const programColumns = normalizeColumns(columns, 'program_kerja');
  if (programColumns.tanggalproker && String(programColumns.tanggalproker.nullable).toUpperCase() !== 'YES') discrepancies.push('Active schema conflicts with repository migration: program_kerja.tanggalProker is NOT NULL but the additive migration expects it to be nullable.');
  if (!tableExists(tables, 'ProgramKerjaRevision')) discrepancies.push('Active schema is missing ProgramKerjaRevision required before the repository photo migration can be deployed; review 20260922180000_program_cms_artifacts first.');
  if (tables.some((table) => table.toLowerCase() === 'programkerjarevision')) {
    const revisionColumns = normalizeColumns(columns, 'ProgramKerjaRevision');
    if (!revisionColumns.datelabel) discrepancies.push('Active schema is missing ProgramKerjaRevision.dateLabel required by the repository migration.');
    else if (normalizeSqlType(revisionColumns.datelabel.type) !== 'varchar(191)' || String(revisionColumns.datelabel.nullable).toUpperCase() !== 'YES') discrepancies.push('ProgramKerjaRevision.dateLabel has an incompatible type or nullability.');
    if (revisionColumns.tanggalproker && String(revisionColumns.tanggalproker.nullable).toUpperCase() !== 'YES') discrepancies.push('ProgramKerjaRevision.tanggalProker is NOT NULL but the repository schema expects it nullable.');
  }
  const photoTableName = tables.find((table) => table.toLowerCase() === 'program_kerja_photo');
  if (photoTableName && normalizeColumns(columns, photoTableName).programkerjaid && programColumns.id) {
    const photoProgramId = normalizeColumns(columns, photoTableName).programkerjaid;
    if (normalizeSqlType(photoProgramId.type) !== normalizeSqlType(programColumns.id.type)) discrepancies.push('program_kerja_photo.programKerjaId does not match program_kerja.id type.');
  }
  discrepancies.push(...compatibility.additive.map((item) => `Repository migration expects change not present in active schema: ${item}`));
  discrepancies.push(...compatibility.incompatible.map((item) => `Active schema conflicts with repository migration: ${item}`));
  return discrepancies;
}

export function structuralSchemaDiscrepancies(discrepancies) {
  return discrepancies.filter((item) => /Active schema conflicts|is missing ProgramKerjaRevision|has an incompatible|is NOT NULL|does not match/.test(item));
}

export function migrationHistoryReady(report) {
  const discrepancies = report.migrationDiscrepancies ?? {};
  return report.migrationTablePresent === true
    && (discrepancies.missingFromDatabase ?? []).length === 0
    && (discrepancies.appliedButNotInRepository ?? []).length === 0
    && (discrepancies.failedOrRolledBack ?? []).length === 0;
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

async function writeBaselineReport(report, plan) {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const destination = baselinePath();
  const baseline = {
    status: 'review_required',
    generatedAt: new Date().toISOString(),
    database: report.database,
    schemaFingerprint: report.schemaFingerprint,
    requiredLegacyTables,
    missingRequiredTables: report.missingRequiredTables,
    programCount: report.programCount,
    programsWithLegacyPhotos: report.programsWithLegacyPhotos,
    legacyPhotoReferenceCount: report.legacyPhotoReferenceCount,
    migrationHistory: report.migrationHistory,
    migrationDiscrepancies: report.migrationDiscrepancies,
    repositorySchemaDiscrepancies: report.repositorySchemaDiscrepancies,
    structuralSchemaDiscrepancies: structuralSchemaDiscrepancies(report.repositorySchemaDiscrepancies),
    repositoryMigrations: report.repositoryMigrations,
    planHash: plan.planHash,
    autoResolveAppliedMigrations: [],
    forwardMigrationScope: [
      'make program_kerja.tanggalProker nullable in the reviewed Prisma forward migration after structural owner approval',
      'add program_kerja.dateLabel',
      'create program_kerja_photo with its unique hash key and foreign key',
    ],
    migrationPrerequisites: [
      ...(report.migrationDiscrepancies.missingFromDatabase.includes('20260922180000_program_cms_artifacts')
        ? ['The active legacy schema lacks ProgramKerjaRevision and ProgramArtifact. Review and apply their existing program_cms_artifacts migration before treating the latest repository photo migration as deployable.']
        : []),
      ...(report.migrationDiscrepancies.missingFromDatabase.includes('20260922170000_enforce_active_cms_assignment')
        ? ['The active legacy schema lacks CmsAssignment.activeAccountKey and its uniqueness triggers. Review and apply the existing active-assignment migration separately.']
        : []),
    ],
    stagingAcceptance,
    stagingAcceptanceReason,
    destructiveOperations: 0,
    operatorActions: [
      'Database owner reviews schema and migration discrepancies.',
      'Database owner explicitly approves any schema-equivalent migration baseline decisions.',
      'Run prisma migrate resolve manually only for reviewed schema-equivalent migrations.',
      'Apply the reviewed forward-only migration sequence only after all structural discrepancies are resolved.',
    ],
  };
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
  return baseline;
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
  const triggers = (await query(connection, `SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema='${connection.database}' ORDER BY trigger_name`))
    .map(([triggerName, tableName]) => ({ triggerName, tableName }));
  const historyExists = (await query(connection, `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${connection.database}' AND table_name='_prisma_migrations'`))[0]?.[0] === '1';
  const history = historyExists
    ? await query(connection, `SELECT migration_name, finished_at, COALESCE(rolled_back_at, ''), COALESCE(logs, '') FROM ${quoteIdentifier(connection.database)}.${quoteIdentifier('_prisma_migrations')} ORDER BY started_at`)
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
    triggers,
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
  const unsignedEvidence = { status: 'verified', verifiedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + (Number.isFinite(restoreTtlMs) && restoreTtlMs > 0 ? restoreTtlMs : defaultRestoreEvidenceTtlMs)).toISOString(), sourceDatabase: connection.database, restoreDatabase, backupSha256: checksum, source: sourceReport, restoredDatabase: restoredReport, sourceAfter };
  const evidence = { ...unsignedEvidence, evidenceSha256: restoreEvidenceSha256(unsignedEvidence) };
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
  if (command !== 'inspect' && command !== 'plan' && command !== 'baseline' && command !== 'verify' && command !== 'apply') throw new Error('Usage: node scripts/legacy-schema-preflight.mjs <restore|inspect|plan|baseline|verify|apply> ...');
  if (command === 'baseline' || command === 'apply') {
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
  const actions = buildProgramSchemaPlan({ tables: report.tables, columns: report.columns, indexes: report.indexes, foreignKeys: report.foreignKeys, triggers: report.triggers, programIdType: idColumn.type.toUpperCase() });
  const planHash = migrationPlanHash({ database: report.database, actions, schemaFingerprint: report.schemaFingerprint, migrationDiscrepancies: report.migrationDiscrepancies });
  const plan = { generatedAt: new Date().toISOString(), database: report.database, schemaFingerprint: report.schemaFingerprint, planHash, destructiveOperations: 0, actions, migrationDiscrepancies: report.migrationDiscrepancies, repositorySchemaDiscrepancies: report.repositorySchemaDiscrepancies };
  if (command === 'plan') {
    console.log(JSON.stringify({ inspection: report, plan }, null, 2));
    return;
  }
  if (command === 'baseline') {
    const baseline = await writeBaselineReport(report, plan);
    console.log(JSON.stringify({ baselineReport: baselinePath(), ...baseline }, null, 2));
    return;
  }
  if (command === 'verify') {
    const structural = structuralSchemaDiscrepancies(report.repositorySchemaDiscrepancies);
    const remaining = buildProgramSchemaPlan({ tables: report.tables, columns: report.columns, indexes: report.indexes, foreignKeys: report.foreignKeys, triggers: report.triggers, programIdType: idColumn.type.toUpperCase() });
    try {
      if (structural.length) throw new Error(`Schema verification blocked by structural discrepancies requiring database-owner review: ${structural.join(' ')}`);
      if (remaining.length) throw new Error(`Schema verification blocked; ${remaining.length} approved additive operation(s) remain. Deploy the reviewed migration first.`);
      if (!migrationHistoryReady(report)) throw new Error('Schema verification blocked; Prisma migration history is missing, incomplete, unknown, or contains failed migrations. Review and reconcile migration history manually before data migration.');
      if (process.env.SCHEMA_PLAN_HASH !== planHash) throw new Error(`Schema verification blocked. Set SCHEMA_PLAN_HASH to the reviewed planHash ${planHash}.`);
      if (process.env.SCHEMA_MIGRATION_APPROVAL !== approvalPhrase) throw new Error(`Schema verification blocked. Set SCHEMA_MIGRATION_APPROVAL="${approvalPhrase}" explicitly.`);
      const readinessTtlMs = Number(process.env.SCHEMA_READINESS_TTL_MS ?? defaultReadinessTtlMs);
      const readinessExpiresAt = new Date(Date.now() + (Number.isFinite(readinessTtlMs) && readinessTtlMs > 0 ? readinessTtlMs : defaultReadinessTtlMs)).toISOString();
      const restoreEvidence = await readRestoreEvidence();
      validateRestoreEvidence(restoreEvidence, { database: connection.database });
      const readinessRestoreEvidence = { status: restoreEvidence.status, sourceDatabase: restoreEvidence.sourceDatabase, restoreDatabase: restoreEvidence.restoreDatabase, backupSha256: restoreEvidence.backupSha256, expiresAt: restoreEvidence.expiresAt, verifiedAt: restoreEvidence.verifiedAt, evidenceSha256: restoreEvidence.evidenceSha256 };
      await writeReadiness('ready', { database: connection.database, expiresAt: readinessExpiresAt, applied: [], migrationApplied: true, dataMigrationReady: true, schemaApproval: approvalPhrase, restoreEvidence: readinessRestoreEvidence, migrationDiscrepancies: report.migrationDiscrepancies, planHash, schemaFingerprint: report.schemaFingerprint, verifiedAt: new Date().toISOString() });
      console.log(JSON.stringify({ schemaReady: true, dataMigrationReady: true, verifiedAt: new Date().toISOString(), planHash }, null, 2));
      return;
    } catch (error) {
      await writeReadiness('blocked', { database: connection.database, reason: error instanceof Error ? error.message : String(error), planHash, schemaFingerprint: report.schemaFingerprint });
      throw error;
    }
  }
  if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production' || process.env.USE_DB_PUSH === 'true') {
    throw new Error('Direct schema apply is blocked for staging/production. Review this plan, add it as a Prisma migration, run check:migration-mode, then use prisma migrate deploy.');
  }
  const structural = structuralSchemaDiscrepancies(report.repositorySchemaDiscrepancies);
  if (structural.length) {
    await writeReadiness('blocked', { database: connection.database, reason: 'Active schema has structural discrepancies against repository migrations; database-owner review is required.', repositorySchemaDiscrepancies: report.repositorySchemaDiscrepancies, structuralSchemaDiscrepancies: structural, planHash, schemaFingerprint: report.schemaFingerprint });
    throw new Error(`Schema apply blocked by structural discrepancies requiring database-owner review: ${structural.join(' ')}`);
  }
  const unexpectedDestructiveActions = actions.filter(({ sql }) => /^\s*(?:DROP|TRUNCATE|DELETE|RENAME)\b/i.test(sql) || /^\s*ALTER\s+TABLE\b[\s\S]*\b(?:DROP|RENAME)\b/i.test(sql));
  if (unexpectedDestructiveActions.length) {
    await writeReadiness('blocked', { database: connection.database, reason: 'Prepared schema plan contains an operation outside the additive-only policy.', actions: unexpectedDestructiveActions, planHash, schemaFingerprint: report.schemaFingerprint });
    throw new Error('Schema apply blocked: prepared plan contains an operation outside the additive-only policy.');
  }
  if (process.env.SCHEMA_PLAN_HASH !== planHash) {
    await writeReadiness('blocked', { database: connection.database, reason: 'Exact plan hash approval is missing or stale.', planHash, schemaFingerprint: report.schemaFingerprint });
    throw new Error(`Schema execution blocked. Review planHash ${planHash}, then set SCHEMA_PLAN_HASH to that exact hash and SCHEMA_MIGRATION_APPROVAL="${approvalPhrase}" explicitly.`);
  }
  if (actions.length === 0) {
    await writeReadiness('blocked', { database: connection.database, reason: 'No schema statements were executed. Reconcile repository migration history with Prisma deploy and run verify instead.', actions: [], planHash, schemaFingerprint: report.schemaFingerprint });
    throw new Error('Schema apply refused because there are no additive schema actions. Deploy the reviewed Prisma migration history and run verify; do not use migrate resolve automatically.');
  }
  if (process.env.SCHEMA_MIGRATION_APPROVAL !== approvalPhrase) {
    await writeReadiness('blocked', { database: connection.database, reason: 'Explicit schema approval is missing.' });
    throw new Error(`Schema execution blocked. Review the plan, then set SCHEMA_MIGRATION_APPROVAL="${approvalPhrase}" explicitly.`);
  }
  await writeReadiness('blocked', { database: connection.database, reason: 'Schema execution is in progress; data migration is blocked.', actions, planHash, schemaFingerprint: report.schemaFingerprint });
  try {
    for (const action of actions) await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['-e', action.sql], true), { capture: false });
    const verified = await inspect(connection);
    const remaining = buildProgramSchemaPlan({ tables: verified.tables, columns: verified.columns, indexes: verified.indexes, foreignKeys: verified.foreignKeys, triggers: verified.triggers, programIdType: idColumn.type.toUpperCase() });
    if (remaining.length) throw new Error(`Schema execution incomplete; ${remaining.length} approved additive operation(s) remain. Data migration is blocked.`);
    if (!migrationHistoryReady(verified)) {
      await writeReadiness('blocked', { database: connection.database, applied: actions.map(({ description }) => description), migrationDiscrepancies: verified.migrationDiscrepancies, planHash, schemaFingerprint: verified.schemaFingerprint, migrationApplied: false, dataMigrationReady: false, reason: 'The additive schema is present, but repository migration history is unresolved; data migration remains blocked until the reviewed Prisma migrations are deployed and verified.' });
      throw new Error('Schema execution completed, but migration history is unresolved; data migration remains blocked until the reviewed Prisma migrations are deployed and verified.');
    }
    const readinessTtlMs = Number(process.env.SCHEMA_READINESS_TTL_MS ?? defaultReadinessTtlMs);
    const readinessExpiresAt = new Date(Date.now() + (Number.isFinite(readinessTtlMs) && readinessTtlMs > 0 ? readinessTtlMs : defaultReadinessTtlMs)).toISOString();
    const restoreEvidence = await readRestoreEvidence();
    validateRestoreEvidence(restoreEvidence, { database: connection.database });
    const readinessRestoreEvidence = { status: restoreEvidence.status, sourceDatabase: restoreEvidence.sourceDatabase, restoreDatabase: restoreEvidence.restoreDatabase, backupSha256: restoreEvidence.backupSha256, expiresAt: restoreEvidence.expiresAt, verifiedAt: restoreEvidence.verifiedAt, evidenceSha256: restoreEvidence.evidenceSha256 };
    await writeReadiness('ready', { database: connection.database, expiresAt: readinessExpiresAt, applied: actions.map(({ description }) => description), migrationDiscrepancies: verified.migrationDiscrepancies, planHash, schemaFingerprint: verified.schemaFingerprint, migrationApplied: true, dataMigrationReady: true, schemaApproval: approvalPhrase, restoreEvidence: readinessRestoreEvidence });
    console.log(JSON.stringify({ schemaReady: true, dataMigrationReady: true, applied: actions.map(({ description }) => description), verifiedAt: new Date().toISOString(), migrationDiscrepancies: verified.migrationDiscrepancies }, null, 2));
  } catch (error) {
    await writeReadiness('blocked', { database: connection.database, reason: error instanceof Error ? error.message : String(error), actions, planHash, schemaFingerprint: report.schemaFingerprint });
    throw new Error(`Schema execution failed; data migration is blocked. ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
