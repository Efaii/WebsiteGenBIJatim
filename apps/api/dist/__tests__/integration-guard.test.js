"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
if (process.env.RUN_INTEGRATION_TESTS !== '1')
    throw new Error('Integration tests require RUN_INTEGRATION_TESTS=1.');
strict_1.default.match(process.env.DATABASE_URL ?? '', /genbi_jatim_test(?:$|[?])/i, 'integration tests must use genbi_jatim_test');
strict_1.default.equal(process.env.NODE_ENV, 'test', 'integration tests must run with NODE_ENV=test');
