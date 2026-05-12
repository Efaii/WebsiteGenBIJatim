import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const allProkers = await prisma.programKerja.findMany({
    include: { commissariat: true },
  });

  const totalProker = allProkers.length;
  let withPhotos = 0;
  let withoutPhotos = 0;

  const commissariatStats: Record<
    string,
    { total: number; with: number; without: number; listWithout: string[] }
  > = {};

  for (const p of allProkers) {
    const comName = p.commissariat.university;
    if (!commissariatStats[comName]) {
      commissariatStats[comName] = { total: 0, with: 0, without: 0, listWithout: [] };
    }

    commissariatStats[comName].total++;

    if (p.foto1) {
      withPhotos++;
      commissariatStats[comName].with++;
    } else {
      withoutPhotos++;
      commissariatStats[comName].without++;
      commissariatStats[comName].listWithout.push(p.namaProker);
    }
  }

  let mdContent = `# Analisis Kelengkapan Galeri Program Kerja\n\n`;
  mdContent += `### Ringkasan Global\n`;
  mdContent += `- **Total Program di Database:** ${totalProker} Program\n`;
  mdContent += `- **Berhasil Sinkronisasi (Ada Gambar):** ${withPhotos} Program\n`;
  mdContent += `- **Belum Dieksekusi / Kosong:** ${withoutPhotos} Program\n\n`;
  mdContent += `> Dokumen ini memetakan proker mana saja yang masih kosong karena tidak ada folder gambar atau nama folder di Drive sangat berbeda dari Database.\n\n`;
  
  mdContent += `### Rincian per Komisariat\n\n`;
  
  Object.entries(commissariatStats).sort((a,b) => b[1].with - a[1].with).forEach(([name, stat]) => {
    mdContent += `#### ${name}\n`;
    mdContent += `**Tingkat Pengisian:** ${stat.with}/${stat.total} Foto Terisi (${Math.round((stat.with/stat.total)*100)}%)\n\n`;
    
    if (stat.without > 0) {
      mdContent += `<details>\n<summary>Klik untuk melihat ${stat.without} Prokur yang <b>belum ada gambarnya</b></summary>\n\n`;
      stat.listWithout.forEach((p) => {
          mdContent += `- ${p}\n`;
      });
      mdContent += `\n</details>\n\n`;
    }
    mdContent += `---\n`;
  });

  const reportPath = "C:/Users/Administrator/.gemini/antigravity/brain/dd8db13e-7fbe-4c05-9e7d-1a15920e96b3/report_galeri_komisariat.md";
  fs.writeFileSync(reportPath, mdContent);
  console.log("Report generated at", reportPath);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
