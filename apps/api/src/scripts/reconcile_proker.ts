import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { isPublicProgram as isPublicProgramProjection } from "../domain/public-program";
import * as xlsx from "@e965/xlsx";
import stringSimilarity from "string-similarity";
import sharp from "sharp";

/**
 * Safe reconciliation tool for the normalized Program Kerja source.
 *
 * The default mode is read-only. Data writes remain blocked until review-only
 * matches are resolved and the separate data migration workflow is approved.
 *
 * This script never deletes Program Kerja records or existing photo files.
 */

const SUPPORTED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
type MatchType =
  | "EXACT_MATCH"
  | "POSSIBLE_MATCH"
  | "NEW_PROGRAM"
  | "LEGACY_ONLY"
  | "CONFLICT"
  | "DATABASE_UNAVAILABLE";
type ProgramAction =
  | "UPDATE"
  | "ACTIVE_INSERT"
  | "CANCELLED_SKIP"
  | "CANCELLED_EXISTING_ARCHIVE"
  | "DOCUMENTED_DATABASE_ONLY_ARCHIVE"
  | "UNDOCUMENTED_DATABASE_ONLY_ARCHIVE"
  | "SOURCE_EXCLUDED_ARCHIVE"
  | "REVIEW"
  | "DATABASE_UNAVAILABLE"
  | "UNCHANGED";
type PhotoAction =
  | "LEGACY_PHOTO_REGISTRATION"
  | "NEW_WEBP"
  | "DUPLICATE"
  | "SKIPPED_PHOTO"
  | "ORPHAN";

interface SourceProgram {
  sourceFile: string;
  sourceRow: number;
  commissariat: string;
  division: string;
  programKe: number;
  title: string;
  slug: string;
  status: string;
  date: string | null;
  dateLabel: string | null;
  format: string;
  description: string;
  kpi: string;
  impact: string;
  evaluation: string;
  proposalLink: string | null;
  docsLink: string | null;
  lpjLink: string | null;
  explicitId: string | null;
  collaborationGroup: string | null;
  sourceExcluded: boolean;
}

interface LegacyProgram {
  id: string;
  commissariatId: string;
  commissariat: string;
  commissariatSlug: string;
  programKe: number;
  title: string;
  division: string;
  date: string | null;
  format: string;
  status: string;
  description: string;
  kpi: string | null;
  impact: string | null;
  evaluation: string | null;
  photos: string[];
  legacyPhotos: string[];
  childPhotos: string[];
  validPhotos: Array<{ filePath: string; fileHash: string }>;
  documentationEvidence: boolean;
}

interface SourcePhotoFolder {
  commissariatFolder: string;
  prokerFolder: string;
  files: string[];
}

type PhotoMatch = {
  program: SourceProgram | null;
  type: "EXACT_MATCH" | "UNMATCHED";
  score: number;
  reason: string;
};

interface ProgramPlan {
  source: SourceProgram;
  matchType: MatchType;
  legacy: LegacyProgram | null;
  confidence: number;
  reason: string;
  metadataChanges: string[];
  action: ProgramAction;
  programId: string | null;
}

interface PhotoPlan {
  sourceFolder: string;
  sourcePath: string;
  commissariat: string;
  prokerFolder: string;
  targetProgramIds: string[];
  file: string;
  extension: string;
  bytes: number;
  sourceSha256: string | null;
  finalWebpSha256: string | null;
  sha256: string | null;
  destinationWebpPath: string | null;
  destinationWebpPaths: string[];
  targetActions: Array<{
    programId: string;
    action: PhotoAction;
    destinationWebpPath: string | null;
  }>;
  action: PhotoAction;
  reason: string;
}

interface PhotoAlias {
  commissariat: string;
  folder: string;
  titles: Array<{ title: string; division?: string }>;
}

const rootFromCwd = () => {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "data/proker"),
    path.resolve(cwd, "../data/proker"),
    path.resolve(cwd, "../../data/proker"),
    path.resolve(cwd, "../../../data/proker"),
  ];
  return (
    candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
  );
};

const args = process.argv.slice(2);
const hasFlag = (flag: string) => args.includes(flag);
const cleanArgument = (value: string | undefined) =>
  value?.trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, (_, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted);
const argument = (name: string) => {
  const inlineIndex = args.findIndex((value) => value.startsWith(`${name}=`));
  const exactIndex = args.indexOf(name);
  const index = inlineIndex >= 0 ? inlineIndex : exactIndex;
  if (index < 0) return undefined;
  const first = inlineIndex >= 0 ? args[index].slice(name.length + 1) : args[index + 1];
  const values = [first];
  let next = index + (inlineIndex >= 0 ? 1 : 2);
  while (next < args.length && !args[next].startsWith("--")) values.push(args[next++]);
  return cleanArgument(values.filter(Boolean).join(" "));
};

const SOURCE_ROOT = path.resolve(argument("--source-dir") || rootFromCwd());
const EXCEL_ROOT = path.join(SOURCE_ROOT, "Data Program Kerja Updated");
const PHOTO_ROOT = path.join(SOURCE_ROOT, "Dokumentasi Proker");
const findProjectRoot = (sourceRoot: string) => {
  let current = path.resolve(sourceRoot);
  for (let depth = 0; depth < 6; depth += 1) {
    if (fs.existsSync(path.join(current, "apps/web")) && fs.existsSync(path.join(current, "apps/api"))) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(`Unable to locate monorepo root from source directory: ${sourceRoot}`);
};
const PROJECT_ROOT = findProjectRoot(SOURCE_ROOT);
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "apps/web/public");
const REPORT_PATH = path.resolve(
  argument("--report") ||
    path.join(PROJECT_ROOT, "docs/proker-reconciliation-dry-run.md"),
);
const JSON_REPORT_PATH = REPORT_PATH.replace(/\.md$/i, ".json");
const DATABASE_TIMEOUT_MS = 10_000;
const DATA_APPROVAL = "SETUJUI DATA MIGRASI";
const SCHEMA_APPROVAL = "SETUJUI SCHEMA MIGRASI";
const preparedWebpBuffers = new Map<string, Buffer>();

const canonicalize = (value: unknown): unknown => Array.isArray(value)
  ? value.map(canonicalize)
  : value && typeof value === "object"
    ? Object.fromEntries(
        Object.keys(value as Record<string, unknown>)
          .sort()
          .map((key) => [key, canonicalize((value as Record<string, unknown>)[key])]),
      )
    : value;

const fingerprint = (value: unknown) =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");

type PhotoWork = {
  folder: SourcePhotoFolder;
  file: string;
  extension: string;
  relative: string;
  sourceBytes: number;
  validTargets: ProgramPlan[];
  hasCancelledTarget: boolean;
  hasReviewTarget: boolean;
  mappingReasons: string[];
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const normalizeCompact = (value: unknown) =>
  normalizeText(value).replace(/\s/g, "");
const DIVISION_ALIASES: Record<string, string> = {
  "social environment": "sosling",
  "organizational development": "psdm",
  "public relation": "hublu",
};
const normalizeDivision = (value: unknown) => {
  const normalized = normalizeText(value)
    .replace(/^divisi\s+/, "")
    .trim();
  return DIVISION_ALIASES[normalized] ?? normalized;
};

const TITLE_IDENTITY_ALIASES: Array<[string, string]> = [
  [
    "aksi sehat berbagi makanan bergizi genbi baso",
    "aksi sehat berbagi makanan bergizi",
  ],
  [
    "aksi sehat check up kesehatan genbi mancing",
    "aksi sehat check up kesehatan",
  ],
  ["pelita bucket bunga x psdm", "bucket bunga x psdm"],
];

const sameProgramTitle = (sourceTitle: string, legacyTitle: string) => {
  const source = normalizeText(sourceTitle);
  const legacy = normalizeText(legacyTitle);
  return (
    source === legacy ||
    TITLE_IDENTITY_ALIASES.some(
      ([from, to]) => source === from && legacy === to,
    )
  );
};

const commissariatKey = (value: unknown) => {
  const compact = normalizeCompact(value);
  if (
    compact === "uin" ||
    compact.includes("uinmadura") ||
    compact.includes("iainmadura")
  )
    return "uin-madura";
  if (compact.includes("upnvjt") || compact.includes("upnveteranjatim"))
    return "upnvjt";
  return compact;
};

const clean = (value: unknown) =>
  typeof value === "string"
    ? value.trim()
    : value == null
      ? ""
      : String(value).trim();

const isPlaceholder = (value: unknown) =>
  ["", "-", "—", "–", "n/a", "na", "null"].includes(
    clean(value).toLowerCase(),
  );

const relativeProjectPath = (filePath: string) =>
  path.relative(PROJECT_ROOT, filePath).replace(/\\/g, "/");

const firstNonEmpty = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (value != null && clean(value) !== "") return value;
  }
  return null;
};

const firstValue = (row: Record<string, unknown>, keys: string[]) =>
  clean(firstNonEmpty(row, keys));

const previewProgramId = (source: SourceProgram) => {
  const digest = crypto
    .createHash("sha256")
    .update(
      `${commissariatKey(source.commissariat)}\0${normalizeText(source.title)}\0${normalizeDivision(source.division)}`,
    )
    .digest("hex");
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-4${digest.slice(13, 16)}-${((parseInt(digest.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0")}${digest.slice(18, 20)}-${digest.slice(20, 32)}`;
};

const excelDate = (value: unknown, isoValue: unknown): string | null => {
  const iso = clean(isoValue);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(Date.parse(iso)))
    return iso;
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toISOString().slice(0, 10);
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString().slice(0, 10);
  }
  const text = clean(value);
  const dayFirst = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dayFirst) {
    const [, day, month, year] = dayFirst;
    return validIsoDate(Number(year), Number(month), Number(day));
  }
  const monthName = text.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i);
  if (monthName) {
    const monthIndex = MONTH_NAMES[normalizeText(monthName[2])];
    if (monthIndex !== undefined)
      return validIsoDate(
        Number(monthName[3]),
        monthIndex + 1,
        Number(monthName[1]),
      );
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(text)))
    return text;
  return null;
};

