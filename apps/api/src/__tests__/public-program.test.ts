import assert from 'node:assert/strict';
import { isCancelledProgramStatus, isPublicProgram, orderProgramsDocumentationFirst, programDate, programGallery, projectPublicProgram, publicProgramWhere } from '../domain/public-program';

const undated = programDate(null, null);
assert.equal(undated.date, 'Periode 2025/2026');
assert.equal(undated.dateLabel, 'Periode 2025/2026');
assert.equal(undated.dateIso, null);

const dated = programDate(new Date('2025-02-03T00:00:00.000Z'), 'ignored label');
assert.equal(dated.dateIso, '2025-02-03');
assert.equal(dated.dateLabel, null);
assert.equal(dated.date, new Date('2025-02-03T00:00:00.000Z').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }));

assert.deepEqual(
  programGallery(['/legacy-1.webp', null, '/legacy-2.webp', '/legacy-1.webp'], [
    { filePath: '/uploads-1.webp' },
    { filePath: '/legacy-2.webp' },
    { filePath: '/uploads-2.webp' },
  ]),
  ['/legacy-1.webp', '/legacy-2.webp', '/uploads-1.webp', '/uploads-2.webp'],
);

const largeGallery = programGallery(
  Array.from({ length: 6 }, (_, index) => `/legacy-${index + 1}.webp`),
  Array.from({ length: 8 }, (_, index) => ({ filePath: `/child-${index + 1}.webp` })),
);
assert.equal(largeGallery.length, 14);
assert.equal(largeGallery[13], '/child-8.webp');

assert.equal(isPublicProgram({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: 'Completed' }), true);
assert.equal(isPublicProgram({ publicationStatus: 'ARCHIVED', executionStatus: 'COMPLETED', status: 'Completed' }), false);
assert.equal(isPublicProgram({ publicationStatus: 'PUBLISHED', executionStatus: 'CANCELLED', status: 'Completed' }), false);
assert.equal(isPublicProgram({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: 'cancelled' }), false);
assert.equal(isPublicProgram({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: 'Cancel' }), false);
assert.equal(isCancelledProgramStatus(' Cancelled by source '), true);
assert.equal(isPublicProgram({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: ' Cancelled by source ' }), false);
assert.deepEqual(publicProgramWhere(), {
  publicationStatus: 'PUBLISHED',
  executionStatus: { not: 'CANCELLED' },
  status: { not: { contains: 'cancel' } },
});

const projectedUndated = projectPublicProgram({
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
assert.equal(projectedUndated.dateIso, null);
assert.equal(projectedUndated.date, 'Periode 2025/2026');
assert.equal(projectedUndated.dateLabel, 'Periode 2025/2026');
assert.equal(projectedUndated.gallery.length, 15);
assert.equal(projectedUndated.commissariatSlug, 'test-commissariat');

const documented = { foto1: '/one.webp', foto2: null, foto3: null, foto4: null, foto5: null, foto6: null, photos: [] };
const undocumented = { foto1: null, foto2: null, foto3: null, foto4: null, foto5: null, foto6: null, photos: [] };
assert.deepEqual(orderProgramsDocumentationFirst([undocumented, documented]).map((program) => program.foto1), ['/one.webp', null]);
