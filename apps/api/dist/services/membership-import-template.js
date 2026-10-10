"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMembershipImportTemplate = exports.TEMPLATE_EMPTY_ROWS = exports.TEMPLATE_HEADERS = void 0;
const xlsx_1 = __importDefault(require("@e965/xlsx"));
const membership_import_service_1 = require("./membership-import.service");
/*
 * Template impor Awardee.
 *
 * Satu Interface kecil — "hasilkan berkas template" — dengan satu sumber
 * kebenaran: daftar kolom diturunkan dari REQUIRED_HEADERS milik parser,
 * jadi kolom ekstra (mis. "No." atau "Periode") mustahil muncul. Berkas
 * diuji round-trip dengan parser resmi: template harus lolos validasi
 * header dan terbaca sebagai nol baris data.
 */
const DISPLAY_HEADERS = {
    komisariat: "Komisariat",
    nama: "Nama Lengkap",
    jabatan: "Jabatan",
    divisi: "Divisi",
    prodi: "Prodi",
};
exports.TEMPLATE_HEADERS = membership_import_service_1.REQUIRED_HEADERS.map((header) => DISPLAY_HEADERS[header]);
exports.TEMPLATE_EMPTY_ROWS = 50;
const buildMembershipImportTemplate = () => {
    const rows = [
        [...exports.TEMPLATE_HEADERS],
        ...Array.from({ length: exports.TEMPLATE_EMPTY_ROWS }, () => exports.TEMPLATE_HEADERS.map(() => "")),
    ];
    const sheet = xlsx_1.default.utils.aoa_to_sheet(rows);
    // Rentang eksplisit supaya 50 baris kosong benar-benar ada di sheet.
    sheet["!ref"] = `A1:E${exports.TEMPLATE_EMPTY_ROWS + 1}`;
    const workbook = xlsx_1.default.utils.book_new();
    xlsx_1.default.utils.book_append_sheet(workbook, sheet, "Data");
    return xlsx_1.default.write(workbook, { type: "buffer", bookType: "xlsx" });
};
exports.buildMembershipImportTemplate = buildMembershipImportTemplate;
