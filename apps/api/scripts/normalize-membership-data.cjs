/**
 * Normalisasi data Membership periode 2025/2026 di database target.
 *
 * Latar belakang: sumber data_genbi_final_db.xlsx punya variasi jabatan antar
 * komisariat (Ketua/Kepala, KADIV/SEKDIV, Anggota/Staff, Bendahara I/II, dst.)
 * sehingga tampilan Struktur Pengurus berantakan. Script ini menyeragamkan
 * jabatan tanpa mengubah makna, plus koreksi yang disepakati pemilik data
 * (UNESA +2 anggota, Seftia UNAIR masuk BPH Sekretaris Umum).
 *
 * Pakai:
 *   node scripts/normalize-membership-data.cjs            # dry-run (default)
 *   node scripts/normalize-membership-data.cjs --apply    # tulis ke database
 *
 * Aturan sengaja eksplisit dan idempoten: dijalankan dua kali, kali kedua
 * tidak menghasilkan perubahan.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");

const PERIOD = "2025/2026";
const APPLY = process.argv.includes("--apply");
const REPORT_ROOT = path.resolve(__dirname, "../../../artifacts/membership");

/** Aturan jabatan untuk anggota yang punya divisi (bukan BPH). */
const DIVISION_POSITION_RULES = [
  ["Ketua/Kepala", "Ketua Divisi"],
  ["Anggota/Staff", "Staff Divisi"],
  ["Staf Divisi", "Staff Divisi"],
  ["Waki Kepala Divisi", "Wakil Kepala Divisi"],
  ["Sekretaris Divisi; Staff Divisi", "Sekretaris Divisi"],
  ["Sekretaris", "Sekretaris Divisi"],
  ["KADIV", "Kepala Divisi"],
  ["SEKDIV", "Sekretaris Divisi"],
  ["Wakil Divisi", "Wakil Ketua Divisi"],
];

/**
 * Override jabatan BPH per orang. Kunci: `${slug}|${nama.toLowerCase()}`.
 * Kasus "Sekretaris I/II" dan "Bendahara I/II": nomor 1 = Umum, nomor 2 = Wakil.
 */
const BPH_POSITION_OVERRIDES = [
  ["its", "Keysha Amelia", "Sekretaris Umum"],
  ["its", "Ratna Maulidah Wulandari", "Bendahara Umum"],
  ["pens", "Charistma Tsani", "Sekretaris Umum"],
  ["pens", "Anindya Puspita Budiariani", "Wakil Sekretaris"],
  ["pens", "Sabrina Humaira", "Bendahara Umum"],
  ["pens", "Very Baktiyar Santosa", "Wakil Bendahara"],
  ["uinsa", "M. Ali Kurrobi", "Ketua Umum"],
  ["uinsa", "Ikhfa Amelia Tantiyuana", "Sekretaris Umum"],
  ["uinsa", "Novia Putri Ramadhan", "Bendahara Umum"],
  ["unair", "Sulton Arifin", "Ketua Umum"],
  ["unair", "Diah Skar Arum", "Bendahara Umum"],
  ["unair", "Artika Rizkyanti Widyanto", "Wakil Bendahara"],
  ["unair", "Gabriel Gamel Gunason", "Wakil Sekretaris"],
  ["unesa", "Nur Laily Zumrotul Khasana", "Sekretaris Umum"],
  ["unesa", "Adella Putri Ramdhani", "Wakil Sekretaris"],
  ["unesa", "Dewi Alysia Nabila Solikhah", "Bendahara Umum"],
  ["unesa", "Tria Kurnia Sari", "Wakil Bendahara"],
  ["unugiri", "Wella Vernanda Meilasaroh", "Sekretaris Umum"],
  ["unugiri", "Dwi Nur Laili", "Wakil Sekretaris"],
  ["unugiri", "Siti Nur Hamidah", "Bendahara Umum"],
  ["unugiri", "Vivin Findika Aprilla E.s", "Wakil Bendahara"],
  ["upnvjt", "Titis Fajar Nurdansyah", "Wakil Ketua"],
  ["upnvjt", "Natasya Maura Amanca Febrianti", "Sekretaris Umum"],
  ["upnvjt", "Theressa Marry Christianty", "Wakil Sekretaris"],
  ["utm", "Tesa Putri Hutagaol", "Sekretaris Umum"],
  ["utm", "Nadia Masfufatul Islamiyah", "Wakil Sekretaris"],
  ["utm", "Dhea Rahma Dianti", "Bendahara Umum"],
  ["utm", "Hanifah Muslimah", "Wakil Bendahara"],
];

