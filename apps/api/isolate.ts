import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";
import * as path from "path";

const prisma = new PrismaClient();

function formatText(text: any): string {
  if (!text) return "";
  const str = String(text);
  return str.replace(/\s+(?=\d+\.\s)/g, '\n').trim();
}

async function main() {
  const filePath = path.resolve(process.cwd(), "./data/excel/ITS_Proker_Normalized_Untuk_DB.xlsx");
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets["ALL"];
  const data = xlsx.utils.sheet_to_json(worksheet) as any[];

  let commissariat = await prisma.commissariat.findFirst({ where: { slug: 'its' }});
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      await prisma.programKerja.create({
        data: {
          commissariatId: commissariat!.id,
          divisi: row.divisi || "BPH",
          programKe: row.program_ke ? parseInt(row.program_ke) : 1,
          namaProker: row.nama_proker || "Tanpa Nama",
          tanggalProker: new Date(),
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
    } catch (err: any) {
      console.log(`======================`);
      console.log(`ERROR ON ROW ${row.nama_proker}`);
      console.log(`Message Length: ${err.message.length}`);
      console.log(`First 200 chars: ${err.message.substring(0, 200)}`);
      if (err.message.includes('Argument')) {
        const matches = err.message.match(/Argument.*?\n/g);
        console.log(`Found Argument matches:`, matches);
      } else {
        console.log(`Tail of message: ${err.message.substring(err.message.length - 1000)}`);
      }
      console.log(`======================`);
      break;
    }
  }
}
main().finally(() => prisma.$disconnect());