const MONTH_NAMES: Record<string, number> = {
  januari: 0,
  january: 0,
  jan: 0,
  februari: 1,
  february: 1,
  feb: 1,
  maret: 2,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  mei: 4,
  may: 4,
  juni: 5,
  june: 5,
  jun: 5,
  juli: 6,
  july: 6,
  jul: 6,
  agustus: 7,
  august: 7,
  agu: 7,
  aug: 7,
  september: 8,
  sep: 8,
  oktober: 9,
  october: 9,
  okt: 9,
  oct: 9,
  november: 10,
  nov: 10,
  desember: 11,
  december: 11,
  des: 11,
  dec: 11,
};

const validIsoDate = (
  year: number,
  month: number,
  day: number,
): string | null => {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return date.toISOString().slice(0, 10);
};

const legacyDate = (value: unknown): string | null => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10);
};

const statusToExecution = (status: string) => {
  const normalized = normalizeText(status);
  if (normalized.includes("cancel")) return "CANCELLED";
  if (
    normalized.includes("ongoing") ||
    normalized.includes("progress") ||
    normalized.includes("on going")
  )
    return "ONGOING";
  if (
    normalized.includes("complete") ||
    normalized.includes("done") ||
    normalized.includes("selesai")
  )
    return "COMPLETED";
  return "PLANNED";
};

const statusFromExcludedSheet = (row: Record<string, unknown>) => {
  const original = firstValue(row, [
    "status_excel",
    "original_status",
    "status_asli",
    "status_source_excel",
    "original_status_excel",
    "status",
    "Status",
    "Status Excel",
  ]);
  const final = firstValue(row, ["status_final", "Status Final"]);
  const decision = firstValue(row, ["keputusan", "reason", "alasan", "note"]);
  if (
    statusToExecution(original) === "CANCELLED" ||
    statusToExecution(decision) === "CANCELLED"
  )
    return "cancelled";
  if (statusToExecution(original) === "ONGOING") return "ongoing";
  return final || original || decision;
};

const displayStatus = (status: string) => {
  const execution = statusToExecution(status);
  return execution === "COMPLETED"
    ? "Completed"
    : execution === "ONGOING"
      ? "On Progress"
      : execution === "CANCELLED"
        ? "Cancelled"
        : "Planned";
};

const photoActionFor = (
  programAction: ProgramAction,
  duplicate: boolean,
  sourceFile = false,
): PhotoAction =>
  duplicate
    ? "DUPLICATE"
    : sourceFile || programAction === "ACTIVE_INSERT"
      ? "NEW_WEBP"
      : "LEGACY_PHOTO_REGISTRATION";

export const reconciliationRules = {
  normalizeCommissariat: commissariatKey,
  normalizeDivision,
  isPlaceholder,
  sameProgramTitle,
  statusToExecution,
  statusFromExcludedSheet,
  isPublicProgram: isPublicProgramProjection,
  photoActionFor,
  excelDate,
  legacyOnlyAction(hasDocumentation: boolean): ProgramAction {
    return hasDocumentation
      ? "DOCUMENTED_DATABASE_ONLY_ARCHIVE"
      : "UNDOCUMENTED_DATABASE_ONLY_ARCHIVE";
  },
  cancelledAction(hasExistingRecord: boolean): ProgramAction {
    return hasExistingRecord ? "CANCELLED_EXISTING_ARCHIVE" : "CANCELLED_SKIP";
  },
  photoMayTarget(action: ProgramAction) {
    return (
      action !== "CANCELLED_SKIP" &&
      action !== "CANCELLED_EXISTING_ARCHIVE" &&
      action !== "SOURCE_EXCLUDED_ARCHIVE" &&
      action !== "REVIEW" &&
      action !== "DATABASE_UNAVAILABLE"
    );
  },
};

const markdown = (value: unknown) =>
  String(value ?? "-")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");

const PHOTO_ALIASES: PhotoAlias[] = [
  {
    commissariat: "uin-madura",
    folder: "Genbi Lestari",
    titles: [
      { title: "GenBI Berseri (GenBI Bersih dan Lestari)", division: "LHKM" },
    ],
  },
  {
    commissariat: "uin-madura",
    folder: "Gender",
    titles: [{ title: "GenDer (GenBI In Dermaga)", division: "Kewirausahaan" }],
  },
  {
    commissariat: "pens",
    folder: "Bakso",
    titles: [
      { title: "GenBI Baso", division: "LHS" },
      {
        title: "Aksi Sehat: Berbagi Makanan Bergizi (genBi BASO)",
        division: "KESMA",
      },
      { title: "Pendidikan Anak Panti", division: "PENKRAF" },
    ],
  },
  {
    commissariat: "pens",
    folder: "Video Edukasi",
    titles: [
      { title: "Konten Edukasi", division: "MEDFO" },
      { title: "Konten Edukasi", division: "PENKRAF" },
    ],
  },
  {
    commissariat: "uin-madura",
    folder: "EcoGen",
    titles: [
      { title: "EcoGen (Economic GenBI Seminar)", division: "pendidikan" },
    ],
  },
  {
    commissariat: "uin-madura",
    folder: "Ensiklopedia",
    titles: [{ title: "ENSIKLOPEBI", division: "kominfo" }],
  },
  {
    commissariat: "uin-madura",
    folder: "Gelar",
    titles: [{ title: "Gelar (GenBI Olahraga)", division: "lhkm" }],
  },
  {
    commissariat: "uin-madura",
    folder: "Genbi Store",
    titles: [{ title: "GenBI Store", division: "kewirausahaan" }],
  },
  {
    commissariat: "uin-madura",
    folder: "Genbi Story",
    titles: [
      { title: "GenStory (GenBI Story Periode)", division: "pendidikan" },
    ],
  },
  {
    commissariat: "uin-madura",
    folder: "Kurma",
    titles: [{ title: "KURMA (Kutipan Ramadhan)", division: "kominfo" }],
  },
  {
    commissariat: "uin-madura",
    folder: "Lomba StoryTelling",
    titles: [
      { title: "GLORY (GenBI Lomba Story Telling)", division: "kominfo" },
    ],
  },
  {
    commissariat: "uin-madura",
    folder: "NOBARS",
    titles: [
      {
        title: "NOBARS (Ngobrol Bareng Soal Bank Sentral)",
        division: "pendidikan",
      },
    ],
  },
  {
    commissariat: "uin-madura",
    folder: "Opor Genbi",
    titles: [{ title: "Opor GenBI", division: "kewirausahaan" }],
  },
  {
    commissariat: "uin-madura",
    folder: "Seo Gim",
    titles: [
      {
        title: "Seo-gim (Smart Education Olympiad GenBI UIN Madura)",
        division: "pendidikan",
      },
    ],
  },
  {
    commissariat: "uin-madura",
    folder: "Serabi",
    titles: [
      { title: "SERABI (Serangkaian Informasi GenBI)", division: "kominfo" },
    ],
  },
  {
    commissariat: "uinsa",
    folder: "Brand Ambassador GenBI UINSA",
    titles: [{ title: "Brand Ambassador GenBI UINSA", division: "bph" }],
  },
  {
    commissariat: "uinsa",
    folder: "Company Profile",
    titles: [{ title: "Company Profile GenBI UINSA", division: "medinfo" }],
  },
  {
    commissariat: "uinsa",
    folder: "Connecting Each Other (CEO)",
    titles: [{ title: "Connecting Each Other (CEO)", division: "medinfo" }],
  },
  {
    commissariat: "uinsa",
    folder: "GenBI IDXplore",
    titles: [
      {
        title:
          "GenBI IDXplore : Goes to PT Bursa Efek Indonesia (Indonesia Stock Exchange) Surabaya",
        division: "parekraf",
      },
    ],
  },
  {
    commissariat: "uinsa",
    folder: "GeShare X GBP",
    titles: [
      {
        title: "GeShare X GBP (GenBI Sharing Room X GenBI Book Party)",
        division: "pendidikan",
      },
    ],
  },
  {
    commissariat: "uinsa",
    folder: "Lomba Infografis",
    titles: [
      {
        title:
          'Lomba Infografis "Creative Action for Green Economy from Innovation to Sustainable Impact"',
        division: "lh",
      },
    ],
  },
  {
    commissariat: "uinsa",
    folder: "Oase EduTrip",
    titles: [
      {
        title: "Oase EduTrip : Learning and Growing at Kampung Oase Songo",
        division: "lh",
      },
    ],
  },
  {
    commissariat: "uinsa",
    folder: "Rapat Kerja Batch II",
    titles: [{ title: "Rapat Kerja Batch II", division: "bph" }],
  },
  {
    commissariat: "uinsa",
    folder: "Sosialiasi Pendaftaran Beasiswa",
    titles: [{ title: "Sosialisasi Pendaftaran Beasiswa", division: "bph" }],
  },
  {
    commissariat: "unair",
    folder: "Blood",
    titles: [{ title: "GenBI Blood for Hope", division: "pengmas" }],
  },
  {
    commissariat: "unair",
    folder: "Company Profile",
    titles: [{ title: "GenBI Company Profile", division: "medkom" }],
  },
  {
    commissariat: "unair",
    folder: "Company Visit",
    titles: [{ title: "GenBI Company Visit", division: "hublu" }],
  },
  {
    commissariat: "unair",
    folder: "EduAction",
    titles: [{ title: "EduAction", division: "pendidikan" }],
  },
  {
    commissariat: "unair",
    folder: "Farewall Party",
    titles: [{ title: "Eternal Party (farewall party)", division: "psdm" }],
  },
  {
    commissariat: "unair",
    folder: "Genbi Info",
    titles: [{ title: "GenBI Info", division: "medkom" }],
  },
  {
    commissariat: "unair",
    folder: "ID Card",
    titles: [{ title: "GenBI Identity", division: "ekraf" }],
  },
  {
    commissariat: "unair",
    folder: "Komedia",
    titles: [{ title: "KOMEDIA", division: "medkom" }],
  },
  {
    commissariat: "unesa",
    folder: "Content Matrix",
    titles: [{ title: "Content Matrix", division: "media dan informasi" }],
  },
  {
    commissariat: "unesa",
    folder: "Genbi Ambassador",
    titles: [
      { title: "GenBI Ambassador UNESA", division: "media dan informasi" },
    ],
  },
  {
    commissariat: "unesa",
    folder: "GFFD",
    titles: [
      { title: "GenBI Fit Fun Day (GFFD)", division: "kesehatan masyarakat" },
    ],
  },
  {
    commissariat: "unesa",
    folder: "GWC",
    titles: [
      { title: "GenBI Week Challenge's", division: "media dan informasi" },
    ],
  },
  {
    commissariat: "unesa",
    folder: "POINKES",
    titles: [
      {
        title: "Pojok Informasi Kesehatan (POINKES)",
        division: "kesehatan masyarakat",
      },
    ],
  },
  {
    commissariat: "unugiri",
    folder: "Bakti Sosial",
    titles: [
      {
        title:
          'Bakti Sosial "GenBI Cerdas, GenBI Peduli: Sehari Berbagi Ilmu, Selamanya Berbagi Kasih"',
        division: "sosma",
      },
    ],
  },
  {
    commissariat: "unugiri",
    folder: "Genbi Entrepreneur",
    titles: [
      {
        title:
          "GenBI Enterpreneur “Wirausaha Muda Inovatif untuk Ekonomi Bangsa”",
        division: "kwu",
      },
    ],
  },
  {
    commissariat: "unugiri",
    folder: "Gsmart qris",
    titles: [
      {
        title: "G-SMART QRIS (GenBI – Sosialisasi Mandiri & Akses Retail QRIS)",
        division: "kwu",
      },
    ],
  },
  {
    commissariat: "unugiri",
    folder: "Makrab",
    titles: [
      { title: "Makrab Anggota GenBI Komisariat UNUGIRI", division: "bph" },
    ],
  },
  {
    commissariat: "unugiri",
    folder: "Reboisasi",
    titles: [{ title: "GenBI Reboisasi", division: "lh" }],
  },
  {
    commissariat: "unugiri",
    folder: "Seminar Branding",
    titles: [
      {
        title:
          'Seminar Branding Digital ini mengangkat tema "Digital Authority: Strategi Pemanfaatan Media Sosial untuk Membangun Brand Value Organisasi dan Personal Credibility".',
        division: "medinfo",
      },
    ],
  },
  {
    commissariat: "upnvjt",
    folder: "EPT",
    titles: [
      { title: "English Proficiency Test Preparation", division: "PSDM" },
    ],
  },
  {
    commissariat: "upnvjt",
    folder: "Farewell Party",
    titles: [{ title: "GenBI Farewell Party", division: "PSDM" }],
  },
  {
    commissariat: "upnvjt",
    folder: "Future Scholars Talk",
    titles: [
      {
        title:
          "Future Scholars Talk: Webinar Tips & Trik Lolos Beasiswa BI 2026",
        division: "Pendidikan",
      },
    ],
  },
  {
    commissariat: "upnvjt",
    folder: "Genbi Coin",
    titles: [{ title: "GenBI COIN: Company Insight", division: "Pendidikan" }],
  },
  {
    commissariat: "upnvjt",
    folder: "Genbi Scale",
    titles: [
      {
        title: "Genbi Scale - Workshop Digitalisasi UMKM",
        division: "Ekonomi Kreatif",
      },
    ],
  },
  {
    commissariat: "upnvjt",
    folder: "Genbi Shine",
    titles: [
      {
        title: "Genbi Shine: Sharing Health, Inspiring New Education",
        division: "Sosial dan Lingkungan",
      },
      {
        title: "GenBI SHINE: Sharing Health, Inspiring New Education",
        division: "Pendidikan",
      },
    ],
  },
  {
    commissariat: "upnvjt",
    folder: "Inspire Talk",
    titles: [{ title: "Inspire Talk", division: "Hubungan Eksternal" }],
  },
  {
    commissariat: "upnvjt",
    folder: "Pelita",
    titles: [
      {
        title: "Pelita: Pelatihan Seni Merangkai Bunga Tangan",
        division: "PSDM",
      },
      { title: "Pelita (Bucket Bunga X PSDM)", division: "Ekonomi Kreatif" },
    ],
  },
];

