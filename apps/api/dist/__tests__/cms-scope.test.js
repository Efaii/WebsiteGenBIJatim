"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const cms_scope_service_1 = require("../services/cms-scope.service");
const session = (role, divisionId) => ({
    cmsAccount: { role, assignments: [{ commissariatId: 'com-1', periodId: 'period-1', divisionId }] },
});
strict_1.default.doesNotThrow(() => (0, cms_scope_service_1.assertScopeAccess)(session('SEKRETARIS_UMUM'), { commissariatId: 'com-1', periodId: 'period-1' }));
strict_1.default.throws(() => (0, cms_scope_service_1.assertScopeAccess)(session('SEKRETARIS_UMUM'), { commissariatId: 'com-2', periodId: 'period-1' }));
strict_1.default.doesNotThrow(() => (0, cms_scope_service_1.assertScopeAccess)(session('SEKRETARIS_DIVISI', 'division-1'), { commissariatId: 'com-1', periodId: 'period-1', divisionId: 'division-1' }));
strict_1.default.throws(() => (0, cms_scope_service_1.assertScopeAccess)(session('SEKRETARIS_DIVISI', 'division-1'), { commissariatId: 'com-1', periodId: 'period-1', divisionId: 'division-2' }));
