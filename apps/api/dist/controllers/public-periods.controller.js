"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicPeriods = void 0;
const public_periods_1 = require("../domain/public-periods");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
const listPublicPeriods = async (_req, res) => (0, request_context_middleware_1.sendSuccess)(res, {
    periods: [...public_periods_1.PUBLIC_PERIODS],
    defaultPeriod: public_periods_1.DEFAULT_PUBLIC_PERIOD,
});
exports.listPublicPeriods = listPublicPeriods;
