import assert from 'node:assert/strict';
import { prisma } from '../lib/prisma';

const run = async () => {
  const suffix = `test-${Date.now()}`;
  const commissariat = await prisma.commissariat.create({ data: { slug: suffix, name: 'Test', university: 'Test', logo: 'test', description: 'test' } });
  try {
    const period = await prisma.period.create({ data: { label: '2099/2100', commissariatId: commissariat.id } });
    await prisma.division.create({ data: { name: 'Pendidikan', commissariatId: commissariat.id, periodId: period.id } });
    await assert.rejects(() => prisma.division.create({ data: { name: 'Pendidikan', commissariatId: commissariat.id, periodId: period.id } }));
    const membership = await prisma.membership.create({ data: { commissariatId: commissariat.id, periodId: period.id, name: 'Test', position: 'Staff', studyProgram: 'Test' } });
    assert.equal(membership.divisionId, null);
  } finally {
    await prisma.membership.deleteMany({ where: { commissariatId: commissariat.id } });
    await prisma.division.deleteMany({ where: { commissariatId: commissariat.id } });
    await prisma.period.deleteMany({ where: { commissariatId: commissariat.id } });
    await prisma.commissariat.delete({ where: { id: commissariat.id } });
  }
};

run().catch((error) => { console.error(error); process.exit(1); });