const sourceRootLabel = () => {
  const relative = path.relative(PROJECT_ROOT, SOURCE_ROOT).replace(/\\/g, "/");
  return relative || ".";
};

const sourceIdentityKey = (source: SourceProgram) =>
  `${commissariatKey(source.commissariat)}\0${normalizeText(source.title)}\0${normalizeDivision(source.division)}`;

const markSourceCollisions = (plans: ProgramPlan[]) => {
  const groups = new Map<string, ProgramPlan[]>();
  for (const planItem of plans) {
    if (planItem.source.sourceFile === "-") continue;
    const key = sourceIdentityKey(planItem.source);
    const group = groups.get(key) ?? [];
    group.push(planItem);
    groups.set(key, group);
  }
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    for (const planItem of group) {
      planItem.matchType = "CONFLICT";
      planItem.action = "REVIEW";
      planItem.programId = null;
      planItem.reason = `Duplicate source identity collision; ${group.length} rows share ${key.replace(/\0/g, " / ")}.`;
    }
  }
};

const findPhotoAlias = (folder: SourcePhotoFolder) =>
  PHOTO_ALIASES.find(
    (alias) =>
      commissariatKey(alias.commissariat) ===
        commissariatKey(folder.commissariatFolder) &&
      normalizeText(alias.folder) === normalizeText(folder.prokerFolder),
  );

const readSourcePrograms = (): SourceProgram[] => {
  if (!fs.existsSync(EXCEL_ROOT))
    throw new Error(`Excel source directory not found: ${EXCEL_ROOT}`);
  const programs: SourceProgram[] = [];
  const workbookFiles = fs
    .readdirSync(EXCEL_ROOT)
    .filter((name) => /\.xlsx?$/i.test(name))
    .sort();
  if (!workbookFiles.length) throw new Error(`No normalized Excel workbooks found: ${EXCEL_ROOT}`);
  for (const fileName of workbookFiles) {
    const workbook = xlsx.readFile(path.join(EXCEL_ROOT, fileName));
    const defaultCommissariat = fileName
      .replace(/_.*$/, "")
      .replace(/_/g, " ")
      .trim();
    const worksheet = workbook.Sheets.proker;
    if (!worksheet) throw new Error(`Workbook ${fileName} is missing the required proker sheet.`);
    const invalidRows: number[] = [];
    const appendRows = (
      rows: Record<string, unknown>[],
      sourceExcluded = false,
    ) =>
      rows.forEach((row, index) => {
        const rawTitle = clean(
          row.title ||
            row["Nama Proker"] ||
            row.Proker ||
            row["Program Kerja"] ||
            row["Nama/Status"],
        );
        if (isPlaceholder(rawTitle)) return;
        const title = rawTitle;
        const commissariat =
          clean(row.commissariat || row.komisariat || row.Komisariat) ||
          defaultCommissariat;
        const hasAnyValue = Object.values(row).some((value) => clean(value) !== "");
        if (!title || !commissariat) {
          if (hasAnyValue) invalidRows.push(index + 2);
          return;
        }
        const programKe = Number(row.programKe || row.program_ke || row.no || index + 1);
        if (!Number.isInteger(programKe) || programKe < 1) {
          invalidRows.push(index + 2);
          return;
        }
        programs.push({
          sourceFile: fileName,
          sourceRow: index + 2,
          commissariat,
          division: clean(row.division || row.Divisi),
          programKe,
          title,
          slug: clean(row.slug),
          status: firstValue(row, [
            "status",
            "status_source_excel",
            "status_asli",
            "original_status",
            "status_excel",
            "status_final",
            "original_status_excel",
            "Status",
            "Status Asli",
            "Status Excel",
            "original status",
          ]),
          date: excelDate(
            firstNonEmpty(row, ["date", "tanggal", "Tanggal"]),
            firstNonEmpty(row, ["date_iso", "tanggal_iso"]),
          ),
          format: clean(row.format) || "Offline",
          dateLabel: excelDate(
            firstNonEmpty(row, ["date", "tanggal", "Tanggal"]),
            firstNonEmpty(row, ["date_iso", "tanggal_iso"]),
          )
            ? null
            : clean(firstNonEmpty(row, ["date", "tanggal", "Tanggal"])) ||
              "Periode 2025/2026",
          description: clean(row.description),
          kpi: clean(row.kpi),
          impact: clean(row.impact),
          evaluation: clean(row.evaluation),
          proposalLink:
            clean(
              firstNonEmpty(row, [
                "proposal_link",
                "proposal",
                "proposal_reference",
              ]),
            ) || null,
          docsLink:
            clean(
              firstNonEmpty(row, [
                "docs_link",
                "docs_reference",
                "excel_documentation_reference",
                "referensi_dokumentasi_excel",
                "docs_link_excel",
                "link dokumentasi",
              ]),
            ) || null,
          lpjLink:
            clean(firstNonEmpty(row, ["lpj_link", "lpj_reference"])) || null,
          explicitId:
            clean(
              firstNonEmpty(row, [
                "db_id",
                "db_documentation_id",
                "database_id",
                "id",
              ]),
            ) || null,
          collaborationGroup:
            clean(row.collaboration_group || row.event_group) || null,
          sourceExcluded,
        });
      });
    if (worksheet)
      appendRows(
        xlsx.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: null,
        }),
      );
    const excludedSheet = workbook.Sheets.Dikeluarkan;
    if (excludedSheet) {
      const excludedRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(
        excludedSheet,
        { defval: null },
      );
      appendRows(
        excludedRows.map((row) => ({
          ...row,
          status: statusFromExcludedSheet(row),
        })),
        true,
      );
    }
    const collaborationSheet = workbook.Sheets.Kolaborasi;
    if (collaborationSheet) {
      const collaborationRows = xlsx.utils.sheet_to_json<
        Record<string, unknown>
      >(collaborationSheet, { defval: null });
      for (const row of collaborationRows) {
        const group = clean(
          row["Kegiatan kolaborasi"] || row["Kegiatan Kolaborasi"],
        );
        if (!group) continue;
        const targets = [
          { title: clean(row["Record 1"]), division: clean(row["Divisi 1"]) },
          { title: clean(row["Record 2"]), division: clean(row["Divisi 2"]) },
        ].filter((target) => target.title);
        for (const program of programs.filter(
          (item) =>
            item.sourceFile === fileName &&
            targets.some(
              (target) =>
                sameProgramTitle(target.title, item.title) &&
                (!target.division ||
                  normalizeDivision(target.division) ===
                    normalizeDivision(item.division)),
            ),
        )) {
          program.collaborationGroup = group;
        }
      }
    }
    if (invalidRows.length) {
      throw new Error(`Workbook ${fileName} contains invalid non-empty rows: ${invalidRows.join(", ")}.`);
    }
  }
  return programs;
};

