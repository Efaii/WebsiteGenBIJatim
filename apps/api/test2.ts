import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.programKerja.count();
  console.log('TOTAL ROWS POST IMPORT: ' + count);
}
main().finally(() => prisma.$disconnect());
