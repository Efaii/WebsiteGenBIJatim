const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const commissariats = [
    {
      id: "unair-profile",
      name: "GenBI UNAIR",
      university: "Universitas Airlangga",
      type: "KOMISARIAT",
      slug: "unair",
      description: "Generasi Baru Indonesia (GenBI) Universitas Airlangga.",
      vision: "Menjadi wadah pengembangan diri yang unggul bagi mahasiswa penerima beasiswa BI di UNAIR.",
      missions: [
        { id: "m1", title: "Internalisasi", desc: "Mempererat hubungan antar anggota GenBI UNAIR.", icon: "Users", order: 1 }
      ],
      socials: { instagram: "genbi_unair" }
    },
    {
      id: "uinsa-profile",
      name: "GenBI UINSA",
      university: "UIN Sunan Ampel Surabaya",
      type: "KOMISARIAT",
      slug: "uinsa",
      description: "Generasi Baru Indonesia (GenBI) UIN Sunan Ampel Surabaya.",
      vision: "Mengabdi dengan ikhlas untuk negeri melalui karya nyata.",
      missions: [
        { id: "m1", title: "EduTech", desc: "Meningkatkan literasi teknologi di lingkungan kampus.", icon: "Laptop", order: 1 }
      ],
      socials: { instagram: "genbi_uinsa" }
    },
    {
      id: "upn-profile",
      name: "GenBI UPN Veteran",
      university: "UPN Veteran Jawa Timur",
      type: "KOMISARIAT",
      slug: "upn-veteran",
      description: "Generasi Baru Indonesia (GenBI) UPN Veteran Jawa Timur.",
      vision: "Mencetak kader bangsa yang berjiwa bela negara.",
      missions: [
        { id: "m1", title: "Bela Negara", desc: "Menanamkan nilai-nilai patriotisme.", icon: "Shield", order: 1 }
      ],
      socials: { instagram: "genbi_upnvjt" }
    }
  ];

  console.log('--- Seeding Commissariats ---');
  for (const comm of commissariats) {
    await prisma.organizationProfile.upsert({
      where: { id: comm.id },
      update: comm,
      create: comm
    });
    console.log(`Upserted: ${comm.name}`);
  }
}

seed()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
