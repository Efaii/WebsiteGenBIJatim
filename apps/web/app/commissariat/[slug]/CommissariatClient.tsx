"use client";

import { useState, use, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import {
  Download,
  ArrowRight,
  Instagram,
  Mail,
  Search,
  ExternalLink,
  ClipboardList,
  Wallet,
} from "lucide-react";
import { DocumentCard } from "@/components/DocumentCard";
import { ProkerCard } from "@/components/ProkerCard";
import { motion, AnimatePresence } from "framer-motion";
// Disable scroll animations per user request to load everything instantly
const FadeIn = ({ children, className }: any) => <div className={className}>{children}</div>;
const SlideUp = ({ children, className }: any) => <div className={className}>{children}</div>;
const StaggerContainer = ({ children, className }: any) => <div className={className}>{children}</div>;
const StaggerItem = ({ children, className }: any) => <div className={className}>{children}</div>;
import { PageBackground } from "@/components/PageBackground";
import { MemberDetailModal, BPHMember } from "@/components/MemberDetailModal";
import { ProkerData } from "@/app/types";
// import { COMMISSARIAT_DATA } from "@/app/data/commissariatData"; // REMOVED

// --- Types ---
type TabType = "profil" | "proker" | "awardee" | "arsip";

// Local types
// interface Proker was replaced by imported ProkerData

interface Awardee {
  id: number;
  name: string;
  major: string;
  year: string;
}

interface Document {
  id: number;
  title: string;
  type:
    | "SK"
    | "LPJ"
    | "SOP"
    | "Other"
    | "Proposal"
    | "Data"
    | "Materi"
    | "Surat"
    | "Notulensi"
    | "Dokumentasi";
  fileType: "PDF" | "DOCX" | "XLSX" | "PPTX" | "ZIP";
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
  proker: ProkerData[];
  awardees: Awardee[]; // Specific to this commissariat
  documents: Document[];
}

// --- Mock Data ---
// Data imported from @/app/data/commissariatData

export default function CommissariatClient({
  initialData,
}: {
  initialData: CommissariatData;
}) {
  const { slug } = initialData;
  const [selectedMember, setSelectedMember] = useState<BPHMember | null>(null);
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabType>("profil");
  
  useEffect(() => {
    if (rawTab && ["profil", "proker", "awardee", "arsip"].includes(rawTab)) {
      setActiveTab(rawTab as TabType);
      setTimeout(() => {
        if (scrollAnchorRef.current) {
          const y = scrollAnchorRef.current.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 500); // Wait for render
    }
  }, [rawTab]);

  // Replaced modal with static page, so selectedProker state is removed.
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivisi, setSelectedDivisi] = useState<string>("All"); // New state for Proker Divisi filter
  const [selectedYear, setSelectedYear] = useState<string>("All"); // New state for Archive filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tabsRef = useRef<HTMLElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // Dynamic Data Generator for Fallback
  const generateMockData = (slug: string): CommissariatData => {
    const universityName = slug.toUpperCase().replace("-", " ");
    const name = `GenBI Komisariat ${universityName}`;

    // Check if we have a specific logo for this slug in public/assets/logos
    // For now we map common ones or default to genbi
    let logo_univ = "/assets/logos/genbi.svg";
    const commonLogos = [
      "unair",
      "unesa",
      "its",
      "upnvjt",
      "uinsa",
      "unugiri",
      "utm",
      "pens",
      "uin-madura",
    ];
    if (commonLogos.includes(slug)) {
      // Handle special naming conventions if needed, e.g. uinMadura
      if (slug === "uin-madura") logo_univ = "/assets/logos/uinMadura.svg";
      else if (slug === "upnvjt")
        logo_univ = "/assets/logos/upnvjt.svg"; // Fixed filename
      else logo_univ = `/assets/logos/${slug}.svg`;
    }

    return {
      slug,
      name,
      university: universityName,
      logo_univ,
      logo_genbi: "/assets/logos/genbi.svg",
      cover_image: "/assets/images/raker.jpg",
      description: `GenBI Komisariat ${universityName} adalah komunitas penerima beasiswa Bank Indonesia yang berdedikasi untuk mengembangkan potensi diri dan berkontribusi bagi masyarakat di lingkungan ${universityName} dan sekitarnya.`,
      socials: {
        instagram: `@genbi_${slug.replace("-", "")}`,
        email: `genbi${slug.replace("-", "")}@gmail.com`,
      },
      bph: Array.from({ length: 6 }).map((_, i) => ({
        role:
          i === 0
            ? "Ketua Umum"
            : i === 1
              ? "Wakil Ketua"
              : i === 2
                ? "Sekretaris Umum"
                : i === 3
                  ? "Sekretaris 2"
                  : i === 4
                    ? "Bendahara Umum"
                    : "Bendahara 2",
        name: `Pengurus ${universityName} ${i + 1}`,
        image: "/assets/images/individu.jpg",
        university: universityName,
        major: "Manajemen",
        instagram: "@genbi_jatim",
        linkedin: "GenBI Jatim",
      })),
      divisions: Array.from({ length: 4 }).map((_, i) => ({
        role: `Kadiv ${
          ["Pendidikan", "Lingkungan", "Kominfo", "Kewirausahaan"][i]
        }`,
        name: `Koordinator ${i + 1}`,
        image: "/assets/images/individu.jpg",
        university: universityName,
        major: "Ekonomi",
        instagram: "@genbi_jatim",
        linkedin: "GenBI Jatim",
      })),
      proker: [
        {
          id: 1,
          title: "Sosialisasi Beasiswa BI",
          slug: "sosialisasi-beasiswa",
          commissariat: universityName,
          type: "Sosialisasi",
          audience: "External",
          status: "Completed",
          date: "10 Jan 2025",
          dateIso: "2025-01-10",
          format: "Offline",
          description:
            "Kegiatan sosialisasi beasiswa Bank Indonesia kepada mahasiswa baru.",
          description_long:
            "Kegiatan ini bertujuan untuk memberikan informasi mendalam mengenai proses seleksi Beasiswa Bank Indonesia. Dihadiri oleh lebih dari 200 mahasiswa, acara ini menjelaskan tahapan administrasi, wawancara, hingga benefit menjadi bagian dari GenBI.",
          objectives: [
            "Meningkatkan awareness mahasiswa tentang Beasiswa BI",
            "Memberikan tips lolos seleksi berkas & wawancara",
            "Memperkenalkan komunitas GenBI kepada publik",
          ],
          benefits: [
            "Mahasiswa paham alur pendaftaran",
            "Meningkatnya jumlah pendaftar berkualitas",
            "Branding GenBI semakin kuat",
          ],
          gallery: [
            "/assets/images/raker.jpg",
            "/assets/images/bnsp.JPG",
            "/assets/images/background.jpg",
          ],
          documentation: "https://instagram.com",
          newsUrl: "https://unair.ac.id/news",
        },
        {
          id: 2,
          title: "GenBI Mengajar",
          slug: "genbi-mengajar",
          commissariat: universityName,
          type: "Social",
          audience: "External",
          status: "On-going",
          date: "20 Feb 2025",
          dateIso: "2025-02-20",
          format: "Offline",
          description:
            "Program pengabdian masyarakat berupa pengajaran di sekolah dasar binaan.",
        },
        {
          id: 3,
          title: "Bersih-Bersih Pantai",
          slug: "bersih-pantai",
          commissariat: universityName,
          type: "Social",
          audience: "External",
          status: "Upcoming",
          date: "15 Mar 2025",
          dateIso: "2025-03-15",
          format: "Offline",
          description: "Aksi kepedulian lingkungan di pantai kenjeran.",
        },
      ],
      awardees: Array.from({ length: 25 }).map((_, i) => ({
        id: i + 1,
        name: `Mahasiswa ${universityName} ${i + 1}`,
        major: ["Manajemen", "Akuntansi", "Ekonomi Islam", "Ilmu Komunikasi"][
          i % 4
        ],
        year: "2024",
      })),
      documents: [
        {
          id: 1,
          title: "SK Pengurus Wilayah GenBI Jatim 2025-2026",
          type: "SK",
          fileType: "PDF",
          size: "2.4 MB",
          date: "10 Jan 2025",
        },
        {
          id: 2,
          title: "Laporan Pertanggungjawaban (LPJ) Triwulan I",
          type: "LPJ",
          fileType: "PDF",
          size: "15.8 MB",
          date: "05 Apr 2025",
        },
        {
          id: 3,
          title: "Proposal Sponsorship GenBI Leadership Camp",
          type: "Proposal",
          fileType: "PDF",
          size: "4.2 MB",
          date: "12 Feb 2025",
        },
        {
          id: 4,
          title: "Database Anggota Aktif & Alumni 2025",
          type: "Data",
          fileType: "XLSX",
          size: "850 KB",
          date: "15 Jan 2025",
        },
        {
          id: 5,
          title: "Materi Presentasi Sosialisasi Kebanksentralan",
          type: "Materi",
          fileType: "PPTX",
          size: "12.5 MB",
          date: "20 Feb 2025",
        },
        {
          id: 6,
          title: "Surat Tugas Delegasi Rakornas 2025",
          type: "Surat",
          fileType: "PDF",
          size: "320 KB",
          date: "01 Mar 2025",
        },
        {
          id: 7,
          title: "Notulensi Rapat Koordinasi Wilayah (Rakorwil)",
          type: "Notulensi",
          fileType: "DOCX",
          size: "145 KB",
          date: "28 Feb 2025",
        },
        {
          id: 8,
          title: "Dokumentasi Foto Kegiatan Buka Bersama",
          type: "Dokumentasi",
          fileType: "ZIP",
          size: "45.2 MB",
          date: "15 Apr 2025",
        },
      ],
    };
  };

  // Use initialData passed from Server Component
  const data = initialData;

  // Filter awardees
  const filteredAwardees = data.awardees.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredAwardees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAwardees.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const downloadMockFile = (title: string) => {
    alert(`Memulai unduhan dokumen: ${title}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Decorative Headers */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <main className="flex-1 w-full relative z-10 pb-20">
        {/* Hero Section */}
        <section className="relative pt-40 pb-10 px-6">
          <div className="container mx-auto">
            <SlideUp once={false} className="w-full">
              <div className="relative w-full bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm overflow-hidden group">
                {/* Decorative Shine Effect */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100/50 transition-all duration-700"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  {/* Logos Container - "Floating" inside the card */}
                  <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner shrink-0 group/logos cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="w-20 h-20 relative">
                      <Image
                        src={data.logo_univ}
                        alt={data.university}
                        fill
                        className="object-contain opacity-90 group-hover/logos:opacity-100 transition-all duration-500"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="w-px h-12 bg-slate-200"></div>
                    <div className="w-20 h-20 relative">
                      <Image
                        src={data.logo_genbi}
                        alt="GenBI"
                        fill
                        className="object-contain opacity-90 group-hover/logos:opacity-100 transition-all duration-500 delay-75"
                      />
                    </div>
                  </div>

                  {/* Text Info */}
                  <div className="text-center md:text-left flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 hover:border-blue-200 cursor-default mb-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                        </span>
                        Komisariat Aktif
                      </div>
                      <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                        {data.name}
                      </h1>
                      <p className="text-xl text-slate-500 font-light">
                        {data.university}
                      </p>
                    </div>

                    {/* Socials */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                      <a
                        href={`https://instagram.com/${data.socials.instagram.replace(
                          "@",
                          "",
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-600 transition-all cursor-pointer group/social shadow-sm"
                      >
                        <span className="group-hover/social:scale-110 transition-transform">
                          <Instagram className="w-4 h-4" />
                        </span>{" "}
                        <span className="font-medium text-sm">
                          {data.socials.instagram}
                        </span>
                      </a>
                      <a
                        href={`mailto:${data.socials.email}`}
                        className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-600 transition-all cursor-pointer group/social shadow-sm"
                      >
                        <span className="group-hover/social:scale-110 transition-transform">
                          <Mail className="w-4 h-4" />
                        </span>{" "}
                        <span className="font-medium text-sm">
                          {data.socials.email}
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </SlideUp>
          </div>
        </section>

        {/* Tabs Navigation - Separated from Hero */}
        <div ref={scrollAnchorRef} className="absolute mt-[-100px]" />
        <section
          ref={tabsRef}
          className="relative z-40 py-4 transition-all duration-300"
        >

          <FadeIn
            delay={0.2}
            className="container mx-auto px-6 flex justify-center relative z-10"
          >
            <div className="flex flex-wrap items-center justify-center gap-1 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
              {[
                { id: "profil", label: "Profil & Kepengurusan" },
                { id: "proker", label: "Program Kerja" },
                { id: "awardee", label: "Data Awardee" },
                { id: "arsip", label: "Arsip Internal & LPJ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setTimeout(() => {
                      if (scrollAnchorRef.current) {
                        const y =
                          scrollAnchorRef.current.getBoundingClientRect().top +
                          window.scrollY -
                          20; // Slight buffer
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                    }, 100);
                  }}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 relative z-10",
                    activeTab === tab.id
                      ? "text-blue-700"
                      : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-full shadow-sm -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* Content Sections */}
        <div className="container mx-auto px-6 min-h-[400px] pt-12 pb-20">
          <AnimatePresence mode="wait">
            {/* Tab 1: Profil */}
            {activeTab === "profil" && (
              <motion.div
                key="profil"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-20">
                  {/* Tentang Kami */}
                  <FadeIn delay={0.1} once={false}>
                    <Card className="bg-white border-slate-200 shadow-sm p-8 relative overflow-hidden group">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-all duration-500"></div>
                      <h3 className="text-2xl font-bold mb-4 text-slate-900 relative z-10 flex items-center gap-3 tracking-tight">
                        <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
                        Tentang Kami
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-lg relative z-10">
                        {data.description}
                      </p>
                    </Card>
                  </FadeIn>

                  {/* Organizational Structure */}
                  <section className="py-20 relative border-t border-slate-200">
                    <div className="container mx-auto px-6 relative z-10">
                      <div className="text-center mb-20">
                        <SlideUp once={false}>
                          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                            Struktur Organisasi
                          </h2>
                        </SlideUp>
                        <SlideUp once={false} delay={0.1}>
                          <p className="text-slate-500 max-w-2xl mx-auto">
                            Susunan pengurus {data.name} Periode 2025/2026.
                          </p>
                        </SlideUp>
                      </div>

                      <div className="max-w-6xl mx-auto">
                        {/* Leaders Section */}
                        <div className="flex flex-col items-center mb-12">
                          <SlideUp
                            once={false}
                            className="flex items-center gap-4 mb-8 w-full justify-center"
                          >
                            <div className="h-px bg-gradient-to-r from-transparent to-slate-200 w-32"></div>
                            <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">
                              Leaders
                            </h3>
                            <div className="h-px bg-gradient-to-l from-transparent to-slate-200 w-32"></div>
                          </SlideUp>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-20 justify-center max-w-2xl">
                            {data.bph
                              .filter(
                                (m) =>
                                  m.role.toLowerCase().includes("ketua") ||
                                  m.role.toLowerCase().includes("wakil"),
                              )
                              .map((member, idx) => (
                                <FadeIn
                                  key={idx}
                                  delay={idx * 0.1}
                                  className="w-full h-full"
                                  once={false}
                                >
                                  <Card
                                    onClick={() => setSelectedMember(member)}
                                    className="bg-white border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-2 cursor-pointer group hover:border-blue-300 h-full"
                                  >
                                    <div className="w-24 h-24 bg-slate-50 rounded-full border-4 border-slate-100 flex items-center justify-center overflow-hidden mb-6 group-hover:border-blue-400 transition-colors">
                                      <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover transition-all duration-500"
                                      />
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                      {member.name}
                                    </h3>
                                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                                      {member.role}
                                    </p>
                                  </Card>
                                </FadeIn>
                              ))}
                          </div>

                          {/* Secretaries & Treasurers */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-20">
                            {/* Secretaries */}
                            <FadeIn delay={0.2} className="h-full" once={false}>
                              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 transition-colors h-full">
                                <div className="flex items-center gap-3 mb-6 justify-center border-b border-slate-100 pb-4">
                                  <ClipboardList className="w-6 h-6 text-blue-500" />
                                  <h3 className="font-bold text-lg text-slate-900 uppercase tracking-wider">
                                    Sekretaris
                                  </h3>
                                </div>
                                <div className="space-y-4">
                                  {data.bph
                                    .filter((m) =>
                                      m.role
                                        .toLowerCase()
                                        .includes("sekretaris"),
                                    )
                                    .map((member, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() =>
                                          setSelectedMember(member)
                                        }
                                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                                      >
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 group-hover:border-blue-400 transition-colors bg-white">
                                          <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover transition-all"
                                          />
                                        </div>
                                        <div className="text-left">
                                          <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                            {member.name}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            {member.role}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </FadeIn>

                            {/* Treasurers */}
                            <FadeIn delay={0.2} className="h-full" once={false}>
                              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 transition-colors h-full">
                                <div className="flex items-center gap-3 mb-6 justify-center border-b border-slate-100 pb-4">
                                  <Wallet className="w-6 h-6 text-amber-500" />
                                  <h3 className="font-bold text-lg text-slate-900 uppercase tracking-wider">
                                    Bendahara
                                  </h3>
                                </div>
                                <div className="space-y-4">
                                  {data.bph
                                    .filter((m) =>
                                      m.role
                                        .toLowerCase()
                                        .includes("bendahara"),
                                    )
                                    .map((member, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() =>
                                          setSelectedMember(member)
                                        }
                                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                                      >
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 group-hover:border-blue-400 transition-colors bg-white">
                                          <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover transition-all"
                                          />
                                        </div>
                                        <div className="text-left">
                                          <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                            {member.name}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            {member.role}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </FadeIn>
                          </div>

                          {/* Divisions */}
                          {data.divisions && data.divisions.length > 0 && (
                            <div className="w-full">
                              <SlideUp
                                once={false}
                                className="flex items-center gap-4 mb-8 w-full justify-center"
                              >
                                <div className="h-px bg-gradient-to-r from-transparent to-slate-200 w-24"></div>
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest">
                                  Koordinator Divisi
                                </h3>
                                <div className="h-px bg-gradient-to-l from-transparent to-slate-200 w-24"></div>
                              </SlideUp>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full justify-center">
                                {data.divisions.map((member, idx) => (
                                  <FadeIn
                                    key={idx}
                                    delay={idx * 0.05}
                                    once={false}
                                  >
                                    <Card
                                      onClick={() => setSelectedMember(member)}
                                      className="bg-white border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group hover:border-blue-300 min-h-[160px]"
                                    >
                                      <div className="w-16 h-16 bg-slate-50 rounded-full border-2 border-slate-100 flex items-center justify-center overflow-hidden mb-3 group-hover:border-blue-400 transition-colors">
                                        <Image
                                          src={member.image}
                                          alt={member.name}
                                          width={64}
                                          height={64}
                                          className="w-full h-full object-cover transition-all duration-500"
                                        />
                                      </div>
                                      <h3 className="font-bold text-sm text-slate-900 mb-2 group-hover:text-blue-600 transition-colors truncate w-full leading-tight">
                                        {member.name}
                                      </h3>
                                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider truncate w-full">
                                        {member.role}
                                      </p>
                                    </Card>
                                  </FadeIn>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Proker */}
            {activeTab === "proker" && (
              <motion.div
                key="proker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Divisi Filter for Proker */}
                <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <span className="text-sm font-medium text-slate-500 mr-2">
                    Filter Divisi:
                  </span>
                  {[
                    "All",
                    ...Array.from(
                      new Set(
                        data.proker
                          .map((p) => p.divisi)
                          .filter(Boolean)
                      ),
                    ).sort(),
                  ].map((divisi) => (
                    <button
                      key={divisi as string}
                      onClick={() => setSelectedDivisi(divisi as string)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer",
                        selectedDivisi === divisi
                          ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      {divisi as string}
                    </button>
                  ))}
                </div>

                <div className="grid gap-6">
                  {data.proker
                    .filter(
                      (item) =>
                        selectedDivisi === "All" ||
                        item.divisi === selectedDivisi,
                    )
                    .map((item, idx) => (
                    <FadeIn key={item.id} delay={idx * 0.1} once={false}>
                      {/* Proker Card (Updated with href) */}
                      <div key={item.id} className="h-full">
                        <ProkerCard
                          href={`/program/${item.id}`}
                          title={item.title}
                          status={item.status}
                          date={item.date}
                          description={item.description}
                          className="h-full"
                        />
                      </div>
                    </FadeIn>
                  ))}
                  {data.proker.filter(
                    (item) =>
                      selectedDivisi === "All" ||
                      item.divisi === selectedDivisi,
                  ).length === 0 && (
                    <div className="py-12 text-center text-slate-400 italic">
                      Tidak ada program kerja untuk divisi {selectedDivisi}.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab 3: Awardee */}
            {activeTab === "awardee" && (
              <motion.div
                key="awardee"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FadeIn
                  delay={0.2}
                  className="w-full"
                  once={false}
                  amount={0.2}
                >
                  {/* Visual Filter */}
                  <div className="relative z-20 mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari nama awardee..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-slate-500 whitespace-nowrap">
                      Total: {filteredAwardees.length} Awardee
                    </div>
                  </div>

                  {/* Table Data Card */}
                  <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-3xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-left">
                              Nama Lengkap
                            </th>
                            <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">
                              Jurusan
                            </th>
                            <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                              Angkatan
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentItems.length > 0 ? (
                            currentItems.map((awardee, idx) => (
                              <tr
                                key={awardee.id}
                                className="hover:bg-slate-50 transition-colors group"
                              >
                                <td className="p-6 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {awardee.name}
                                </td>
                                <td className="p-6 text-slate-600 hidden sm:table-cell">
                                  {awardee.major}
                                </td>
                                <td className="p-6 text-center">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                                    {awardee.year}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={3}
                                className="p-12 text-center text-slate-400"
                              >
                                Data tidak ditemukan.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
                        <span className="text-sm text-slate-500">
                          Menampilkan {indexOfFirstItem + 1} -{" "}
                          {Math.min(indexOfLastItem, filteredAwardees.length)}{" "}
                          dari {filteredAwardees.length} data
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 md:h-9 border-slate-200 text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              setCurrentPage((prev) => Math.max(prev - 1, 1));
                              setTimeout(() => {
                                if (scrollAnchorRef.current) {
                                  const y =
                                    scrollAnchorRef.current.getBoundingClientRect()
                                      .top +
                                    window.scrollY -
                                    20;
                                  window.scrollTo({
                                    top: y,
                                    behavior: "smooth",
                                  });
                                }
                              }, 100);
                            }}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                              Page {currentPage} of {totalPages}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 md:h-9 border-slate-200 text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages),
                              );
                              setTimeout(() => {
                                if (scrollAnchorRef.current) {
                                  const y =
                                    scrollAnchorRef.current.getBoundingClientRect()
                                      .top +
                                    window.scrollY -
                                    20;
                                  window.scrollTo({
                                    top: y,
                                    behavior: "smooth",
                                  });
                                }
                              }, 100);
                            }}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </FadeIn>
              </motion.div>
            )}

            {/* Tab 4: Arsip */}
            {activeTab === "arsip" && (
              <motion.div
                key="arsip"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Year Filter for Archives */}
                <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <span className="text-sm font-medium text-slate-500 mr-2">
                    Filter Tahun:
                  </span>
                  {[
                    "All",
                    ...Array.from(
                      new Set(
                        data.documents.map((d) => d.date.split(" ").pop()),
                      ),
                    )
                      .sort()
                      .reverse(),
                  ].map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year as string)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer",
                        selectedYear === year
                          ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                <StaggerContainer
                  once={false}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {data.documents
                    .filter(
                      (doc) =>
                        selectedYear === "All" ||
                        doc.date.includes(selectedYear),
                    )
                    .map((doc) => (
                      <StaggerItem key={doc.id}>
                        <DocumentCard
                          title={doc.title}
                          fileType={doc.fileType}
                          date={doc.date}
                          size={doc.size}
                          onClick={() =>
                            alert(
                              `Preview Dokumen (Tab Baru)\n\nDalam implementasi nyata, ini akan membuka: \nwindow.open(url, '_blank')`,
                            )
                          }
                          onDownload={() => downloadMockFile(doc.title)}
                        />
                      </StaggerItem>
                    ))}
                  {data.documents.filter(
                    (doc) =>
                      selectedYear === "All" || doc.date.includes(selectedYear),
                  ).length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 italic">
                      Tidak ada dokumen arsip di tahun {selectedYear}.
                    </div>
                  )}
                </StaggerContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="relative border-t border-slate-200 bg-white">
        <AnimatePresence>
          {selectedMember && (
            <MemberDetailModal
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
              contextTitle={`Pengurus GenBI Komisariat ${data.slug.toUpperCase()}`}
            />
          )}
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  );
}
