"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const public_membership_1 = require("../domain/public-membership");
strict_1.default.deepEqual((0, public_membership_1.summarizeAwardeesByCommissariat)([
    { commissariat: { slug: 'its', name: 'ITS' } },
    { commissariat: { slug: 'unair', name: 'UNAIR' } },
    { commissariat: { slug: 'its', name: 'ITS' } },
]), [
    { slug: 'its', name: 'ITS', count: 2 },
    { slug: 'unair', name: 'UNAIR', count: 1 },
]);
strict_1.default.deepEqual((0, public_membership_1.summarizeAwardeesByCommissariat)([]), []);
console.log('All public-awardee assertions passed successfully!');
