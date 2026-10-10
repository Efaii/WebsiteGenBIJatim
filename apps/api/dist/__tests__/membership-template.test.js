"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const xlsx_1 = __importDefault(require("@e965/xlsx"));
const membership_import_service_1 = require("../services/membership-import.service");
const membership_import_template_1 = require("../services/membership-import-template");
/*
 * Round-trip template impor: berkas yang dihasilkan modul template harus
 * langsung lolos parser resmi — header diterima, nol baris data, dan rentang
 * sheet memuat 50 baris kosong.
 */
strict_1.default.deepEqual(membership_import_template_1.TEMPLATE_HEADERS, [
    "Komisariat",
    "Nama Lengkap",
    "Jabatan",
    "Divisi",
    "Prodi",
]);
const buffer = (0, membership_import_template_1.buildMembershipImportTemplate)();
strict_1.default.equal(buffer.subarray(0, 2).toString(), "PK", "template harus XLSX valid");
const parsed = (0, membership_import_service_1.parseMembershipWorkbook)(buffer);
strict_1.default.equal(parsed.rows.length, 0, "template tanpa isi tidak boleh menghasilkan baris data");
const workbook = xlsx_1.default.read(buffer, { type: "buffer" });
strict_1.default.equal(workbook.SheetNames.length, 1, "template harus satu sheet");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
strict_1.default.equal(sheet["!ref"], `A1:E${membership_import_template_1.TEMPLATE_EMPTY_ROWS + 1}`, "sheet harus memuat 50 baris kosong");
// Header template harus dinormalkan parser ke daftar kanonik (tanpa kolom ekstra).
const headerRow = xlsx_1.default.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: null,
})[0];
strict_1.default.equal(headerRow.length, 5, "tidak boleh ada kolom tambahan");
console.log("All membership template assertions passed successfully!");