const readPhotoFolders = (): SourcePhotoFolder[] => {
  if (!fs.existsSync(PHOTO_ROOT)) return [];
  const folders: SourcePhotoFolder[] = [];
  for (const commissariat of fs
    .readdirSync(PHOTO_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const commissariatPath = path.join(PHOTO_ROOT, commissariat.name);
    for (const proker of fs
      .readdirSync(commissariatPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())) {
      const prokerPath = path.join(commissariatPath, proker.name);
      const files: string[] = [];
      const visit = (directory: string) => {
        for (const entry of fs.readdirSync(directory, {
          withFileTypes: true,
        })) {
          const fullPath = path.join(directory, entry.name);
          if (entry.isDirectory()) visit(fullPath);
          else files.push(fullPath);
        }
      };
      visit(prokerPath);
      folders.push({
        commissariatFolder: commissariat.name,
        prokerFolder: proker.name,
        files: files.sort(),
      });
    }
  }
  return folders.sort((a, b) =>
    `${a.commissariatFolder}\0${a.prokerFolder}`.localeCompare(
      `${b.commissariatFolder}\0${b.prokerFolder}`,
    ),
  );
};

const readLegacyDatabase = async () => {
  const result: {
    connected: boolean;
    error?: string;
    tables: string[];
    columns: string[];
    rows: LegacyProgram[];
    foreignKeys: unknown[];
  } = { connected: false, tables: [], columns: [], rows: [], foreignKeys: [] };
  const read = async () => {
    const tables = await prisma.$queryRawUnsafe<Array<{ TABLE_NAME: string }>>(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME",
    );
    result.tables = tables.map((table) => table.TABLE_NAME);
    const programPhotoTableAvailable = result.tables.some(
      (table) => table.toLowerCase() === "program_kerja_photo",
    );
    const columns = await prisma.$queryRawUnsafe<
      Array<{ COLUMN_NAME: string }>
    >(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'program_kerja' ORDER BY ORDINAL_POSITION",
    );
    result.columns = columns.map((column) => column.COLUMN_NAME);
    if (!result.tables.some((table) => table.toLowerCase() === "program_kerja"))
      return result;
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(`
      SELECT p.id, p.commissariatId, c.name AS commissariat, c.slug AS commissariatSlug,
        p.programKe, p.namaProker, p.divisi, p.tanggalProker, p.formatPelaksanaan,
        p.status, p.deskripsiProker, p.kpiTukTarget, p.dampak, p.evaluasi,
        p.foto1, p.foto2, p.foto3, p.foto4, p.foto5, p.foto6
      FROM program_kerja p
      LEFT JOIN commissariat c ON c.id = p.commissariatId
      ORDER BY c.name, p.programKe, p.id`);
    let childPhotoRows: Array<{ programKerjaId: string; filePath: string }> =
      [];
    if (programPhotoTableAvailable) {
      childPhotoRows = await prisma.$queryRawUnsafe<
        Array<{ programKerjaId: string; filePath: string }>
      >(
        "SELECT programKerjaId, filePath FROM program_kerja_photo ORDER BY programKerjaId, createdAt, id",
      );
    }
    const childPhotos = new Map<string, string[]>();
    for (const photo of childPhotoRows) {
      const values = childPhotos.get(photo.programKerjaId) ?? [];
      values.push(String(photo.filePath));
      childPhotos.set(photo.programKerjaId, values);
    }
    result.rows = rows.map((row) => {
      const legacyPhotos = [row.foto1, row.foto2, row.foto3, row.foto4, row.foto5, row.foto6]
        .filter(Boolean)
        .map(String);
      const childPhotosForRow = childPhotos.get(String(row.id)) ?? [];
      return {
      id: String(row.id),
      commissariatId: String(row.commissariatId ?? ""),
      commissariat: String(row.commissariat ?? ""),
      commissariatSlug: String(row.commissariatSlug ?? ""),
      programKe: Number(row.programKe ?? 0),
      title: String(row.namaProker ?? ""),
      division: String(row.divisi ?? ""),
      date: legacyDate(row.tanggalProker),
      format: String(row.formatPelaksanaan ?? ""),
      status: String(row.status ?? ""),
      description: String(row.deskripsiProker ?? ""),
      kpi: row.kpiTukTarget == null ? null : String(row.kpiTukTarget),
      impact: row.dampak == null ? null : String(row.dampak),
      evaluation: row.evaluasi == null ? null : String(row.evaluasi),
      photos: legacyPhotos.concat(childPhotosForRow),
      legacyPhotos,
      childPhotos: childPhotosForRow,
      validPhotos: [],
      documentationEvidence:
        legacyPhotos.length > 0 || childPhotosForRow.length > 0,
      };
    });
    result.foreignKeys = await prisma.$queryRawUnsafe(
      "SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_NAME='program_kerja'",
    );
    result.connected = true;
  };
  try {
    await Promise.race([
      read(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Database read timed out after ${DATABASE_TIMEOUT_MS}ms.`,
              ),
            ),
          DATABASE_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }
  return result;
};

const chooseSourcePrograms = (
  folder: SourcePhotoFolder,
  programs: SourceProgram[],
): PhotoMatch[] => {
  const alias = findPhotoAlias(folder);
  if (alias) {
    return alias.titles.map((target) => {
      const program = programs.find(
        (candidate) =>
          commissariatKey(candidate.commissariat) ===
            commissariatKey(folder.commissariatFolder) &&
          sameProgramTitle(candidate.title, target.title) &&
          (!target.division ||
            normalizeDivision(candidate.division) ===
              normalizeDivision(target.division)),
      );
      return {
        program: program ?? null,
        type: program ? ("EXACT_MATCH" as const) : ("UNMATCHED" as const),
        score: program ? 1 : 0,
        reason: program
          ? `PHOTO_ALIAS:${alias.folder}->${target.title}`
          : `PHOTO_ALIAS_UNMATCHED:${alias.folder}->${target.title}`,
      };
    });
  }
  const candidates = programs.filter(
    (program) =>
      commissariatKey(program.commissariat) ===
      commissariatKey(folder.commissariatFolder),
  );
  const collaborationMatches = candidates.filter(
    (program) =>
      program.collaborationGroup &&
      normalizeText(program.collaborationGroup) ===
        normalizeText(folder.prokerFolder),
  );
  if (collaborationMatches.length)
    return collaborationMatches.map((program) => ({
      program,
      type: "EXACT_MATCH" as const,
      score: 1,
      reason: `COLLABORATION:${program.collaborationGroup}`,
    }));
  const exact = candidates.filter((program) =>
    sameProgramTitle(program.title, folder.prokerFolder),
  );
  if (exact.length)
    return exact.map((program) => ({
      program,
      type: "EXACT_MATCH" as const,
      score: 1,
      reason: "TITLE_EXACT",
    }));
  return [{ program: null, type: "UNMATCHED" as const, score: 0, reason: "UNMATCHED" }];
};

const matchPrograms = (
  sources: SourceProgram[],
  legacy: LegacyProgram[],
  databaseConnected: boolean,
): ProgramPlan[] => {
  if (!databaseConnected) {
    return sources.map((source) =>
      plan(
        source,
        "DATABASE_UNAVAILABLE",
        null,
        0,
        "Database could not be read; matching and insert/update decisions are blocked.",
      ),
    );
  }
  const claimedLegacyIds = new Set<string>();
  return sources.map((source) => {
    const sourceComm = commissariatKey(source.commissariat);
    const sourceDivision = normalizeDivision(source.division);
    const sourceTitle = normalizeText(source.title);
    const exactId = source.explicitId
      ? legacy.find(
          (row) =>
            row.id === source.explicitId &&
            commissariatKey(row.commissariat) === sourceComm,
        )
      : undefined;
    if (exactId && claimedLegacyIds.has(exactId.id)) {
      return plan(source, "CONFLICT", null, 1, "Explicit database identifier is already claimed by another source row.");
    }
    if (exactId) {
      claimedLegacyIds.add(exactId.id);
      return plan(
        source,
        "EXACT_MATCH",
        exactId,
        1,
        "Explicit database identifier from normalized workbook.",
      );
    }
    if (source.explicitId) {
      return plan(
        source,
        "CONFLICT",
        null,
        0,
        "Explicit database identifier was not found in the same commissariat; title matching is intentionally blocked.",
      );
    }
    const sameComm = legacy.filter(
      (row) => commissariatKey(row.commissariat) === sourceComm,
    );
    const exactTitle = sameComm.filter((row) =>
      sameProgramTitle(source.title, row.title),
    );
    const sameIdentity = exactTitle.filter(
      (row) => normalizeDivision(row.division) === sourceDivision,
    );
    if (sameIdentity.length === 1 && claimedLegacyIds.has(sameIdentity[0].id)) {
      return plan(source, "CONFLICT", null, 0.98, "The only exact legacy identity match is already claimed by another source row.");
    }
    if (sameIdentity.length === 1) {
      const identity = sameIdentity[0];
      claimedLegacyIds.add(identity.id);
      const dateReason =
        source.date && identity.date && source.date !== identity.date
          ? "Commissariat, normalized title, and division match; date is updated from Excel."
          : "Commissariat, normalized title, and division match. Dates/status are metadata, not identity.";
      return plan(source, "EXACT_MATCH", identity, 0.98, dateReason);
    }
    if (sameIdentity.length > 1) {
      return plan(
        source,
        "CONFLICT",
        null,
        0.7,
        "More than one legacy record has the same commissariat, normalized title, and division.",
      );
    }
    const ranked = sameComm
      .map((row) => {
        const titleScore = stringSimilarity.compareTwoStrings(
          sourceTitle,
          normalizeText(row.title),
        );
        const divisionScore =
          sourceDivision && row.division
            ? stringSimilarity.compareTwoStrings(
                sourceDivision,
                normalizeDivision(row.division),
              )
            : 0;
        return {
          row,
          score: titleScore * 0.75 + divisionScore * 0.25,
          titleScore,
          divisionScore,
        };
      })
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (
      best &&
      best.titleScore >= 0.72 &&
      best.divisionScore >= 0.55 &&
      best.score >= 0.68
    ) {
      if (claimedLegacyIds.has(best.row.id)) {
        return plan(source, "CONFLICT", null, best.score, "The best fuzzy legacy match is already claimed by another source row.");
      }
      claimedLegacyIds.add(best.row.id);
      return plan(
        source,
        "POSSIBLE_MATCH",
        best.row,
        best.score,
        "Fuzzy title/division match; manual review required.",
      );
    }
    return plan(
      source,
      "NEW_PROGRAM",
      null,
      0,
      "No safe existing record match.",
    );
  });
};

const plan = (
  source: SourceProgram,
  matchType: MatchType,
  legacy: LegacyProgram | null,
  confidence: number,
  reason: string,
): ProgramPlan => {
  const metadataChanges: string[] = [];
  if (legacy) {
    if (source.title !== legacy.title) metadataChanges.push("namaProker");
    if (
      source.division &&
      normalizeDivision(source.division) !== normalizeDivision(legacy.division)
    )
      metadataChanges.push("divisi");
    if (source.date !== legacy.date)
      metadataChanges.push("tanggalProker/dateLabel");
    if ((source.format || "Offline") !== legacy.format)
      metadataChanges.push("formatPelaksanaan");
    if (source.description && source.description !== legacy.description)
      metadataChanges.push("deskripsiProker");
    if (source.kpi && source.kpi !== legacy.kpi)
      metadataChanges.push("kpiTukTarget");
    if (source.impact && source.impact !== legacy.impact)
      metadataChanges.push("dampak");
    if (source.evaluation && source.evaluation !== legacy.evaluation)
      metadataChanges.push("evaluasi");
    if (source.status && displayStatus(source.status) !== legacy.status)
      metadataChanges.push("status/executionStatus");
  }
  const cancelled = statusToExecution(source.status) === "CANCELLED";
  const normalizedStatus = normalizeText(source.status);
  const knownStatus =
    !normalizedStatus ||
    [
      "cancel",
      "cancelled",
      "canceled",
      "ongoing",
      "on progress",
      "on going",
      "in progress",
      "completed",
      "complete",
      "done",
      "selesai",
      "planned",
      "plan",
    ].includes(normalizedStatus);
  const action: ProgramAction =
    matchType === "DATABASE_UNAVAILABLE"
      ? "DATABASE_UNAVAILABLE"
      : matchType === "POSSIBLE_MATCH" || matchType === "CONFLICT"
        ? "REVIEW"
      : source.sourceExcluded
        ? legacy
          ? "SOURCE_EXCLUDED_ARCHIVE"
          : "CANCELLED_SKIP"
      : cancelled
        ? legacy
          ? "CANCELLED_EXISTING_ARCHIVE"
          : "CANCELLED_SKIP"
        : matchType === "EXACT_MATCH"
          ? metadataChanges.length
            ? "UPDATE"
            : "UNCHANGED"
          : matchType === "NEW_PROGRAM"
            ? missingRequiredFields(source).length
              ? "REVIEW"
              : "ACTIVE_INSERT"
            : "REVIEW";
  const safeAction = knownStatus ? action : "REVIEW";
  return {
    source,
    matchType,
    legacy,
    confidence,
    reason,
    metadataChanges,
    action: safeAction,
    programId:
      legacy?.id ??
      (safeAction === "ACTIVE_INSERT" || safeAction === "CANCELLED_SKIP"
        ? previewProgramId(source)
        : null),
  };
};

const missingRequiredFields = (source: SourceProgram) =>
  [
    ["format", source.format || "Offline"],
    ["description", source.description],
  ]
    .filter(([, value]) => !value)
    .map(([field]) => field);

const hashFile = async (filePath: string) => {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
};

const hashFileSync = (filePath: string) =>
  crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

const convertToWebp = async (filePath: string) =>
  sharp(filePath).rotate().webp().toBuffer();

const sourcePhotoHash = async (filePath: string) => hashFile(filePath);

const mapConcurrent = async <T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
) => {
  const result = new Array<R>(values.length);
  let nextIndex = 0;
  const worker = async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= values.length) return;
      result[index] = await mapper(values[index], index);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () =>
      worker(),
    ),
  );
  return result;
};

const legacyHashMap = async (legacy: LegacyProgram[]) => {
  const hashes = new Map<string, Set<string>>();
  const paths = new Map<string, string>();
  const references = legacy.flatMap((row) =>
    row.photos.map((storedPath) => ({ rowId: row.id, storedPath })),
  );
  const results = await mapConcurrent(references, 8, async (reference) => {
    const diskPath = path.join(
      PUBLIC_ROOT,
      reference.storedPath.replace(/^\/+/, ""),
    );
    if (!fs.existsSync(diskPath)) return null;
    return { ...reference, hash: await hashFile(diskPath) };
  });
  for (const result of results) {
    if (!result) continue;
    const ids = hashes.get(result.hash) ?? new Set<string>();
    ids.add(result.rowId);
    hashes.set(result.hash, ids);
    paths.set(`${result.rowId}:${result.hash}`, result.storedPath);
  }
  return { hashes, paths };
};

const populateLegacyPhotoHashes = async (legacy: LegacyProgram[]) => {
  await mapConcurrent(legacy, 8, async (row) => {
    const validPhotos: Array<{ filePath: string; fileHash: string }> = [];
    for (const storedPath of [...row.legacyPhotos, ...row.childPhotos]) {
      const diskPath = path.join(PUBLIC_ROOT, storedPath.replace(/^\/+/, ""));
      if (!fs.existsSync(diskPath)) continue;
      try {
        validPhotos.push({ filePath: storedPath, fileHash: await hashFile(diskPath) });
      } catch {
        // Broken legacy files remain untouched and are not registered.
      }
    }
    row.validPhotos = validPhotos;
    row.documentationEvidence = validPhotos.length > 0;
  });
};

const buildPhotoPlans = async (
  folders: SourcePhotoFolder[],
  sources: SourceProgram[],
  programPlans: ProgramPlan[],
  legacy: LegacyProgram[],
  dbConnected: boolean,
) => {
  const plans: PhotoPlan[] = [];
  const existing = dbConnected
    ? await legacyHashMap(legacy)
    : { hashes: new Map<string, Set<string>>(), paths: new Map<string, string>() };
  const existingHashes = existing.hashes;
  const plannedHashes = new Set<string>();

  for (const target of programPlans) {
    if (target.action === "REVIEW" || target.matchType === "CONFLICT" || target.matchType === "POSSIBLE_MATCH" || !target.legacy?.legacyPhotos.length || !target.programId) continue;
    const childPhotoPaths = new Set(target.legacy.childPhotos);
    for (const storedPath of target.legacy.legacyPhotos) {
      if (childPhotoPaths.has(storedPath)) continue;
      const diskPath = path.join(PUBLIC_ROOT, storedPath.replace(/^\/+/, ""));
      if (!fs.existsSync(diskPath)) continue;
      const sourceSha256 = hashFileSync(diskPath);
      plans.push({
        sourceFolder: `legacy/${target.programId}`,
        sourcePath: storedPath,
        commissariat: target.legacy.commissariat,
        prokerFolder: target.source.title,
        targetProgramIds: [target.programId],
        file: path.basename(storedPath),
        extension: path.extname(storedPath).toLowerCase(),
        bytes: fs.statSync(diskPath).size,
        sourceSha256,
        finalWebpSha256: null,
        sha256: null,
        destinationWebpPath: storedPath,
        destinationWebpPaths: [storedPath],
        targetActions: [{ programId: target.programId, action: "LEGACY_PHOTO_REGISTRATION", destinationWebpPath: storedPath }],
        action: "LEGACY_PHOTO_REGISTRATION",
        reason: `Existing legacy photo field registered as a child photo; source file was not moved or converted. Target: ${target.programId}.`,
      });
    }
  }

  const buildSkippedPlan = (
    folder: SourcePhotoFolder,
    file: string,
    relative: string,
    extension: string,
    bytes: number,
    action: PhotoAction,
    reason: string,
  ): PhotoPlan => ({
    sourceFolder: relative,
    sourcePath: relative,
    commissariat: folder.commissariatFolder,
    prokerFolder: folder.prokerFolder,
    targetProgramIds: [],
    file: path.basename(file),
    extension,
    bytes,
    sourceSha256: (() => { try { return hashFileSync(file); } catch { return null; } })(),
    finalWebpSha256: null,
    sha256: null,
    destinationWebpPath: null,
    destinationWebpPaths: [],
    targetActions: [],
    action,
    reason,
  });

  const work: PhotoWork[] = [];
  for (const folder of folders) {
    const sourceMatches = chooseSourcePrograms(folder, sources);
    for (const file of folder.files) {
      const extension = path.extname(file).toLowerCase();
      const relative = relativeProjectPath(file);
      const matchedSourcePrograms = sourceMatches
        .map((m) => m.program)
        .filter((p): p is SourceProgram => !!p);
      const matchedPlans = matchedSourcePrograms
        .map((source) => programPlans.find((item) => item.source === source))
        .filter((item): item is ProgramPlan => !!item);
      const validTargets = matchedPlans.filter(
        (item) =>
          reconciliationRules.photoMayTarget(item.action) && !!item.programId,
      );
      if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
        plans.push(
          buildSkippedPlan(
            folder,
            file,
            relative,
            extension,
            fs.statSync(file).size,
            "ORPHAN",
            "Unsupported image extension; no valid photo target.",
          ),
        );
        continue;
      }
      const sourceBytes = fs.statSync(file).size;
      const hasCancelledTarget = matchedPlans.some(
        (item) =>
          item.action === "CANCELLED_SKIP" ||
          item.action === "CANCELLED_EXISTING_ARCHIVE",
      );
      const hasReviewTarget = matchedPlans.some(
        (item) =>
          item.action === "REVIEW" || item.matchType === "POSSIBLE_MATCH",
      );
      if (!dbConnected || !validTargets.length) {
        const action: PhotoAction =
          !dbConnected || (!hasCancelledTarget && !hasReviewTarget)
            ? "ORPHAN"
            : "SKIPPED_PHOTO";
        plans.push(
          buildSkippedPlan(
            folder,
            file,
            relative,
            extension,
            sourceBytes,
            action,
            !dbConnected
              ? "Database unavailable; no valid program target can be confirmed."
              : hasCancelledTarget
                ? "Cancelled program has no photo migration plan; source was not converted."
                : "Photo mapping is unresolved or review-only; source was not converted.",
          ),
        );
        continue;
      }
      work.push({
        folder,
        file,
        extension,
        relative,
        sourceBytes,
        validTargets,
        hasCancelledTarget,
        hasReviewTarget,
        mappingReasons: sourceMatches.map((match) => match.reason),
      });
    }
  }
  const prepared = await mapConcurrent(work, 4, async (item) => {
    try {
      const sourceSha256 = await sourcePhotoHash(item.file);
      const webp = await convertToWebp(item.file);
      const finalWebpSha256 = crypto.createHash("sha256").update(webp).digest("hex");
      if (hasFlag("--apply")) preparedWebpBuffers.set(item.relative, webp);
      return { item, sourceSha256, finalWebpSha256, error: null as string | null };
    } catch (error) {
      return {
        item,
        sourceSha256: null,
        finalWebpSha256: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
  for (const result of prepared) {
    const { item, sourceSha256, finalWebpSha256, error } = result;
    if (!sourceSha256 || (hasFlag("--apply") && !finalWebpSha256)) {
      plans.push(
        buildSkippedPlan(
          item.folder,
          item.file,
          item.relative,
          item.extension,
          item.sourceBytes,
          "ORPHAN",
          error ?? "Source photo hashing failed, or apply-phase WebP conversion failed.",
        ),
      );
      continue;
    }
    const targetLabels = item.validTargets
      .map((target) => target.source.title)
      .join(", ");
    const targetActions: PhotoPlan["targetActions"] = [];
    for (const target of item.validTargets) {
      const id = target.programId!;
      const destinationWebpPath =
        finalWebpSha256 && target.legacy && existing.paths.get(`${id}:${finalWebpSha256}`)
          ? existing.paths.get(`${id}:${finalWebpSha256}`)!
          : finalWebpSha256
            ? `/uploads/proker/${target.legacy?.commissariatSlug || commissariatKey(target.source.commissariat)}/${id}/${finalWebpSha256}.webp`
            : null;
      const duplicate =
        Boolean(finalWebpSha256 && ((target.legacy && existingHashes.get(finalWebpSha256)?.has(target.legacy.id)) || plannedHashes.has(`${id}:${finalWebpSha256}`)));
      const action = photoActionFor(target.action, Boolean(duplicate), true);
      if (finalWebpSha256) plannedHashes.add(`${id}:${finalWebpSha256}`);
      targetActions.push({ programId: id, action, destinationWebpPath });
    }
    const distinctActions = [
      ...new Set(targetActions.map((target) => target.action)),
    ];
    const overallAction =
      distinctActions.length === 1 ? distinctActions[0] : "NEW_WEBP";
    plans.push({
      sourceFolder: item.relative,
      sourcePath: item.relative,
      commissariat: item.folder.commissariatFolder,
      prokerFolder: item.folder.prokerFolder,
      targetProgramIds: targetActions.map((target) => target.programId),
      file: path.basename(item.file),
      extension: item.extension,
      bytes: item.sourceBytes,
      sourceSha256,
      finalWebpSha256,
      sha256: finalWebpSha256,
      destinationWebpPath:
        targetActions.length === 1
          ? targetActions[0].destinationWebpPath
          : null,
      destinationWebpPaths: targetActions
        .map((target) => target.destinationWebpPath)
        .filter((value): value is string => !!value),
      targetActions,
      action: overallAction,
      reason: `${distinctActions.length === 1 && distinctActions[0] === "DUPLICATE" ? "Final WebP SHA-256 already exists" : hasFlag("--apply") ? "Final WebP bytes encoded and hashed in memory; destination write is part of the approved apply phase" : "Preview does not convert source images; final WebP conversion and hash are deferred until apply"}. Mapping: ${item.mappingReasons.join("; ") || "UNMATCHED"}. Confirmed targets: ${targetLabels}. Per-target actions: ${targetActions.map((target) => `${target.programId}=${target.action}`).join(", ")}.`,
    });
  }
  return plans;
};

const summarize = (plans: ProgramPlan[], photos: PhotoPlan[]) => ({
  program: Object.fromEntries(
    [
      "EXACT_MATCH",
      "POSSIBLE_MATCH",
      "NEW_PROGRAM",
      "LEGACY_ONLY",
      "CONFLICT",
      "DATABASE_UNAVAILABLE",
    ].map((key) => [
      key,
      plans.filter((plan) => plan.matchType === key).length,
    ]),
  ),
  actions: Object.fromEntries(
    [
      "UPDATE",
      "ACTIVE_INSERT",
      "CANCELLED_SKIP",
      "CANCELLED_EXISTING_ARCHIVE",
      "DOCUMENTED_DATABASE_ONLY_ARCHIVE",
      "UNDOCUMENTED_DATABASE_ONLY_ARCHIVE",
      "SOURCE_EXCLUDED_ARCHIVE",
      "REVIEW",
      "DATABASE_UNAVAILABLE",
      "UNCHANGED",
    ].map((key) => [key, plans.filter((plan) => plan.action === key).length]),
  ),
  photo: Object.fromEntries(
    [
      "LEGACY_PHOTO_REGISTRATION",
      "NEW_WEBP",
      "DUPLICATE",
      "SKIPPED_PHOTO",
      "ORPHAN",
    ].map((key) => [
      key,
      photos.reduce(
        (count, photo) =>
          count +
          (photo.targetActions.length
            ? photo.targetActions.filter((target) => target.action === key)
                .length
            : photo.action === key
              ? 1
              : 0),
        0,
      ),
    ]),
  ),
});

const renderReport = (
  sourceRoot: string,
  database: Awaited<ReturnType<typeof readLegacyDatabase>>,
  sources: SourceProgram[],
  folders: SourcePhotoFolder[],
  plans: ProgramPlan[],
  photos: PhotoPlan[],
  inputFingerprint: string,
) => {
  const summary = summarize(plans, photos);
  const lines: string[] = [];
  lines.push("# Dry-Run Rekonsiliasi Program Kerja dan Dokumentasi Foto");
  lines.push("");
  lines.push(
    hasFlag("--apply")
      ? "> Laporan ini dibuat setelah apply yang telah melewati approval gate. WebP di-encode ke memory lalu ditulis secara eksklusif ke destination yang direncanakan; tidak ada source file yang dipindah atau di-overwrite."
      : "> Laporan ini adalah read-only preview. Tidak ada INSERT, UPDATE, DELETE, pemindahan file, overwrite foto, perubahan schema production, atau penulisan hasil conversion. Untuk evidence SHA-256 final WebP, gambar hanya di-encode di memory; tidak ada hasil conversion yang ditulis ke disk.",
  );
  lines.push("");
  lines.push(`- **Source root:** \`${sourceRootLabel()}\``);
  lines.push(`- **Excel root:** \`${path.relative(PROJECT_ROOT, EXCEL_ROOT).replace(/\\/g, "/")}\``);
  lines.push(`- **Dokumentasi root:** \`${path.relative(PROJECT_ROOT, PHOTO_ROOT).replace(/\\/g, "/")}\``);
  lines.push(
    `- **Database read status:** ${database.connected ? "CONNECTED" : "BLOCKED/OFFLINE"}`,
  );
  if (database.error)
    lines.push(`- **Database error:** \`${markdown(database.error)}\``);
  lines.push(`- **Record Excel terbaru:** ${sources.length}`);
  lines.push(`- **Folder proker foto:** ${folders.length}`);
  lines.push(`- **File foto sumber:** ${photos.length}`);
  lines.push(`- **Report input fingerprint:** \`${inputFingerprint}\``);
  lines.push("");
  lines.push("## Hasil Matching Program");
  lines.push("");
  lines.push("| Kategori | Jumlah |");
  lines.push("|---|---:|");
  for (const key of Object.keys(summary.program))
    lines.push(`| ${key} | ${summary.program[key]} |`);
  lines.push("");
  if (database.connected)
    lines.push(
      "> Matching database berhasil dibaca. Tetap review semua `POSSIBLE_MATCH` dan `CONFLICT` secara manual sebelum approval.",
    );
  else
    lines.push(
      "> Database offline pada saat dry-run ini. Semua keputusan source diberi `DATABASE_UNAVAILABLE` dan diblokir; tidak boleh dianggap sebagai `NEW_PROGRAM`. Jalankan ulang setelah MySQL aktif.",
    );
  lines.push("");
  lines.push("## Rencana Perubahan Metadata");
  lines.push("");
  lines.push(
    "| Komisariat | Program ID | Old division | New division | Old status | New status | Old photos | Planned photos | Name | Match | Action | Reason |",
  );
  lines.push("|---|---|---|---|---|---|---:|---:|---|---|---|---|");
  for (const planItem of plans) {
    const plannedPhotos = planItem.programId
      ? photos.reduce(
          (count, photo) =>
            count +
            photo.targetActions.filter(
              (target) =>
                target.programId === planItem.programId &&
                ["LEGACY_PHOTO_REGISTRATION", "NEW_WEBP"].includes(
                  target.action,
                ),
            ).length,
          0,
        )
      : 0;
    const reason = `${planItem.reason}${planItem.metadataChanges.length ? `; fields: ${planItem.metadataChanges.join(", ")}` : ""}`;
    lines.push(
      `| ${markdown(planItem.source.commissariat)} | ${planItem.programId ?? "-"} | ${markdown(planItem.legacy?.division ?? "-")} | ${markdown(planItem.source.division)} | ${markdown(planItem.legacy?.status ?? "-")} | ${markdown(displayStatus(planItem.source.status))} | ${planItem.legacy?.photos.length ?? 0} | ${plannedPhotos} | ${markdown(planItem.source.title)} | ${planItem.matchType} | ${planItem.action} | ${markdown(reason)} |`,
    );
  }
  lines.push("");
  lines.push("## Audit Sumber Excel");
  lines.push("");
  lines.push("| File | Jumlah Record |");
  lines.push("|---|---:|");
  for (const file of [...new Set(sources.map((source) => source.sourceFile))])
    lines.push(
      `| ${markdown(file)} | ${sources.filter((source) => source.sourceFile === file).length} |`,
    );
  lines.push("");
  lines.push("## Mapping Folder Dokumentasi");
  lines.push("");
  lines.push(
    "| Komisariat | Folder Proker | File | Target program IDs | Destination WebP | Actions | Reasons |",
  );
  lines.push("|---|---|---:|---|---|---|---|");
  for (const folder of folders) {
    const folderPrefix = `${relativeProjectPath(path.join(PHOTO_ROOT, folder.commissariatFolder, folder.prokerFolder))}/`;
    const rows = photos.filter((photo) => photo.sourceFolder.startsWith(folderPrefix));
    lines.push(
      `| ${markdown(folder.commissariatFolder)} | ${markdown(folder.prokerFolder)} | ${folder.files.length} | ${markdown([...new Set(rows.flatMap((row) => row.targetProgramIds))].join(", ") || "-")} | ${markdown([...new Set(rows.flatMap((row) => row.destinationWebpPaths))].join(", ") || "-")} | ${markdown([...new Set(rows.flatMap((row) => row.targetActions.map((target) => `${target.programId}=${target.action}`)).concat(rows.filter((row) => !row.targetActions.length).map((row) => row.action)))].join(", ") || "-")} | ${markdown([...new Set(rows.map((row) => row.reason))].join("; ") || "-")} |`,
    );
  }
  lines.push("");
  lines.push("## Detail File Foto dan SHA-256");
  lines.push("");
  lines.push(
    "| Source path | Source SHA-256 | Destination WebP | Final WebP SHA-256 | Target program IDs | Bytes | Action | Reason |",
  );
  lines.push("|---|---|---|---|---:|---|---|---|");
  for (const photo of photos)
    lines.push(
      `| \`${markdown(photo.sourcePath)}\` | \`${photo.sourceSha256 ?? "-"}\` | \`${markdown(photo.destinationWebpPaths.join(", ") || photo.destinationWebpPath || "-")}\` | \`${photo.finalWebpSha256 ?? "-"}\` | ${markdown(photo.targetProgramIds.join(", ") || "-")} | ${photo.bytes} | ${markdown(photo.targetActions.map((target) => `${target.programId}=${target.action}`).join(", ") || photo.action)} | ${markdown(photo.reason)} |`,
    );
  lines.push("");
  lines.push("## Database dan Schema yang Diaudit");
  lines.push("");
  lines.push(
    `- Tabel yang terdeteksi: ${database.tables.length ? database.tables.map((table) => `\`${table}\``).join(", ") : "tidak terbaca"}`,
  );
  lines.push(
    `- Kolom \`program_kerja\`: ${database.columns.length ? database.columns.map((column) => `\`${column}\``).join(", ") : "tidak terbaca"}`,
  );
  lines.push(`- Program legacy terbaca: ${database.rows.length}`);
  lines.push(
    `- Program legacy dengan foto: ${database.rows.filter((row) => row.photos.length).length}`,
  );
  lines.push(
    `- Foreign key langsung pada \`program_kerja\`: ${database.foreignKeys.length}`,
  );
  lines.push("");
  lines.push("## Aturan Apply yang Disiapkan");
  lines.push("");
  lines.push("1. Backup database berhasil dan file backup diverifikasi.");
  lines.push("2. Semua `POSSIBLE_MATCH` dan `CONFLICT` ditahan untuk review.");
  lines.push("3. `EXACT_MATCH` mempertahankan ID, createdAt, dan foto lama.");
  lines.push(
    "4. Program cancelled dari sheet Dikeluarkan diklasifikasikan untuk archive; kandidat fuzzy/conflict ditahan sebagai REVIEW dan tidak digandakan sebagai legacy-only.",
  );
  lines.push(
    "5. Foto disimpan sebagai child records berbasis SHA-256; kolom foto lama tetap dipertahankan. Foto proker baru berstatus pending insert sampai ID program dibuat.",
  );
  lines.push(
    "6. Preview tidak melakukan mass delete, truncate, overwrite, pemindahan file sumber, staging, atau penulisan hasil conversion. Encoding WebP hanya dilakukan di memory untuk evidence hash; apply tetap memerlukan approval terpisah.",
  );
  lines.push(
    "7. Tidak ada operasi data dalam mode preview. Data migration memerlukan approval terpisah `SETUJUI DATA MIGRASI` setelah report direview; baris REVIEW tetap memblokir apply.",
  );
  lines.push("");
  lines.push("## Approval Gate");
  lines.push("");
  lines.push(
    "Mode preview: tidak ada perubahan database atau filesystem yang dilakukan.",
  );
  return lines.join("\n") + "\n";
};

