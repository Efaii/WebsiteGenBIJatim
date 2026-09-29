"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptLegacyPrograms = exports.adaptLegacyProgram = void 0;
const api_error_1 = require("../lib/api-error");
const executionStatusMap = {
    completed: 'COMPLETED',
    'on-going': 'ONGOING',
    ongoing: 'ONGOING',
    upcoming: 'PLANNED',
    planned: 'PLANNED',
    cancelled: 'CANCELLED',
};
const adaptLegacyProgram = (input) => {
    if (!input || typeof input !== 'object')
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Legacy program must be an object.', 400);
    const value = input;
    const title = typeof value.title === 'string' ? value.title.trim() : typeof value.namaProker === 'string' ? value.namaProker.trim() : '';
    if (!title)
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Legacy program title is required.', 400);
    const rawStatus = typeof value.status === 'string' ? value.status.trim().toLowerCase() : '';
    const executionStatus = executionStatusMap[rawStatus];
    const rawDate = typeof value.dateIso === 'string' ? value.dateIso : typeof value.date === 'string' ? value.date : undefined;
    const validDate = rawDate && !Number.isNaN(Date.parse(rawDate)) ? rawDate : undefined;
    return {
        legacyId: String(value.id ?? ''),
        title,
        commissariat: typeof value.commissariat === 'string' ? value.commissariat : undefined,
        division: typeof value.divisi === 'string' ? value.divisi : typeof value.division === 'string' ? value.division : undefined,
        executionStatus,
        date: validDate,
        description: typeof value.description === 'string' ? value.description : typeof value.deskripsiProker === 'string' ? value.deskripsiProker : undefined,
        ambiguous: !executionStatus || !validDate || !value.id,
    };
};
exports.adaptLegacyProgram = adaptLegacyProgram;
const adaptLegacyPrograms = (input) => {
    if (!Array.isArray(input))
        throw new api_error_1.ApiError('VALIDATION_ERROR', 'Legacy programs must be an array.', 400);
    return input.map(exports.adaptLegacyProgram);
};
exports.adaptLegacyPrograms = adaptLegacyPrograms;
