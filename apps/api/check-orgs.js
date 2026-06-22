const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const orgs = await prisma.organizationProfile.findMany({
      select: { id: true, slug: true, name: true, university: true, type: true }
    });
    console.log('--- Organization Profiles ---');
    console.log(JSON.stringify(orgs, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
