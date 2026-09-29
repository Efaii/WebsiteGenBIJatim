import assert from 'node:assert/strict';

const publicNews = { id: '1', title: 'T', slug: 't', excerpt: 'E', content: 'C', category: 'EDUKASI', coverImage: null, images: [], publishedAt: new Date(), author: 'Fathir Ainur Rochim', publisher: 'GenBI Jatim', featuredOrder: null };
assert.deepEqual(Object.keys(publicNews).sort(), ['author', 'category', 'content', 'coverImage', 'excerpt', 'featuredOrder', 'id', 'images', 'publishedAt', 'publisher', 'slug', 'title']);
assert.equal('authorAccountId' in publicNews, false);
assert.equal('rejectionReason' in publicNews, false);
assert.equal('storageKey' in publicNews, false);
