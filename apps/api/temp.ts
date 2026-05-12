import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const comms = await p.commissariat.findMany({ include: { _count: { select: { programKerja: true } } } });
  console.log(comms.map(c => `${c.name} (${c.slug}): ${c._count.programKerja} prokers`).join('\n'));
}
main().finally(() => p.$disconnect());
