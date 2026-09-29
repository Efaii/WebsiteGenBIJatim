"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveAssignment = exports.assertOneActiveAssignment = void 0;
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
const assertOneActiveAssignment = async (cmsAccountId, excludeId) => {
    const existing = await prisma_1.prisma.cmsAssignment.findFirst({ where: { cmsAccountId, active: true, ...(excludeId ? { id: { not: excludeId } } : {}) } });
    if (existing)
        throw new api_error_1.ApiError('CONFLICT', 'A CMS account may have only one active assignment.', 409);
};
exports.assertOneActiveAssignment = assertOneActiveAssignment;
const getActiveAssignment = async (cmsAccountId) => {
    const assignments = await prisma_1.prisma.cmsAssignment.findMany({ where: { cmsAccountId, active: true }, take: 2 });
    if (assignments.length > 1)
        throw new api_error_1.ApiError('CONFLICT', 'CMS account has multiple active assignments.', 409);
    return assignments[0] ?? null;
};
exports.getActiveAssignment = getActiveAssignment;
