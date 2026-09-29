"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = exports.requestContext = void 0;
const crypto_1 = require("crypto");
const requestContext = (req, res, next) => {
    const requestId = req.header('x-request-id')?.trim() || (0, crypto_1.randomUUID)();
    res.locals.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
};
exports.requestContext = requestContext;
const sendSuccess = (res, data, meta = {}) => res.json({ data, meta: { requestId: res.locals.requestId, ...meta } });
exports.sendSuccess = sendSuccess;
