"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const publicNews = { id: '1', title: 'T', slug: 't', excerpt: 'E', content: 'C', category: 'EDUKASI', coverImage: null, publishedAt: new Date(), byline: 'GenBI Jatim' };
strict_1.default.deepEqual(Object.keys(publicNews).sort(), ['byline', 'category', 'content', 'coverImage', 'excerpt', 'id', 'publishedAt', 'slug', 'title']);
strict_1.default.equal('authorAccountId' in publicNews, false);
strict_1.default.equal('rejectionReason' in publicNews, false);
strict_1.default.equal('storageKey' in publicNews, false);
