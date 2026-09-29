import type { ProkerData } from "@repo/types";

/** Jumlah kegiatan di panel "Kegiatan Terakhir". */
export const RECENT_ACTIVITY_COUNT = 5;

/**
 * Tanggal hari ini di zona waktu pengunjung, format YYYY-MM-DD. Dipakai agar
 * panel "Kegiatan Terakhir" hanya memuat kegiatan yang sudah berlangsung;
 * sebagian baris Excel memuat tanggal rencana yang belum terjadi.
 */
export const todayIso = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

/**
 * Proker dianggap punya dokumentasi bila galeri fotonya terisi. Panel
 * "Kegiatan Terakhir" hanya memuat kegiatan yang ada dokumentasinya supaya
 * tidak ada entri tanpa bukti visual, sekalipun tanggalnya paling baru.
 */
export const hasDocumentation = (program: ProkerData): boolean =>
  Array.isArray(program.gallery) && program.gallery.length > 0;

/**
 * Kegiatan untuk panel "Kegiatan Terakhir": sudah berlangsung (tanggal
 * kalender tidak melewati hari ini), berstatus selesai, punya dokumentasi
 * foto, diurutkan dari yang paling baru, lalu dibatasi jumlahnya.
 *
 * Dipakai server (render awal) dan klien (tombol "Coba Lagi") supaya aturannya
 * hanya ada di satu tempat.
 */
export const selectRecentActivities = (programs: ProkerData[]): ProkerData[] =>
  programs
    .filter(
      (program) =>
        program.dateIso &&
        program.dateIso <= todayIso() &&
        program.status === "Completed" &&
        hasDocumentation(program),
    )
    .sort((a, b) => (b.dateIso ?? "").localeCompare(a.dateIso ?? ""))
    .slice(0, RECENT_ACTIVITY_COUNT);
