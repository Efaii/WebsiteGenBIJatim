"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsSlug = exports.normalizeNewsText = exports.assertNewsTransition = void 0;
const api_error_1 = require("../lib/api-error");
const transitions = {
    DRAFT: ['SUBMITTED'], SUBMITTED: ['APPROVED', 'REJECTED'], APPROVED: ['PUBLISHED'],
    PUBLISHED: ['DRAFT', 'ARCHIVED'], REJECTED: ['DRAFT'], ARCHIVED: [],
};
const assertNewsTransition = (from, to, reason) => {
    if (!transitions[from].includes(to))
        throw new api_error_1.ApiError('CONFLICT', `Cannot transition News from ${from} to ${to}.`, 409);
    if (to === 'REJECTED' && !reason?.trim())
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Rejection reason is required.', 400, { rejectionReason: ['Required'] });
};
exports.assertNewsTransition = assertNewsTransition;
const normalizeNewsText = (value, field, max) => {
    if (typeof value !== 'string')
        throw new api_error_1.ApiError('VALIDATION_ERROR', `${field} must be text.`, 400);
    if (/<[^>]+>/.test(value))
        throw new api_error_1.ApiError('VALIDATION_ERROR', `${field} must be plain text.`, 400, { [field]: ['HTML_NOT_ALLOWED'] });
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized || normalized.length > max)
        throw new api_error_1.ApiError('VALIDATION_ERROR', `${field} is invalid.`, 400, { [field]: [`Must be 1-${max} characters`] });
    return normalized;
};
exports.normalizeNewsText = normalizeNewsText;
const newsSlug = (title) => title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180);
exports.newsSlug = newsSlug;
