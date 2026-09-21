import path from 'path';

const isConfiguredEnvironment = () => ['staging', 'production', 'test'].includes(process.env.NODE_ENV ?? '');
const isProductionEnvironment = () => ['staging', 'production'].includes(process.env.NODE_ENV ?? '');

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value && isConfiguredEnvironment()) throw new Error(`${name} is required when NODE_ENV=${process.env.NODE_ENV}.`);
  return value ?? '';
};

export const runtimeConfig = () => ({
  databaseUrl: required('DATABASE_URL'),
  sessionCookieSecret: required('SESSION_COOKIE_SECRET'),
  jwtSecret: required('JWT_SECRET'),
  adminPassword: required('ADMIN_PASSWORD'),
  publicStorageRoot: process.env.PUBLIC_STORAGE_ROOT?.trim() || path.join(process.cwd(), 'public/uploads'),
  privateStorageRoot: process.env.PRIVATE_STORAGE_ROOT?.trim() || path.join(process.cwd(), 'private/uploads'),
});

export const assertRuntimeConfig = () => {
  const config = runtimeConfig();
  if (isProductionEnvironment() && config.adminPassword.length < 16) throw new Error('ADMIN_PASSWORD must be at least 16 characters.');
  if (isProductionEnvironment() && (config.sessionCookieSecret.length < 32 || config.jwtSecret.length < 32)) throw new Error('SESSION_COOKIE_SECRET and JWT_SECRET must be at least 32 characters.');
  return config;
};
