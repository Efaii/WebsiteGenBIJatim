import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const databaseUrl = new URL(process.env.DATABASE_URL ?? '');
const sourceDatabase = decodeURIComponent(databaseUrl.pathname.slice(1));
const restoreDatabase = process.env.RESTORE_DATABASE ?? 'genbi_jatim_restore_test';
if (sourceDatabase !== 'genbi_jatim_test') throw new Error('Backup/restore verification only runs against genbi_jatim_test.');
if (!/^[a-zA-Z0-9_]+$/.test(restoreDatabase) || restoreDatabase === sourceDatabase) throw new Error('Invalid isolated restore database name.');

const mysqlArgs = ['--host', databaseUrl.hostname, '--port', databaseUrl.port || '3306', '--user', decodeURIComponent(databaseUrl.username)];
if (databaseUrl.password) mysqlArgs.push(`--password=${decodeURIComponent(databaseUrl.password)}`);
const run = (command, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'inherit'], ...options });
  const chunks = [];
  child.stdout.on('data', (chunk) => chunks.push(chunk));
  child.on('error', reject);
  child.on('close', (code) => code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error(`${command} failed with exit code ${code}`)));
});

const dir = await mkdtemp(path.join(os.tmpdir(), 'genbi-db-backup-'));
const dumpPath = path.join(dir, 'database.sql');
try {
  const dump = await run(process.env.MYSQLDUMP_BIN ?? 'mysqldump', [...mysqlArgs, '--single-transaction', '--routines', '--triggers', '--no-tablespaces', sourceDatabase]);
  await writeFile(dumpPath, dump);
  const checksum = createHash('sha256').update(await readFile(dumpPath)).digest('hex');
  await run(process.env.MYSQL_BIN ?? 'mysql', [...mysqlArgs, '-e', `CREATE DATABASE IF NOT EXISTS \`${restoreDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`]);
  const restore = spawn(process.env.MYSQL_BIN ?? 'mysql', [...mysqlArgs, restoreDatabase], { stdio: ['pipe', 'ignore', 'inherit'] });
  restore.stdin.end(await readFile(dumpPath));
  const [code] = await once(restore, 'close');
  if (code !== 0) throw new Error(`MySQL restore failed with exit code ${code}`);
  const mysqlBin = process.env.MYSQL_BIN ?? 'mysql';
  const sourceTableNames = (await run(mysqlBin, [...mysqlArgs, '-N', '-e', `SELECT table_name FROM information_schema.tables WHERE table_schema='${sourceDatabase}' AND table_type='BASE TABLE' ORDER BY table_name;`])).toString().trim().split(/\r?\n/).filter(Boolean);
  const restoredTableNames = (await run(mysqlBin, [...mysqlArgs, '-N', '-e', `SELECT table_name FROM information_schema.tables WHERE table_schema='${restoreDatabase}' AND table_type='BASE TABLE' ORDER BY table_name;`])).toString().trim().split(/\r?\n/).filter(Boolean);
  if (!sourceTableNames.length || JSON.stringify(sourceTableNames) !== JSON.stringify(restoredTableNames)) throw new Error('Restore table list does not match the source database.');
  const countRows = async (database, table) => (await run(mysqlBin, [...mysqlArgs, '-N', '-e', `SELECT COUNT(*) FROM \`${database}\`.\`${table}\`;`])).toString().trim();
  const rowCounts = {};
  for (const table of sourceTableNames) {
    const sourceCount = await countRows(sourceDatabase, table);
    const restoredCount = await countRows(restoreDatabase, table);
    if (sourceCount !== restoredCount) throw new Error(`Restore row-count mismatch in ${table}: source=${sourceCount}, restored=${restoredCount}`);
    rowCounts[table] = Number(sourceCount);
  }
  const backupId = process.env.BACKUP_EVIDENCE_ID ?? `sha256:${checksum.slice(0, 16)}`;
  const evidence = { backupId, restoreId: `restore:${restoreDatabase}`, sha256: checksum, rowCounts };
  if (process.env.GITHUB_OUTPUT) await import('node:fs/promises').then(({ appendFile }) => appendFile(process.env.GITHUB_OUTPUT, `backup-id=${backupId}\nrestore-id=${evidence.restoreId}\n`, 'utf8'));
  console.log(JSON.stringify(evidence));
} finally {
  await rm(dir, { recursive: true, force: true });
}
