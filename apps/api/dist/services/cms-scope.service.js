"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertScopeAccess = void 0;
const client_1 = require("@prisma/client");
const api_error_1 = require("../lib/api-error");
const assertScopeAccess = (session, scope, operation = 'write') => {
    const role = session.cmsAccount.role;
    if (role === client_1.CmsRole.ADMIN_GLOBAL)
        return;
    const assignment = session.cmsAccount.assignments[0];
    if (!assignment)
        throw new api_error_1.ApiError('FORBIDDEN', 'No active CMS assignment.', 403);
    const matches = assignment.commissariatId === scope.commissariatId && assignment.periodId === scope.periodId;
    const divisionMatches = role === client_1.CmsRole.SEKRETARIS_DIVISI && assignment.divisionId === scope.divisionId;
    if (!matches || (role === client_1.CmsRole.SEKRETARIS_DIVISI && !divisionMatches) || (role === client_1.CmsRole.SEKRETARIS_DIVISI && operation === 'write' && !divisionMatches)) {
        throw new api_error_1.ApiError('FORBIDDEN', 'The requested resource is outside the active CMS scope.', 403);
    }
};
exports.assertScopeAccess = assertScopeAccess;
