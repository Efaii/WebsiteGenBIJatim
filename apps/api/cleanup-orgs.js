const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Cleaning up Organization Profiles...');
  try {
    // List of slugs to keep
    const keepSlugs = ["utm", "unair", "upn", "unesa", "unugiri", "its", "pens", "uinsa", "uin-madura"];
    const keepIds = ["main-profile"];

    const allOrgs = await prisma.organizationProfile.findMany();
    
    for (const org of allOrgs) {
      if (!keepIds.includes(org.id) && !keepSlugs.includes(org.slug)) {
        console.log(`Deleting: ${org.name} (${org.id})`);
        // Delete related data first (cascading might not be set in some cases)
        await prisma.awardee.deleteMany({ where: { organizationProfileId: org.id } });
        await prisma.proker.deleteMany({ where: { organizationProfileId: org.id } });
        await prisma.document.deleteMany({ where: { organizationProfileId: org.id } });
        await prisma.division.deleteMany({ where: { organizationProfileId: org.id } });
        await prisma.organizationProfile.delete({ where: { id: org.id } });
      }
    }
    console.log('✅ Cleanup finished.');
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
