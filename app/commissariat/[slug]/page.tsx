"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { motion, AnimatePresence } from "framer-motion";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { MemberDetailModal, BPHMember } from "@/components/MemberDetailModal";

// --- Types ---
type TabType = "profil" | "proker" | "awardee" | "arsip";

interface Proker {
  id: number;
  title: string;
  status: "Upcoming" | "On-going" | "Completed";
  date: string;
  description: string;
  documentation?: string;
}

interface Awardee {
  id: number;
  name: string;
  major: string;
  year: string;
}

interface Document {
  id: number;
  title: string;
  type: "SK" | "LPJ" | "SOP" | "Other";
  fileType: "PDF" | "DOCX";
  size: string;
  date: string;
}

interface CommissariatData {
  slug: string;
  name: string;
  university: string;
  logo_univ: string;
  logo_genbi: string; // Using generic genbi logo for now
  cover_image: string;
  description: string;
  socials: {
    instagram: string;
    email: string;
  };
  bph: BPHMember[];
  divisions: BPHMember[];
  proker: Proker[];
  awardees: Awardee[]; // Specific to this commissariat
  documents: Document[];
}

// --- Mock Data ---
const COMMISSARIAT_DATA: Record<string, CommissariatData> = {
  unair: {
    slug: "unair",
    name: "GenBI Komisariat UNAIR",
    university: "Universitas Airlangga",
    logo_univ: "/assets/logos/unair.svg",
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description:
      "GenBI Komisariat UNAIR merupakan wadah bagi penerima beasiswa Bank Indonesia di Universitas Airlangga untuk berkarya, mengabdi, dan berkontribusi bagi pengembangan ekonomi dan sosial masyarakat, khususnya di lingkungan kampus dan Surabaya.",
    socials: { instagram: "@genbi_unair", email: "genbiunair@gmail.com" },
    bph: [
      {
        role: "Ketua Umum",
        name: "Ahmad Fulan",
        image: "/assets/images/individu.jpg",
        major: "Ekonomi Islam",
        instagram: "@ahmadfulan",
        linkedin: "ahmad-fulan",
      },
      {
        role: "Wakil Ketua",
        name: "Rudi Tabuti",
        image: "/assets/images/individu.jpg",
        major: "Akuntansi",
        instagram: "@rudit",
        linkedin: "rudi-tabuti",
      },
      {
        role: "Sekretaris Umum",
        name: "Siti Aminah",
        image: "/assets/images/individu.jpg",
        major: "Manajemen",
        instagram: "@sitia",
        linkedin: "siti-aminah",
      },
      {
        role: "Sekretaris 2",
        name: "Lina Marlina",
        image: "/assets/images/individu.jpg",
        major: "Ilmu Komunikasi",
        instagram: "@linam",
        linkedin: "lina-marlina",
      },
      {
        role: "Bendahara Umum",
        name: "Budi Santoso",
        image: "/assets/images/individu.jpg",
        major: "Ekonomi Pembangunan",
        instagram: "@budis",
        linkedin: "budi-santoso",
      },
      {
        role: "Bendahara 2",
        name: "Ratna Sari",
        image: "/assets/images/individu.jpg",
        major: "Administrasi Niaga",
        instagram: "@ratnas",
        linkedin: "ratna-sari",
      },
    ],
    divisions: [
      {
        role: "Kadiv Pendidikan",
        name: "Rina Nose",
        image: "/assets/images/individu.jpg",
        major: "Pendidikan Dokter",
        instagram: "@rinanose",
        linkedin: "rina-nose",
      },
      {
        role: "Kadiv Lingkungan",
        name: "Joko Anwar",
        image: "/assets/images/individu.jpg",
        major: "Teknik Lingkungan",
        instagram: "@jokoanwar",
        linkedin: "joko-anwar",
      },
      {
        role: "Kadiv Kominfo",
        name: "Sarah Sechan",
        image: "/assets/images/individu.jpg",
        major: "Desain Komunikasi Visual",
        instagram: "@sarahsechan",
        linkedin: "sarah-sechan",
      },
      {
        role: "Kadiv Kewirausahaan",
        name: "Bob Sadino KW",
        image: "/assets/images/individu.jpg",
        major: "Manajemen Bisnis",
        instagram: "@bobsadino",
        linkedin: "bob-sadino",
      },
    ],
    proker: [
      {
        id: 1,
        title: "GenBI Mengajar",
        status: "Completed",
        date: "10 Feb 2025",
        description: "Mengajar literasi keuangan di SD binaan.",
        documentation: "/assets/images/raker.jpg",
      },
      {
        id: 2,
        title: "Webinar Entrepreneurship",
        status: "On-going",
        date: "25 Mar 2025",
        description: "Webinar kewirausahaan untuk mahasiswa umum.",
      },
      {
        id: 3,
        title: "Bersih Pantai Kenjeran",
        status: "Upcoming",
        date: "15 Apr 2025",
        description: "Aksi sosial bersih-bersih lingkungan.",
      },
    ],
    awardees: Array.from({ length: 45 }).map((_, i) => ({
      id: i + 1,
      name: `Awardee UNAIR ${i + 1}`,
      major: ["Akuntansi", "Ekonomi Pembangunan", "Manajemen", "Hukum"][
        Math.floor(Math.random() * 4)
      ],
      year: Math.random() > 0.5 ? "2023" : "2024",
    })),
    documents: [
      {
        id: 1,
        title: "SK Pengurus GenBI UNAIR 2025",
        type: "SK",
        fileType: "PDF",
        size: "2.5 MB",
        date: "2025-01-05",
      },
      {
        id: 2,
        title: "LPJ Kegiatan GenBI Mengajar",
        type: "LPJ",
        fileType: "PDF",
        size: "5 MB",
        date: "2025-02-15",
      },
    ],
  },
  unesa: {
    slug: "unesa",
    name: "GenBI Komisariat UNESA",
    university: "Universitas Negeri Surabaya",
    logo_univ: "/assets/logos/genbi.svg", // Placeholder
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description:
      "GenBI UNESA berdedikasi untuk menjadi garda terdepan dalam edukasi QRIS dan kebijakan Bank Indonesia di lingkungan pendidikan.",
    socials: { instagram: "@genbi_unesa", email: "genbiunesa@gmail.com" },
    bph: [
      {
        role: "Ketua Umum",
        name: "Rizky Pratama",
        image: "/assets/images/individu.jpg",
      },
      {
        role: "Sekretaris",
        name: "Dewi Sartika",
        image: "/assets/images/individu.jpg",
      },
      {
        role: "Bendahara",
        name: "Lestari",
        image: "/assets/images/individu.jpg",
      },
    ],
    divisions: [
      {
        role: "Kadiv Pendidikan",
        name: "Budi Doremi",
        image: "/assets/images/individu.jpg",
      },
      {
        role: "Kadiv PSDA",
        name: "Siti Badriah",
        image: "/assets/images/individu.jpg",
      },
      {
        role: "Kadiv Multimedia",
        name: "Reza Rahadian KW",
        image: "/assets/images/individu.jpg",
      },
    ],
    proker: [
      {
        id: 1,
        title: "Sosialisasi QRIS Kantin",
        status: "Completed",
        date: "01 Feb 2025",
        description: "Sosialisasi QRIS kepada pedagang kantin kampus.",
      },
      {
        id: 2,
        title: "GenBI Goes to School",
        status: "Upcoming",
        date: "10 May 2025",
        description: "Edukasi kebanksentralan ke SMA di Surabaya.",
      },
    ],
    awardees: Array.from({ length: 40 }).map((_, i) => ({
      id: i + 1,
      name: `Awardee UNESA ${i + 1}`,
      major: [
        "Pendidikan Ekonomi",
        "Manajemen",
        "Akuntansi",
        "Teknologi Pendidikan",
      ][Math.floor(Math.random() * 4)],
      year: "2024",
    })),
    documents: [
      {
        id: 1,
        title: "SOP Internal GenBI UNESA",
        type: "SOP",
        fileType: "DOCX",
        size: "1.0 MB",
        date: "2025-01-10",
      },
    ],
  },
  "upn-veteran-jatim": {
    slug: "upn-veteran-jatim",
    name: "GenBI Komisariat UPN Veteran Jatim",
    university: "UPN Veteran Jawa Timur",
    logo_univ: "/assets/logos/genbi.svg",
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description:
      "GenBI UPN Jatim aktif dalam pengembangan UMKM dan digitalisasi ekonomi di sekitar kampus.",
    socials: { instagram: "@genbiupnvjt", email: "genbiupn@gmail.com" },
    bph: [
      {
        role: "Ketua Umum",
        name: "Fajar Nugraha",
        image: "/assets/images/individu.jpg",
      },
      {
        role: "Sekretaris",
        name: "Indah Permata",
        image: "/assets/images/individu.jpg",
      },
    ],
    divisions: [
      {
        role: "Kadiv UMKM",
        name: "Sandiaga Uno KW",
        image: "/assets/images/individu.jpg",
      },
      {
        role: "Kadiv Humas",
        name: "Najwa Shihab KW",
        image: "/assets/images/individu.jpg",
      },
    ],
    proker: [
      {
        id: 1,
        title: "Pendampingan UMKM",
        status: "On-going",
        date: "Every Weekend",
        description: "Mendampingi UMKM dalam pencatatan keuangan digital.",
      },
      {
        id: 2,
        title: "Seminar Bela Negara & Ekonomi",
        status: "Completed",
        date: "20 Jan 2025",
        description: "Seminar gabungan wawasan kebangsaan dan ekonomi.",
      },
    ],
    awardees: Array.from({ length: 35 }).map((_, i) => ({
      id: i + 1,
      name: `Awardee UPN ${i + 1}`,
      major: ["Ekonomi Pembangunan", "Manajemen", "Akuntansi", "Informatika"][
        Math.floor(Math.random() * 4)
      ],
      year: "2024",
    })),
    documents: [],
  },
  its: {
    slug: "its",
    name: "GenBI Komisariat ITS",
    university: "Institut Teknologi Sepuluh Nopember",
    logo_univ: "/assets/logos/genbi.svg",
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description:
      "GenBI ITS fokus pada inovasi teknologi finansial dan digitalisasi layanan publik.",
    socials: { instagram: "@genbi_its", email: "genbiits@gmail.com" },
    bph: [
      {
        role: "Ketua Umum",
        name: "Bimo Anggoro",
        image: "/assets/images/individu.jpg",
      },
      {
        role: "Sekretaris",
        name: "Rina Wati",
        image: "/assets/images/individu.jpg",
      },
    ],
    divisions: [
      {
        role: "Kadiv Ristek",
        name: "Habibie KW",
        image: "/assets/images/individu.jpg",
      },
      {
        role: "Kadiv Kreatif",
        name: "Raditya Dika KW",
        image: "/assets/images/individu.jpg",
      },
    ],
    proker: [
      {
        id: 1,
        title: "Hackathon Fintech",
        status: "Upcoming",
        date: "20 Jun 2025",
        description: "Kompetisi ide solusi fintech untuk mahasiswa.",
      },
      {
        id: 2,
        title: "Pelatihan Data Science",
        status: "Completed",
        date: "05 Mar 2025",
        description: "Pelatihan pengolahan data ekonomi.",
      },
    ],
    awardees: Array.from({ length: 50 }).map((_, i) => ({
      id: i + 1,
      name: `Awardee ITS ${i + 1}`,
      major: [
        "Statistika",
        "Teknik Informatika",
        "Sistem Informasi",
        "Manajemen Bisnis",
      ][Math.floor(Math.random() * 4)],
      year: Math.random() > 0.5 ? "2023" : "2024",
    })),
    documents: [
      {
        id: 1,
        title: "Modul Pelatihan Data Science",
        type: "Other",
        fileType: "PDF",
        size: "10 MB",
        date: "2025-03-05",
      },
    ],
  },
  uinsa: {
    slug: "uinsa",
    name: "GenBI Komisariat UINSA",
    university: "UIN Sunan Ampel Surabaya",
    logo_univ: "/assets/logos/genbi.svg",
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description:
      "GenBI UINSA mengintegrasikan nilai-nilai ekonomi syariah dalam setiap program kerjanya.",
    socials: { instagram: "@genbi_uinsa", email: "genbiuinsa@gmail.com" },
    bph: [
      {
        role: "Ketua Umum",
        name: "Yusuf Maulana",
        image: "/assets/images/individu.jpg",
      },
      {
        role: "Sekretaris",
        name: "Zahra",
        image: "/assets/images/individu.jpg",
      },
    ],
    divisions: [
      {
        role: "Kadiv Eko. Syariah",
        name: "Adi Hidayat KW",
        image: "/assets/images/individu.jpg",
      },
    ],
    proker: [
      {
        id: 1,
        title: "Festival Ekonomi Syariah",
        status: "Upcoming",
        date: "10 Aug 2025",
        description: "Pameran produk halal dan talkshow ekonomi syariah.",
      },
      {
        id: 2,
        title: "Kajian Ekonomi Islam",
        status: "On-going",
        date: "Monthly",
        description: "Diskusi rutin isu ekonomi terkini perspektif Islam.",
      },
    ],
    awardees: Array.from({ length: 30 }).map((_, i) => ({
      id: i + 1,
      name: `Awardee UINSA ${i + 1}`,
      major: [
        "Ekonomi Syariah",
        "Perbankan Syariah",
        "Akuntansi",
        "Ilmu Ekonomi",
      ][Math.floor(Math.random() * 4)],
      year: "2024",
    })),
    documents: [],
  },
  unugiri: {
    slug: "unugiri",
    name: "GenBI Komisariat UNUGIRI",
    university: "UNU Sunan Giri Bojonegoro",
    logo_univ: "/assets/logos/genbi.svg",
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description:
      "GenBI UNUGIRI hadir untuk memberdayakan ekonomi pedesaan dan pesantren.",
    socials: { instagram: "@genbi_unugiri", email: "genbiunugiri@gmail.com" },
    bph: [
      {
        role: "Ketua Umum",
        name: "Mustofa",
        image: "/assets/images/individu.jpg",
      },
    ],
    divisions: [],
    proker: [
      {
        id: 1,
        title: "Pesantren Go Digital",
        status: "On-going",
        date: "Weekly",
        description: "Edukasi pembayaran digital di koperasi pesantren.",
      },
    ],
    awardees: Array.from({ length: 25 }).map((_, i) => ({
      id: i + 1,
      name: `Awardee UNUGIRI ${i + 1}`,
      major: ["Ekonomi", "Pendidikan", "Teknik", "Hukum"][
        Math.floor(Math.random() * 4)
      ],
      year: "2024",
    })),
    documents: [],
  },
  utm: {
    slug: "utm",
    name: "GenBI Komisariat UTM",
    university: "Universitas Trunojoyo Madura",
    logo_univ: "/assets/logos/genbi.svg",
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description:
      "GenBI UTM fokus pada pengembangan potensi pariwisata dan ekonomi garam di Madura.",
    socials: { instagram: "@genbi_utm", email: "genbiutm@gmail.com" },
    bph: [
      {
        role: "Ketua Umum",
        name: "Hasan Basri",
        image: "/assets/images/individu.jpg",
      },
    ],
    divisions: [],
    proker: [
      {
        id: 1,
        title: "Promosi Wisata Madura",
        status: "Upcoming",
        date: "12 Sep 2025",
        description: "Konten kreatif promosi wisata lokal.",
      },
    ],
    awardees: Array.from({ length: 30 }).map((_, i) => ({
      id: i + 1,
      name: `Awardee UTM ${i + 1}`,
      major: ["Akuntansi", "Manajemen", "Ekonomi Pembangunan", "Kelautan"][
        Math.floor(Math.random() * 4)
      ],
      year: "2024",
    })),
    documents: [],
  },
  pens: {
    slug: "pens",
    name: "GenBI Komisariat PENS",
    university: "Politeknik Elektronika Negeri Surabaya",
    logo_univ: "/assets/logos/genbi.svg",
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description:
      "GenBI PENS siap menciptakan inovasi teknologi tepat guna untuk UMKM binaan Bank Indonesia.",
    socials: { instagram: "@genbi_pens", email: "genbipens@gmail.com" },
    bph: [
      {
        role: "Ketua Umum",
        name: "Kevin Sanjaya",
        image: "/assets/images/individu.jpg",
      },
    ],
    divisions: [],
    proker: [
      {
        id: 1,
        title: "Alat Ketahanan Pangan IoT",
        status: "On-going",
        date: "Jul 2025",
        description: "Riset alat bantu pertanian berbasis IoT.",
      },
    ],
    awardees: Array.from({ length: 25 }).map((_, i) => ({
      id: i + 1,
      name: `Awardee PENS ${i + 1}`,
      major: ["Teknik Komputer", "Elektro", "Telekomunikasi", "Informatika"][
        Math.floor(Math.random() * 4)
      ],
      year: "2024",
    })),
    documents: [],
  },
  "uin-madura": {
    slug: "uin-madura",
    name: "GenBI Komisariat UIN Madura",
    university: "UIN Madura",
    logo_univ: "/assets/logos/genbi.svg",
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description:
      "GenBI UIN Madura aktif mensosialisasikan cinta, bangga, dan paham rupiah di kalangan santri.",
    socials: {
      instagram: "@genbi_uinmadura",
      email: "genbiuinmadura@gmail.com",
    },
    bph: [
      {
        role: "Ketua Umum",
        name: "Syaiful",
        image: "/assets/images/individu.jpg",
      },
    ],
    divisions: [],
    proker: [
      {
        id: 1,
        title: "CBP Rupiah Goes to Pondok",
        status: "Completed",
        date: "15 Jan 2025",
        description: "Sosialisasi CBP Rupiah di Ponpes Pamekasan.",
      },
    ],
    awardees: Array.from({ length: 25 }).map((_, i) => ({
      id: i + 1,
      name: `Awardee UIN Madura ${i + 1}`,
      major: [
        "Ekonomi Syariah",
        "Perbankan Syariah",
        "Akuntansi Syariah",
        "Hukum Ekonomi Syariah",
      ][Math.floor(Math.random() * 4)],
      year: "2024",
    })),
    documents: [],
  },
  default: {
    slug: "default",
    name: "GenBI Komisariat",
    university: "Universitas",
    logo_univ: "/assets/logos/genbi.svg",
    logo_genbi: "/assets/logos/genbi.svg",
    cover_image: "/assets/images/raker.jpg",
    description: "Halaman ini belum memiliki data spesifik.",
    socials: { instagram: "@genbi_jatim", email: "genbijatim@gmail.com" },
    bph: [],
    divisions: [],
    proker: [],
    awardees: [],
    documents: [],
  },
};