const readJson = <T>(filePath: string): T =>
  JSON.parse(fs.readFileSync(filePath, "utf8")) as T;

const assertDataMigrationReady = (backupPath: string) => {
  if (process.env.DATA_MIGRATION_APPROVAL !== DATA_APPROVAL)
    throw new Error(`Data migration requires DATA_MIGRATION_APPROVAL="${DATA_APPROVAL}".`);
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for data migration.");
  const database = decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ""));
  const readinessPath = path.resolve(process.env.SCHEMA_READINESS_PATH || path.join(PROJECT_ROOT, "artifacts/migration/schema-readiness.json"));
  const restorePath = path.resolve(process.env.RESTORE_EVIDENCE_PATH || path.join(PROJECT_ROOT, "artifacts/migration/restore-verification.json"));
  const readiness = readJson<{ status: string; database: string; dataMigrationReady: boolean; migrationApplied: boolean; schemaApproval: string; expiresAt: string; planHash: string }>(readinessPath);
  const restore = readJson<{ status: string; sourceDatabase: string; backupSha256: string; expiresAt: string }>(restorePath);
  const backupHash = crypto.createHash("sha256").update(fs.readFileSync(path.resolve(backupPath))).digest("hex");
  const now = Date.now();
  if (readiness.status !== "ready" || readiness.database !== database || !readiness.dataMigrationReady || !readiness.migrationApplied || readiness.schemaApproval !== SCHEMA_APPROVAL || Date.parse(readiness.expiresAt) <= now)
    throw new Error("Schema readiness is not valid for data migration.");
  if (restore.status !== "verified" || restore.sourceDatabase !== database || restore.backupSha256 !== backupHash || Date.parse(restore.expiresAt) <= now)
    throw new Error("Backup does not match verified restore evidence.");
  return readiness.planHash;
};

