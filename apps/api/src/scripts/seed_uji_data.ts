import dotenv from "dotenv";
import path from "node:path";
import XLSX from "@e965/xlsx";

/*
 * Skrip data uji [UJI] untuk alur persetujuan (tiket #98).
 *
 * Satu Interface publik — "siapkan data uji" — dengan detail tersembunyi di
 * implementasi. Semua data dibuat lewat jalur API kanonik (sanitasi konten,
 * staging aset, transisi status, audit) supaya invarian tetap terjaga.
 *
 * Idempoten dan bisa dilanjutkan: tiap item dicek dengan judul/nama persis
 * milik skrip ini, bagian yang sudah ada dilewati, bagian yang kurang
 * dilengkapi — dijalankan ulang tidak pernah menggandakan data.
 */

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const API = process.env.SEED_API_URL ?? "http://localhost:5000/api";
const MARK = "[UJI]";
const BATCH_FILENAME = "uji-awardee-batch.xlsx";

// Judul/nama persis milik skrip ini (penjagaan idempoten), sengaja tidak
// memakai prefiks [UJI] saja supaya tidak bentrok dengan artefak uji lain.
const NEWS_TITLES = [
  `${MARK} Berita diajukan pertama`,
  `${MARK} Berita diajukan kedua`,
  `${MARK} Berita draf dengan galeri`,
] as const;
const PROGRAM_TITLES = [
  `${MARK} Program diajukan`,
  `${MARK} Program draf`,
] as const;
const MEMBERSHIP_SEED = [
  ["Awardee Satu", "Pendidikan", "Anggota", "Teknik Informatika"],
  ["Awardee Dua", "Ekonomi Kreatif", "Anggota", "Manajemen"],
  ["Awardee Tiga", "Media Komunikasi", "Staff Divisi", "Ilmu Komunikasi"],
  ["Awardee Empat", "Sosial Lingkungan", "Anggota", "Biologi"],
  ["Awardee Lima", "Hubungan Eksternal", "Anggota", "Hubungan Internasional"],
] as const;
const MEMBERSHIP_NAMES = MEMBERSHIP_SEED.map(([name]) => `${MARK} ${name}`);

// PNG 1x1 valid untuk cover/galeri uji (dikonversi WebP oleh server).
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

type Session = { cookie: string };

