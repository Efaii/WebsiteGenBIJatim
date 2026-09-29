/**
 * Seed konten Beranda (ADR 0013 keputusan 6).
 *
 * Nilai awal = salinan `apps/web/content/home.ts` pada saat modul CMS dibuat,
 * supaya tampilan Beranda tidak berubah saat rilis. Idempoten: baris yang sudah
 * ada dilewati; jalankan dengan `--force` untuk menimpa kembali ke nilai awal.
 *
 * Pemakaian (dari apps/api):
 *   npm run seed:home
 *   npm run seed:home -- --force
 */
import "dotenv/config";
import { PrismaClient, MediaKind } from "@prisma/client";

const prisma = new PrismaClient();
const FORCE = process.argv.includes("--force");

const HERO = {
  headingLine1: "Generasi Baru",
  headingLine2: "untuk Indonesia",
  description:
    "Komunitas penerima Beasiswa Bank Indonesia di Jawa Timur, garda terdepan transformasi bangsa sebagai",
  videoEnabled: false,
};

const ABOUT = {
  paragraphLead: "GenBI Jawa Timur",
  paragraph:
    "hadir sebagai wadah bagi penerima Beasiswa Bank Indonesia untuk berkembang, berjejaring, dan berkontribusi. Kami menjembatani mahasiswa dari berbagai latar belakang kampus untuk bergerak bersama dalam semangat Energi Untuk Negeri.",
  emphasis:
    "Bukan hanya tempat untuk belajar dan berkembang, GenBI juga menjadi ruang untuk membangun kepedulian, menciptakan perubahan, dan memberikan kontribusi nyata bagi masyarakat.",
};

const PILAR_CARDS = [
  {
    position: 1,
    title: "Front-liners",
    description:
      "Menjadi garda terdepan dalam menyampaikan informasi dan edukasi Bank Indonesia kepada masyarakat secara komunikatif dan mudah dipahami.",
    points: [
      "Edukasi kebijakan dan informasi Bank Indonesia",
      "Menjembatani informasi dengan masyarakat dan lingkungan kampus",
      "Mendorong literasi ekonomi dan keuangan",
    ],
  },
  {
    position: 2,
    title: "Agent of Change",
    description:
      "Menjadi agen perubahan yang menghadirkan gagasan, inovasi, dan aksi nyata untuk menjawab berbagai tantangan sosial di sekitar.",
    points: [
      "Menginisiasi program yang berdampak bagi masyarakat",
      "Mendorong inovasi dan kolaborasi lintas komunitas",
      "Mengubah ide menjadi aksi dan solusi nyata",
    ],
  },
  {
    position: 3,
    title: "Future Leaders",
    description:
      "Mempersiapkan generasi muda yang memiliki integritas, kapasitas, dan semangat kolaborasi untuk memberikan kontribusi bagi negeri.",
    points: [
      "Mengembangkan kemampuan kepemimpinan dan profesionalitas",
      "Membangun jejaring lintas kampus dan bidang",
      "Mempersiapkan diri untuk berkontribusi di masa depan",
    ],
  },
];

const STORY_MILESTONES = [
  {
    position: 1,
    title: "Inisiasi Nasional",
    description:
      "Program Beasiswa Bank Indonesia resmi diluncurkan secara nasional sebagai wujud dedikasi untuk negeri.",
  },
  {
    position: 2,
    title: "GenBI Surabaya",
    description:
      "GenBI Surabaya mulai terorganisir dan menyatukan visi mahasiswa dari berbagai kampus mitra.",
  },
  {
    position: 3,
    title: "GenBI Koordinator Komisariat Suramadu-Bojonegoro",
    description:
      "GenBI Surabaya berubah nama menjadi GenBI Korkom Suramadu-Bojonegoro.",
  },
  {
    position: 4,
    title: "GenBI Koordinator Komisariat Jawa Timur",
    description:
      "GenBI Korkom Suramadu-Bojonegoro berkembang menjadi GenBI Korkom Jawa Timur.",
  },
];

