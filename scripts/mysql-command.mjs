export function parseMysqlCommandArgs(value = process.env.MYSQL_BIN_ARGS) {
  if (!value?.trim()) return [];

  let args;
  try { args = JSON.parse(value); }
  catch { throw new Error('MYSQL_BIN_ARGS must be a JSON array of command-line strings.'); }
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== 'string')) {
    throw new Error('MYSQL_BIN_ARGS must be a JSON array of command-line strings.');
  }
  return args;
}
