"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = void 0;
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const overview_service_1 = require("../services/overview.service");
/*
 * Adapter HTTP tipis untuk Dasbor CMS: baca sesi, panggil modul data
 * (src/services/overview.service.ts), lalu kirim respons. Seluruh aturan
 * scope dan agregasi hidup di modul itu, bukan di sini.
 */
const getOverview = async (req, res) => {
    const account = req.cmsSession.cmsAccount;
    const assignment = account.assignments[0] ?? null;
    const data = await (0, overview_service_1.getOverviewData)({
        role: account.role,
        assignment: assignment
            ? {
                commissariatId: assignment.commissariatId,
                periodId: assignment.periodId,
                divisionId: assignment.divisionId,
            }
            : null,
    });
    return (0, request_context_middleware_1.sendSuccess)(res, data);
};
exports.getOverview = getOverview;
