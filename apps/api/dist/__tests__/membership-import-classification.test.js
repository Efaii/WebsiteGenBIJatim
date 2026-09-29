"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const client_1 = require("@prisma/client");
strict_1.default.deepEqual(Object.values(client_1.ImportRowClassification), ['NEW', 'UPDATED', 'UNCHANGED', 'INVALID', 'AMBIGUOUS_MATCH', 'DUPLICATE_IN_FILE']);
