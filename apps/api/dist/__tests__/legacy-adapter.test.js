"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const legacy_adapter_1 = require("../domain/legacy-adapter");
const adapted = (0, legacy_adapter_1.adaptLegacyProgram)({ id: 7, namaProker: 'Legacy', status: 'Completed', dateIso: '2025-01-01', divisi: 'Pendidikan' });
strict_1.default.equal(adapted.legacyId, '7');
strict_1.default.equal(adapted.executionStatus, 'COMPLETED');
strict_1.default.equal(adapted.ambiguous, false);
strict_1.default.equal((0, legacy_adapter_1.adaptLegacyProgram)({ id: 'x', title: 'Missing date', status: 'unknown' }).ambiguous, true);
strict_1.default.equal((0, legacy_adapter_1.adaptLegacyPrograms)([{ id: '1', title: 'A' }]).length, 1);
strict_1.default.throws(() => (0, legacy_adapter_1.adaptLegacyPrograms)({}), /array/);
