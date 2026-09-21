import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const MOCK_TESTIMONIALS = [
  {
    id: "testi-1",
    name: "Fathir Ainur Rochim",
    role: "GenBI 2019 • Analis Bank Indonesia",
    quote: "GenBI adalah inkubator kepemimpinan terbaik yang membentuk karakter dan profesionalisme saya.",
    image: "/assets/images/individu.jpg",
  },
  {
    id: "testi-2",
    name: "Ahmad Rizky",
    role: "GenBI 2021 • CEO Startup",
    quote: "Jejaring yang saya dapatkan selama menjadi awardee adalah modal terbesar dalam membangun karir.",
    image: "/assets/images/background.jpg",
  },
  {
    id: "testi-3",
    name: "Rochim Fathir Ainur",
    role: "GenBI 2020 • Researcher",
    quote: "Kesempatan belajar langsung dari mentor Bank Indonesia memberikan perspektif ekonomi yang luar biasa.",
    image: "/assets/images/raker.jpg",
  },
  {
    id: "testi-4",
    name: "Ainur Rochim",
    role: "GenBI 2022 • PNS",
    quote: "Saya belajar arti sesungguhnya dari 'Energi untuk Negeri' melalui berbagai proker GenBI.",
    image: "/assets/images/bnsp.JPG",
  },
];

const MOCK_FAQS = [
  {
    id: "faq-1",
    question: "Apakah semua mahasiswa di Jawa Timur bisa mendaftar?",
    answer: "Beasiswa Bank Indonesia KPw. BI Jatim dikhususkan bagi mahasiswa jenjang **S1/D3/D4 di 9 Perguruan Tinggi Mitra**: ITS, UNAIR, UINSA, UNESA, UPN Veteran Jatim, PENS, UTM, UIN MADURA, dan UNUGIRI. Pastikan kampusmu termasuk dalam daftar mitra kami.",
    order: 1,
  },
  {
    id: "faq-2",
    question: "Apa keuntungan menjadi anggota GenBI selain bantuan dana?",
    answer: "Tentu! Selain bantuan pendidikan, benefit terbesar adalah **tergabung dalam komunitas GenBI**. Kamu akan mendapatkan pelatihan kepemimpinan eksklusif, perluasan jejaring profesional, serta kesempatan berkontribusi langsung dalam berbagai proyek sosial bersama Bank Indonesia.",
    order: 2,
  },
  {
    id: "faq-3",
    question: "Apa perbedaan Beasiswa Reguler dan Unggulan?",
    answer: "**Beasiswa Unggulan** umumnya memiliki persyaratan IPK yang lebih tinggi, bukti kemampuan bahasa Inggris yang baik (TOEFL/IELTS), dan *track record* prestasi yang kuat. Penerima Unggulan juga sering dilibatkan dalam event-event berskala internasional.",
    order: 3,
  },
  {
    id: "faq-4",
    question: "Bagaimana tahapan seleksi beasiswa ini?",
    answer: "Proses seleksi terdiri dari dua tahap utama: **1) Seleksi Administrasi** di tingkat Perguruan Tinggi (Pemberkasan), dan **2) Seleksi Wawancara** langsung oleh *user* dari Bank Indonesia. Keduanya harus dilalui untuk dinyatakan lolos.",
    order: 4,
  },
  {
    id: "faq-5",
    question: "Kapan periode pendaftaran biasanya dibuka?",
    answer: "Siklus pendaftaran umumnya dibuka pada **awal tahun (Februari - Maret)**. Namun, jadwal spesifik bisa berbeda tiap kampus. Kami sangat menyarankan untuk memantau Instagram **@genbi_jatim** dan Biro Kemahasiswaan kampus masing-masing.",
    order: 5,
  }
];

