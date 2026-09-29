"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const runtime_config_1 = require("../lib/runtime-config");
const previous = { nodeEnv: process.env.NODE_ENV, admin: process.env.ADMIN_PASSWORD, jwt: process.env.JWT_SECRET, session: process.env.SESSION_COOKIE_SECRET, database: process.env.DATABASE_URL };
process.env.NODE_ENV = 'production';
process.env.DATABASE_URL = 'mysql://test';
process.env.SESSION_COOKIE_SECRET = 'test-session-secret';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_PASSWORD = '';
strict_1.default.throws(() => (0, runtime_config_1.assertRuntimeConfig)(), /ADMIN_PASSWORD is required/);
process.env.ADMIN_PASSWORD = 's'.repeat(16);
process.env.JWT_SECRET = 'j'.repeat(32);
process.env.SESSION_COOKIE_SECRET = 'c'.repeat(32);
strict_1.default.equal((0, runtime_config_1.assertRuntimeConfig)().adminPassword, 's'.repeat(16));
if (previous.nodeEnv === undefined)
    delete process.env.NODE_ENV;
else
    process.env.NODE_ENV = previous.nodeEnv;
if (previous.admin === undefined)
    delete process.env.ADMIN_PASSWORD;
else
    process.env.ADMIN_PASSWORD = previous.admin;
if (previous.jwt === undefined)
    delete process.env.JWT_SECRET;
else
    process.env.JWT_SECRET = previous.jwt;
if (previous.session === undefined)
    delete process.env.SESSION_COOKIE_SECRET;
else
    process.env.SESSION_COOKIE_SECRET = previous.session;
if (previous.database === undefined)
    delete process.env.DATABASE_URL;
else
    process.env.DATABASE_URL = previous.database;
