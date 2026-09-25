import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { canonicalCommissariatSlug, normalizeMembershipDivision, parseMembershipWorkbook, validateMembershipSource } from '../services/membership-import.service';
import { MEMBERSHIP_EXPECTED_COUNTS, MEMBERSHIP_RELEASE_PERIOD, MEMBERSHIP_SOURCE_SHA256 } from '../domain/membership-release';
import XLSX from '@e965/xlsx';

assert.equal(normalizeMembershipDivision('BPH 1', { commissariatSlug: 'unugiri', periodLabel: MEMBERSHIP_RELEASE_PERIOD }), 'BPH');
assert.equal(normalizeMembershipDivision('BPH 2', { commissariatSlug: 'unugiri', periodLabel: MEMBERSHIP_RELEASE_PERIOD }), 'BPH');
assert.equal(normalizeMembershipDivision('BPH 3', { commissariatSlug: 'unugiri', periodLabel: MEMBERSHIP_RELEASE_PERIOD }), 'BPH');
assert.equal(normalizeMembershipDivision('Linkungan Hidup & Sosial', { commissariatSlug: 'pens', periodLabel: MEMBERSHIP_RELEASE_PERIOD }), 'Lingkungan Hidup & Sosial');
assert.equal(normalizeMembershipDivision('Sosial dan Linkungan', { commissariatSlug: 'unesa', periodLabel: MEMBERSHIP_RELEASE_PERIOD }), 'Sosial dan Lingkungan');
assert.equal(normalizeMembershipDivision('Sosial Linkungan', { commissariatSlug: 'upnvjt', periodLabel: MEMBERSHIP_RELEASE_PERIOD }), 'Sosial Lingkungan');
assert.equal(normalizeMembershipDivision('Linkungan Hidup', { commissariatSlug: 'uinsa', periodLabel: MEMBERSHIP_RELEASE_PERIOD }), 'Lingkungan Hidup');
assert.equal(normalizeMembershipDivision('Media Komunikasi; Hubungan Luar', { commissariatSlug: 'unair', periodLabel: MEMBERSHIP_RELEASE_PERIOD }), 'Media Komunikasi & Hubungan Luar');
assert.equal(normalizeMembershipDivision(''), null);

assert.equal(canonicalCommissariatSlug('UPN Veteran Jatim'), 'upnvjt');
assert.equal(canonicalCommissariatSlug('UIN Madura'), 'uin-madura');
assert.equal(canonicalCommissariatSlug('unknown'), null);

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
  ['komisariat', 'nama', 'jabatan', 'divisi', 'prodi'],
  ['UPN Veteran Jatim', '  Budi   Santoso ', 'Staff', 'BPH 1', 'Teknik'],
]), 'Data Final');
const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
const parsed = parseMembershipWorkbook(buffer);
assert.equal(parsed.sourceSheet, 'Data Final');
assert.equal(parsed.rows[0].normalized.divisi, 'BPH');

const sourcePath = path.resolve(__dirname, '../../../../data/anggota/data_genbi_final_db.xlsx');
const sourceBuffer = fs.readFileSync(sourcePath);
const sourceParsed = parseMembershipWorkbook(sourceBuffer);
const sourceValidation = validateMembershipSource(sourceParsed, { expectedTotalRows: 619, expectedCommissariatCounts: MEMBERSHIP_EXPECTED_COUNTS });
assert.equal(sourceParsed.hash, MEMBERSHIP_SOURCE_SHA256);
assert.equal(sourceValidation.valid, true);
assert.equal(sourceValidation.totalRows, 619);
assert.equal(sourceValidation.noDivisionCount, 127);
assert.deepEqual(sourceValidation.commissariatCounts, MEMBERSHIP_EXPECTED_COUNTS);
assert.deepEqual(sourceValidation.noDivisionCounts, { its: 46, pens: 2, 'uin-madura': 1, uinsa: 34, unair: 30, utm: 14 });
