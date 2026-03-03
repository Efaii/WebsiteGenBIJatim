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
  { id: "com-1", name: "UPN Veteran Jatim", logo: "/assets/logos/upnvjt.svg" },
  { id: "com-2", name: "Universitas Airlangga", logo: "/assets/logos/unair.svg" },
  { id: "com-3", name: "ITS Surabaya", logo: "/assets/logos/its.svg" },
  { id: "com-4", name: "PENS Surabaya", logo: "/assets/logos/pens.svg" },
  { id: "com-5", name: "Unesa", logo: "/assets/logos/unesa.svg" },
  { id: "com-6", name: "UIN Sunan Ampel", logo: "/assets/logos/uinsa.svg" },
  { id: "com-7", name: "Universitas Trunojoyo", logo: "/assets/logos/utm.svg" },
  { id: "com-8", name: "IUNUGIRI", logo: "/assets/logos/unugiri.svg" },
  { id: "com-9", name: "UIN Madura", logo: "/assets/logos/uinMadura.svg" },
];

async function main() {
  console.log('🌱 Seeding Database...');

  // 0. Seed Admin User
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword }, // Ensure password updates if changed in seed
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });
  console.log('👤 Admin user seeded.');

  // 1. Seed Testimonials
  for (const t of MOCK_TESTIMONIALS) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }

  // 2. Seed FAQs
  for (const f of MOCK_FAQS) {
    await prisma.faq.upsert({
      where: { id: f.id },
      update: {},
      create: f,
    });
  }

  // 3. Seed Commissariats
  for (const c of MOCK_COMMISSARIATS) {
    await prisma.commissariat.upsert({
      where: { id: c.id },
      update: {},
      create: c,
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
