import { prisma } from "../lib/prisma";
import * as xlsx from "@e965/xlsx";
import * as fs from "fs";
import * as path from "path";

function assertSchemaReady(): void {
  const configuredPath = process.env.SCHEMA_READINESS_PATH;
  const candidates = configuredPath
    ? [path.resolve(configuredPath)]
    : [path.resolve(__dirname, "../../../artifacts/migration/schema-readiness.json"), path.resolve(__dirname, "../../../../artifacts/migration/schema-readiness.json")];
  const evidencePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!evidencePath) throw new Error(`Schema readiness evidence is missing at ${candidates[0]}; data migration is blocked.`);
  let evidence: { status?: string };
  try {
    evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8")) as { status?: string };
  } catch {
    throw new Error(`Schema readiness evidence is invalid at ${evidencePath}; data migration is blocked.`);
  }
  if (evidence.status !== "ready") {
    throw new Error(`Schema readiness is ${evidence.status ?? "unknown"}; data migration is blocked. Resolve the schema preflight first.`);
  }
}

// Helper untuk merapikan teks (mengubah "1. Teks  2. Teks" menjadi baris baru)
function formatText(text: unknown): string {
  if (!text) return "";
  const str = String(text);
  // Mencari spasi yang diikuti dengan angka dan titik (misal " 1. ", "  2. ", "\n3. ")
  // dan menggantinya dengan newline \n secara konsisten
  return str.replace(/\s+(?=\d+\.\s)/g, '\n').trim();
}

interface ParsedProker {
  fileName: string;
  rowIndex: number;
  komisariatName: string;
  divisi: string;
  programKe: number;
  namaProker: string;
  tanggalProker: Date;
  formatPelaksanaan: string;
  status: string;
  deskripsiProker: string;
  kpiTukTarget: string;
  dampak: string;
  evaluasi: string;
  foto1: string | null;
  foto2: string | null;
  foto3: string | null;
  foto4: string | null;
  foto5: string | null;
  foto6: string | null;
}

