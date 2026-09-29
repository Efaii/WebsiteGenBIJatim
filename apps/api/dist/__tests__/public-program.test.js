"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const public_program_1 = require("../domain/public-program");
const undated = (0, public_program_1.programDate)(null, null);
strict_1.default.equal(undated.date, 'Periode 2025/2026');
strict_1.default.equal(undated.dateLabel, 'Periode 2025/2026');
strict_1.default.equal(undated.dateIso, null);
const dated = (0, public_program_1.programDate)(new Date('2025-02-03T00:00:00.000Z'), 'ignored label');
strict_1.default.equal(dated.dateIso, '2025-02-03');
strict_1.default.equal(dated.dateLabel, null);
strict_1.default.equal(dated.date, new Date('2025-02-03T00:00:00.000Z').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }));
strict_1.default.deepEqual((0, public_program_1.programGallery)(['/legacy-1.webp', null, '/legacy-2.webp', '/legacy-1.webp'], [
    { filePath: '/uploads-1.webp' },
    { filePath: '/legacy-2.webp' },
    { filePath: '/uploads-2.webp' },
]), ['/legacy-1.webp', '/legacy-2.webp', '/uploads-1.webp', '/uploads-2.webp']);
const largeGallery = (0, public_program_1.programGallery)(Array.from({ length: 6 }, (_, index) => `/legacy-${index + 1}.webp`), Array.from({ length: 8 }, (_, index) => ({ filePath: `/child-${index + 1}.webp` })));
strict_1.default.equal(largeGallery.length, 14);
strict_1.default.equal(largeGallery[13], '/child-8.webp');
strict_1.default.equal((0, public_program_1.isPublicProgram)({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: 'Completed' }), true);
strict_1.default.equal((0, public_program_1.isPublicProgram)({ publicationStatus: 'ARCHIVED', executionStatus: 'COMPLETED', status: 'Completed' }), false);
strict_1.default.equal((0, public_program_1.isPublicProgram)({ publicationStatus: 'PUBLISHED', executionStatus: 'CANCELLED', status: 'Completed' }), false);
strict_1.default.equal((0, public_program_1.isPublicProgram)({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: 'cancelled' }), false);
strict_1.default.equal((0, public_program_1.isPublicProgram)({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: 'Cancel' }), false);
strict_1.default.equal((0, public_program_1.isCancelledProgramStatus)(' Cancelled by source '), true);
strict_1.default.equal((0, public_program_1.isPublicProgram)({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: ' Cancelled by source ' }), false);
strict_1.default.deepEqual((0, public_program_1.publicProgramWhere)(), {
    publicationStatus: 'PUBLISHED',
    executionStatus: { not: 'CANCELLED' },
    status: { not: { contains: 'cancel' } },
});
const projectedUndated = (0, public_program_1.projectPublicProgram)({
    id: 'program-1',
    programKe: 1,
    namaProker: 'Undated program',
    divisi: 'Pendidikan',
    tanggalProker: null,
    dateLabel: 'Periode 2025/2026',
    formatPelaksanaan: 'Offline',
    status: 'Completed',
    deskripsiProker: 'Program without a calendar date',
    kpiTukTarget: null,
    dampak: null,
    evaluasi: null,
    foto1: '/legacy-1.webp',
    foto2: '/legacy-2.webp',
    foto3: '/legacy-3.webp',
    foto4: '/legacy-4.webp',
    foto5: '/legacy-5.webp',
    foto6: '/legacy-6.webp',
    photos: Array.from({ length: 9 }, (_, index) => ({ filePath: `/child-${index + 1}.webp` })),
    publicationStatus: 'PUBLISHED',
    executionStatus: 'COMPLETED',
    commissariat: { name: 'Test Commissariat', slug: 'test-commissariat' },
});
strict_1.default.equal(projectedUndated.dateIso, null);
strict_1.default.equal(projectedUndated.date, 'Periode 2025/2026');
strict_1.default.equal(projectedUndated.dateLabel, 'Periode 2025/2026');
strict_1.default.equal(projectedUndated.gallery.length, 15);
strict_1.default.equal(projectedUndated.commissariatSlug, 'test-commissariat');
const documented = { foto1: '/one.webp', foto2: null, foto3: null, foto4: null, foto5: null, foto6: null, photos: [] };
const undocumented = { foto1: null, foto2: null, foto3: null, foto4: null, foto5: null, foto6: null, photos: [] };
strict_1.default.deepEqual((0, public_program_1.orderProgramsDocumentationFirst)([undocumented, documented]).map((program) => program.foto1), ['/one.webp', null]);
