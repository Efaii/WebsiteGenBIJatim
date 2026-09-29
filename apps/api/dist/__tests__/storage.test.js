"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const storage_1 = require("../lib/storage");
process.env.PUBLIC_STORAGE_ROOT = 'C:/genbi-test/public';
process.env.PRIVATE_STORAGE_ROOT = 'C:/genbi-test/private';
strict_1.default.match((0, storage_1.publicStoragePath)('news/cover.webp'), /genbi-test[\\/]public[\\/]news[\\/]cover\.webp$/);
strict_1.default.match((0, storage_1.privateStoragePath)('news/staged.webp'), /genbi-test[\\/]private[\\/]news[\\/]staged\.webp$/);
strict_1.default.throws(() => (0, storage_1.publicStoragePath)('../private/secret.txt'), /escapes its configured root/);
strict_1.default.throws(() => (0, storage_1.privateStoragePath)('..\\public\\secret.txt'), /escapes its configured root/);
