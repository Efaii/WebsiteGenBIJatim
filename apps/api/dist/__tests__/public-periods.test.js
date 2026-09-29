"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const public_periods_1 = require("../domain/public-periods");
strict_1.default.deepEqual([...public_periods_1.PUBLIC_PERIODS], ['2025/2026', '2026/2027']);
strict_1.default.equal(public_periods_1.DEFAULT_PUBLIC_PERIOD, '2025/2026');
strict_1.default.equal((0, public_periods_1.periodToSlug)('2025/2026'), '2025-2026');
strict_1.default.equal((0, public_periods_1.periodToSlug)('2026/2027'), '2026-2027');
strict_1.default.equal((0, public_periods_1.periodFromSlug)('2025-2026'), '2025/2026');
strict_1.default.equal((0, public_periods_1.periodFromSlug)('2026-2027'), '2026/2027');
strict_1.default.equal((0, public_periods_1.periodFromSlug)('2099-2100'), null);
console.log('All public-periods assertions passed successfully!');