const stageWebpFiles = async (photos: PhotoPlan[]) => {
  const stageRoot = fs.mkdtempSync(path.join(PROJECT_ROOT, ".proker-stage-"));
  const staged = new Map<string, string>();
  let stageIndex = 0;
  for (const photo of photos) {
    if (!photo.sha256) continue;
    for (const target of photo.targetActions.filter((item) => item.action === "NEW_WEBP")) {
      if (staged.has(photo.sourceFolder)) continue;
      const buffer = preparedWebpBuffers.get(photo.sourceFolder);
      if (!buffer) throw new Error(`Missing staged WebP buffer for ${photo.sourceFolder}`);
      const stagedPath = path.join(stageRoot, `${stageIndex++}-${photo.sha256}.webp`);
      fs.writeFileSync(stagedPath, buffer, { flag: "wx" });
      staged.set(photo.sourceFolder, stagedPath);
    }
  }
  return { stageRoot, staged };
};

const applyDataMigration = async (plans: ProgramPlan[], photos: PhotoPlan[], backupPath: string) => {
  assertDataMigrationReady(backupPath);
  const unresolved = plans.filter((item) => item.action === "REVIEW" || item.matchType === "POSSIBLE_MATCH" || item.matchType === "CONFLICT");
  if (unresolved.length) throw new Error(`Data migration blocked by ${unresolved.length} unresolved program match(es).`);
  const { stageRoot, staged } = await stageWebpFiles(photos);
  const finalFiles: string[] = [];
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of plans) {
        const source = item.source;
        const date = source.date ? new Date(`${source.date}T00:00:00.000Z`) : null;
        if (
          ["SOURCE_EXCLUDED_ARCHIVE", "CANCELLED_EXISTING_ARCHIVE"].includes(
            item.action,
          ) &&
          item.legacy?.id
        ) {
          await tx.programKerja.update({ where: { id: item.legacy.id }, data: { publicationStatus: "ARCHIVED", executionStatus: "CANCELLED", status: "Cancelled" } });
          continue;
        }
        if (item.action === "CANCELLED_SKIP") continue;
        if (item.action === "DOCUMENTED_DATABASE_ONLY_ARCHIVE" && item.legacy?.id) {
          await tx.programKerja.update({ where: { id: item.legacy.id }, data: { publicationStatus: "ARCHIVED" } });
          continue;
        }
        if (item.action === "UNDOCUMENTED_DATABASE_ONLY_ARCHIVE" && item.legacy?.id) {
          await tx.programKerja.update({
            where: { id: item.legacy.id },
            data: { publicationStatus: "ARCHIVED" },
          });
          continue;
        }
        if (!["UPDATE", "ACTIVE_INSERT", "UNCHANGED"].includes(item.action)) continue;
        const data = {
          programKe: source.programKe,
          namaProker: source.title,
          divisi: source.division || "BPH",
          tanggalProker: date,
          dateLabel: date ? null : source.dateLabel || "Periode 2025/2026",
          formatPelaksanaan: source.format || "Offline",
          status: displayStatus(source.status),
          executionStatus: statusToExecution(source.status) as "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED",
          publicationStatus: "PUBLISHED" as const,
          deskripsiProker: source.description,
          kpiTukTarget: source.kpi || null,
          dampak: source.impact || null,
          evaluasi: source.evaluation || null,
        };
        if (item.action === "ACTIVE_INSERT") {
          const commissariat = await tx.commissariat.findFirst({ where: { name: { contains: source.commissariat } } });
          if (!commissariat) throw new Error(`Commissariat not found for ${source.commissariat}`);
          await tx.programKerja.create({ data: { id: item.programId!, commissariatId: commissariat.id, ...data } });
        } else if (item.legacy?.id) {
          await tx.programKerja.update({ where: { id: item.legacy.id }, data });
        }
      }
      for (const row of plans.map((item) => item.legacy).filter((item): item is LegacyProgram => !!item)) {
        for (const photo of row.validPhotos) {
          await tx.programKerjaPhoto.upsert({ where: { programKerjaId_fileHash: { programKerjaId: row.id, fileHash: photo.fileHash } }, create: { programKerjaId: row.id, filePath: photo.filePath, fileHash: photo.fileHash }, update: { filePath: photo.filePath } });
        }
      }
      for (const photo of photos) {
        if (!photo.sha256) continue;
        for (const target of photo.targetActions) {
          await tx.programKerjaPhoto.upsert({ where: { programKerjaId_fileHash: { programKerjaId: target.programId, fileHash: photo.sha256 } }, create: { programKerjaId: target.programId, filePath: target.destinationWebpPath!, fileHash: photo.sha256 }, update: { filePath: target.destinationWebpPath! } });
        }
      }
    }, { maxWait: 30000, timeout: 120000 });
    for (const photo of photos) {
      if (!photo.sha256) continue;
      for (const target of photo.targetActions.filter((item) => item.action === "NEW_WEBP")) {
        const destination = path.join(PUBLIC_ROOT, target.destinationWebpPath!.replace(/^\/+/, ""));
        if (fs.existsSync(destination)) continue;
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        const stagedPath = staged.get(photo.sourceFolder);
        if (!stagedPath) throw new Error(`Staged file missing for ${photo.sourceFolder}`);
        fs.copyFileSync(stagedPath, destination, fs.constants.COPYFILE_EXCL);
        finalFiles.push(destination);
      }
    }
  } catch (error) {
    for (const file of finalFiles) try { fs.unlinkSync(file); } catch { /* leave unknown files untouched */ }
    throw error;
  } finally {
    fs.rmSync(stageRoot, { recursive: true, force: true });
  }
  return { programs: plans.length, photos: photos.filter((photo) => photo.sha256).length, files: finalFiles.length };
};

