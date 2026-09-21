import assert from 'node:assert/strict';
import { assertNewsTransition, newsSlug, normalizeNewsText } from '../domain/news-lifecycle';

assert.doesNotThrow(() => assertNewsTransition('DRAFT', 'SUBMITTED'));
assert.doesNotThrow(() => assertNewsTransition('SUBMITTED', 'REJECTED', 'Perlu koreksi'));
assert.throws(() => assertNewsTransition('SUBMITTED', 'REJECTED'));
assert.throws(() => assertNewsTransition('PUBLISHED', 'APPROVED'));
assert.equal(newsSlug('Berita GenBI Jatim!'), 'berita-genbi-jatim');
assert.equal(normalizeNewsText('  berita   baru  ', 'title', 20), 'berita baru');
assert.throws(() => normalizeNewsText('<b>berita</b>', 'title', 20));
assert.throws(() => normalizeNewsText('x'.repeat(5), 'title', 4));
