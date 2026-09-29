"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const xlsx_1 = __importDefault(require("@e965/xlsx"));
const membership_import_service_1 = require("../services/membership-import.service");
const workbook = xlsx_1.default.utils.book_new();
xlsx_1.default.utils.book_append_sheet(workbook, xlsx_1.default.utils.aoa_to_sheet([
    ['komisariat', 'nama', 'jabatan', 'divisi', 'prodi'],
    ['UNAIR', '  Budi   Santoso ', 'Staff', '', 'Teknik'],
]));
const buffer = xlsx_1.default.write(workbook, { type: 'buffer', bookType: 'xlsx' });
const parsed = (0, membership_import_service_1.parseMembershipWorkbook)(buffer);
strict_1.default.equal(parsed.rows.length, 1);
strict_1.default.equal(parsed.rows[0].normalized.nama, 'Budi Santoso');
strict_1.default.equal(parsed.rows[0].normalized.divisi, null);
strict_1.default.equal(parsed.hash.length, 64);
strict_1.default.throws(() => (0, membership_import_service_1.parseMembershipWorkbook)(Buffer.from('not-xlsx')));