const main = async () => {
  const sources = readSourcePrograms();
  const folders = readPhotoFolders();
  const database = await readLegacyDatabase();
  if (database.connected) await populateLegacyPhotoHashes(database.rows);
  const plans = matchPrograms(sources, database.rows, database.connected);
  markSourceCollisions(plans);
  const matchedLegacyIds = new Set(
    plans
      .filter((item) => item.legacy)
      .map((item) => item.legacy!.id),
  );
  if (database.connected)
    for (const legacy of database.rows.filter(
      (row) => !matchedLegacyIds.has(row.id),
    ))
      plans.push({
        source: {
          sourceFile: "-",
          sourceRow: 0,
          commissariat: legacy.commissariat,
          division: legacy.division,
          programKe: legacy.programKe,
          title: legacy.title,
          slug: "",
          status: legacy.status,
          date: legacy.date,
          dateLabel: legacy.date ? null : "Periode 2025/2026",
          format: legacy.format || "Offline",
          description: legacy.description,
          kpi: legacy.kpi ?? "",
          impact: legacy.impact ?? "",
          evaluation: legacy.evaluation ?? "",
          proposalLink: null,
          docsLink: null,
          lpjLink: null,
          explicitId: legacy.id,
          collaborationGroup: null,
          sourceExcluded: false,
        },
        matchType: "LEGACY_ONLY",
        legacy,
        confidence: 0,
        reason: legacy.documentationEvidence
          ? "Database-only row has photo or link evidence; retain the legacy record. Archive classification is informational only in this read-only preview."
           : "Database-only row has no documentation evidence; retain as an archived record for CMS review.",
        action: reconciliationRules.legacyOnlyAction(
          legacy.documentationEvidence,
        ),
        metadataChanges: [],
        programId: legacy.id,
      });
  const photos = await buildPhotoPlans(
    folders,
    sources,
    plans,
    database.rows,
    database.connected,
  );
  const inputFingerprint = fingerprint({
    sources,
    folders: folders.map((folder) => ({ ...folder, files: folder.files.map((file) => path.relative(PROJECT_ROOT, file).replace(/\\/g, "/")) })),
    database: {
      connected: database.connected,
      tables: database.tables,
      columns: database.columns,
      rows: database.rows.map((row) => ({ id: row.id, programKe: row.programKe, title: row.title, division: row.division, date: row.date, status: row.status, photos: row.photos })),
    },
    photos: photos.map((photo) => ({ sourcePath: photo.sourcePath, bytes: photo.bytes, sourceSha256: photo.sourceSha256 })),
  });
  if (hasFlag("--apply")) {
    const backup = argument("--backup");
    if (!backup) throw new Error("Data migration requires --backup <verified-dump-file>.");
    const result = await applyDataMigration(plans, photos, backup);
    console.log(JSON.stringify({ applied: true, ...result }, null, 2));
  }
  const report = renderReport(
    SOURCE_ROOT,
    database,
    sources,
    folders,
    plans,
    photos,
    inputFingerprint,
  );
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf8");
  fs.writeFileSync(
    JSON_REPORT_PATH,
    JSON.stringify(
      {
        reportVersion: 2,
        deterministic: true,
        inputFingerprint,
        sourceRoot: sourceRootLabel(),
        database,
        sources,
        folders: folders.map((folder) => ({
          ...folder,
          files: folder.files.map((file) => path.relative(PROJECT_ROOT, file).replace(/\\/g, "/")),
        })),
        programs: plans,
        photos,
        summary: summarize(plans, photos),
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(
    JSON.stringify(
      {
        report: REPORT_PATH,
        jsonReport: JSON_REPORT_PATH,
        sourcePrograms: sources.length,
        photoFiles: photos.length,
        databaseConnected: database.connected,
        summary: summarize(plans, photos),
      },
      null,
      2,
    ),
  );
};

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
