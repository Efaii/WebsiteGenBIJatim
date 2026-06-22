import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prokerUnairData } from './seed-data/proker-unair';
import { prokerPensData } from './seed-data/proker-pens';
import { prokerItsData } from './seed-data/proker-its';
import { prokerUinsaData } from './seed-data/proker-uinsa';
import { prokerUtmData } from './seed-data/proker-utm';
import { prokerUpnvjtData } from './seed-data/proker-upnvjt';
import { prokerUnesaData } from './seed-data/proker-unesa';
import { prokerUinMaduraData } from './seed-data/proker-uin-madura';
import { prokerUnugiriData } from './seed-data/proker-unugiri';
import { itsData } from './seed-data/its';
import { uinsaData } from './seed-data/uinsa';
import { utmData } from './seed-data/utm';
import { unesaData } from './seed-data/unesa';
import { uinMaduraData } from './seed-data/uin-madura';
import { unugiriData } from './seed-data/unugiri';
import { prokerJatimData } from './seed-data/proker-jatim';
import { genbiJatimData } from './seed-data/genbi-jatim';

const prisma = new PrismaClient();

async function seedProgramKerja(profileSlug: string) {
  console.log(`🚀 Seeding Work Programs for ${profileSlug} into 'proker' table...`);

  const profile = await prisma.organizationProfile.findUnique({
    where: { slug: profileSlug }
  });

  if (!profile) {
    console.error(`❌ Profile with slug ${profileSlug} not found!`);
    return;
  }

  // Clear existing prokers for this profile to ensure clean state and avoid ID collisions from logic changes
  await prisma.proker.deleteMany({
    where: { organizationProfileId: profile.id }
  });

  const dataToSeed = 
    profileSlug === 'unair' ? prokerUnairData : 
    profileSlug === 'pens' ? prokerPensData : 
    profileSlug === 'its' ? prokerItsData : 
    profileSlug === 'uinsa' ? prokerUinsaData : 
    profileSlug === 'utm' ? prokerUtmData : 
    profileSlug === 'upnvjt' ? prokerUpnvjtData : 
    profileSlug === 'unesa' ? prokerUnesaData : 
    profileSlug === 'uin-madura' ? prokerUinMaduraData :
    profileSlug === 'unugiri' ? prokerUnugiriData : 
    profileSlug === 'jatim' ? prokerJatimData : [];

  const statusMapping: Record<string, string> = {
    'Done': 'DONE',
    'Cancel': 'CANCELLED',
    'Cancelled': 'CANCELLED',
    'On Progress': 'ON_PROGRESS',
    'Planned': 'PLANNED',
    'DONE': 'DONE',
    'CANCELLED': 'CANCELLED',
    'ON_PROGRESS': 'ON_PROGRESS',
    'PLANNED': 'PLANNED',
    'Menyusul': 'PLANNED'
  };

  for (const rawItem of dataToSeed) {
    const item = rawItem as any;
    // Determine title and other fields based on profile slug (different sources have different keys)
    const title = item.name || item.nama_proker || item["Nama Proker"];
    const division = item.divisi || item.Divisi || item.div || "general";
    const customId = `proker-${profileSlug}-${division.toLowerCase().replace(/\s+/g, '-')}-${title.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Status Mapping
    const status = statusMapping[item.status || item.Status] || 'PLANNED';

    // Transformation for PENS (Aggregated Description)
    let finalDescription = item["Deskripsi Proker"] || item.deskripsi;
    if (profileSlug === 'pens') {
      finalDescription = `[DESKRIPSI]: ${item.deskripsi} | [KPI]: ${item.kpi} | [DAMPAK]: ${item.dampak} | [EVALUASI]: ${item.evaluasi} | [KETERANGAN]: ${item.keterangan}`;
    } else if (profileSlug === 'its') {
      finalDescription = `${item["Deskripsi Proker"]} | [KPI]: ${item["KPI/TUK/Target"]} | [DAMPAK]: ${item["Dampak"]} | [EVALUASI]: ${item["Evaluasi"] || '-'}`;
    } else if (profileSlug === 'uinsa') {
      finalDescription = `${item.description_short} | [DETAIL]: ${item.description_long}`;
    } else if (profileSlug === 'utm') {
      finalDescription = `${item.description} | [DETAIL & KPI]: ${item.description_long}`;
    } else if (profileSlug === 'upnvjt') {
      finalDescription = `${item.deskripsi} | [DETAIL]: ${item.description_long}`;
    } else if (profileSlug === 'unesa') {
      finalDescription = `${item.deskripsi} | [DETAIL & KPI]: ${item.description_long}`;
    } else if (profileSlug === 'uin-madura') {
      finalDescription = `${item["Deskripsi Proker"]} | [DETAIL & KPI]: ${item.description_long}`;
    } else if (profileSlug === 'unugiri') {
      finalDescription = `${item.deskripsi} | [DETAIL & KPI]: ${item.description_long}`;
    } else if (profileSlug === 'jatim') {
      finalDescription = `${item.deskripsi} | [DETAIL & KPI]: ${item.description_long}`;
    }

    // Mapping for links
    const filterLink = (val: any) => {
      if (!val || val === "" || val === "-" || val === "nan") return null;
      const str = String(val);
      const isUrl = str.startsWith("http");
      
      // If it's not a URL and contains common placeholders or looks like a local file/description
      if (!isUrl) {
        if (
          str.toLowerCase().includes("tidak ada") || 
          str.toLowerCase().includes("menyusul") || 
          str.toLowerCase().includes("contoh") ||
          str.toLowerCase().includes("proposal") ||
          str.toLowerCase().includes("lpj") ||
          str.length > 30 // Most local filenames or descriptions are long
        ) return null;
        return null; // By default, if it's not a URL, we might want to null it based on the user's latest request
      }

      if (
        str.toLowerCase().includes("tidak ada") || 
        str.toLowerCase().includes("menyusul") || 
        str.toLowerCase().includes("contoh") ||
        str.toLowerCase().includes("karena ini agenda")
      ) return null;
      
      return str;
    };
    
    const lpjUrl = filterLink(item.lpj || item["Link LPJ"] || item.lpj_link || item.lpj_url || item.link_lpj);
    const docUrl = filterLink(item.documentation || item["Link Proposal"] || item.proposal_link || item.proposal_url || item.dokumentasi || item.documentation_url || item.link_proposal || item.link_dokumentasi);

    await prisma.proker.upsert({
      where: { id: customId },
      update: {
        name: title,
        date: item.date || item.tanggal || item["Tanggal Proker"],
        executionFormat: item.format || item["Format Pelaksanaan"] || "Offline",
        description: finalDescription,
        target: item.kpi || item["KPI/Target"] || item.description_long || "-",
        impact: item.dampak || item["Dampak"] || "-",
        evaluation: (item.evaluasi === "nan" || item.evaluasi === "-" || item.evaluasi === "Menyusul") ? null : (item.evaluasi || item.Evaluasi),
        documentation: docUrl,
        lpjLink: lpjUrl,
        category: division,
        status: status as any,
        audience: "Internal",
        period: "2025/2026",
      },
      create: {
        id: customId,
        name: title,
        date: item.date || item.tanggal || item["Tanggal Proker"],
        executionFormat: item.format || item["Format Pelaksanaan"] || "Offline",
        description: finalDescription,
        target: item.kpi || item["KPI/Target"] || item.description_long || "-",
        impact: item.dampak || item["Dampak"] || "-",
        evaluation: (item.evaluasi === "nan" || item.evaluasi === "-" || item.evaluasi === "Menyusul") ? null : (item.evaluasi || item.Evaluasi),
        documentation: docUrl,
        lpjLink: lpjUrl,
        category: division,
        status: status as any,
        audience: "Internal",
        period: "2025/2026",
        organizationProfileId: profile.id
      }
    });
  }

  console.log(`✅ ${dataToSeed.length} prokers seeded for ${profileSlug}.`);
}

async function seedFAQ() {
  console.log('❓ Seeding FAQs...');
  const faqs = [
    {
      question: "Apakah semua mahasiswa di Jawa Timur bisa mendaftar?",
      answer: "Beasiswa Bank Indonesia (KPw Jatim) dikhususkan bagi mahasiswa jenjang S1/D3/D4 di 9 Perguruan Tinggi Mitra: ITS, UNAIR, UINSA, UNESA, UPN Veteran Jatim, PENS, UTM, UIN MADURA, dan UNUGIRI. Pastikan kampusmu termasuk dalam daftar mitra kami.",
    },
    {
      question: "Apa keuntungan menjadi anggota GenBI selain bantuan dana?",
      answer: "Tentu! Selain bantuan pendidikan, benefit terbesar adalah tergabung dalam komunitas GenBI. Kamu akan mendapatkan pelatihan kepemimpinan eksklusif, perluasan jejaring profesional, serta kesempatan berkontribusi langsung dalam berbagai proyek sosial bersama Bank Indonesia.",
    },
    {
      question: "Apa perbedaan Beasiswa Reguler dan Unggulan?",
      answer: "Beasiswa Unggulan biasanya memiliki persyaratan IPK yang lebih tinggi, kemampuan bahasa Inggris yang baik (TOEFL/IELTS), dan track record prestasi yang kuat. Penerima Beasiswa Unggulan juga sering dilibatkan dalam event-event berskala internasional.",
    },
    {
      question: "Bagaimana tahapan seleksi beasiswa ini?",
      answer: "Proses seleksi terdiri dari dua tahap utama: 1) Seleksi Administrasi di tingkat Perguruan Tinggi (Pemberkasan), dan 2) Seleksi Wawancara langsung oleh user dari Bank Indonesia. Keduanya harus dilalui untuk dinyatakan lolos.",
    },
    {
      question: "Kapan periode pendaftaran biasanya dibuka?",
      answer: "Siklus pendaftaran umumnya dibuka pada awal tahun (Februari - Maret). Namun, jadwal spesifik bisa berbeda tiap kampus. Kami sarankan untuk selalu memantau Instagram @genbi_jatim dan Biro Kemahasiswaan kampus masing-masing.",
    },
  ];

  await prisma.faq.deleteMany();
  for (let i = 0; i < faqs.length; i++) {
    await prisma.faq.create({
      data: {
        ...faqs[i],
        order: i,
        isActive: true,
      }
    });
  }
  console.log('✅ FAQs seeded.');
}

async function seedNews() {
  console.log('📰 Seeding News...');
  const newsData = [
    {
      title: "Partisipasi GenBI Jatim dalam Sosialisasi QRIS Nasional",
      slug: "partisipasi-genbi-jatim-dalam-sosialisasi-qris-nasional",
      category: "Kegiatan",
      date: "24 Desember 2024",
      image: "/assets/images/raker.jpg",
      author: "Admin",
      snippet: "GenBI Jatim turut serta dalam upaya Bank Indonesia memperluas akseptasi digital di kalangan UMKM...",
      content: "GenBI Jatim turut serta dalam upaya Bank Indonesia memperluas akseptasi digital di kalangan UMKM..."
    },
    {
      title: "Webinar Nasional: Tantangan Ekonomi Digital 2025",
      slug: "webinar-nasional-tantangan-ekonomi-digital-2025",
      category: "Webinar",
      date: "20 Desember 2024",
      image: "/assets/images/raker.jpg",
      author: "Admin",
      snippet: "Membahas peluang dan tantangan yang dihadapi generasi muda dalam era transformasi digital...",
      content: "Membahas peluang dan tantangan yang dihadapi generasi muda dalam era transformasi digital..."
    },
    {
      title: "GenBI Peduli: Penanaman 1000 Mangrove di Surabaya",
      slug: "genbi-peduli-penanaman-1000-mangrove-di-surabaya",
      category: "Sosial",
      date: "15 Desember 2024",
      image: "/assets/images/raker.jpg",
      author: "Admin",
      snippet: "Aksi nyata kepedulian lingkungan yang dilakukan oleh anggota GenBI dari berbagai komisariat...",
      content: "Aksi nyata kepedulian lingkungan yang dilakukan oleh anggota GenBI dari berbagai komisariat..."
    },
    {
      title: "Leadership Camp 2024: Mencetak Pemimpin Masa Depan",
      slug: "leadership-camp-2024-mencetak-pemimpin-masa-depan",
      category: "Kegiatan",
      date: "10 Desember 2024",
      image: "/assets/images/raker.jpg",
      author: "Admin",
      snippet: "Program pelatihan kepemimpinan intensif selama 3 hari untuk pengurus inti GenBI Jatim...",
      content: "Program pelatihan kepemimpinan intensif selama 3 hari untuk pengurus inti GenBI Jatim..."
    },
    {
      title: "Kunjungan Studi Bank Indonesia Institute",
      slug: "kunjungan-studi-bank-indonesia-institute",
      category: "Edukasi",
      date: "5 Desember 2024",
      image: "/assets/images/raker.jpg",
      author: "Admin",
      snippet: "Meningkatkan pemahaman mengenai kebijakan moneter langsung dari pakarnya...",
      content: "Meningkatkan pemahaman mengenai kebijakan moneter langsung dari pakarnya..."
    },
    {
      title: "Workshop Content Creator & Jurnalistik",
      slug: "workshop-content-creator-jurnalistik",
      category: "Pelatihan",
      date: "1 Desember 2024",
      image: "/assets/images/raker.jpg",
      author: "Admin",
      snippet: "Mengasah kemampuan anggota dalam memproduksi konten kreatif yang edukatif...",
      content: "Mengasah kemampuan anggota dalam memproduksi konten kreatif yang edukatif..."
    },
  ];

  await prisma.news.deleteMany();
  for (const item of newsData) {
    await prisma.news.create({
      data: item
    });
  }
  console.log('✅ News seeded.');
}

async function main() {
  console.log('🌱 Standardizing Database Seeding (Slug-based Upsert)...');

  // 0. Seed Admin User
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword },
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });
  console.log('👤 Admin user seeded.');

  // 1. Seed Organization Profiles - Use slug as where clause
  const MOCK_PROFILES = [
    { 
      name: "UPN Veteran Jatim", 
      university: "UPN Veteran Jatim", 
      slug: "upnvjt", 
      logo: "/assets/logos/upnvjt.svg", 
      univLogo: "/assets/logos/upnvjt.svg",
      coverImage: "/assets/images/raker.jpg",
      description: "Profil resmi GenBI UPN Veteran Jatim",
      vision: "GenBI UPNVJT: Sinergi, Inovasi, Kontribusi.",
      type: "KOMISARIAT" as any,
      activePeriod: "2025/2026"
    },
    { 
      name: "Universitas Airlangga", 
      university: "Universitas Airlangga", 
      slug: "unair", 
      logo: "/assets/logos/unair.svg", 
      univLogo: "/assets/logos/unair.svg",
      description: "Inkubator pemimpin masa depan.",
      vision: "Inkubator pemimpin masa depan.",
      type: "KOMISARIAT" as any,
      activePeriod: "2025/2026"
    },
    {
      name: itsData.name,
      university: itsData.university,
      slug: itsData.slug,
      logo: "/assets/logos/its.svg",
      univLogo: "/assets/logos/its.svg",
      coverImage: "/assets/images/raker.jpg",
      description: itsData.description,
      vision: itsData.vision,
      type: "KOMISARIAT" as any,
      activePeriod: "2025/2026"
    },
    {
      name: uinsaData.name,
      university: uinsaData.university,
      slug: uinsaData.slug,
      logo: "/assets/logos/uinsa.svg",
      univLogo: "/assets/logos/uinsa.svg",
      coverImage: "/assets/images/raker.jpg",
      description: uinsaData.description,
      vision: uinsaData.vision,
      type: "KOMISARIAT" as any,
      activePeriod: "2025/2026"
    },
    {
      name: utmData.name,
      university: utmData.university,
      slug: utmData.slug,
      logo: "/assets/logos/utm.svg",
      univLogo: "/assets/logos/utm.svg",
      coverImage: "/assets/images/raker.jpg",
      description: utmData.description,
      vision: utmData.vision,
      type: "KOMISARIAT" as any,
      activePeriod: "2025/2026"
    },
    {
      name: unesaData.name,
      university: unesaData.university,
      slug: unesaData.slug,
      logo: "/assets/logos/unesa.svg",
      univLogo: "/assets/logos/unesa.svg",
      coverImage: "/assets/images/raker.jpg",
      description: unesaData.description,
      vision: unesaData.vision,
      type: "KOMISARIAT" as any,
      activePeriod: "2025/2026"
    },
    {
      name: uinMaduraData.name,
      university: uinMaduraData.university,
      slug: uinMaduraData.slug,
      logo: "/assets/logos/uin-madura.svg",
      univLogo: "/assets/logos/uin-madura.svg",
      coverImage: "/assets/images/raker.jpg",
      description: uinMaduraData.description,
      vision: uinMaduraData.vision,
      type: "KOMISARIAT" as any,
      activePeriod: "2025/2026"
    },
    {
      name: unugiriData.name,
      university: unugiriData.university,
      slug: unugiriData.slug,
      logo: "/assets/logos/unugiri.svg",
      univLogo: "/assets/logos/unugiri.svg",
      coverImage: "/assets/images/raker.jpg",
      description: unugiriData.description,
      vision: unugiriData.vision,
      type: "KOMISARIAT" as any,
      activePeriod: "2025/2026"
    },
    {
      name: genbiJatimData.name,
      university: genbiJatimData.university,
      slug: genbiJatimData.slug,
      logo: "/assets/logos/genbi.svg",
      univLogo: "/assets/logos/bankIndonesiaBlue.svg",
      coverImage: "/assets/images/raker.jpg",
      description: genbiJatimData.description,
      vision: genbiJatimData.vision,
      type: "KOORDINATOR" as any,
      activePeriod: "2025/2026"
    }
  ];

  for (const p of MOCK_PROFILES) {
    await prisma.organizationProfile.upsert({
      where: { slug: p.slug },
      update: { 
        name: p.name,
        university: p.university,
        description: p.description,
        vision: p.vision,
        activePeriod: p.activePeriod
      },
      create: {
        ...p,
        id: `prof-${p.slug}`
      }
    });
  }
  console.log('🏛️ Organization Profiles seeded/updated.');

  // 2. Seed Work Programs
  await seedProgramKerja('unair');
  await seedProgramKerja('pens');
  await seedProgramKerja('its');
  await seedProgramKerja('uinsa');
  await seedProgramKerja('utm');
  await seedProgramKerja('upnvjt');
  await seedProgramKerja('unesa');
  await seedProgramKerja('uin-madura');
  await seedProgramKerja('unugiri');
  await seedProgramKerja('jatim');

  // 3. Seed FAQs & News
  await seedFAQ();
  await seedNews();

  console.log('✅ Database Seeding Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
