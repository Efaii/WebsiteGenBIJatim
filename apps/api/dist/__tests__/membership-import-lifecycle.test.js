"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const client_1 = require("@prisma/client");
strict_1.default.deepEqual(Object.values(client_1.ImportPreviewStatus), ['PREVIEW_READY', 'COMMITTED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'STALE', 'EXPIRED', 'FAILED']);
strict_1.default.equal(30 * 60 * 1000, 1800000);
strict_1.default.equal(90 * 24 * 60 * 60 * 1000, 7776000000);
