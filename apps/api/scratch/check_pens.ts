
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pens = await prisma.organizationProfile.findUnique({
    where: { slug: 'pens' }
  });
  console.log('PENS Profile:', JSON.stringify(pens, null, 2));

  if (pens) {
    const prokers = await prisma.proker.findMany({
      where: { organizationProfileId: pens.id }
    });
    console.log('PENS Prokers Count:', prokers.length);
    console.log('Sample Proker:', JSON.stringify(prokers[0], null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
