import assert from 'node:assert/strict';
import { isPublicProgram, programDate, programGallery } from '../domain/public-program';

const undated = programDate(null, null);
assert.equal(undated.date, 'Periode 2025/2026');
assert.equal(undated.dateLabel, 'Periode 2025/2026');
assert.equal(undated.dateIso, null);

const dated = programDate(new Date('2025-02-03T00:00:00.000Z'), 'ignored label');
assert.equal(dated.dateIso, '2025-02-03');
assert.equal(dated.dateLabel, null);

assert.deepEqual(
  programGallery(['/legacy-1.webp', null, '/legacy-2.webp', '/legacy-1.webp'], [
    { filePath: '/uploads-1.webp' },
    { filePath: '/legacy-2.webp' },
    { filePath: '/uploads-2.webp' },
  ]),
  ['/legacy-1.webp', '/legacy-2.webp', '/uploads-1.webp', '/uploads-2.webp'],
);

assert.equal(isPublicProgram({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: 'Completed' }), true);
assert.equal(isPublicProgram({ publicationStatus: 'ARCHIVED', executionStatus: 'COMPLETED', status: 'Completed' }), false);
assert.equal(isPublicProgram({ publicationStatus: 'PUBLISHED', executionStatus: 'CANCELLED', status: 'Completed' }), false);
assert.equal(isPublicProgram({ publicationStatus: 'PUBLISHED', executionStatus: 'COMPLETED', status: 'cancelled' }), false);
