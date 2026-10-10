"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const status_transitions_1 = require("../domain/status-transitions");
strict_1.default.doesNotThrow(() => (0, status_transitions_1.assertPublicationTransition)('DRAFT', 'SUBMITTED'));
strict_1.default.throws(() => (0, status_transitions_1.assertPublicationTransition)('PUBLISHED', 'APPROVED'));
strict_1.default.throws(() => (0, status_transitions_1.assertPublicationTransition)('SUBMITTED', 'REJECTED'));
strict_1.default.doesNotThrow(() => (0, status_transitions_1.assertPublicationTransition)('SUBMITTED', 'REJECTED', 'Needs correction'));
strict_1.default.doesNotThrow(() => (0, status_transitions_1.assertExecutionTransition)('PLANNED', 'ONGOING'));
strict_1.default.throws(() => (0, status_transitions_1.assertExecutionTransition)('COMPLETED', 'ONGOING'));
// Program Kerja: sekretaris hanya boleh mengajukan; admin global seluruh alur.
strict_1.default.doesNotThrow(() => (0, status_transitions_1.assertProgramRoleTransition)('SEKRETARIS_DIVISI', 'SUBMITTED'));
strict_1.default.doesNotThrow(() => (0, status_transitions_1.assertProgramRoleTransition)('SEKRETARIS_UMUM', 'SUBMITTED'));
strict_1.default.doesNotThrow(() => (0, status_transitions_1.assertProgramRoleTransition)('ADMIN_GLOBAL', 'APPROVED'));
strict_1.default.doesNotThrow(() => (0, status_transitions_1.assertProgramRoleTransition)('ADMIN_GLOBAL', 'PUBLISHED'));
strict_1.default.doesNotThrow(() => (0, status_transitions_1.assertProgramRoleTransition)('ADMIN_GLOBAL', 'ARCHIVED'));
strict_1.default.throws(() => (0, status_transitions_1.assertProgramRoleTransition)('SEKRETARIS_DIVISI', 'APPROVED'), /publisher/);
strict_1.default.throws(() => (0, status_transitions_1.assertProgramRoleTransition)('SEKRETARIS_DIVISI', 'PUBLISHED'), /publisher/);
strict_1.default.throws(() => (0, status_transitions_1.assertProgramRoleTransition)('SEKRETARIS_UMUM', 'ARCHIVED'), /publisher/);
strict_1.default.throws(() => (0, status_transitions_1.assertProgramRoleTransition)('SEKRETARIS_DIVISI', 'REJECTED'), /publisher/);
