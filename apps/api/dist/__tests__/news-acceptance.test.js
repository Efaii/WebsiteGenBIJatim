"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const types_1 = require("@repo/types");
const news_lifecycle_1 = require("../domain/news-lifecycle");
strict_1.default.equal(types_1.newsWriteSchema.safeParse({ title: 'A', excerpt: '', content: '', category: null, extra: true }).success, false);
strict_1.default.equal(types_1.newsWriteSchema.safeParse({ title: 'A', excerpt: 'E', content: 'C', category: 'EDUKASI' }).success, true);
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsTransition)('PUBLISHED', 'DRAFT'));
strict_1.default.doesNotThrow(() => (0, news_lifecycle_1.assertNewsTransition)('PUBLISHED', 'ARCHIVED'));
strict_1.default.throws(() => (0, news_lifecycle_1.assertNewsTransition)('ARCHIVED', 'DRAFT'));
