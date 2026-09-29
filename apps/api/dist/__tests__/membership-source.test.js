"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const membership_import_service_1 = require("../services/membership-import.service");
const membership_release_1 = require("../domain/membership-release");
const xlsx_1 = __importDefault(require("@e965/xlsx"));
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)('BPH 1', { commissariatSlug: 'unugiri', periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }), 'BPH');
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)('BPH 2', { commissariatSlug: 'unugiri', periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }), 'BPH');
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)('BPH 3', { commissariatSlug: 'unugiri', periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }), 'BPH');
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)('BPH 1', { commissariatSlug: 'upnvjt', periodLabel: '2026/2027' }), 'BPH 1');
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)('Linkungan Hidup & Sosial', { commissariatSlug: 'pens', periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }), 'Lingkungan Hidup & Sosial');
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)('Sosial dan Linkungan', { commissariatSlug: 'unesa', periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }), 'Sosial dan Lingkungan');
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)('Sosial Linkungan', { commissariatSlug: 'upnvjt', periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }), 'Sosial Lingkungan');
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)('Linkungan Hidup', { commissariatSlug: 'uinsa', periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }), 'Lingkungan Hidup');
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)('Media Komunikasi; Hubungan Luar', { commissariatSlug: 'unair', periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD }), 'Media Komunikasi & Hubungan Luar');
strict_1.default.equal((0, membership_import_service_1.normalizeMembershipDivision)(''), null);
strict_1.default.equal((0, membership_import_service_1.canonicalCommissariatSlug)('UPN Veteran Jatim'), 'upnvjt');
strict_1.default.equal((0, membership_import_service_1.canonicalCommissariatSlug)('UIN Madura'), 'uin-madura');
strict_1.default.equal((0, membership_import_service_1.canonicalCommissariatSlug)('unknown'), null);
const workbook = xlsx_1.default.utils.book_new();
xlsx_1.default.utils.book_append_sheet(workbook, xlsx_1.default.utils.aoa_to_sheet([
    ['komisariat', 'nama', 'jabatan', 'divisi', 'prodi'],
    ['UNUGIRI', '  Budi   Santoso ', 'Staff', 'BPH 1', 'Teknik'],
]), 'Data Final');
const buffer = xlsx_1.default.write(workbook, { type: 'buffer', bookType: 'xlsx' });
const parsed = (0, membership_import_service_1.parseMembershipWorkbook)(buffer, { periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD });
strict_1.default.equal(parsed.sourceSheet, 'Data Final');
strict_1.default.equal(parsed.rows[0].normalized.divisi, 'BPH');
const sourcePath = node_path_1.default.resolve(__dirname, '../../../../data/anggota/data_genbi_final_db.xlsx');
const sourceBuffer = node_fs_1.default.readFileSync(sourcePath);
const sourceParsed = (0, membership_import_service_1.parseMembershipWorkbook)(sourceBuffer, { periodLabel: membership_release_1.MEMBERSHIP_RELEASE_PERIOD });
const sourceValidation = (0, membership_import_service_1.validateMembershipSource)(sourceParsed, { expectedTotalRows: 619, expectedCommissariatCounts: membership_release_1.MEMBERSHIP_EXPECTED_COUNTS, expectedNoDivisionCount: 127, expectedDivisionNames: membership_release_1.MEMBERSHIP_RELEASE_DIVISIONS });
strict_1.default.equal(sourceParsed.hash, membership_release_1.MEMBERSHIP_SOURCE_SHA256);
strict_1.default.equal(sourceValidation.valid, true);
strict_1.default.equal(sourceValidation.totalRows, 619);
strict_1.default.equal(sourceValidation.noDivisionCount, 127);
strict_1.default.deepEqual(sourceValidation.commissariatCounts, membership_release_1.MEMBERSHIP_EXPECTED_COUNTS);
strict_1.default.deepEqual(sourceValidation.noDivisionCounts, membership_release_1.MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS);
const strictValidation = (0, membership_import_service_1.validateMembershipSource)({ sourceSheet: 'Data Final', rows: [{ rowNumber: 2, rawValues: { divisi: 'Unknown' }, normalized: { komisariat: 'ITS', nama: 'Test', jabatan: 'Staff', divisi: 'Unknown', prodi: 'Teknik' } }] }, { expectedDivisionNames: membership_release_1.MEMBERSHIP_RELEASE_DIVISIONS, requireDivisionCatalog: true });
strict_1.default.equal(strictValidation.valid, false);
strict_1.default.match(strictValidation.rejectedRows[0].errors.join(','), /INVALID_DIVISION/);
