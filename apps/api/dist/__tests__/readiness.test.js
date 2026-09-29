"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const index_1 = require("../index");
const request_context_middleware_1 = require("../middlewares/request-context.middleware");
strict_1.default.equal(typeof index_1.app, 'function');
strict_1.default.equal(typeof index_1.app.get, 'function');
const hasRoute = (layers, path) => Boolean(layers?.some((layer) => layer.route?.path === path || hasRoute(layer.handle?.stack, path)));
strict_1.default.ok(hasRoute(index_1.app._router?.stack, '/health'));
strict_1.default.ok(hasRoute(index_1.app._router?.stack, '/ready'));
let status = 0;
let requestIdHeader = '';
const response = {
    locals: { requestId: 'readiness-test-id' },
    status(code) { status = code; return this; },
    json() { return undefined; },
    setHeader(name, value) { if (name === 'x-request-id')
        requestIdHeader = value; return this; },
};
(0, request_context_middleware_1.requestContext)({ header: () => 'readiness-test-id' }, response, () => undefined);
strict_1.default.equal(response.locals.requestId, 'readiness-test-id');
strict_1.default.equal(requestIdHeader, 'readiness-test-id');
strict_1.default.equal(status, 0);
