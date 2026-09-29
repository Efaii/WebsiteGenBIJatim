import assert from 'node:assert/strict';
import { newsWriteSchema } from '@repo/types';
import { assertNewsTransition } from '../domain/news-lifecycle';

assert.equal(newsWriteSchema.safeParse({ title: 'A', excerpt: '', content: '', category: null, extra: true }).success, false);
assert.equal(newsWriteSchema.safeParse({ title: 'A', excerpt: 'E', content: 'C', category: 'EDUKASI' }).success, true);
assert.doesNotThrow(() => assertNewsTransition('PUBLISHED', 'DRAFT'));
assert.doesNotThrow(() => assertNewsTransition('PUBLISHED', 'ARCHIVED'));
assert.throws(() => assertNewsTransition('ARCHIVED', 'DRAFT'));
