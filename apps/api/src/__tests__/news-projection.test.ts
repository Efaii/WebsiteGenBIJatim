import assert from 'node:assert/strict';

const publicNews = { id: '1', title: 'T', slug: 't', excerpt: 'E', content: 'C', category: 'EDUKASI', coverImage: null, publishedAt: new Date(), byline: 'GenBI Jatim' };
assert.deepEqual(Object.keys(publicNews).sort(), ['byline', 'category', 'content', 'coverImage', 'excerpt', 'id', 'publishedAt', 'slug', 'title']);
assert.equal('authorAccountId' in publicNews, false);
assert.equal('rejectionReason' in publicNews, false);
assert.equal('storageKey' in publicNews, false);