const login = async (username: string, password: string): Promise<Session> => {
  const res = await fetch(`${API}/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`Login ${username} gagal (${res.status}).`);
  const cookie = res.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  return { cookie };
};

const readData = async <T>(res: Response, label: string): Promise<T> => {
  const body = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(
      `${label} gagal (${res.status}): ${JSON.stringify(body?.error ?? body)}`,
    );
  return body?.data as T;
};

const getJson = async <T>(pathName: string, session: Session, label: string) =>
  readData<T>(
    await fetch(`${API}${pathName}`, { headers: { cookie: session.cookie } }),
    label,
  );

const postJson = async <T>(
  pathName: string,
  session: Session,
  payload: unknown,
  label: string,
) =>
  readData<T>(
    await fetch(`${API}${pathName}`, {
      method: "POST",
      headers: { cookie: session.cookie, "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
    label,
  );

const postForm = async <T>(
  pathName: string,
  session: Session,
  form: FormData,
  label: string,
) =>
  readData<T>(
    await fetch(`${API}${pathName}`, {
      method: "POST",
      headers: { cookie: session.cookie },
      body: form,
    }),
    label,
  );

const fileOf = (buffer: Buffer, type: string, filename: string) =>
  new File([new Uint8Array(buffer)], filename, { type });

type DeptRow = { id: string; name: string };
type Options = {
  period: { id: string; label: string } | null;
  commissariat: { id: string; name: string } | null;
  divisions: DeptRow[];
};

type CmsNews = { id: string; title: string; publicationStatus: string };
type CmsProgram = {
  id: string;
  namaProker: string;
  publicationStatus: string;
  divisionId: string | null;
};
type CmsMembership = {
  id: string;
  name: string;
  publicationStatus: string;
};
type PreviewRow = { id: string; sourceFilename: string; status: string };
type PreviewCreate = {
  previewId: string;
  status: string;
  totalRows: number;
  invalidCount: number;
  ambiguousCount: number;
  duplicateCount: number;
};

const main = async () => {
  const admin = await login(
    process.env.DEV_ADMIN_USERNAME ?? "admin-dev",
    process.env.DEV_ADMIN_PASSWORD ?? "",
  );
  const sekum = await login(
    process.env.DEV_SEKRETARIS_USERNAME ?? "sekretaris-dev",
    process.env.DEV_SEKRETARIS_PASSWORD ?? "",
  );

  const options = await getJson<Options>(
    "/v1/memberships/cms/options",
    sekum,
    "Opsi scope sekretaris",
  );
  const { commissariat, period, divisions } = options;
  if (!commissariat || !period || divisions.length === 0)
    throw new Error("Scope komisariat sekretaris tidak lengkap.");

  const divisionId = (name: string) => {
    const found = divisions.find((item) => item.name === name);
    if (!found)
      throw new Error(
        `Divisi "${name}" tidak ada di scope ${commissariat.name}.`,
      );
    return found.id;
  };

  const actions: string[] = [];

  // --- Keadaan saat ini (idempoten per item).
  const news = await getJson<CmsNews[]>("/v1/news/cms", admin, "Daftar berita");
  const programs = await getJson<CmsProgram[]>(
    "/v1/programs?scope=all&pageSize=1000",
    admin,
    "Daftar program",
  );
  const memberships = await getJson<CmsMembership[]>(
    "/v1/memberships/cms?pageSize=1000",
    admin,
    "Daftar awardee",
  );
  const previews: PreviewRow[] = [];
  for (const status of ["PREVIEW_READY", "COMMITTED", "SUBMITTED"]) {
    previews.push(
      ...(await getJson<PreviewRow[]>(
        `/v1/membership-imports?status=${status}`,
        admin,
        `Daftar batch (${status})`,
      )),
    );
  }

  const hasNews = (title: string) => news.some((item) => item.title === title);
  const hasProgram = (title: string) =>
    programs.some((item) => item.namaProker === title);
  const hasMembership = (name: string) =>
    memberships.some((item) => item.name === name);
  const batchRows = previews.filter(
    (item) => item.sourceFilename === BATCH_FILENAME,
  );

  // --- 1) Berita: 2 diajukan ber-cover + 1 draf ber-galeri 2 gambar.
  const createNews = async (title: string, category: string) => {
    const form = new FormData();
    form.append("title", title);
    form.append("excerpt", "Data uji alur persetujuan; aman untuk dihapus.");
    form.append(
      "content",
      "<p>Data uji <strong>[UJI]</strong> untuk mencoba alur persetujuan berita.</p>",
    );
    form.append("category", category);
    form.append("author", "Tim Uji GenBI");
    form.append("cover", fileOf(PNG, "image/png", "cover-uji.png"));
    return postForm<CmsNews>("/v1/news", sekum, form, `Buat berita ${title}`);
  };
  const submitNews = async (id: string) =>
    postJson<CmsNews>(
      `/v1/news/${id}/transition`,
      sekum,
      { status: "SUBMITTED" },
      "Ajukan berita",
    );

  if (!hasNews(NEWS_TITLES[0])) {
    const created = await createNews(NEWS_TITLES[0], "KEGIATAN");
    await submitNews(created.id);
    actions.push(`berita dibuat + diajukan: ${NEWS_TITLES[0]}`);
  } else actions.push(`berita dilewati (sudah ada): ${NEWS_TITLES[0]}`);

  if (!hasNews(NEWS_TITLES[1])) {
    const created = await createNews(NEWS_TITLES[1], "WEBINAR");
    await submitNews(created.id);
    actions.push(`berita dibuat + diajukan: ${NEWS_TITLES[1]}`);
  } else actions.push(`berita dilewati (sudah ada): ${NEWS_TITLES[1]}`);

  if (!hasNews(NEWS_TITLES[2])) {
    const created = await createNews(NEWS_TITLES[2], "EDUKASI");
    for (let index = 1; index <= 2; index += 1) {
      const galleryForm = new FormData();
      galleryForm.append(
        "file",
        fileOf(PNG, "image/png", `galeri-${index}.png`),
      );
      await postForm(
        `/v1/news/${created.id}/gallery`,
        admin,
        galleryForm,
        `Tambah galeri ${index}`,
      );
    }
    actions.push(`berita draf + 2 galeri dibuat: ${NEWS_TITLES[2]}`);
  } else actions.push(`berita draf dilewati (sudah ada): ${NEWS_TITLES[2]}`);

  // --- 2) Program Kerja: 1 diajukan, 1 draf; beda divisi (admin lintas divisi).
  const createProgram = async (
    title: string,
    divisionName: string,
    submit: boolean,
  ) => {
    const created = await postJson<CmsProgram>(
      "/v1/programs",
      admin,
      {
        title,
        description:
          "Data uji [UJI] untuk mencoba alur persetujuan Program Kerja.",
        format: "OFFLINE",
        startDate: "2026-11-10",
        endDate: "2026-11-10",
        objectives: ["Menguji alur persetujuan"],
        commissariatId: commissariat.id,
        periodId: period.id,
        divisionId: divisionId(divisionName),
      },
      `Buat program ${title}`,
    );
    if (submit)
      await postJson(
        `/v1/programs/${created.id}/transition`,
        admin,
        { status: "SUBMITTED" },
        "Ajukan program",
      );
    return created;
  };
  const programPlan: Array<[string, string, boolean]> = [
    [PROGRAM_TITLES[0], "Pendidikan", true],
    [PROGRAM_TITLES[1], "Ekonomi Kreatif", false],
  ];
  for (const [title, divisionName, submit] of programPlan) {
    if (!hasProgram(title)) {
      await createProgram(title, divisionName, submit);
      actions.push(
        `program dibuat${submit ? " + diajukan" : " (draf)"}: ${title}`,
      );
    } else actions.push(`program dilewati (sudah ada): ${title}`);
  }

  // --- 3) Awardee manual: 5 baris diajukan, divisi bervariasi.
  for (const [name, divisionName, position, studyProgram] of MEMBERSHIP_SEED) {
    const fullName = `${MARK} ${name}`;
    if (!hasMembership(fullName)) {
      await postJson(
        "/v1/memberships/cms",
        sekum,
        {
          name: fullName,
          position,
          studyProgram,
          divisionId: divisionId(divisionName),
        },
        `Buat awardee ${name}`,
      );
      actions.push(`awardee dibuat (draf): ${fullName}`);
    } else actions.push(`awardee dilewati (sudah ada): ${fullName}`);
  }
  const ourMemberships = memberships.filter((item) =>
    MEMBERSHIP_NAMES.includes(item.name),
  );
  const pengajuanTerbuka =
    ourMemberships.some((item) => item.publicationStatus === "DRAFT") ||
    MEMBERSHIP_NAMES.some((name) => !hasMembership(name));
  if (pengajuanTerbuka) {
    await postJson(
      "/v1/memberships/cms/submit",
      sekum,
      {},
      "Ajukan awardee manual",
    );
    actions.push("awardee manual diajukan (SUBMITTED)");
  } else actions.push("awardee manual sudah diajukan sebelumnya");

  // --- 4) Batch impor: 5 baris, diajukan.
  const submittedBatch = batchRows.find((item) => item.status === "SUBMITTED");
  if (submittedBatch) {
    actions.push("batch impor dilewati (sudah diajukan)");
  } else {
    let previewId = batchRows.find((item) =>
      ["PREVIEW_READY", "COMMITTED"].includes(item.status),
    )?.id;

    if (!previewId) {
      const sheetRows = [
        ["Komisariat", "Nama Lengkap", "Jabatan", "Divisi", "Prodi"],
        ...MEMBERSHIP_SEED.map(
          ([name, divisionName, position, studyProgram]) => [
            commissariat.name,
            `${MARK} ${name} Impor`,
            position,
            divisionName,
            studyProgram,
          ],
        ),
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(sheetRows),
        "Data",
      );
      const batchBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      }) as Buffer;

      const previewForm = new FormData();
      previewForm.append(
        "file",
        fileOf(
          batchBuffer,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          BATCH_FILENAME,
        ),
      );
      previewForm.append("commissariatId", commissariat.id);
      previewForm.append("periodId", period.id);
      const preview = await postForm<PreviewCreate>(
        "/v1/membership-imports/preview",
        sekum,
        previewForm,
        "Pratinjau batch impor",
      );
      if (
        preview.totalRows !== 5 ||
        preview.invalidCount > 0 ||
        preview.ambiguousCount > 0 ||
        preview.duplicateCount > 0
      )
        throw new Error(
          `Pratinjau tidak bersih: total=${preview.totalRows}, invalid=${preview.invalidCount}, ambiguous=${preview.ambiguousCount}, duplicate=${preview.duplicateCount}.`,
        );
      previewId = preview.previewId;
      actions.push("batch impor dipratinjau (5 baris bersih)");
    }

    const commitResult = await postJson<{ previewId: string; status: string }>(
      "/v1/membership-imports/commit",
      sekum,
      { previewId },
      "Simpan batch impor",
    );
    if (commitResult.status === "PREVIEW_READY")
      throw new Error("Batch impor tidak berubah status setelah commit.");
    await postJson(
      `/v1/membership-imports/${previewId}/submit`,
      sekum,
      {},
      "Ajukan batch impor",
    );
    actions.push("batch impor diajukan (SUBMITTED)");
  }

  // --- Ringkasan hasil (tanpa kredensial).
  const finalNews = (
    await getJson<CmsNews[]>("/v1/news/cms", admin, "Daftar berita akhir")
  ).filter((item) => (NEWS_TITLES as readonly string[]).includes(item.title));
  const finalPrograms = (
    await getJson<CmsProgram[]>(
      "/v1/programs?scope=all&pageSize=1000",
      admin,
      "Daftar program akhir",
    )
  ).filter((item) =>
    (PROGRAM_TITLES as readonly string[]).includes(item.namaProker),
  );
  const finalMemberships = (
    await getJson<CmsMembership[]>(
      "/v1/memberships/cms?pageSize=1000",
      admin,
      "Daftar awardee akhir",
    )
  ).filter((item) => MEMBERSHIP_NAMES.includes(item.name));
  const finalPreviews: PreviewRow[] = [];
  for (const status of ["PREVIEW_READY", "COMMITTED", "SUBMITTED"]) {
    finalPreviews.push(
      ...(await getJson<PreviewRow[]>(
        `/v1/membership-imports?status=${status}`,
        admin,
        `Daftar batch akhir (${status})`,
      )),
    );
  }

  console.log("Data uji [UJI] siap (semua TIDAK disetujui).\n");
  console.log(`Komisariat: ${commissariat.name} (${period.label})\n`);
  console.log("Aksi:");
  for (const line of actions) console.log(`  - ${line}`);
  console.log("\nKeadaan akhir:");
  console.log(
    `  Berita   : ${finalNews.length}/3 (${finalNews
      .map((item) => item.publicationStatus)
      .join(", ")})`,
  );
  console.log(
    `  Program  : ${finalPrograms.length}/2 (${finalPrograms
      .map((item) => item.publicationStatus)
      .join(", ")})`,
  );
  console.log(
    `  Awardee  : ${finalMemberships.length}/5 (${finalMemberships
      .map((item) => item.publicationStatus)
      .join(", ")})`,
  );
  console.log(
    `  Batch    : ${
      finalPreviews
        .filter((item) => item.sourceFilename === BATCH_FILENAME)
        .map((item) => item.status)
        .join(", ") || "tidak ada"
    }`,
  );
  console.log("\nSemua item ditandai [UJI] dan menunggu keputusan Anda.");
};

main().catch((error) => {
  console.error("GAGAL:", error instanceof Error ? error.message : error);
  process.exit(1);
});