async function main() {
  assertSchemaReady();
  // Default to ./data/excel if no arg is provided
  const targetDir = process.argv[2] || "./data/excel";
  const absoluteDir = path.resolve(process.cwd(), targetDir);

  if (!fs.existsSync(absoluteDir)) {
    console.error(`Folder tidak ditemukan: ${absoluteDir}`);
    console.error(`Harap buat folder tersebut dan letakkan file excel di dalamnya.`);
    process.exit(1);
  }

  const files = fs.readdirSync(absoluteDir).filter(file => file.endsWith('.xlsx') && !file.startsWith('~'));
  
  if (files.length === 0) {
    console.warn(`Tidak ada file .xlsx yang ditemukan di dalam folder: ${absoluteDir}`);
    process.exit(0);
  }

  console.log(`Ditemukan ${files.length} file Excel di ${absoluteDir}. Parsing file...`);

  const parsedRecords: ParsedProker[] = [];

  for (const fileName of files) {
    const filePath = path.join(absoluteDir, fileName);
    console.log(`\n=================================================`);
    console.log(`Membaca file: ${fileName}`);
    console.log(`=================================================`);
    
    const workbook = xlsx.readFile(filePath);
    
    // Spesifik target sheet "ALL" sesuai instruksi user
    if (!workbook.Sheets["ALL"]) {
      console.warn(`[SKIP] Sheet "ALL" tidak ditemukan di dalam file ${fileName}. Melewati file ini.`);
      continue;
    }

    const worksheet = workbook.Sheets["ALL"];
    const data = xlsx.utils.sheet_to_json<Record<string, unknown>>(worksheet);
    console.log(`Ditemukan ${data.length} baris data di sheet "ALL".`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const komisariatName = typeof row["komisariat"] === "string" ? row["komisariat"] : undefined;
      if (!komisariatName) {
        console.warn(`  [Baris ${i + 2}] Melewati data tanpa nama komisariat.`);
        continue;
      }

      const divisi = typeof row["divisi"] === "string" ? row["divisi"] : undefined;
      const program_ke = row["program_ke"];
      const nama_proker = typeof row["nama_proker"] === "string" ? row["nama_proker"] : undefined;
      const tanggal_proker = row["tanggal_proker"];
      const format_pelaksanaan = typeof row["format_pelaksanaan"] === "string" ? row["format_pelaksanaan"] : undefined;
      const status = typeof row["status"] === "string" ? row["status"] : undefined;
      const deskripsi_proker = row["deskripsi_proker"];
      const kpi_tuk_target = row["kpi_tuk_target"];
      const dampak = row["dampak"];
      const evaluasi = row["evaluasi"];
      const foto1 = typeof row["foto1"] === "string" ? row["foto1"] : null;
      const foto2 = typeof row["foto2"] === "string" ? row["foto2"] : null;
      const foto3 = typeof row["foto3"] === "string" ? row["foto3"] : null;
      const foto4 = typeof row["foto4"] === "string" ? row["foto4"] : null;
      const foto5 = typeof row["foto5"] === "string" ? row["foto5"] : null;
      const foto6 = typeof row["foto6"] === "string" ? row["foto6"] : null;

      // Konversi format tanggal otomatis dari Excel Serial Number atau String biasa
      let parsedDate = new Date();
      if (tanggal_proker) {
        if (typeof tanggal_proker === "number") {
          // Konversi dari base 1900 format Excel ke format JS Date
          parsedDate = new Date(Math.round((tanggal_proker - 25569) * 86400 * 1000));
        } else if (typeof tanggal_proker === "string" || tanggal_proker instanceof Date) {
          parsedDate = new Date(tanggal_proker);
        }
      }
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date(); // Fallback untuk tanggal teks seperti "Kondisional"
      }

      parsedRecords.push({
        fileName,
        rowIndex: i + 2,
        komisariatName,
        divisi: divisi || "BPH",
        programKe: program_ke ? parseInt(String(program_ke)) : 1,
        namaProker: nama_proker || "Tanpa Nama",
        tanggalProker: parsedDate,
        formatPelaksanaan: format_pelaksanaan || "Offline",
        status: status || "Completed",
        deskripsiProker: formatText(deskripsi_proker),
        kpiTukTarget: formatText(kpi_tuk_target),
        dampak: formatText(dampak),
        evaluasi: formatText(evaluasi),
        foto1: foto1 || null,
        foto2: foto2 || null,
        foto3: foto3 || null,
        foto4: foto4 || null,
        foto5: foto5 || null,
        foto6: foto6 || null,
      });
    }
  }

  console.log(`\nParsing selesai. Total ${parsedRecords.length} proker valid siap diimport.`);
  console.log("Memulai transaksi database...");

  await prisma.$transaction(async (tx) => {
    console.log("Membersihkan data Program Kerja lama agar tidak terjadi duplikasi...");
    await tx.programKerja.deleteMany();
    console.log("Data lama berhasil dibersihkan! Memasukkan data baru...\n");

    for (const record of parsedRecords) {
      // Cari Commissariat berdasarkan nama (menggunakan contains agar fleksibel)
      let commissariat = await tx.commissariat.findFirst({
        where: {
          name: {
            contains: record.komisariatName,
          },
        },
      });

      // Jika belum ada, auto-create profil komisariat tersebut
      if (!commissariat) {
        console.warn(`  [Baris ${record.rowIndex}] Komisariat '${record.komisariatName}' tidak ditemukan di database. Membuat baru otomatis...`);
        commissariat = await tx.commissariat.create({
          data: {
            slug: record.komisariatName.toLowerCase().replace("komisariat ", "").replace(/\s+/g, '-'),
            name: record.komisariatName,
            university: record.komisariatName.replace("Komisariat ", ""),
            description: `Profil resmi dari ${record.komisariatName}.`,
            logo: "/assets/logos/genbi.svg",
          }
        });
      }

      await tx.programKerja.create({
        data: {
          commissariatId: commissariat.id,
          divisi: record.divisi,
          programKe: record.programKe,
          namaProker: record.namaProker,
          tanggalProker: record.tanggalProker,
          formatPelaksanaan: record.formatPelaksanaan,
          status: record.status,
          deskripsiProker: record.deskripsiProker,
          kpiTukTarget: record.kpiTukTarget,
          dampak: record.dampak,
          evaluasi: record.evaluasi,
          foto1: record.foto1,
          foto2: record.foto2,
          foto3: record.foto3,
          foto4: record.foto4,
          foto5: record.foto5,
          foto6: record.foto6,
        },
      });
      console.log(`  [Baris ${record.rowIndex}] ✔️ Sukses import proker: ${record.namaProker}`);
    }
  });

  console.log("\n✅ Semua file excel berhasil diproses dan dikirim ke database!");
}

main()
  .catch((e) => {
    console.error("Terjadi error fatal saat menjalankan import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
