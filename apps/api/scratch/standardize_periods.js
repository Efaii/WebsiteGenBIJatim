const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Period Standardization [2025/2026] ---');

  // 1. Update all Prokers
  const prokerUpdate = await prisma.proker.updateMany({
    data: {
      period: "2025/2026"
    }
  });
  console.log(`Updated ${prokerUpdate.count} Program Kerja to period 2025/2026`);

  // 2. Update all OrganizationProfiles
  const orgUpdate = await prisma.organizationProfile.updateMany({
    data: {
      activePeriod: "2025/2026"
    }
  });
  console.log(`Updated ${orgUpdate.count} Organization Profiles to activePeriod 2025/2026`);

  // 3. Update all Awardees (if any)
  if (prisma.awardee) {
    const awardeeUpdate = await prisma.awardee.updateMany({
      data: {
        period: "2025/2026"
      }
    });
    console.log(`Updated ${awardeeUpdate.count} Awardees to period 2025/2026`);
  } else {
    console.log('Model [awardee] not found in prisma client');
  }

  // 4. Update all Documents (if any)
  if (prisma.document) {
    const docUpdate = await prisma.document.updateMany({
      data: {
        period: "2025/2026"
      }
    });
    console.log(`Updated ${docUpdate.count} Documents to period 2025/2026`);
  } else {
    console.log('Model [document] not found in prisma client');
  }

  console.log('--- Standardization Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
