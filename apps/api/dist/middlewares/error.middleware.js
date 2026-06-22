"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = require("../utils/AppError");
/**
 * @middleware GlobalErrorHandler
 * @description Centralized error handler that formats and sends uniform error responses.
 */
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else {
        // Log unexpected errors for developers, but don't leak details to clients
        console.error('UNEXPECTED ERROR 💥:', err);
    }
    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.globalErrorHandler = globalErrorHandler;
