import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import * as xlsx from "@e965/xlsx";
import stringSimilarity from "string-similarity";
import sharp from "sharp";

/**
 * Safe reconciliation tool for the normalized Program Kerja source.
 *
 * The default mode is read-only. `--apply` is intentionally guarded by:
 * - an explicit approval phrase;
 * - a verified mysqldump file; and
 * - a canonical/additive schema already being present.
 *
 * This script never deletes Program Kerja records or existing photo files.
 */

const SUPPORTED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const APPROVAL_PHRASE = "SETUJUI MIGRASI";
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
  | "CANCELLED_EXISTING_DELETE"
  | "DOCUMENTED_DATABASE_ONLY_ARCHIVE"
  | "UNDOCUMENTED_DATABASE_ONLY_DELETE"
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
}

interface SourcePhotoFolder {
  commissariatFolder: string;
  prokerFolder: string;
  files: string[];
}

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
  commissariat: string;
  prokerFolder: string;
  targetProgramIds: string[];
  file: string;
  extension: string;
  bytes: number;
  sha256: string | null;
  destinationWebpPath: string | null;
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
    path.resolve(cwd, "../../data/proker"),
  ];
  return (
    candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
  );
};

const args = process.argv.slice(2);
const hasFlag = (flag: string) => args.includes(flag);
const argument = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const SOURCE_ROOT = path.resolve(argument("--source-dir") || rootFromCwd());
const EXCEL_ROOT = path.join(SOURCE_ROOT, "Data Program Kerja Updated");
const PHOTO_ROOT = path.join(SOURCE_ROOT, "Dokumentasi Proker");
const PROJECT_ROOT = fs.existsSync(path.join(SOURCE_ROOT, "../../apps/web"))
  ? path.resolve(SOURCE_ROOT, "../..")
  : path.resolve(SOURCE_ROOT, "../../..");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "apps/web/public");
const REPORT_PATH = path.resolve(
  argument("--report") ||
    path.join(PROJECT_ROOT, "docs/proker-reconciliation-dry-run.md"),
);
const JSON_REPORT_PATH = REPORT_PATH.replace(/\.md$/i, ".json");
const DATABASE_TIMEOUT_MS = 10_000;

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
  if (compact.includes("uinmadura") || compact.includes("iainmadura"))
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toISOString().slice(0, 10);
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString().slice(0, 10);
  }
  const parsed = Date.parse(clean(value));
  return Number.isNaN(parsed)
    ? null
    : new Date(parsed).toISOString().slice(0, 10);
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

export const reconciliationRules = {
  normalizeDivision,
  statusToExecution,
  photoMayTarget(action: ProgramAction) {
    return (
      action !== "CANCELLED_SKIP" &&
      action !== "CANCELLED_EXISTING_DELETE" &&
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
  for (const fileName of fs
    .readdirSync(EXCEL_ROOT)
    .filter((name) => /\.xlsx?$/i.test(name))
    .sort()) {
    const workbook = xlsx.readFile(path.join(EXCEL_ROOT, fileName));
    const defaultCommissariat = fileName
      .replace(/_.*$/, "")
      .replace(/_/g, " ")
      .trim();
    const worksheet = workbook.Sheets.proker;
    const appendRows = (rows: Record<string, unknown>[]) =>
      rows.forEach((row, index) => {
        const title = clean(
          row.title ||
            row["Nama Proker"] ||
            row.Proker ||
            row["Program Kerja"] ||
            row["Nama/Status"],
        );
        const commissariat =
          clean(row.commissariat || row.komisariat || row.Komisariat) ||
          defaultCommissariat;
        if (!title || !commissariat) return;
        programs.push({
          sourceFile: fileName,
          sourceRow: index + 2,
          commissariat,
          division: clean(row.division || row.Divisi),
          title,
          slug: clean(row.slug),
          status: clean(
            row.status ||
              row.status_source_excel ||
              row.status_asli ||
              row.original_status ||
              row.Status,
          ),
          date: excelDate(row.date, row.date_iso),
          format: clean(row.format) || "Offline",
          dateLabel: excelDate(row.date, row.date_iso)
            ? null
            : clean(row.date) || "Periode 2025/2026",
          description: clean(row.description),
          kpi: clean(row.kpi),
          impact: clean(row.impact),
          evaluation: clean(row.evaluation),
          proposalLink: clean(row.proposal_link) || null,
          docsLink: clean(row.docs_link) || null,
          lpjLink: clean(row.lpj_link) || null,
          explicitId: clean(row.db_id || row.db_documentation_id) || null,
          collaborationGroup:
            clean(row.collaboration_group || row.event_group) || null,
        });
      });
    if (worksheet)
      appendRows(
        xlsx.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: null,
        }),
      );
    const excludedSheet = workbook.Sheets.Dikeluarkan;
    if (excludedSheet)
      appendRows(
        xlsx.utils.sheet_to_json<Record<string, unknown>>(excludedSheet, {
          defval: null,
        }),
      );
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
        const titles = [row["Record 1"], row["Record 2"]]
          .map(clean)
          .filter(Boolean);
        for (const program of programs.filter(
          (item) =>
            item.sourceFile === fileName &&
            titles.some((title) => sameProgramTitle(title, item.title)),
        )) {
          program.collaborationGroup = group;
        }
      }
    }
  }
  return programs;
};