const MEDIA = [
  {
    slot: "hero.poster",
    kind: MediaKind.IMAGE,
    path: "/assets/images/hero.JPG",
    alt: "Ratusan peserta berpose bersama di dalam aula",
  },
  {
    slot: "hero.video",
    kind: MediaKind.VIDEO,
    path: "/assets/videos/hero.mp4",
    alt: "",
    mimeType: "video/mp4",
  },
  {
    slot: "about.image.1",
    kind: MediaKind.IMAGE,
    path: "/assets/images/raker.jpg",
    alt: "Rapat kerja GenBI Jawa Timur",
  },
  {
    slot: "about.image.2",
    kind: MediaKind.IMAGE,
    path: "/uploads/proker/upnvjt/1ea05c84-2f55-45da-ab83-8932099598e9/foto6.webp",
    alt: "Aktivitas anggota GenBI",
  },
  {
    slot: "about.image.3",
    kind: MediaKind.IMAGE,
    path: "/assets/images/bnsp.JPG",
    alt: "Pelatihan peningkatan kapasitas anggota",
  },
  {
    slot: "about.image.4",
    kind: MediaKind.IMAGE,
    path: "/assets/images/background.jpg",
    alt: "Kolaborasi GenBI Jawa Timur",
  },
  {
    slot: "pilar.image.1",
    kind: MediaKind.IMAGE,
    path: "/assets/images/pilar-frontliners.webp",
    alt: "Anggota GenBI menyampaikan informasi kepada masyarakat",
  },
  {
    slot: "pilar.image.2",
    kind: MediaKind.IMAGE,
    path: "/assets/images/pilar-agent-of-change.webp",
    alt: "Program sosial anggota GenBI di masyarakat",
  },
  {
    slot: "pilar.image.3",
    kind: MediaKind.IMAGE,
    path: "/assets/images/pilar-future-leaders.webp",
    alt: "Peningkatan kapasitas kepemimpinan anggota GenBI",
  },
];

async function main() {
  console.log(`🌱 Seed konten Beranda (force=${FORCE})`);

  const hero = await prisma.homeHero.findUnique({ where: { id: "default" } });
  if (!hero || FORCE) {
    await prisma.homeHero.upsert({
      where: { id: "default" },
      update: HERO,
      create: { id: "default", ...HERO },
    });
    console.log("hero: ditulis");
  } else {
    console.log("hero: sudah ada, dilewati");
  }

  const about = await prisma.homeAbout.findUnique({ where: { id: "default" } });
  if (!about || FORCE) {
    await prisma.homeAbout.upsert({
      where: { id: "default" },
      update: ABOUT,
      create: { id: "default", ...ABOUT },
    });
    console.log("about: ditulis");
  } else {
    console.log("about: sudah ada, dilewati");
  }

  for (const card of PILAR_CARDS) {
    const existing = await prisma.homePilarCard.findUnique({
      where: { position: card.position },
    });
    if (!existing || FORCE) {
      await prisma.homePilarCard.upsert({
        where: { position: card.position },
        update: {
          title: card.title,
          description: card.description,
          points: card.points,
        },
        create: card,
      });
      console.log(`pilar ${card.position}: ditulis`);
    } else {
      console.log(`pilar ${card.position}: sudah ada, dilewati`);
    }
  }

  for (const milestone of STORY_MILESTONES) {
    const existing = await prisma.homeStoryMilestone.findUnique({
      where: { position: milestone.position },
    });
    if (!existing || FORCE) {
      await prisma.homeStoryMilestone.upsert({
        where: { position: milestone.position },
        update: { title: milestone.title, description: milestone.description },
        create: milestone,
      });
      console.log(`story ${milestone.position}: ditulis`);
    } else {
      console.log(`story ${milestone.position}: sudah ada, dilewati`);
    }
  }

  for (const asset of MEDIA) {
    const existing = await prisma.homeMediaAsset.findUnique({
      where: { slot: asset.slot },
    });
    if (!existing || FORCE) {
      await prisma.homeMediaAsset.upsert({
        where: { slot: asset.slot },
        update: {
          kind: asset.kind,
          path: asset.path,
          alt: asset.alt,
          mimeType: asset.mimeType ?? null,
        },
        create: { ...asset, mimeType: asset.mimeType ?? null },
      });
      console.log(`media ${asset.slot}: ditulis`);
    } else {
      console.log(`media ${asset.slot}: sudah ada, dilewati`);
    }
  }

  console.log("✅ Seed konten Beranda selesai.");
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
