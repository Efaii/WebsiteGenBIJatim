import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function formatText(text: any): string {
  if (!text) return "";
  const str = String(text);
  return str.replace(/\s+(?=\d+\.\s)/g, '\n').trim();
}

async function main() {
  const dir = path.resolve(process.cwd(), "./data/excel");
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx') && !f.startsWith('~'));
  
  await prisma.programKerja.deleteMany();
  
  let success = 0;
  let fail = 0;
  let skip = 0;

  for (const file of files) {
    const wb = xlsx.readFile(path.join(dir, file));
    if (!wb.Sheets["ALL"]) { continue; }
    const data = xlsx.utils.sheet_to_json(wb.Sheets["ALL"]) as any[];

    for (const row of data) {
      if (!row["komisariat"]) { skip++; continue; }

      let comm = await prisma.commissariat.findFirst({
        where: { name: { contains: row["komisariat"] } },
      });
      if (!comm) {
        comm = await prisma.commissariat.create({
          data: {
             slug: row["komisariat"].toLowerCase().replace(/komisariat\s+/g, "").replace(/\s+/g, "-"),
             name: row["komisariat"],
             university: row["komisariat"],
             description: "Profil",
             logo: "/assets/logos/genbi.svg"
          }
        });
      }

      let parsedDate = new Date();
      if (typeof row.tanggal_proker === "number") {
        parsedDate = new Date(Math.round((row.tanggal_proker - 25569) * 86400 * 1000));
      } else if (row.tanggal_proker) {
        parsedDate = new Date(row.tanggal_proker);
      }

      try {
        await prisma.programKerja.create({
          data: {
            commissariatId: comm.id,
            divisi: row.divisi || "BPH",
            programKe: row.program_ke ? parseInt(row.program_ke) : 1,
            namaProker: row.nama_proker || "Tanpa Nama",
            tanggalProker: parsedDate,
            formatPelaksanaan: row.format_pelaksanaan || "Offline",
            status: row.status || "Completed",
            deskripsiProker: formatText(row.deskripsi_proker),
            kpiTukTarget: formatText(row.kpi_tuk_target),
            dampak: formatText(row.dampak),
            evaluasi: formatText(row.evaluasi),
            foto1: row.foto1 || null,
            foto2: row.foto2 || null,
            foto3: row.foto3 || null,
            foto4: row.foto4 || null,
            foto5: row.foto5 || null,
            foto6: row.foto6 || null,
          },
        });
        success++;
      } catch (e: any) {
        if (fail === 0) console.log("FIRST FAIL ERROR:", e.message);
        fail++;
      }
    }
  }

  console.log(`\n============================`);
  console.log(`IMPORT FINISHED`);
  console.log(`SUCCESS: ${success}`);
  console.log(`FAILED:  ${fail}`);
  console.log(`SKIPPED: ${skip}`);
  console.log(`TOTAL:   ${success + fail + skip}`);
  console.log(`============================\n`);
}
main().finally(() => prisma.$disconnect());
