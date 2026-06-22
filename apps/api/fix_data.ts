import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DATA_UPDATES = [
  { slug: "unesa", name: "Komisariat UNESA", univ: "Universitas Negeri Surabaya", logo: "/assets/logos/unesa.svg", members: 64 },
  { slug: "upnvjt", name: "Komisariat UPNVJT", univ: "UPN Veteran Jawa Timur", logo: "/assets/logos/upnvjt.svg", members: 50 },
  { slug: "unair", name: "Komisariat UNAIR", univ: "Universitas Airlangga", logo: "/assets/logos/unair.svg", members: 112 },
  { slug: "its", name: "Komisariat ITS", univ: "Institut Teknologi Sepuluh Nopember", logo: "/assets/logos/its.svg", members: 87 },
  { slug: "uinsa", name: "Komisariat UINSA", univ: "UIN Sunan Ampel Surabaya", logo: "/assets/logos/uinsa.svg", members: 83 },
  { slug: "unugiri", name: "Komisariat UNUGIRI", univ: "UNU Sunan Giri Bojonegoro", logo: "/assets/logos/unugiri.svg", members: 50 },
  { slug: "utm", name: "Komisariat UTM", univ: "Universitas Trunojoyo Madura", logo: "/assets/logos/utm.svg", members: 75 },
  { slug: "pens", name: "Komisariat PENS", univ: "Politeknik Elektronika Negeri Surabaya", logo: "/assets/logos/pens.svg", members: 48 },
  { slug: "uin-madura", name: "Komisariat UIN Madura", univ: "UIN Madura", logo: "/assets/logos/uinMadura.svg", members: 50 },
];

async function main() {
  console.log("=== START DATABASE SYNC & LINKING ===");
  
  for (const item of DATA_UPDATES) {
    // 1. Update/Fix Commissariat Metadata
    const comm = await prisma.commissariat.findFirst({
      where: {
        OR: [
          { slug: item.slug },
          { name: { contains: item.slug.toUpperCase() } },
          { university: { contains: item.univ } }
        ]
      }
    });

    if (comm) {
      await prisma.commissariat.update({
        where: { id: comm.id },
        data: {
          name: item.name,
          university: item.univ,
          logo: item.logo,
          memberCount: item.members,
          isActive: true
        }
      });
      console.log(`[v] Updated metadata for: ${item.name}`);

      // 2. Re-link any orphaned prokers that should belong to this comm
      // (Berdasarkan kemiripan nama atau ID yang mungkin salah)
      const relinked = await prisma.programKerja.updateMany({
        where: {
          commissariatId: { not: comm.id },
          OR: [
            { divisi: { contains: item.slug } },
            // Add more heuristics if needed
          ]
        },
        data: { commissariatId: comm.id }
      });
      if (relinked.count > 0) {
        console.log(`    -> Re-linked ${relinked.count} orphaned prokers to ${item.name}`);
      }
    } else {
      console.log(`[x] Could not find commissariat for slug: ${item.slug}`);
    }
  }

  // Final Audit
  const totalProker = await prisma.programKerja.count();
  const commsWithProker = await prisma.commissariat.findMany({
    include: { _count: { select: { programKerja: true } } }
  });

  console.log("\n=== FINAL AUDIT ===");
  console.log(`Total Proker in DB: ${totalProker}`);
  commsWithProker.forEach(c => {
    console.log(`${c.name}: ${c._count.programKerja} Proker, ${c.memberCount} Anggota`);
  });

  console.log("\n=== SYNC COMPLETED ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
