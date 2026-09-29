"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const news_lifecycle_1 = require("../domain/news-lifecycle");
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsTransition)('DRAFT', 'SUBMITTED'));
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsTransition)('SUBMITTED', 'REJECTED', 'Perlu koreksi'));
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsTransition)('SUBMITTED', 'REJECTED'));
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsTransition)('PUBLISHED', 'APPROVED'));
strict_1.default.equal((0, news_lifecycle_1.newsSlug)('Berita GenBI Jatim!'), 'berita-genbi-jatim');
strict_1.default.equal((0, news_lifecycle_1.normalizeNewsText)('  berita   baru  ', 'title', 20), 'berita baru');
strict_1.default.throws(() => (0, news_lifecycle_1.normalizeNewsText)('<b>berita</b>', 'title', 20));
strict_1.default.throws(() => (0, news_lifecycle_1.normalizeNewsText)('x'.repeat(5), 'title', 4));
