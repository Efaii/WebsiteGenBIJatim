import assert from 'node:assert/strict';
import { summarizeAwardeesByCommissariat } from '../domain/public-membership';

assert.deepEqual(
  summarizeAwardeesByCommissariat([
    { commissariat: { slug: 'its', name: 'ITS' } },
    { commissariat: { slug: 'unair', name: 'UNAIR' } },
    { commissariat: { slug: 'its', name: 'ITS' } },
  ]),
  [
    { slug: 'its', name: 'ITS', count: 2 },
    { slug: 'unair', name: 'UNAIR', count: 1 },
  ],
);

assert.deepEqual(summarizeAwardeesByCommissariat([]), []);

console.log('All public-awardee assertions passed successfully!');
