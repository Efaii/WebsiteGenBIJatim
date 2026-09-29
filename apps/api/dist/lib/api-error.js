"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(code, message, status, fields) {
        super(message);
        this.code = code;
        this.status = status;
        this.fields = fields;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
