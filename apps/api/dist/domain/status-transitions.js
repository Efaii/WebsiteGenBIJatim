"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertExecutionTransition = exports.assertProgramRoleTransition = exports.assertPublicationTransition = void 0;
const client_1 = require("@prisma/client");
const api_error_1 = require("../lib/api-error");
const publicationTransitions = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['APPROVED', 'REJECTED'],
    APPROVED: ['PUBLISHED'],
    PUBLISHED: ['ARCHIVED'],
    REJECTED: ['DRAFT'],
    ARCHIVED: [],
};
const assertPublicationTransition = (from, to, rejectionReason) => {
    if (!publicationTransitions[from].includes(to))
        throw new api_error_1.ApiError('CONFLICT', `Cannot transition publication status from ${from} to ${to}.`, 409);
    if (to === 'REJECTED' && !rejectionReason?.trim())
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'A rejection reason is required.', 400, { rejectionReason: ['Required'] });
};
exports.assertPublicationTransition = assertPublicationTransition;
/**
 * Sekretaris hanya boleh mengajukan Program Kerja (ke SUBMITTED); persetujuan,
 * penerbitan, dan pengarsipan tetap milik admin global. Program Kerja lama
 * hasil rekonsiliasi tidak punya jalur transisi sama sekali.
 */
const assertProgramRoleTransition = (role, to) => {
    if (role !== client_1.CmsRole.ADMIN_GLOBAL && to !== 'SUBMITTED')
        throw new api_error_1.ApiError('FORBIDDEN', 'Only the publisher can move Program Kerja to this status.', 403);
};
exports.assertProgramRoleTransition = assertProgramRoleTransition;
const executionTransitions = {
    PLANNED: ['ONGOING', 'CANCELLED'],
    ONGOING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
};
const assertExecutionTransition = (from, to) => {
    if (!executionTransitions[from].includes(to))
        throw new api_error_1.ApiError('CONFLICT', `Cannot transition execution status from ${from} to ${to}.`, 409);
};
exports.assertExecutionTransition = assertExecutionTransition;
