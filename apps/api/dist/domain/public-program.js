"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectPublicProgram = exports.isPublicProgram = exports.orderProgramsDocumentationFirst = exports.hasProgramDocumentation = exports.programGallery = exports.programDate = exports.publicProgramWhere = exports.isCancelledProgramStatus = void 0;
const isCancelledProgramStatus = (value) => value.trim().toLowerCase().includes('cancel');
exports.isCancelledProgramStatus = isCancelledProgramStatus;
const publicProgramWhere = () => ({
    publicationStatus: 'PUBLISHED',
    executionStatus: { not: 'CANCELLED' },
    status: { not: { contains: 'cancel' } },
});
exports.publicProgramWhere = publicProgramWhere;
const programDate = (date, label) => {
    const periodLabel = label || 'Periode 2025/2026';
    return {
        date: date
            ? date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
            : periodLabel,
        dateIso: date ? date.toISOString().split('T')[0] : null,
        dateLabel: date ? null : periodLabel,
    };
};
exports.programDate = programDate;
const programGallery = (legacyPhotos, photos) => [
    ...new Set([...legacyPhotos, ...photos.map((photo) => photo.filePath)]
        .filter((photo) => Boolean(photo))),
];
exports.programGallery = programGallery;
const hasProgramDocumentation = (program) => (0, exports.programGallery)([program.foto1, program.foto2, program.foto3, program.foto4, program.foto5, program.foto6], program.photos).length > 0;
exports.hasProgramDocumentation = hasProgramDocumentation;
const orderProgramsDocumentationFirst = (programs) => programs
    .map((program, index) => ({ program, index, hasDocumentation: (0, exports.hasProgramDocumentation)(program) }))
    .sort((left, right) => Number(right.hasDocumentation) - Number(left.hasDocumentation) || left.index - right.index)
    .map(({ program }) => program);
exports.orderProgramsDocumentationFirst = orderProgramsDocumentationFirst;
const isPublicProgram = (program) => (program.publicationStatus === 'PUBLISHED'
    && program.executionStatus !== 'CANCELLED'
    && !(0, exports.isCancelledProgramStatus)(program.status));
exports.isPublicProgram = isPublicProgram;
const projectPublicProgram = (program) => ({
    id: program.id,
    programKe: program.programKe,
    title: program.namaProker,
    divisi: program.divisi,
    ...(program.commissariat
        ? {
            commissariat: program.commissariat.name,
            commissariatSlug: program.commissariat.slug,
        }
        : {}),
    ...(0, exports.programDate)(program.tanggalProker, program.dateLabel),
    format: program.formatPelaksanaan,
    status: program.status,
    description: program.deskripsiProker,
    kpiTukTarget: program.kpiTukTarget,
    dampak: program.dampak,
    evaluasi: program.evaluasi,
    gallery: (0, exports.programGallery)([program.foto1, program.foto2, program.foto3, program.foto4, program.foto5, program.foto6], program.photos),
});
exports.projectPublicProgram = projectPublicProgram;