const readPhotoFolders = (): SourcePhotoFolder[] => {
  if (!fs.existsSync(PHOTO_ROOT)) return [];
  const folders: SourcePhotoFolder[] = [];
  for (const commissariat of fs
    .readdirSync(PHOTO_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())) {
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
  return folders;
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
    result.rows = rows.map((row) => ({
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
      photos: [row.foto1, row.foto2, row.foto3, row.foto4, row.foto5, row.foto6]
        .filter(Boolean)
        .map(String),
    }));
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
) => {
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
    }));
  const exact = candidates.filter((program) =>
    sameProgramTitle(program.title, folder.prokerFolder),
  );
  if (exact.length)
    return exact.map((program) => ({
      program,
      type: "EXACT_MATCH" as const,
      score: 1,
    }));
  return [{ program: null, type: "UNMATCHED" as const, score: 0 }];
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
    if (exactId) {
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
    if (sameIdentity.length === 1) {
      const identity = sameIdentity[0];
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
      : cancelled
        ? legacy
          ? "CANCELLED_EXISTING_DELETE"
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

const convertToWebp = async (filePath: string) =>
  sharp(filePath).rotate().webp().toBuffer();

const legacyHashMap = async (legacy: LegacyProgram[]) => {
  const hashes = new Map<string, Set<string>>();
  for (const row of legacy) {
    for (const storedPath of row.photos) {
      const diskPath = path.join(PUBLIC_ROOT, storedPath.replace(/^\/+/, ""));
      if (!fs.existsSync(diskPath)) continue;
      const hash = await hashFile(diskPath);
      const ids = hashes.get(hash) ?? new Set<string>();
      ids.add(row.id);
      hashes.set(hash, ids);
    }
  }
  return hashes;
};

const buildPhotoPlans = async (
  folders: SourcePhotoFolder[],
  sources: SourceProgram[],
  programPlans: ProgramPlan[],
  legacy: LegacyProgram[],
  dbConnected: boolean,
) => {
  const plans: PhotoPlan[] = [];
  const existingHashes = dbConnected
    ? await legacyHashMap(legacy)
    : new Map<string, Set<string>>();
  const plannedHashes = new Set<string>();
  for (const folder of folders) {
    const sourceMatches = chooseSourcePrograms(folder, sources);
    for (const file of folder.files) {
      const extension = path.extname(file).toLowerCase();
      const relative = path.relative(PROJECT_ROOT, file);
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
        plans.push({
          sourceFolder: relative,
          commissariat: folder.commissariatFolder,
          prokerFolder: folder.prokerFolder,
          targetProgramIds: [],
          file: path.basename(file),
          extension,
          bytes: fs.statSync(file).size,
          sha256: null,
          destinationWebpPath: null,
          action: "ORPHAN",
          reason: "Unsupported image extension; no valid photo target.",
        });
        continue;
      }
      try {
        const webp = await convertToWebp(file);
        const sha256 = crypto.createHash("sha256").update(webp).digest("hex");
        if (!dbConnected || !validTargets.length) {
          const hasCancelledTarget = matchedPlans.some(
            (item) =>
              item.action === "CANCELLED_SKIP" ||
              item.action === "CANCELLED_EXISTING_DELETE",
          );
          const hasReviewTarget = matchedPlans.some(
            (item) =>
              item.action === "REVIEW" || item.matchType === "POSSIBLE_MATCH",
          );
          const action: PhotoAction =
            !dbConnected || (!hasCancelledTarget && !hasReviewTarget)
              ? "ORPHAN"
              : "SKIPPED_PHOTO";
          plans.push({
            sourceFolder: relative,
            commissariat: folder.commissariatFolder,
            prokerFolder: folder.prokerFolder,
            targetProgramIds: [],
            file: path.basename(file),
            extension,
            bytes: fs.statSync(file).size,
            sha256,
            destinationWebpPath: null,
            action,
            reason: !dbConnected
              ? "Database unavailable; no valid program target can be confirmed."
              : hasCancelledTarget
                ? "Cancelled program has no photo migration plan."
                : "Photo mapping is unresolved or review-only; no target is planned.",
          });
          continue;
        }
        const targetLabels = validTargets
          .map((item) => item.source.title)
          .join(", ");
        for (const item of validTargets) {
          const id = item.programId!;
          const destinationWebpPath = `/uploads/proker/${item.legacy?.commissariatSlug || commissariatKey(item.source.commissariat)}/${id}/${path.basename(file, extension)}.webp`;
          const duplicate = item.legacy
            ? existingHashes.get(sha256)?.has(item.legacy.id) ||
              plannedHashes.has(`${item.programId}:${sha256}`)
            : false;
          const action: PhotoAction = duplicate
            ? "DUPLICATE"
            : item.action === "ACTIVE_INSERT"
              ? "NEW_WEBP"
              : "LEGACY_PHOTO_REGISTRATION";
          if (!duplicate) plannedHashes.add(`${item.programId}:${sha256}`);
          plans.push({
            sourceFolder: relative,
            commissariat: folder.commissariatFolder,
            prokerFolder: folder.prokerFolder,
            targetProgramIds: [item.programId!],
            file: path.basename(file),
            extension,
            bytes: fs.statSync(file).size,
            sha256,
            destinationWebpPath,
            action,
            reason: `${duplicate ? "Final WebP SHA-256 already exists" : action === "NEW_WEBP" ? "New active program photo; WebP bytes hashed in memory only" : "Register photo for existing program without copying during preview"}. Confirmed target: ${targetLabels}.`,
          });
        }
      } catch (error) {
        plans.push({
          sourceFolder: relative,
          commissariat: folder.commissariatFolder,
          prokerFolder: folder.prokerFolder,
          targetProgramIds: [],
          file: path.basename(file),
          extension,
          bytes: fs.statSync(file).size,
          sha256: null,
          destinationWebpPath: null,
          action: "ORPHAN",
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }
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
      "CANCELLED_EXISTING_DELETE",
      "DOCUMENTED_DATABASE_ONLY_ARCHIVE",
      "UNDOCUMENTED_DATABASE_ONLY_DELETE",
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
      photos.filter((photo) => photo.action === key).length,
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
) => {
  const summary = summarize(plans, photos);
  const lines: string[] = [];
  lines.push("# Dry-Run Rekonsiliasi Program Kerja dan Dokumentasi Foto");
  lines.push("");
  lines.push(
    "> Laporan ini read-only. Tidak ada INSERT, UPDATE, DELETE, pemindahan file, overwrite foto, atau perubahan schema production.",
  );
  lines.push("");
  lines.push(`- **Dibuat:** ${new Date().toISOString()}`);
  lines.push(`- **Source root:** \`${sourceRoot}\``);
  lines.push(`- **Excel root:** \`${EXCEL_ROOT}\``);
  lines.push(`- **Dokumentasi root:** \`${PHOTO_ROOT}\``);
  lines.push(
    `- **Database read status:** ${database.connected ? "CONNECTED" : "BLOCKED/OFFLINE"}`,
  );
  if (database.error)
    lines.push(`- **Database error:** \`${markdown(database.error)}\``);
  lines.push(`- **Record Excel terbaru:** ${sources.length}`);
  lines.push(`- **Folder proker foto:** ${folders.length}`);
  lines.push(`- **File foto sumber:** ${photos.length}`);
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
      ? photos.filter(
          (photo) =>
            photo.targetProgramIds.includes(planItem.programId!) &&
            ["LEGACY_PHOTO_REGISTRATION", "NEW_WEBP"].includes(photo.action),
        ).length
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
    const rows = photos.filter((photo) =>
      photo.sourceFolder.startsWith(
        `${path.relative(PROJECT_ROOT, path.join(PHOTO_ROOT, folder.commissariatFolder, folder.prokerFolder))}${path.sep}`,
      ),
    );
    lines.push(
      `| ${markdown(folder.commissariatFolder)} | ${markdown(folder.prokerFolder)} | ${folder.files.length} | ${markdown([...new Set(rows.flatMap((row) => row.targetProgramIds))].join(", ") || "-")} | ${markdown([...new Set(rows.map((row) => row.destinationWebpPath).filter(Boolean))].join(", ") || "-")} | ${[...new Set(rows.map((row) => row.action))].join(", ") || "-"} | ${markdown([...new Set(rows.map((row) => row.reason))].join("; ") || "-")} |`,
    );
  }
  lines.push("");
  lines.push("## Detail File Foto dan SHA-256");
  lines.push("");
  lines.push(
    "| Source path | Destination WebP | SHA-256 final WebP | Target program IDs | Bytes | Action | Reason |",
  );
  lines.push("|---|---|---|---|---:|---|---|");
  for (const photo of photos)
    lines.push(
      `| \`${markdown(photo.sourceFolder)}\` | \`${markdown(photo.destinationWebpPath ?? "-")}\` | \`${photo.sha256 ?? "-"}\` | ${markdown(photo.targetProgramIds.join(", ") || "-")} | ${photo.bytes} | ${photo.action} | ${markdown(photo.reason)} |`,
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
    "4. Semua 148 record database tetap diperlakukan sebagai bagian periode 2025/2026; `LEGACY_ONLY` hanya berarti tidak muncul di Excel terbaru dan tidak dihapus atau diarsipkan otomatis.",
  );
  lines.push(
    "5. Foto disimpan sebagai child records berbasis SHA-256; kolom foto lama tetap dipertahankan. Foto proker baru berstatus pending insert sampai ID program dibuat.",
  );
  lines.push(
    "6. Tidak ada operasi mass delete, truncate, overwrite, atau pemindahan file sumber.",
  );
  lines.push(
    "7. Apply production hanya boleh dilakukan setelah approval eksplisit: `SETUJUI MIGRASI`.",
  );
  lines.push("");
  lines.push("## Approval Gate");
  lines.push("");
  lines.push(
    "Belum ada migration production yang dijalankan. Review laporan ini terlebih dahulu.",
  );
  return lines.join("\n") + "\n";
};

const main = async () => {
  if (hasFlag("--apply")) {
    const approval = argument("--approval");
    const backup = argument("--backup");
    if (approval !== APPROVAL_PHRASE)
      throw new Error(
        `Production apply requires --approval \"${APPROVAL_PHRASE}\".`,
      );
    if (
      !backup ||
      !fs.existsSync(path.resolve(backup)) ||
      fs.statSync(path.resolve(backup)).size < 1024
    )
      throw new Error(
        "Production apply requires a verified non-empty --backup file.",
      );
    throw new Error(
      "Production apply is intentionally not enabled in this audit pass. Review the generated report and request the approved apply pass separately.",
    );
  }
  const sources = readSourcePrograms();
  const folders = readPhotoFolders();
  const database = await readLegacyDatabase();
  const plans = matchPrograms(sources, database.rows, database.connected);
  const matchedLegacyIds = new Set(
    plans
      .filter((item) => item.legacy && item.matchType !== "NEW_PROGRAM")
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
        },
        matchType: "LEGACY_ONLY",
        legacy,
        confidence: 0,
        reason: legacy.photos.length
          ? "Database-only row has legacy documentation paths; archive it after review."
          : "Database-only row has no documentation evidence; delete only after explicit review.",
        action: legacy.photos.length
          ? "DOCUMENTED_DATABASE_ONLY_ARCHIVE"
          : "UNDOCUMENTED_DATABASE_ONLY_DELETE",
        metadataChanges: [],
        programId: legacy.id,
      });
  const photos = await buildPhotoPlans(
    folders,
    sources,
    plans.filter((item) => item.source.sourceFile !== "-"),
    database.rows,
    database.connected,
  );
  const report = renderReport(
    SOURCE_ROOT,
    database,
    sources,
    folders,
    plans,
    photos,
  );
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf8");
  fs.writeFileSync(
    JSON_REPORT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceRoot: SOURCE_ROOT,
        database,
        sources,
        folders,
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
