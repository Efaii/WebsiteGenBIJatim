"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommissariatStructure = void 0;
const client_1 = require("@prisma/client");
const public_periods_1 = require("../domain/public-periods");
const public_structure_1 = require("../domain/public-structure");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const prisma = new client_1.PrismaClient();
const sendError = (res, status, code, message) => res.status(status).json({ error: { code, message }, meta: { requestId: res.locals.requestId } });
/**
 * GET /api/v1/commissariats/:slug/structure?period=2025/2026
 *
 * Returns the public structure for one commissariat and period, derived from
 * ACTIVE + PUBLISHED Membership rows.
 */
const getCommissariatStructure = async (req, res) => {
    const { slug } = req.params;
    const requested = typeof req.query.period === 'string' && req.query.period.trim()
        ? req.query.period.trim()
        : public_periods_1.DEFAULT_PUBLIC_PERIOD;
    const period = public_periods_1.PUBLIC_PERIODS.find((label) => label === requested);
    if (!period)
        return sendError(res, 400, 'VALIDATION_ERROR', `Unknown period "${requested}".`);
    const commissariat = await prisma.commissariat.findUnique({
        where: { slug },
        select: { id: true, slug: true, name: true },
    });
    if (!commissariat)
        return sendError(res, 404, 'NOT_FOUND', 'Komisariat tidak ditemukan');
    const memberships = await prisma.membership.findMany({
        where: {
            commissariatId: commissariat.id,
            period: { label: period },
            publicationStatus: 'PUBLISHED',
            membershipStatus: 'ACTIVE',
        },
        select: { name: true, position: true, division: { select: { name: true } } },
    });
    const structure = (0, public_structure_1.buildPublicStructure)(memberships);
    return (0, request_context_middleware_1.sendSuccess)(res, {
        commissariat: { slug: commissariat.slug, name: commissariat.name },
        period,
        ...structure,
    });
};
exports.getCommissariatStructure = getCommissariatStructure;