const MOCK_COMMISSARIATS = [
  { id: "com-1", slug: "upnvjt", name: "UPN Veteran Jatim", university: "UPN Veteran Jawa Timur", description: "GenBI UPN Veteran Jawa Timur", logo: "/assets/logos/upnvjt.svg" },
  { id: "com-2", slug: "unair", name: "Universitas Airlangga", university: "Universitas Airlangga", description: "GenBI Universitas Airlangga", logo: "/assets/logos/unair.svg" },
  { id: "com-3", slug: "its", name: "ITS Surabaya", university: "Institut Teknologi Sepuluh Nopember", description: "GenBI ITS", logo: "/assets/logos/its.svg" },
  { id: "com-4", slug: "pens", name: "PENS Surabaya", university: "Politeknik Elektronika Negeri Surabaya", description: "GenBI PENS", logo: "/assets/logos/pens.svg" },
  { id: "com-5", slug: "unesa", name: "Unesa", university: "Universitas Negeri Surabaya", description: "GenBI UNESA", logo: "/assets/logos/unesa.svg" },
  { id: "com-6", slug: "uinsa", name: "UIN Sunan Ampel", university: "UIN Sunan Ampel Surabaya", description: "GenBI UINSA", logo: "/assets/logos/uinsa.svg" },
  { id: "com-7", slug: "utm", name: "Universitas Trunojoyo", university: "Universitas Trunojoyo Madura", description: "GenBI UTM", logo: "/assets/logos/utm.svg" },
  { id: "com-8", slug: "unugiri", name: "UNUGIRI", university: "Universitas Nahdlatul Ulama Sunan Giri", description: "GenBI UNUGIRI", logo: "/assets/logos/unugiri.svg" },
  { id: "com-9", slug: "uin-madura", name: "UIN Madura", university: "UIN Madura", description: "GenBI UIN Madura", logo: "/assets/logos/uinMadura.svg" },
];

async function main() {
  console.log('🌱 Seeding Database...');

  const adminUsername = process.env.ADMIN_USERNAME;
  const rawPassword = process.env.ADMIN_PASSWORD;
  const profile = process.env.SEED_PROFILE ?? 'local';
  if (!adminUsername || !rawPassword || adminUsername.startsWith('replace-with-') || rawPassword === 'password123' || rawPassword.startsWith('replace-with-') || rawPassword.length < 12) {
    throw new Error('ADMIN_USERNAME and a non-default ADMIN_PASSWORD are required for seed.');
  }
  if (!['local', 'e2e', 'staging'].includes(profile)) throw new Error(`Unsupported SEED_PROFILE: ${profile}`);
  console.log(`🌱 Seed profile: ${profile}`);

  // 0. Seed Admin User
  const existingAdmin = await prisma.user.findUnique({ where: { username: adminUsername } });
  let admin = existingAdmin;
  if (!admin) {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    admin = await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN_GLOBAL',
      },
    });
    console.log('👤 Admin user seeded.');
  } else {
    console.log('👤 Admin user already exists, skipping creation.');
  }
  await prisma.cmsAccount.upsert({
    where: { userId: admin.id },
    update: { role: 'ADMIN_GLOBAL', status: 'ACTIVE' },
    create: { userId: admin.id, role: 'ADMIN_GLOBAL', status: 'ACTIVE', mustChangePassword: true },
  });

  if (profile !== 'staging') {
    for (const t of MOCK_TESTIMONIALS) await prisma.testimonial.upsert({ where: { id: t.id }, update: {}, create: t });
    for (const f of MOCK_FAQS) await prisma.faq.upsert({ where: { id: f.id }, update: {}, create: f });
  }

  // 3. Seed Commissariats
  for (const c of MOCK_COMMISSARIATS) {
    const commissariat = await prisma.commissariat.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    const period = await prisma.period.upsert({
      where: { commissariatId_label: { commissariatId: commissariat.id, label: '2025/2026' } },
      update: {},
      create: { id: `period-${c.slug}-2025-2026`, commissariatId: commissariat.id, label: '2025/2026' },
    });
    for (const divisionName of ['Pendidikan', 'Kewirausahaan', 'Komunikasi']) {
      await prisma.division.upsert({
        where: { commissariatId_periodId_name: { commissariatId: commissariat.id, periodId: period.id, name: divisionName } },
        update: {},
        create: { commissariatId: commissariat.id, periodId: period.id, name: divisionName },
      });
    }
    if (profile !== 'staging') await prisma.programKerja.upsert({
      where: { id: `e2e-proker-${c.slug}` },
      update: {},
      create: {
        id: `e2e-proker-${c.slug}`,
        commissariatId: commissariat.id,
        programKe: 1,
        namaProker: `Program Kerja ${c.name}`,
        divisi: 'Pendidikan',
        tanggalProker: new Date('2025-10-01T00:00:00.000Z'),
        formatPelaksanaan: 'Hybrid',
        status: 'PLANNED',
        deskripsiProker: `Program kerja seeded untuk smoke test ${c.name}.`,
      },
    });
  }

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