export default function CommissariatDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Unwrap params in Next.js 15+
  const { slug } = use(params);
  const [selectedMember, setSelectedMember] = useState<BPHMember | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("profil");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data, fallback to default or 404 in real app. For demo we use 'unair' or generic.
  const data = COMMISSARIAT_DATA[slug] || {
    ...COMMISSARIAT_DATA["default"],
    name: `GenBI Komisariat ${slug.toUpperCase()}`,
    university: slug.toUpperCase(),
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <main className="flex-1 w-full relative z-10 pb-20">
        {/* Hero Section */}
        <section className="relative pt-32 pb-12 px-6">
          <div className="container mx-auto">
            <SlideUp className="flex flex-col md:flex-row items-center gap-8 mb-8">
              {/* Logos */}
              <div className="flex items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="w-20 h-20 relative">
                  <Image
                    src={data.logo_univ}
                    alt={data.university}
                    fill
                    className="object-contain brightness-0 invert"
                  />
                </div>
                <div className="w-px h-16 bg-white/20"></div>
                <div className="w-20 h-20 relative">
                  <Image
                    src={data.logo_genbi}
                    alt="GenBI"
                    fill
                    className="object-contain brightness-0 invert"
                  />
                </div>
              </div>

              {/* Text Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  {data.name}
                </h1>
                <p className="text-xl text-blue-200">{data.university}</p>
                {/* Socials */}
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm text-blue-200/80">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <span>📸</span> {data.socials.instagram}
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <span>✉️</span> {data.socials.email}
                  </div>
                </div>
              </div>
            </SlideUp>

            {/* Tabs Navigation */}
            <FadeIn
              delay={0.2}
              className="flex flex-wrap justify-center md:justify-start gap-2 border-b border-white/10 pb-1 mt-12"
            >
              {(["profil", "proker", "awardee", "arsip"] as TabType[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-semibold rounded-t-xl transition-all relative ${
                      activeTab === tab
                        ? "text-white bg-white/10 border-b-2 border-cyan-400"
                        : "text-blue-200/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab === "profil" && "Profil & Kepengurusan"}
                    {tab === "proker" && "Program Kerja"}
                    {tab === "awardee" && "Data Awardee"}
                    {tab === "arsip" && "Arsip Internal & LPJ"}
                  </button>
                )
              )}
            </FadeIn>
          </div>
        </section>

        {/* Content Sections */}
        <div className="container mx-auto px-6 min-h-[400px]">
          {/* Tab 1: Profil */}
          {activeTab === "profil" && (
            <StaggerContainer className="space-y-12">
              {/* Tentang Kami */}
              <StaggerItem>
                <Card className="bg-white/5 border-white/10 p-8 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
                  <h3 className="text-2xl font-bold mb-4 text-white relative z-10 flex items-center gap-3">
                    <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
                    Tentang Kami
                  </h3>
                  <p className="text-blue-100/80 leading-relaxed text-lg relative z-10">
                    {data.description}
                  </p>
                </Card>
              </StaggerItem>

              {/* Organizational Structure */}
              <section className="py-24 relative border-t border-white/5">
                <div className="container mx-auto px-6 relative z-10">
                  <div className="text-center mb-16">
                    <SlideUp>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Struktur Organisasi
                      </h2>
                      <p className="text-blue-200/70 max-w-2xl mx-auto">
                        Susunan pengurus {data.name} Periode 2025/2026.
                      </p>
                    </SlideUp>
                  </div>

                  <div className="max-w-6xl mx-auto">
                    <StaggerItem>
                      {/* Leaders Section */}
                      <div className="flex flex-col items-center mb-12">
                        <div className="flex items-center gap-4 mb-8 w-full justify-center">
                          <div className="h-px bg-gradient-to-r from-transparent to-white/20 w-32"></div>
                          <h3 className="text-2xl font-bold text-white uppercase tracking-widest">
                            Leaders
                          </h3>
                          <div className="h-px bg-gradient-to-l from-transparent to-white/20 w-32"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16 justify-center max-w-2xl">
                          {data.bph
                            .filter(
                              (m) =>
                                m.role.toLowerCase().includes("ketua") ||
                                m.role.toLowerCase().includes("wakil")
                            )
                            .map((member, idx) => (
                              <Card
                                key={idx}
                                onClick={() => setSelectedMember(member)}
                                className="bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col items-center text-center hover:bg-white/10 transition-all hover:-translate-y-2 cursor-pointer group hover:border-cyan-500/30"
                              >
                                <div className="w-24 h-24 bg-blue-950/50 rounded-full border-4 border-white/10 flex items-center justify-center shadow-lg overflow-hidden mb-6 group-hover:border-cyan-400 transition-colors">
                                  <Image
                                    src={member.image}
                                    alt={member.name}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover transition-all duration-500"
                                  />
                                </div>
                                <h3 className="font-bold text-xl text-white mb-1 group-hover:text-cyan-300 transition-colors">
                                  {member.name}
                                </h3>
                                <p className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                                  {member.role}
                                </p>
                              </Card>
                            ))}
                        </div>

                        {/* Secretaries & Treasurers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-20">
                          {/* Secretaries */}
                          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-6 justify-center border-b border-white/5 pb-4">
                              <span className="text-2xl grayscale brightness-200">
                                📝
                              </span>
                              <h3 className="font-bold text-lg text-white uppercase tracking-wider">
                                Sekretaris
                              </h3>
                            </div>
                            <div className="space-y-4">
                              {data.bph
                                .filter((m) =>
                                  m.role.toLowerCase().includes("sekretaris")
                                )
                                .map((member, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => setSelectedMember(member)}
                                    className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
                                  >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 flex-shrink-0 group-hover:border-cyan-400 transition-colors">
                                      <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover transition-all"
                                      />
                                    </div>
                                    <div className="text-left">
                                      <p className="font-bold text-white text-sm group-hover:text-cyan-200 transition-colors">
                                        {member.name}
                                      </p>
                                      <p className="text-xs text-blue-200/60">
                                        {member.role}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Treasurers */}
                          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-6 justify-center border-b border-white/5 pb-4">
                              <span className="text-2xl grayscale brightness-200">
                                💰
                              </span>
                              <h3 className="font-bold text-lg text-white uppercase tracking-wider">
                                Bendahara
                              </h3>
                            </div>
                            <div className="space-y-4">
                              {data.bph
                                .filter((m) =>
                                  m.role.toLowerCase().includes("bendahara")
                                )
                                .map((member, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => setSelectedMember(member)}
                                    className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
                                  >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 flex-shrink-0 group-hover:border-cyan-400 transition-colors">
                                      <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover transition-all"
                                      />
                                    </div>
                                    <div className="text-left">
                                      <p className="font-bold text-white text-sm group-hover:text-cyan-200 transition-colors">
                                        {member.name}
                                      </p>
                                      <p className="text-xs text-blue-200/60">
                                        {member.role}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Divisions */}
                        {data.divisions && data.divisions.length > 0 && (
                          <div className="w-full">
                            <div className="flex items-center gap-4 mb-8 w-full justify-center">
                              <div className="h-px bg-gradient-to-r from-transparent to-white/20 w-24"></div>
                              <h3 className="text-xl font-bold text-white uppercase tracking-widest">
                                Koordinator Divisi
                              </h3>
                              <div className="h-px bg-gradient-to-l from-transparent to-white/20 w-24"></div>
                            </div>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {data.divisions.map((member, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedMember(member)}
                                  className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
                                >
                                  <div className="aspect-square relative bg-white/5">
                                    <Image
                                      src={member.image}
                                      alt={member.name}
                                      fill
                                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                  </div>
                                  <div className="p-3 bg-white/5 backdrop-blur-md">
                                    <p
                                      className="text-cyan-400/80 font-semibold text-[10px] uppercase mb-0.5 tracking-wider truncate"
                                      title={member.role}
                                    >
                                      {member.role}
                                    </p>
                                    <p
                                      className="text-white font-bold text-xs truncate group-hover:text-cyan-100 transition-colors"
                                      title={member.name}
                                    >
                                      {member.name}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </StaggerItem>
                  </div>
                </div>
              </section>
            </StaggerContainer>
          )}

          {/* Tab 2: Proker */}
          {activeTab === "proker" && (
            <StaggerContainer className="grid gap-6">
              {data.proker.map((item) => (
                <StaggerItem key={item.id}>
                  <div className="flex flex-col md:flex-row gap-6 bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="w-full md:w-48 flex-none flex flex-col items-center justify-center bg-black/20 rounded-xl p-4 text-center border border-white/5">
                      <div className="text-2xl font-bold text-white">
                        {item.date.split(" ")[0]}
                      </div>
                      <div className="text-sm text-cyan-200 uppercase tracking-widest">
                        {item.date.split(" ")[1]} {item.date.split(" ")[2]}
                      </div>
                      <div
                        className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${
                          item.status === "Completed"
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : item.status === "On-going"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                        }`}
                      >
                        {item.status}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-blue-200/70 mb-4">
                        {item.description}
                      </p>
                      {item.documentation && (
                        <Button size="sm" variant="secondary" className="gap-2">
                          <span>📷</span> Lihat Dokumentasi
                        </Button>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* Tab 3: Awardee */}
          {activeTab === "awardee" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Daftar Awardee</h3>
                <input
                  type="text"
                  placeholder="Cari nama..."
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-blue-200 border-b border-white/10">
                      <tr>
                        <th className="p-4">No</th>
                        <th className="p-4">Nama Lengkap</th>
                        <th className="p-4">Jurusan</th>
                        <th className="p-4">Angkatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.awardees
                        .filter((a) =>
                          a.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((awardee, i) => (
                          <tr
                            key={awardee.id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="p-4 text-blue-200/50">{i + 1}</td>
                            <td className="p-4 font-semibold text-white">
                              {awardee.name}
                            </td>
                            <td className="p-4 text-blue-100">
                              {awardee.major}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                                {awardee.year}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Arsip */}
          {activeTab === "arsip" && (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.documents.map((doc) => (
                <StaggerItem key={doc.id}>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all group">
                    <div
                      className={`w-12 h-12 flex-none rounded flex items-center justify-center text-sm font-bold border ${
                        doc.fileType === "PDF"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {doc.fileType}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate group-hover:text-cyan-300 transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-blue-200/60 mt-1">
                        {doc.type} • {doc.date} • {doc.size}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ⬇
                    </Button>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </main>

      <div className="relative border-t border-white/10">
        <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-3xl -z-10"></div>
        <AnimatePresence>
          {selectedMember && (
            <MemberDetailModal
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
            />
          )}
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  );
}
