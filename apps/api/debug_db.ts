import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const comms = await prisma.commissariat.findMany({
    include: {
      _count: {
        select: { programKerja: true }
      }
    }
  });

  console.log("=== COMMISSARIATS ===");
  comms.forEach(c => {
    console.log(`- ${c.name} (ID: ${c.id})`);
    console.log(`  isActive: ${c.isActive}`);
    console.log(`  memberCount: ${c.memberCount}`);
    console.log(`  prokerCount (count): ${c._count.programKerja}`);
    console.log(`  logo: ${c.logo}`);
    console.log("");
  });

  const totalProker = await prisma.programKerja.count();
  console.log(`TOTAL PROKER IN DB: ${totalProker}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
