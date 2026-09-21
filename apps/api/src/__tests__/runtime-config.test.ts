import assert from 'node:assert/strict';
import { assertRuntimeConfig } from '../lib/runtime-config';

const previous = { nodeEnv: process.env.NODE_ENV, admin: process.env.ADMIN_PASSWORD, jwt: process.env.JWT_SECRET, session: process.env.SESSION_COOKIE_SECRET, database: process.env.DATABASE_URL };
process.env.NODE_ENV = 'production';
process.env.DATABASE_URL = 'mysql://test';
process.env.SESSION_COOKIE_SECRET = 'test-session-secret';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_PASSWORD = '';
assert.throws(() => assertRuntimeConfig(), /ADMIN_PASSWORD is required/);
process.env.ADMIN_PASSWORD = 's'.repeat(16);
process.env.JWT_SECRET = 'j'.repeat(32);
process.env.SESSION_COOKIE_SECRET = 'c'.repeat(32);
assert.equal(assertRuntimeConfig().adminPassword, 's'.repeat(16));
if (previous.nodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous.nodeEnv;
if (previous.admin === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = previous.admin;
if (previous.jwt === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previous.jwt;
if (previous.session === undefined) delete process.env.SESSION_COOKIE_SECRET; else process.env.SESSION_COOKIE_SECRET = previous.session;
if (previous.database === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previous.database;
