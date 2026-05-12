import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const prokers = await prisma.programKerja.findMany({
    take: 5,
    include: { commissariat: true }
  });

  console.log("=== PROKER SAMPLE ===");
  prokers.forEach(p => {
    console.log(`- ${p.namaProker} (Com: ${p.commissariat.name}, ID: ${p.commissariatId})`);
  });

  const comms = await prisma.commissariat.findMany({
    select: { id: true, name: true, slug: true }
  });
  console.log("\n=== COMMS IN DB ===");
  comms.forEach(c => console.log(`- ${c.name} (${c.slug}) ID: ${c.id}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
