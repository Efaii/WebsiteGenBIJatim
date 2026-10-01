import XLSX from "@e965/xlsx";
import { REQUIRED_HEADERS } from "./membership-import.service";

/*
 * Template impor Awardee.
 *
 * Satu Interface kecil — "hasilkan berkas template" — dengan satu sumber
 * kebenaran: daftar kolom diturunkan dari REQUIRED_HEADERS milik parser,
 * jadi kolom ekstra (mis. "No." atau "Periode") mustahil muncul. Berkas
 * diuji round-trip dengan parser resmi: template harus lolos validasi
 * header dan terbaca sebagai nol baris data.
 */

const DISPLAY_HEADERS: Record<(typeof REQUIRED_HEADERS)[number], string> = {
  komisariat: "Komisariat",
  nama: "Nama Lengkap",
  jabatan: "Jabatan",
  divisi: "Divisi",
  prodi: "Prodi",
};

export const TEMPLATE_HEADERS = REQUIRED_HEADERS.map(
  (header) => DISPLAY_HEADERS[header],
);

export const TEMPLATE_EMPTY_ROWS = 50;

export const buildMembershipImportTemplate = (): Buffer => {
  const rows = [
    [...TEMPLATE_HEADERS],
    ...Array.from({ length: TEMPLATE_EMPTY_ROWS }, () =>
      TEMPLATE_HEADERS.map(() => ""),
    ),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  // Rentang eksplisit supaya 50 baris kosong benar-benar ada di sheet.
  sheet["!ref"] = `A1:E${TEMPLATE_EMPTY_ROWS + 1}`;
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Data");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
};
