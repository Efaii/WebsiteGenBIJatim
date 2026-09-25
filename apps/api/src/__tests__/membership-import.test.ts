import assert from 'node:assert/strict';
import XLSX from '@e965/xlsx';
import { parseMembershipWorkbook } from '../services/membership-import.service';

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
  ['komisariat', 'nama', 'jabatan', 'divisi', 'prodi'],
  ['UNAIR', '  Budi   Santoso ', 'Staff', '', 'Teknik'],
]));
const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
const parsed = parseMembershipWorkbook(buffer);
assert.equal(parsed.rows.length, 1);
assert.equal(parsed.rows[0].normalized.nama, 'Budi Santoso');
assert.equal(parsed.rows[0].normalized.divisi, null);
assert.equal(parsed.hash.length, 64);
assert.throws(() => parseMembershipWorkbook(Buffer.from('not-xlsx')));
