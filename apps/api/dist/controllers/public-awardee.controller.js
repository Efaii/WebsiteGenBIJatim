"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicAwardees = void 0;
const client_1 = require("@prisma/client");
const public_periods_1 = require("../domain/public-periods");
const public_membership_1 = require("../domain/public-membership");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const prisma = new client_1.PrismaClient();
const sendError = (res, status, code, message) => res.status(status).json({ error: { code, message }, meta: { requestId: res.locals.requestId } });
/**
 * GET /api/v1/awardees?period=2025/2026&commissariatSlug=its
 *
 * Lists every awardee (Membership ACTIVE + PUBLISHED) for a period, with an
 * optional commissariat filter and a per-commissariat count summary.
 */
const listPublicAwardees = async (req, res) => {
    const requested = typeof req.query.period === 'string' && req.query.period.trim()
        ? req.query.period.trim()
        : public_periods_1.DEFAULT_PUBLIC_PERIOD;
    const period = public_periods_1.PUBLIC_PERIODS.find((label) => label === requested);
    if (!period)
        return sendError(res, 400, 'VALIDATION_ERROR', `Unknown period "${requested}".`);
    const commissariatSlug = typeof req.query.commissariatSlug === 'string' && req.query.commissariatSlug.trim()
        ? req.query.commissariatSlug.trim()
        : undefined;
    const memberships = await prisma.membership.findMany({
        where: {
            publicationStatus: 'PUBLISHED',
            membershipStatus: 'ACTIVE',
            period: { label: period },
            ...(commissariatSlug ? { commissariat: { slug: commissariatSlug } } : {}),
        },
        select: {
            id: true,
            name: true,
            position: true,
            studyProgram: true,
            division: { select: { name: true } },
            commissariat: { select: { slug: true, name: true } },
            period: { select: { label: true } },
        },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    const awardees = memberships.map(public_membership_1.projectPublicAwardee);
    return (0, request_context_middleware_1.sendSuccess)(res, {
        period,
        awardees,
        summary: {
            total: awardees.length,
            byCommissariat: (0, public_membership_1.summarizeAwardeesByCommissariat)(awardees),
        },
    });
};
exports.listPublicAwardees = listPublicAwardees;
