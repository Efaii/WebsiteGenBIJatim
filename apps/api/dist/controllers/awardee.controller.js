"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAwardees = void 0;
const prisma_1 = require("../lib/prisma");
const public_membership_1 = require("../domain/public-membership");
const membership_release_1 = require("../domain/membership-release");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const getAwardees = async (req, res) => {
    const periodId = typeof req.query.periodId === 'string' ? req.query.periodId : undefined;
    const periodLabel = typeof req.query.periodLabel === 'string' ? req.query.periodLabel : membership_release_1.MEMBERSHIP_RELEASE_PERIOD;
    const periodFilter = periodId ? { periodId } : { period: { label: periodLabel } };
    const items = await prisma_1.prisma.membership.findMany({
        where: {
            publicationStatus: 'PUBLISHED',
            membershipStatus: 'ACTIVE',
            ...(typeof req.query.commissariatId === 'string' ? { commissariatId: req.query.commissariatId } : {}),
            ...periodFilter,
            ...(typeof req.query.commissariatSlug === 'string' ? { commissariat: { slug: req.query.commissariatSlug } } : {}),
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
    return (0, request_context_middleware_1.sendSuccess)(res, items.map(public_membership_1.projectPublicAwardee));
};
exports.getAwardees = getAwardees;
