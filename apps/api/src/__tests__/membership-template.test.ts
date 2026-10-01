import assert from "node:assert/strict";
import XLSX from "@e965/xlsx";
import { parseMembershipWorkbook } from "../services/membership-import.service";
import {
  buildMembershipImportTemplate,
  TEMPLATE_EMPTY_ROWS,
  TEMPLATE_HEADERS,
} from "../services/membership-import-template";

/*
 * Round-trip template impor: berkas yang dihasilkan modul template harus
 * langsung lolos parser resmi — header diterima, nol baris data, dan rentang
 * sheet memuat 50 baris kosong.
 */

assert.deepEqual(TEMPLATE_HEADERS, [
  "Komisariat",
  "Nama Lengkap",
  "Jabatan",
  "Divisi",
  "Prodi",
]);

const buffer = buildMembershipImportTemplate();
assert.equal(
  buffer.subarray(0, 2).toString(),
  "PK",
  "template harus XLSX valid",
);

const parsed = parseMembershipWorkbook(buffer);
assert.equal(
  parsed.rows.length,
  0,
  "template tanpa isi tidak boleh menghasilkan baris data",
);

const workbook = XLSX.read(buffer, { type: "buffer" });
assert.equal(workbook.SheetNames.length, 1, "template harus satu sheet");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
assert.equal(
  sheet["!ref"],
  `A1:E${TEMPLATE_EMPTY_ROWS + 1}`,
  "sheet harus memuat 50 baris kosong",
);

// Header template harus dinormalkan parser ke daftar kanonik (tanpa kolom ekstra).
const headerRow = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
  header: 1,
  blankrows: false,
  defval: null,
})[0] as unknown[];
assert.equal(headerRow.length, 5, "tidak boleh ada kolom tambahan");

console.log("All membership template assertions passed successfully!");
