"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCanonicalMasters = void 0;
const prisma_1 = require("../lib/prisma");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const getCanonicalMasters = async (_req, res) => {
    const commissariats = await prisma_1.prisma.commissariat.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, include: { periods: { orderBy: { label: 'desc' }, include: { divisions: { orderBy: { name: 'asc' }, select: { id: true, name: true } } } } } });
    return (0, request_context_middleware_1.sendSuccess)(res, commissariats.map((item) => ({ id: item.id, slug: item.slug, name: item.name, periods: item.periods.map((period) => ({ id: period.id, label: period.label, divisions: period.divisions })) })));
};
exports.getCanonicalMasters = getCanonicalMasters;
