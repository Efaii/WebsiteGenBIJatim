"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const types_1 = require("@repo/types");
const scope = { commissariatId: '123e4567-e89b-42d3-a456-426614174001', periodId: '123e4567-e89b-42d3-a456-426614174002', divisionId: null };
strict_1.default.equal(types_1.periodWriteSchema.safeParse({ label: '2025/2026' }).success, true);
strict_1.default.equal(types_1.periodWriteSchema.safeParse({ label: '2025' }).success, false);
strict_1.default.equal(types_1.divisionWriteSchema.safeParse({ name: 'Pendidikan', commissariatId: scope.commissariatId, periodId: scope.periodId }).success, true);
strict_1.default.equal(types_1.membershipWriteSchema.safeParse({ ...scope, name: 'A', position: 'Staff', studyProgram: 'Teknik' }).success, true);
strict_1.default.equal(types_1.membershipWriteSchema.safeParse({ ...scope, name: 'A', position: 'Staff', studyProgram: 'Teknik', clientScope: 'other' }).success, false);
