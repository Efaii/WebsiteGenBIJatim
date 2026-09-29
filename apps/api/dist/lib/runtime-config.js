"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertRuntimeConfig = exports.runtimeConfig = void 0;
const path_1 = __importDefault(require("path"));
const isConfiguredEnvironment = () => ['staging', 'production', 'test'].includes(process.env.NODE_ENV ?? '');
const isProductionEnvironment = () => ['staging', 'production'].includes(process.env.NODE_ENV ?? '');
const required = (name) => {
    const value = process.env[name]?.trim();
    if (!value && isConfiguredEnvironment())
        throw new Error(`${name} is required when NODE_ENV=${process.env.NODE_ENV}.`);
    return value ?? '';
};
const runtimeConfig = () => ({
    databaseUrl: required('DATABASE_URL'),
    sessionCookieSecret: required('SESSION_COOKIE_SECRET'),
    jwtSecret: required('JWT_SECRET'),
    adminPassword: required('ADMIN_PASSWORD'),
    publicStorageRoot: process.env.PUBLIC_STORAGE_ROOT?.trim() || path_1.default.join(process.cwd(), 'public/uploads'),
    privateStorageRoot: process.env.PRIVATE_STORAGE_ROOT?.trim() || path_1.default.join(process.cwd(), 'private/uploads'),
});
exports.runtimeConfig = runtimeConfig;
const assertRuntimeConfig = () => {
    const config = (0, exports.runtimeConfig)();
    if (isProductionEnvironment() && config.adminPassword.length < 16)
        throw new Error('ADMIN_PASSWORD must be at least 16 characters.');
    if (isProductionEnvironment() && (config.sessionCookieSecret.length < 32 || config.jwtSecret.length < 32))
        throw new Error('SESSION_COOKIE_SECRET and JWT_SECRET must be at least 32 characters.');
    return config;
};
exports.assertRuntimeConfig = assertRuntimeConfig;