/**
 * Pindah divisi + jabatan sekaligus.
 * - UNAIR "Seftia Handa Fransisca": ada di daftar Non Staff, padahal Sekretaris Umum.
 * - UNAIR "Nada Ayu Nurul Fadilah": Wakil Kepala Divisi Pendidikan (feed IG).
 * - UNAIR "Nanda Fitra Ardana": divisi "Media Komunikasi & Hubungan Luar" dibubarkan, pindah ke Media Komunikasi.
 * - UINSA: 10 staff divisi Kesehatan & Sosial Masyarakat (dari daftar pemilik data).
 * - UTM: 14 anggota yang sebelumnya Non Staff pindah ke divisi masing-masing (daftar lengkap 75 nama).
 */
const DIVISION_MOVES = [
  ["unair", "Seftia Handa Fransisca", "BPH", "Sekretaris Umum"],
  ["unair", "Nada Ayu Nurul Fadilah", "Pendidikan", "Wakil Kepala Divisi"],
  ["unair", "Nanda Fitra Ardana", "Media Komunikasi", "Sekretaris Divisi"],
  ["uinsa", "M Zaidan Husni Mubarok Hakam", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["uinsa", "Amanda Sita Amalia", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["uinsa", "Zahirah Nadiatus Salsabila", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["uinsa", "Ra Diana Maulidiyah", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["uinsa", "Ignacia Nabila Djorsy", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["uinsa", "Safrien Najiha", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["uinsa", "Muhammad Bagus Ramadhan", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["uinsa", "Nurul Aisatul Masita", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["uinsa", "Nurul Istiqomah", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["uinsa", "Desfriana Fatika Wardhana", "Kesehatan & Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Irma Wahyu Nur Fadilah", "Pendidikan", "Staff Divisi"],
  ["utm", "Ahmad Alaika Kamaluddin", "Ekonomi Kreatif", "Staff Divisi"],
  ["utm", "Setya Widarti Norianing Tes", "Ekonomi Kreatif", "Staff Divisi"],
  ["utm", "Rad Azhar Romadhan", "Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Bonang Wahyudi", "Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Mayatul Laili Muharomah", "Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Nur Laili Samak", "Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Rahmawati", "Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Siti Hotimatul Husna", "Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Amiliya", "Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Yomaterah Natasya Meiyanti Butarbutar", "Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Debby Marina Siregar", "Sosial Masyarakat", "Staff Divisi"],
  ["utm", "Poeti Oktafia", "Lingkungan Hidup", "Staff Divisi"],
  ["utm", "Ade Verdaus Saputra", "Lingkungan Hidup", "Staff Divisi"],
];

/**
 * Override jabatan untuk anggota divisi (bukan BPH) yang tidak ikut aturan
 * generik. ITS: dua sub-divisi di bawah Ketua Divisi & Sekretaris Divisi.
 */
const DIVISION_POSITION_OVERRIDES = [
  ["its", "Salsa Berlian Nabilah", "Kepala Sub Divisi Sumber Daya Manusia"],
  ["its", "Sidiq Bimo Pangestu", "Kepala Sub Divisi Regenerasi"],
];

/** Anggota yang belum ada di database (dari daftar lengkap pemilik data). */
const ADDITIONS = [
  {
    slug: "unesa",
    name: "Muhammad Zaini Rochman",
    position: "Ketua Divisi",
    division: "Pendidikan",
    studyProgram: "-",
  },
  {
    slug: "unesa",
    name: "Syahirotul Ambar Maulidiyah",
    position: "Sekretaris Divisi",
    division: "Hubungan Eksternal",
    studyProgram: "-",
  },
  {
    slug: "unair",
    name: "Tessa",
    position: "Kepala Divisi",
    division: "Pendidikan",
    studyProgram: "-",
  },
  {
    slug: "unair",
    name: "Tata",
    position: "Pemberdayaan dan Kreativitas",
    division: "BPH",
    studyProgram: "-",
  },
];

const key = (slug, name) => `${slug}|${name.trim().toLowerCase()}`;
const overrideMap = new Map(BPH_POSITION_OVERRIDES.map(([slug, name, position]) => [key(slug, name), position]));
const divisionOverrideMap = new Map(DIVISION_POSITION_OVERRIDES.map(([slug, name, position]) => [key(slug, name), position]));
const moveMap = new Map(DIVISION_MOVES.map(([slug, name, division, position]) => [key(slug, name), { division, position }]));
const divisionRuleMap = new Map(DIVISION_POSITION_RULES.map(([from, to]) => [from.toLowerCase(), to]));

const main = async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");
  const prisma = new PrismaClient();
  const targetDatabase = (() => {
    const url = new URL(process.env.DATABASE_URL);
    return `${url.hostname}:${url.port || "3306"}${url.pathname}`;
  })();

  try {
    const periods = await prisma.period.findMany({ where: { label: PERIOD }, select: { id: true, commissariatId: true } });
    if (!periods.length) throw new Error(`Period ${PERIOD} not found.`);

    const commissariats = await prisma.commissariat.findMany({
      select: { id: true, slug: true, name: true, memberCount: true },
    });
    const slugById = new Map(commissariats.map((item) => [item.id, item.slug]));
    const commissariatBySlug = new Map(commissariats.map((item) => [item.slug, item]));
    const periodIdBySlug = new Map(periods.map((item) => [slugById.get(item.commissariatId), item.id]));
    const periodIds = periods.map((item) => item.id);

    const divisions = await prisma.division.findMany({
      where: { periodId: { in: periodIds } },
      select: { id: true, name: true, commissariatId: true },
    });
    const divisionIdByKey = new Map(divisions.map((item) => [`${slugById.get(item.commissariatId)}|${item.name}`, item.id]));

    const memberships = await prisma.membership.findMany({
      where: { periodId: { in: periodIds } },
      select: { id: true, commissariatId: true, divisionId: true, name: true, position: true, studyProgram: true },
    });

    const changes = [];
    const updates = [];
    const skipped = [];

    for (const membership of memberships) {
      const slug = slugById.get(membership.commissariatId);
      const divisionName = membership.divisionId
        ? divisions.find((item) => item.id === membership.divisionId)?.name ?? null
        : null;
      const move = moveMap.get(key(slug, membership.name));

      let nextPosition = membership.position;
      let nextDivisionId = membership.divisionId;
      let nextDivisionName = divisionName;
      let reason = null;

      if (move) {
        const targetDivisionId = divisionIdByKey.get(`${slug}|${move.division}`);
        if (!targetDivisionId) throw new Error(`Division ${move.division} not found for ${slug}.`);
        nextPosition = move.position;
        nextDivisionId = targetDivisionId;
        nextDivisionName = move.division;
        reason = "pindah divisi + jabatan sesuai koreksi pemilik data";
      } else if (divisionName === "BPH") {
        const override = overrideMap.get(key(slug, membership.name));
        if (override) {
          nextPosition = override;
          reason = "penyeragaman jabatan BPH";
        }
      } else if (divisionName) {
        const divisionOverride = divisionOverrideMap.get(key(slug, membership.name));
        const mapped = divisionRuleMap.get(membership.position.trim().toLowerCase());
        if (divisionOverride) {
          nextPosition = divisionOverride;
          reason = "penyeragaman jabatan sub-divisi";
        } else if (mapped) {
          nextPosition = mapped;
          reason = "penyeragaman jabatan divisi";
        }
      }

      const positionChanged = nextPosition !== membership.position;
      const divisionChanged = nextDivisionId !== membership.divisionId;
      if (positionChanged || divisionChanged) {
        changes.push({
          slug,
          name: membership.name,
          from: { division: divisionName, position: membership.position },
          to: { division: nextDivisionName, position: nextPosition },
          reason,
        });
        updates.push({ id: membership.id, position: nextPosition, divisionId: nextDivisionId });
      }
    }

    // Deteksi anggota yang belum ada (nama + prodi) supaya tidak dobel saat apply.
    const existingKeys = new Set(memberships.map((item) => key(slugById.get(item.commissariatId), item.name)));
    const validAdditions = [];
    for (const addition of ADDITIONS) {
      if (existingKeys.has(key(addition.slug, addition.name))) {
        skipped.push({ addition, reason: "sudah ada di database" });
        continue;
      }
      const commissariat = commissariatBySlug.get(addition.slug);
      const divisionId = divisionIdByKey.get(`${addition.slug}|${addition.division}`);
      if (!commissariat || !divisionId) throw new Error(`Addition target not found: ${JSON.stringify(addition)}`);
      validAdditions.push({ ...addition, commissariatId: commissariat.id, divisionId, periodId: periodIdBySlug.get(addition.slug) });
    }

    // Ringkasan hasil yang akan diterapkan.
    const changedCount = updates.length;
    const addedCount = validAdditions.length;
    console.log(`[membership-normalize] ${targetDatabase}`);
    console.log(`  updates: ${changedCount} membership, additions: ${addedCount}, skipped: ${skipped.length}`);
    for (const change of changes) {
      console.log(`  ~ ${change.slug} | ${change.name} | ${change.from.division ?? "-"} / ${change.from.position} -> ${change.to.division ?? "-"} / ${change.to.position}`);
    }
    for (const addition of validAdditions) {
      console.log(`  + ${addition.slug} | ${addition.name} | ${addition.division} / ${addition.position}`);
    }

    if (!APPLY) {
      console.log("Dry-run selesai. Tambahkan --apply untuk menulis ke database.");
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        await tx.membership.update({
          where: { id: update.id },
          data: update.divisionId ? { position: update.position, divisionId: update.divisionId } : { position: update.position },
        });
      }
      for (const addition of validAdditions) {
        await tx.membership.create({
          data: {
            commissariatId: addition.commissariatId,
            periodId: addition.periodId,
            divisionId: addition.divisionId,
            name: addition.name,
            position: addition.position,
            studyProgram: addition.studyProgram,
            publicationStatus: "PUBLISHED",
            membershipStatus: "ACTIVE",
          },
        });
      }
      // Divisi yang jadi kosong setelah pemindahan (mis. sisa penggabungan
      // divisi UNAIR) dibersihkan hanya kalau tidak dipakai proker/assignment.
      const deletedDivisions = [];
      const emptyDivisions = await tx.division.findMany({
        where: { periodId: { in: periodIds }, memberships: { none: {} } },
        select: { id: true, name: true, commissariatId: true, _count: { select: { programs: true, assignments: true } } },
      });
      for (const division of emptyDivisions) {
        if (division._count.programs === 0 && division._count.assignments === 0) {
          await tx.division.delete({ where: { id: division.id } });
          deletedDivisions.push({ slug: slugById.get(division.commissariatId), name: division.name });
        }
      }
      // Sinkronkan memberCount komisariat dengan jumlah membership periode ini.
      const counts = await tx.membership.groupBy({
        by: ["commissariatId"],
        where: { periodId: { in: periodIds } },
        _count: { _all: true },
      });
      for (const count of counts) {
        await tx.commissariat.update({ where: { id: count.commissariatId }, data: { memberCount: count._count._all } });
      }
      return { counts, deletedDivisions };
    });

    // Verifikasi pasca-apply: ringkasan jabatan per komisariat/divisi.
    const after = await prisma.membership.findMany({
      where: { periodId: { in: periodIds } },
      select: {
        name: true,
        position: true,
        commissariat: { select: { slug: true } },
        division: { select: { name: true } },
      },
    });
    const perCommissariat = {};
    for (const item of after) perCommissariat[item.commissariat.slug] = (perCommissariat[item.commissariat.slug] ?? 0) + 1;

    const remainingWarnings = [];
    const canonicalBphRoles = new Set(["Ketua Umum", "Wakil Ketua", "Sekretaris Umum", "Wakil Sekretaris", "Bendahara Umum", "Wakil Bendahara"]);
    for (const [slug] of Object.entries(perCommissariat)) {
      const bphPositions = after.filter((item) => item.commissariat.slug === slug && item.division?.name === "BPH");
      for (const role of new Set(bphPositions.map((item) => item.position))) {
        const members = bphPositions.filter((item) => item.position === role);
        if (members.length > 1) remainingWarnings.push(`${slug}: BPH punya ${members.length}x "${role}" (${members.map((item) => item.name).join(", ")}).`);
        if (!canonicalBphRoles.has(role)) remainingWarnings.push(`${slug}: BPH punya jabatan non-kanonik "${role}" (${members.map((item) => item.name).join(", ")}).`);
      }
      const divisionsForSlug = await prisma.division.findMany({ where: { periodId: { in: periodIds }, commissariat: { slug } }, select: { name: true } });
      for (const division of divisionsForSlug.flatMap((item) => (item.name === "BPH" ? [] : [item.name]))) {
        const members = after.filter((item) => item.commissariat.slug === slug && item.division?.name === division);
        const leads = members.filter((item) => ["Ketua Divisi", "Kepala Divisi"].includes(item.position));
        if (!leads.length) remainingWarnings.push(`${slug}/${division}: tidak ada Ketua/Kepala Divisi (${members.length} anggota).`);
        if (leads.length > 1) remainingWarnings.push(`${slug}/${division}: punya ${leads.length}x Ketua/Kepala Divisi (${leads.map((item) => item.name).join(", ")}).`);
        const secretaries = members.filter((item) => item.position === "Sekretaris Divisi");
        if (secretaries.length > 1) remainingWarnings.push(`${slug}/${division}: punya ${secretaries.length}x Sekretaris Divisi (${secretaries.map((item) => item.name).join(", ")}).`);
        const staff = members.filter((item) => item.position === "Staff Divisi");
        if (members.length > 1 && !staff.length) remainingWarnings.push(`${slug}/${division}: tidak punya Staff Divisi (${members.length} anggota).`);
      }
    }

    const reportDir = path.join(REPORT_ROOT, `${new Date().toISOString().replace(/[:.]/g, "-")}-normalization`);
    fs.mkdirSync(reportDir, { recursive: true });
    const report = {
      runAt: new Date().toISOString(),
      database: targetDatabase,
      period: PERIOD,
      updates: changes,
      additions: validAdditions.map(({ commissariatId, divisionId, ...rest }) => rest),
      skippedAdditions: skipped,
      deletedDivisions: result.deletedDivisions,
      perCommissariat,
      remainingWarnings,
    };
    fs.writeFileSync(path.join(reportDir, "membership-normalization.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
    const markdown = [
      "# Membership Normalization Report",
      "",
      `- Run at: ${report.runAt}`,
      `- Database: ${targetDatabase}`,
      `- Period: ${PERIOD}`,
      `- Updated rows: ${updates.length}`,
      `- Added rows: ${validAdditions.length}`,
      `- Skipped additions: ${skipped.length}`,
      "",
      "## Changes",
      "",
      ...(changes.length
        ? changes.map((change) => `- ${change.slug} | ${change.name}: ${change.from.division ?? "-"} / ${change.from.position} -> ${change.to.division ?? "-"} / ${change.to.position}`)
        : ["- None"]),
      "",
      "## Additions",
      "",
      ...(validAdditions.length ? validAdditions.map((addition) => `- ${addition.slug} | ${addition.name} | ${addition.division} | ${addition.position} | ${addition.studyProgram}`) : ["- None"]),
      "",
      "## Deleted empty divisions",
      "",
      ...(result.deletedDivisions.length ? result.deletedDivisions.map((division) => `- ${division.slug} | ${division.name}`) : ["- None"]),
      "",
      "## Per commissariat totals",
      "",
      ...Object.entries(perCommissariat).sort().map(([slug, count]) => `- ${slug}: ${count}`),
      "",
      "## Remaining warnings",
      "",
      ...(remainingWarnings.length ? remainingWarnings.map((warning) => `- ${warning}`) : ["- None"]),
    ].join("\n");
    fs.writeFileSync(path.join(reportDir, "membership-normalization.md"), `${markdown}\n`, "utf8");
    console.log(`Applied. Report: ${path.join(reportDir, "membership-normalization.md")}`);
    for (const warning of remainingWarnings) console.warn(`  ! ${warning}`);
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
