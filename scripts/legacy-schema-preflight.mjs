import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredTables = ['program_kerja', 'commissariat'];
const approvalPhrase = 'SETUJUI SCHEMA MIGRASI';

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

export function buildAdditivePlan({ tables, columns, programIdType = 'VARCHAR(191)' }) {
  const tableSet = new Set(tables.map((table) => table.toLowerCase()));
  const findColumns = (tableName) => {
    const key = Object.keys(columns).find((candidate) => candidate.toLowerCase() === tableName);
    return columns[key] ?? [];
  };
  const programColumns = new Set(findColumns('program_kerja').map((column) => typeof column === 'string' ? column.toLowerCase() : column.name.toLowerCase()));
  const actions = [];
  if (!tableSet.has('program_kerja')) throw new Error('Required legacy table program_kerja is missing; refusing to prepare schema changes.');
  if (!programColumns.has('datelabel')) actions.push({
    description: 'Add nullable period label for undated programs',
    sql: 'ALTER TABLE `program_kerja` ADD COLUMN `dateLabel` VARCHAR(191) NULL',
  });
  if (!tableSet.has('program_kerja_photo')) {
    actions.push({
      description: 'Add child photo gallery table without altering legacy photo columns',
      sql: `CREATE TABLE \`program_kerja_photo\` (\`id\` VARCHAR(191) NOT NULL, \`programKerjaId\` ${programIdType} NOT NULL, \`filePath\` VARCHAR(191) NOT NULL, \`fileHash\` VARCHAR(64) NOT NULL, \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (\`id\`), UNIQUE INDEX \`program_kerja_photo_programKerjaId_fileHash_key\` (\`programKerjaId\`, \`fileHash\`), INDEX \`program_kerja_photo_programKerjaId_createdAt_idx\` (\`programKerjaId\`, \`createdAt\`), CONSTRAINT \`program_kerja_photo_programKerjaId_fkey\` FOREIGN KEY (\`programKerjaId\`) REFERENCES \`program_kerja\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    });
  } else {
    const photoColumns = new Set(findColumns('program_kerja_photo').map((column) => typeof column === 'string' ? column.toLowerCase() : column.name.toLowerCase()));
    const missingPhotoColumns = ['id', 'programkerjaid', 'filepath', 'filehash', 'createdat'].filter((column) => !photoColumns.has(column));
    if (missingPhotoColumns.length) throw new Error(`Existing program_kerja_photo is incompatible; missing columns: ${missingPhotoColumns.join(', ')}. Refusing to alter or recreate it.`);
  }
  return actions;
}

export function compareRestore(source, restored) {
  const differences = [];
  if (JSON.stringify(source.tables) !== JSON.stringify(restored.tables)) differences.push('table list differs');
  if (source.programCount !== restored.programCount) differences.push(`program_kerja count differs (${source.programCount} vs ${restored.programCount})`);
  if (source.programsWithLegacyPhotos !== restored.programsWithLegacyPhotos) differences.push(`programs with legacy photos differs (${source.programsWithLegacyPhotos} vs ${restored.programsWithLegacyPhotos})`);
  if (source.legacyPhotoReferenceCount !== restored.legacyPhotoReferenceCount) differences.push(`legacy photo reference count differs (${source.legacyPhotoReferenceCount} vs ${restored.legacyPhotoReferenceCount})`);
  return differences;
}

function mysqlArgs(connection, extra = []) {
  const args = ['--host', connection.host, '--port', connection.port, '--user', connection.user, ...extra];
  if (connection.password) args.push(`--password=${connection.password}`);
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

async function inspect(connection) {
  const tableRows = await query(connection, `SELECT table_name FROM information_schema.tables WHERE table_schema='${connection.database}' AND table_type='BASE TABLE' ORDER BY table_name`);
  const tables = tableRows.map(([name]) => name);
  const missing = requiredTables.filter((name) => !tables.some((table) => table.toLowerCase() === name));
  if (missing.length) throw new Error(`Required legacy tables missing: ${missing.join(', ')}.`);
  const columns = {};
  for (const table of tables) {
    columns[table] = (await query(connection, `SELECT column_name, column_type, is_nullable FROM information_schema.columns WHERE table_schema='${connection.database}' AND table_name='${table}' ORDER BY ordinal_position`))
      .map(([name, type, nullable]) => ({ name, type, nullable }));
  }
  const historyExists = tables.some((table) => table.toLowerCase() === '_prisma_migrations');
  const history = historyExists
    ? await query(connection, `SELECT migration_name, finished_at, rolled_back_at, logs FROM ${quoteIdentifier(connection.database)}.${quoteIdentifier('_prisma_migrations')} ORDER BY started_at`)
    : [];
  const programTable = tables.find((table) => table.toLowerCase() === 'program_kerja');
  const programColumns = new Set((columns[programTable] ?? []).map(({ name }) => name.toLowerCase()));
  const photoFields = ['foto1', 'foto2', 'foto3', 'foto4', 'foto5', 'foto6'].filter((field) => programColumns.has(field));
  const countRows = await query(connection, `SELECT COUNT(*) FROM ${quoteIdentifier(connection.database)}.${quoteIdentifier(programTable)}`);
  const photoExpr = photoFields.length ? photoFields.map((field) => `NULLIF(TRIM(${quoteIdentifier(field)}), '') IS NOT NULL`).join(' + ') : '0';
  const photoRows = await query(connection, `SELECT COUNT(*) FROM ${quoteIdentifier(connection.database)}.${quoteIdentifier(programTable)} WHERE (${photoExpr}) > 0`);
  const photoReferenceExpr = photoFields.length ? photoFields.map((field) => `(${quoteIdentifier(field)} IS NOT NULL AND TRIM(${quoteIdentifier(field)}) <> '')`).join(' + ') : '0';
  const photoReferenceRows = await query(connection, `SELECT COALESCE(SUM(${photoReferenceExpr}), 0) FROM ${quoteIdentifier(connection.database)}.${quoteIdentifier(programTable)}`);
  const sourceMigrations = (await readdir(path.join(root, 'apps/api/prisma/migrations'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const applied = new Set(history.filter(([, finished, rolledBack]) => finished && !rolledBack).map(([name]) => name));
  return {
    database: connection.database,
    tables,
    columns,
    programCount: Number(countRows[0]?.[0] ?? 0),
    programsWithLegacyPhotos: Number(photoRows[0]?.[0] ?? 0),
    legacyPhotoReferenceCount: Number(photoReferenceRows[0]?.[0] ?? 0),
    legacyPhotoColumns: photoFields,
    migrationTablePresent: historyExists,
    migrationHistory: history.map(([name, finishedAt, rolledBackAt, logs]) => ({ name, finishedAt, rolledBackAt, logs })),
    migrationDiscrepancies: sourceMigrations.filter((name) => !applied.has(name)),
    repositoryMigrations: sourceMigrations,
  };
}

async function restoreBackup(connection, dumpFile, restoreDatabase) {
  if (!/^genbi_restore_[a-zA-Z0-9_]+$/.test(restoreDatabase)) throw new Error('Restore target must use the isolated genbi_restore_ prefix.');
  if (restoreDatabase === connection.database) throw new Error('Restore database must not be the source/production database.');
  const exists = await query({ ...connection, database: 'information_schema' }, `SELECT SCHEMA_NAME FROM SCHEMATA WHERE SCHEMA_NAME='${restoreDatabase}'`);
  if (exists.length) throw new Error(`Restore target ${restoreDatabase} already exists; refusing to overwrite or drop it.`);
  const dump = await readFile(dumpFile);
  if (!dump.length) throw new Error('Backup file is empty; refusing to restore it.');
  const sourceReport = await inspect(connection);
  const checksum = createHash('sha256').update(dump).digest('hex');
  await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['-e', `CREATE DATABASE ${quoteIdentifier(restoreDatabase)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`]), { capture: false });
  let verified = false;
  try {
    await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs({ ...connection, database: restoreDatabase }), { input: dump, capture: false });
    const report = await inspect({ ...connection, database: restoreDatabase });
    const differences = compareRestore(sourceReport, report);
    if (differences.length) throw new Error(`Restore verification mismatch: ${differences.join('; ')}.`);
    verified = true;
    console.log(JSON.stringify({ restored: true, backupSha256: checksum, source: sourceReport, restoredDatabase: report }, null, 2));
  } catch (error) {
    throw new Error(`Backup restore/verification failed. Temporary database ${restoreDatabase} was ${process.env.KEEP_RESTORE_DATABASE ? 'retained for diagnosis' : 'created only for this failed check and is eligible for cleanup'}; it was not marked ready for data migration. ${error.message}`);
  } finally {
    if (verified || !process.env.KEEP_RESTORE_DATABASE) {
      await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['-e', `DROP DATABASE ${quoteIdentifier(restoreDatabase)}`]), { capture: false });
    }
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
  const report = await inspect(connection);
  if (command === 'inspect') {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const program = report.tables.find((table) => table.toLowerCase() === 'program_kerja');
  const idColumn = report.columns[program].find(({ name }) => name.toLowerCase() === 'id');
  if (!idColumn) throw new Error('Legacy program_kerja.id is missing; refusing automatic schema changes.');
  const actions = buildAdditivePlan({ tables: report.tables, columns: report.columns, programIdType: idColumn.type.toUpperCase() });
  const plan = { generatedAt: new Date().toISOString(), database: report.database, destructiveOperations: 0, actions, migrationDiscrepancies: report.migrationDiscrepancies };
  if (command === 'plan') {
    console.log(JSON.stringify({ inspection: report, plan }, null, 2));
    return;
  }
  if (process.env.SCHEMA_MIGRATION_APPROVAL !== approvalPhrase) throw new Error(`Schema execution blocked. Review the plan, then set SCHEMA_MIGRATION_APPROVAL="${approvalPhrase}" explicitly.`);
  for (const action of actions) await run(process.env.MYSQL_BIN ?? 'mysql', mysqlArgs(connection, ['-e', action.sql]), { capture: false });
  const verified = await inspect(connection);
  const verifiedProgramTable = verified.tables.find((table) => table.toLowerCase() === 'program_kerja');
  const remaining = buildAdditivePlan({
    tables: verified.tables,
    columns: verified.columns,
  });
  if (remaining.length) throw new Error(`Schema execution incomplete; ${remaining.length} approved additive operation(s) remain. Data migration is blocked.`);
  console.log(JSON.stringify({ schemaReady: true, applied: actions.map(({ description }) => description), verifiedAt: new Date().toISOString(), migrationDiscrepancies: verified.migrationDiscrepancies }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
