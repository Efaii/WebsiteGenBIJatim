/**
 * Utilitas tampilan untuk halaman detail komisariat.
 *
 * Fungsi murni tanpa JSX supaya bisa dipakai panel server maupun client.
 */

import type { ProkerData } from "@repo/types";

/** Rapikan spasi ganda dan baris baru dari data Excel. */
export const tidyText = (text: string): string => text.replace(/\s+/g, " ").trim();

/** True kalau teks punya isi yang layak ditampilkan (bukan kosong atau "-"). */
export const isMeaningfulText = (text: string | null | undefined): boolean => {
  if (typeof text !== "string") return false;
  const tidy = tidyText(text).replace(/[\u2013\u2014]/g, "-");
  return tidy.length > 0 && !/^-+$/.test(tidy);
};

/** Nama tampilan halaman: "ITS" -> "Komisariat ITS". */
export const commissariatDisplayName = (name: string): string =>
  /genbi|komisariat/i.test(name) ? tidyText(name) : `Komisariat ${tidyText(name)}`;

/** Inisial untuk avatar huruf: "Michael William" -> "MW". */
export const initialsOf = (name: string): string =>
  tidyText(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

/**
 * Peringkat jabatan untuk urutan tampilan; kecil berarti lebih tinggi.
 * Dipakai untuk struktur kepengurusan dan urutan tabel awardee.
 *
 * Urutan BPH: Ketua Umum, Wakil Ketua, Sekretaris Umum, Wakil Sekretaris,
 * Bendahara Umum, Wakil Bendahara. Urutan dalam divisi: Ketua/Kepala Divisi,
 * Wakil Ketua/Kepala Divisi, Sekretaris Divisi, Bendahara Divisi, lalu Staff.
 * Fungsi ini toleran terhadap variasi penulisan antar-komisariat (KADIV,
 * SEKDIV, Ketua/Kepala, Anggota/Staff, dst.) supaya baris kepengurusan tetap
 * tersusun benar walau data lama belum terseragamkan.
 */
export const positionRank = (position: string): number => {
  const value = position.toLowerCase();

  // Jabatan tingkat divisi lebih spesifik, jadi diperiksa lebih dulu.
  if (value.includes("ketua divisi")) return value.includes("wakil") ? 41 : 40;
  if (value.includes("kepala divisi")) return value.includes("wakil") ? 41 : 40;
  if (value.includes("ketua/kepala")) return value.includes("wakil") ? 41 : 40;
  if (value.includes("kadiv")) return 40;
  if (value.includes("sekdiv") || value.includes("sekretaris divisi")) return 42;
  if (value.includes("bendahara divisi")) return 43;
  // Sub-divisi (mis. ITS) tampil setelah jajaran inti divisi, sebelum staff.
  if (value.includes("sub divisi")) return 50;

  // BPH.
  if (value.includes("wakil ketua")) return 10;
  if (value.includes("ketua umum")) return 0;
  if (value.includes("wakil sekretaris")) return 21;
  if (value.includes("sekretaris umum")) return 20;
  if (value.includes("wakil bendahara")) return 31;
  if (value.includes("bendahara umum")) return 30;

  // Cadangan untuk penulisan yang belum terseragamkan.
  if (value.trim() === "ketua") return 0;
  if (value.includes("wakil")) return 41;
  if (value.includes("ketua") || value.includes("kepala")) return 40;
  if (value.includes("sekretaris")) return 20;
  if (value.includes("bendahara")) return 30;
  if (value.includes("non staff")) return 70;
  if (
    value.includes("staff") ||
    value.includes("staf") ||
    value.includes("anggota")
  ) {
    return 60;
  }
  return 65;
};

/** Salinan daftar anggota terurut: jabatan dulu, lalu nama. */
export const sortMembers = <T extends { name: string; position: string }>(
  members: T[],
): T[] =>
  [...members].sort(
    (a, b) =>
      positionRank(a.position) - positionRank(b.position) ||
      a.name.localeCompare(b.name, "id"),
  );

/**
 * Urutan tabel awardee: jabatan paling tinggi dulu, lalu divisi, lalu nama.
 * "Non Staff" otomatis berada di bawah karena peringkatnya paling besar.
 */
export const sortAwardees = <
  T extends { name: string; position: string; division: string },
>(
  list: T[],
): T[] =>
  [...list].sort(
    (a, b) =>
      positionRank(a.position) - positionRank(b.position) ||
      (a.division ?? "").localeCompare(b.division ?? "", "id") ||
      a.name.localeCompare(b.name, "id"),
  );

/**
 * Gambar dokumentasi pertama proker yang bisa dipakai `next/image`.
 * Urutan: kolom `image`, lalu galeri foto. Path yang tidak valid diabaikan
 * supaya `next/image` tidak pernah menerima URL rusak.
 */
export const prokerImage = (program: {
  image?: string;
  gallery?: string[];
}): string | null => {
  const candidates = [
    program.image,
    ...(Array.isArray(program.gallery) ? program.gallery : []),
  ];
  for (const candidate of candidates) {
    const value = typeof candidate === "string" ? candidate.trim() : "";
    if (value && (value.startsWith("/") || /^https?:\/\//.test(value))) {
      return value;
    }
  }
  return null;
};

/**
 * Kunci identitas sebuah foto dokumentasi.
 *
 * Nama file berupa hash isi (32+ karakter heksadesimal) dipakai apa adanya:
 * satu kegiatan bisa tersalin ke beberapa folder proker dengan isi yang
 * identik, jadi yang menentukan foto itu kembar adalah nama hash-nya, bukan
 * path foldernya. Nama generik seperti "foto1.webp" tidak menandakan isi
 * yang sama, jadi identitasnya adalah path lengkap.
 */
export const imageIdentity = (path: string): string => {
  const name = path.split("/").pop() ?? path;
  return /^[0-9a-f]{32,}\.[a-z0-9]+$/i.test(name) ? name.toLowerCase() : path;
};

/** Jumlah kartu proker per halaman versi dasar. */
export const PROKER_PER_PAGE = 12;

/**
 * Ukuran halaman daftar proker.
 *
 * Dasar 12 kartu; kalau sisa pembagiannya tepat satu kartu, halaman pertama
 * memakai 13 kartu supaya tidak ada kartu sendirian di halaman terakhir.
 * Contohnya komisariat ITS yang punya 13 proker: semuanya tampil utuh dalam
 * satu halaman.
 */
export const prokerPageSize = (total: number): number =>
  total > PROKER_PER_PAGE && total % PROKER_PER_PAGE === 1
    ? PROKER_PER_PAGE + 1
    : PROKER_PER_PAGE;

export type ProkerCuration = {
  /** Urutan tampil setelah penyesuaian halaman. */
  order: ProkerData[];
  /** Foto terpilih per id proker, untuk thumbnail kartu. */
  imageById: Map<string, string>;
};

/**
 * Kurasi tampilan daftar proker:
 *
 * 1. Foto berbeda untuk proker dengan dokumentasi sama (mis. satu kegiatan
 *    yang diklaim beberapa divisi): kartu kedua dan seterusnya memakai foto
 *    berikutnya yang belum terpakai, bukan menyalin thumbnail yang sama.
 * 2. Kalau dua kartu tetap berbagi foto identik (galerinya hanya satu foto),
 *    kemunculan pertama dipindah ke awal halaman berikutnya dan ditukar
 *    dengan kartu pertama halaman itu, supaya dokumentasi kembar tidak
 *    tampil dalam satu halaman.
 */
export const curateProker = (
  ordered: ProkerData[],
  pageSize: number,
): ProkerCuration => {
  const idOf = (item: ProkerData) => String(item.id);

  // Langkah 1: pilih foto yang belum terpakai supaya thumbnail tidak kembar.
  const imageById = new Map<string, string>();
  const usedImages = new Set<string>();
  for (const item of ordered) {
    const candidates = [
      item.image,
      ...(Array.isArray(item.gallery) ? item.gallery : []),
    ]
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(
        (value) =>
          value.length > 0 &&
          (value.startsWith("/") || /^https?:\/\//.test(value)),
      );
    if (candidates.length === 0) continue;
    const fresh = candidates.find(
      (value) => !usedImages.has(imageIdentity(value)),
    );
    const chosen = fresh ?? candidates[0];
    imageById.set(idOf(item), chosen);
    usedImages.add(imageIdentity(chosen));
  }

  // Langkah 2: pisahkan kartu yang fotonya tetap tidak bisa dibedakan.
  const order = [...ordered];
  const identityById = new Map(
    order.map((item) => {
      const chosen = imageById.get(idOf(item));
      return [idOf(item), chosen ? imageIdentity(chosen) : null];
    }),
  );
  const firstSeen = new Map<string, number>();
  for (let index = 0; index < order.length; index += 1) {
    const identity = identityById.get(idOf(order[index]));
    if (!identity) continue;
    const previous = firstSeen.get(identity);
    if (previous === undefined) {
      firstSeen.set(identity, index);
      continue;
    }
    // Kartu yang baru saja dipindah tidak dihitung ulang.
    if (previous === index) continue;
    if (Math.floor(previous / pageSize) !== Math.floor(index / pageSize)) {
      continue;
    }

    const targetIndex = (Math.floor(previous / pageSize) + 1) * pageSize;
    if (targetIndex >= order.length) continue;
    [order[previous], order[targetIndex]] = [
      order[targetIndex],
      order[previous],
    ];
    firstSeen.set(identity, targetIndex);
  }

  return { order, imageById };
};

/**
 * Label tanggal program untuk kartu tanpa dokumentasi.
 * Tanggal kalender diprioritaskan atas dateLabel supaya kartu tetap ringkas;
 * label bebas dipakai saat tanggalnya tidak bisa dipecah (mis. "Setiap Senin").
 */
export type DateChip =
  | { kind: "day"; month: string; day: string }
  | { kind: "month"; month: string; year: string }
  | { kind: "label"; text: string };

export const programDateChip = (program: {
  date: string;
  dateLabel?: string | null;
}): DateChip => {
  const candidates = [program.date, program.dateLabel]
    .map((value) => tidyText(String(value ?? "")))
    .filter((value) => value.length > 0);
  for (const value of candidates) {
    const parts = value.split(" ");
    if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(value)) {
      return { kind: "day", month: parts[1], day: parts[0] };
    }
    if (/^[A-Za-z]+\s+\d{4}$/.test(value)) {
      return { kind: "month", month: parts[0], year: parts[1] };
    }
  }
  return { kind: "label", text: candidates[0] ?? "" };
};

/** Kode divisi proker yang memang akronim, ditampilkan kapital penuh. */
const DIVISION_ACRONYMS = new Set([
  "psdm",
  "bph",
  "lh",
  "lhkm",
  "ppr",
  "kwu",
  "ekraf",
  "kominfo",
  "medinfo",
]);

/**
 * Label divisi proker: "sosling" -> "Sosling", "psdm" -> "PSDM".
 * Nama lengkap yang sudah rapi dibiarkan apa adanya; nilai di database
 * campur antara kode dan nama panjang, jadi jangan mengarang pemetaan.
 */
export const divisionLabel = (code: string | null | undefined): string => {
  const value = tidyText(String(code ?? ""));
  if (!value || value === "-") return "";
  if (DIVISION_ACRONYMS.has(value.toLowerCase())) return value.toUpperCase();
  if (/^[a-z]+$/.test(value)) return value.charAt(0).toUpperCase() + value.slice(1);
  return value;
};

/**
 * Jendela nomor halaman untuk pagination, sama dengan halaman /awardee:
 * halaman pertama, terakhir, dan tetangga halaman aktif; sisanya elipsis.
 */
export const buildPageList = (
  current: number,
  total: number,
): Array<number | "gap"> => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const items: Array<number | "gap"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("gap");
  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }
  if (end < total - 1) items.push("gap");
  items.push(total);
  return items;
};

/** URL Instagram dari handle yang mungkin kosong atau sudah berupa URL. */
export const instagramUrl = (value: string | null | undefined): string | null => {
  const raw = tidyText(String(value ?? "")).replace(/^@/, "");
  if (!isMeaningfulText(raw)) return null;
  return raw.startsWith("http") ? raw : `https://instagram.com/${raw}`;
};

/** Label handle Instagram untuk chip. */
export const instagramLabel = (value: string | null | undefined): string => {
  const raw = tidyText(String(value ?? ""));
  return raw.startsWith("http") ? "Instagram" : `@${raw.replace(/^@/, "")}`;
};

/** Alamat email yang layak dipakai tautan mailto. */
export const contactEmail = (value: string | null | undefined): string | null => {
  const raw = tidyText(String(value ?? ""));
  return isMeaningfulText(raw) && raw.includes("@") ? raw : null;
};
