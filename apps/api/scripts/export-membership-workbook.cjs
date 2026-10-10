/**
 * Ekspor ulang data/anggota/data_genbi_final_db.xlsx dari database.
 *
 * Dipakai setelah rekonsiliasi data membership 30 September 2026 supaya file
 * sumber (yang dipakai import) sama persis dengan database hasil perbaikan.
 * File lama dicadangkan ke backups/ (gitignored) sebelum ditimpa.
 *
 * Pakai:
 *   node scripts/export-membership-workbook.cjs            # tulis ke data/anggota
 *   node scripts/export-membership-workbook.cjs --out <path>
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createRequire } = require("module");

const API_DIR = path.resolve(__dirname, "..");
const localRequire = createRequire(path.join(API_DIR, "package.json"));
localRequire("dotenv").config({ path: path.join(API_DIR, ".env") });
const { PrismaClient } = localRequire("@prisma/client");
const XLSX = localRequire("@e965/xlsx");

const REPO_ROOT = path.resolve(__dirname, "../../..");
const TARGET = process.argv.includes("--out")
  ? path.resolve(process.argv[process.argv.indexOf("--out") + 1])
  : path.join(REPO_ROOT, "data/anggota/data_genbi_final_db.xlsx");
const BACKUP_DIR = path.join(REPO_ROOT, "backups");
const PERIOD = "2025/2026";

const COMMISSARIATS = [
  ["its", "ITS"],
  ["pens", "PENS"],
  ["uin-madura", "UIN Madura"],
  ["uinsa", "UINSA"],
  ["unair", "UNAIR"],
  ["unesa", "UNESA"],
  ["unugiri", "UNUGIRI"],
  ["upnvjt", "UPN Veteran Jatim"],
  ["utm", "UTM"],
];
const orderBySlug = new Map(COMMISSARIATS.map(([slug], index) => [slug, index]));

const positionRank = (position) => {
  const value = position.toLowerCase();
  if (value.includes("wakil ketua divisi")) return 41;
  if (value.includes("ketua divisi") || value.includes("kepala divisi")) return 40;
  if (value.includes("sekretaris divisi")) return 42;
  if (value.includes("bendahara divisi")) return 43;
  if (value.includes("wakil ketua")) return 10;
  if (value.includes("ketua umum")) return 0;
  if (value.includes("wakil sekretaris")) return 21;
  if (value.includes("sekretaris umum")) return 20;
  if (value.includes("wakil bendahara")) return 31;
  if (value.includes("bendahara umum")) return 30;
  if (value.includes("sub divisi")) return 50;
  if (value.includes("non staff")) return 70;
  if (value.includes("staff") || value.includes("staf") || value.includes("anggota")) return 60;
  if (value.includes("wakil")) return 45;
  if (value.includes("ketua") || value.includes("kepala")) return 40;
  if (value.includes("sekretaris")) return 20;
  if (value.includes("bendahara")) return 30;
  return 65;
};

const main = async () => {
  const prisma = new PrismaClient();
  try {
    const memberships = await prisma.membership.findMany({
      where: { period: { label: PERIOD } },
      select: {
        name: true,
        position: true,
        studyProgram: true,
        commissariat: { select: { slug: true } },
        division: { select: { name: true } },
      },
    });
    if (!memberships.length) throw new Error("Tidak ada membership untuk diekspor.");

    const rows = memberships.map((item) => ({
      slug: item.commissariat.slug,
      name: item.name,
      position: item.position,
      division: item.division?.name ?? "",
      studyProgram: item.studyProgram,
    }));
    rows.sort((a, b) => {
      const bySlug = (orderBySlug.get(a.slug) ?? 99) - (orderBySlug.get(b.slug) ?? 99);
      if (bySlug) return bySlug;
      const divisionA = a.division === "BPH" ? "" : a.division || "\uffff";
      const divisionB = b.division === "BPH" ? "" : b.division || "\uffff";
      const byDivision = divisionA.localeCompare(divisionB, "id");
      if (byDivision) return byDivision;
      const byRank = positionRank(a.position) - positionRank(b.position);
      if (byRank) return byRank;
      return a.name.localeCompare(b.name, "id");
    });

    const nameBySlug = new Map(COMMISSARIATS);
    const sheetData = [
      ["komisariat", "nama", "jabatan", "divisi", "prodi"],
      ...rows.map((row) => [nameBySlug.get(row.slug) ?? row.slug, row.name, row.position, row.division, row.studyProgram]),
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetData), "Data Final");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    if (fs.existsSync(TARGET)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      const backup = path.join(BACKUP_DIR, `${path.basename(TARGET, ".xlsx")}-before-export-2026-09-30.xlsx`);
      if (!fs.existsSync(backup)) {
        fs.copyFileSync(TARGET, backup);
        console.log(`Backup file lama: ${backup}`);
      } else {
        console.log(`Backup file lama sudah ada: ${backup}`);
      }
    }
    const temp = `${TARGET}.tmp`;
    fs.writeFileSync(temp, buffer);
    fs.renameSync(temp, TARGET);

    const hash = crypto.createHash("sha256").update(fs.readFileSync(TARGET)).digest("hex");
    console.log(`Tulis: ${TARGET}`);
    console.log(`Baris data: ${rows.length}`);
    console.log(`SHA-256: ${hash}`);
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
