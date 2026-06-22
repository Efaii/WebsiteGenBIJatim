"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn, getAssetUrl } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  Instagram,
  Mail,
  Search,
  ClipboardList,
  User,
  Users,
  GraduationCap,
  Calendar,
  SearchX,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ProkerCard } from "@/components/ProkerCard";
import { getPublicProkers } from "@/lib/services/proker.service";
import { motion, AnimatePresence } from "framer-motion";
import {
  FadeIn,
  SlideUp,
  BlurIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { PageBackground } from "@/components/PageBackground";
import { VisionMission } from "@/components/about/VisionMission";
import { ProfileCard } from "@/components/about/ProfileCard";
import { SectionHeader } from "@/components/SectionHeader";
import { MemberDetailModal } from "@/components/MemberDetailModal";
import {
  Member as BPHMember,
  Proker,
  Awardee,
  OrganizationProfile,
} from "@repo/types";

// --- Types ---
type TabType = "profil" | "proker" | "awardee" | "arsip";

interface Division {
  id: string;
  title: string;
  subtitle?: string;
  accent: string;
  members: BPHMember[];
}

interface CommissariatData extends OrganizationProfile {
  bph?: BPHMember[];
  divisions?: Division[]; // Changed to match About page dynamic structure
  proker?: Proker[];
  awardees?: Awardee[];
}

export default function CommissariatClient({
  initialData,
}: {
  initialData: CommissariatData;
}) {
  const [selectedMember, setSelectedMember] = useState<BPHMember | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("profil");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tabsRef = useRef<HTMLElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const [prokers, setProkers] = useState<Proker[]>(initialData.proker?.slice(0, 9) || []);
  const [prokerPage, setProkerPage] = useState(1);
  const [hasMoreProkers, setHasMoreProkers] = useState((initialData.proker?.length || 0) > 9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalProkers, setTotalProkers] = useState(initialData.proker?.length || 0);
  const [expandedPeriods, setExpandedPeriods] = useState<string[]>([]);

  const data = initialData || {};

  const filteredAwardees = (data.awardees || []).filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredAwardees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAwardees.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  // const prokersShadow = data.proker || []; // Removed to avoid shadowing state

  const periods = Array.from(new Set((initialData.proker || []).map((p) => p.period || "")))
    .filter(Boolean)
    .sort()
    .reverse();
  const currentPeriod = data.activePeriod || "2024/2025";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    if (dateStr.toLowerCase().includes("setiap")) return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };


  const loadMoreProkers = async () => {
    if (isLoadingMore || !hasMoreProkers) return;
    setIsLoadingMore(true);
    try {
      const nextPage = prokerPage + 1;
      const result = await getPublicProkers({ 
        orgId: data.id, 
        page: nextPage, 
        limit: 9 
      });
      
      setProkers(prev => [...prev, ...result.prokers]);
      setProkerPage(nextPage);
      setHasMoreProkers(result.prokers.length === 9);
      setTotalProkers(result.pagination.total);
    } catch (error) {
      console.error("Failed to load more prokers:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Initial load sync for prokers count
  useEffect(() => {
    if (activeTab === "proker" && prokers.length <= 10) {
      // Just to initialize total count if needed, but initialData.proker might be full
      // Actually, if initialData.proker is full, we don't need to load more until requested
      // Let's assume initialData.proker is the full list for now, 
      // but we will limit it visually if we want server-side load more.
    }
  }, [activeTab]);

  const renderTitle = (title: string) => {
    if (!title) return "";
    if (title.includes(" - ")) {
      const parts = title.split(" - ");
      return (
        <>
          {parts[0]}{" "}
          <span className="text-blue-600">- {parts.slice(1).join(" - ")}</span>
        </>
      );
    }
    if (title.includes(" dan ")) {
      const parts = title.split(" dan ");
      return (
        <>
          {parts[0]}{" "}
          <span className="text-blue-600">
            dan {parts.slice(1).join(" dan ")}
          </span>
        </>
      );
    }
    const words = title.split(" ");
    if (words.length <= 1) return title;
    const lastWord = words.pop();
    return (
      <>
        {words.join(" ")} <span className="text-blue-600">{lastWord}</span>
      </>
    );
  };

  // --- Dynamic Section Logic (Standardized with About page) ---
  const bphDivision = (data.divisions || []).find(
    (d) =>
      d.title.toLowerCase().includes("harian") ||
      d.title.toLowerCase().includes("inti") ||
      d.title.toUpperCase() === "BPH",
  );

  const otherDivisions = (data.divisions || []).filter(
    (d) => d.id !== bphDivision?.id,
  );

  const allSections = [
    {
      id: "bph",
      title: bphDivision?.title || "Badan Pengurus Harian",
      subtitle:
        bphDivision?.subtitle ||
        `Struktur inti pengurus GenBI Komisariat ${data.name} untuk Periode ${data.activePeriod || "2025/2026"}`,
      members:
        data.bph && data.bph.length > 0 ? data.bph : bphDivision?.members || [],
      accent: bphDivision?.accent || "blue",
    },
    ...otherDivisions.map((div) => ({
      ...div,
      members: div.members || [],
    })),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-clip">
      <Navbar />
      <PageBackground />

      <main className="flex-1 w-full relative z-10">
        {/* --- HERO SECTION: Synchronized with Korkom (About) --- */}
        <section className="relative w-full min-h-[70vh] flex flex-col justify-center overflow-hidden bg-white pt-24 pb-20 lg:pt-32">
          {/* Background architectural elements */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full bg-blue-50/40 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full bg-blue-50/40 blur-[100px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A08_1px,transparent_1px),linear-gradient(to_bottom,#0F172A08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_40%,#000_30%,transparent_100%)]" />
          </div>

          <div className="container relative z-20 px-6 lg:px-8 xl:px-12 mx-auto max-w-7xl flex-1 flex flex-col justify-center py-20">
            <div className="w-full lg:px-6 xl:px-10">
              <div className="text-center flex flex-col items-center gap-8">
                {/* Brand Narrative */}
                <div className="max-w-4xl mx-auto px-4">
                  <div className="flex flex-col items-center">
                    {/* Social Eyebrow - Synchronized & Integrated */}
                    <FadeIn delay={0.1} className="mb-4">
                      <div className="flex items-center justify-center gap-3">
                        {data.socials?.instagram && (
                          <a
                            href={`https://instagram.com/${data.socials.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/social flex items-center gap-2.5 bg-white/80 backdrop-blur-md hover:bg-blue-50 px-6 py-3 rounded-full border border-slate-200/80 hover:border-blue-400/50 transition-all duration-300"
                          >
                            <Instagram className="w-4 h-4 text-blue-600 transition-colors" />
                            <span className="font-bold text-xs text-slate-600 group-hover/social:text-blue-600 uppercase tracking-widest transition-colors">
                              {data.socials.instagram}
                            </span>
                          </a>
                        )}
                        {data.socials?.email && (
                          <a
                            href={`mailto:${data.socials.email}`}
                            className="group/social flex items-center gap-2.5 bg-white/80 backdrop-blur-md hover:bg-slate-50 px-5 py-2 rounded-full border border-slate-200/80 hover:border-slate-400/50 transition-all duration-300"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 transition-colors" />
                            <span className="font-bold text-[10px] text-slate-600 group-hover/social:text-slate-900 uppercase tracking-widest transition-colors">
                              Email
                            </span>
                          </a>
                        )}
                      </div>
                    </FadeIn>

                    <BlurIn delay={0.3} initial={{ opacity: 0, y: 60 }}>
                      <h1 className="h1">
                        Mengenal <br />
                        <span className="text-blue-600">{data.name}</span>
                      </h1>
                    </BlurIn>

                    <FadeIn
                      delay={0.8}
                      initial={{ opacity: 0, y: 80 }}
                      className="mt-8"
                    >
                      <div className="max-w-3xl mx-auto">
                        <p className="text-[17px] md:text-lg text-slate-600 leading-relaxed font-medium">
                          {data.description || data.university}
                        </p>
                      </div>
                    </FadeIn>
                  </div>
                </div>

                {/* Hero Featured Image */}
                <div className="relative group w-full max-w-6xl mx-auto">
                  <SlideUp
                    once
                    delay={0.3}
                    amount={0.1}
                    initial={{ opacity: 0, y: 100 }}
                  >
                    <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 lg:border-8 border-white ring-1 ring-slate-900/5 group transform-gpu transition-all duration-[800ms] ease-[cubic-bezier(0.33,1,0.68,1)]">
                      <Image
                        src="/assets/images/GenBIJatim.JPG"
                        alt={data.name || "Komisariat"}
                        fill
                        priority
                        className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-white/20 to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-500" />
                    </div>
                  </SlideUp>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-slate-50 min-h-screen">
          {/* Tabs Navigation - Persistent & Sticky */}
          <div ref={scrollAnchorRef} className="pt-8" />
          <section
            ref={tabsRef}
            className="sticky top-20 z-40 py-4 mb-6 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-slate-50 backdrop-blur-xl border-b border-slate-200 opacity-0 data-[sticky=true]:opacity-100 transition-opacity"></div>
            <FadeIn
              delay={0.4}
              className="container mx-auto px-6 flex justify-center relative z-10 w-full overflow-hidden"
            >
              <div className="flex items-center justify-start md:justify-center gap-1 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm overflow-x-auto no-scrollbar w-full md:w-auto min-w-0 flex-nowrap scroll-smooth">
                {[
                  { id: "profil", label: "Profil & Struktur" },
                  { id: "proker", label: "Program Kerja" },
                  { id: "awardee", label: "Data Awardee" },
                  { id: "arsip", label: "Arsip Program" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      setActiveTab(tab.id as TabType);
                      (e.currentTarget as HTMLElement).scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                      });

                      // Controlled scroll to exactly the start of the content area
                      if (scrollAnchorRef.current) {
                        const y =
                          scrollAnchorRef.current.getBoundingClientRect().top +
                          window.scrollY -
                          100;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                    }}
                    className={cn(
                      "px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[13px] md:text-sm font-semibold transition-all duration-300 relative z-10 shrink-0 whitespace-nowrap cursor-pointer",
                      activeTab === tab.id
                        ? "text-blue-600"
                        : "text-slate-500 hover:text-slate-800",
                    )}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabComm"
                        className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-full -z-10"
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

          {/* --- CONTENT SECTIONS --- */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* TAB: PROFIL & STRUKTUR (Refactored for Dynamic Sections) */}
              {activeTab === "profil" && (
                <motion.div
                  key="profil"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full bg-slate-50 flex flex-col"
                >
                  <VisionMission
                    vision={data.vision}
                    missions={data.missions || []}
                  />

                  <div className="flex flex-col gap-24 py-16 md:py-24 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
                    {allSections.map(
                      (section, idx) =>
                        section.members &&
                        section.members.length > 0 && (
                          <section
                            key={section.id || idx}
                            className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10"
                          >
                            <div className="w-full lg:px-6 xl:px-10">
                              <SlideUp once amount={0.1} delay={0.3}>
                                <SectionHeader
                                  title={renderTitle(section.title)}
                                  description={section.subtitle}
                                  align="center"
                                  variant="light"
                                  className="mb-12"
                                />
                              </SlideUp>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {section.members.map((member, i) => (
                                  <FadeIn
                                    key={`${section.title}-${i}`}
                                    delay={0.2 + i * 0.08}
                                    once
                                    amount={0.1}
                                  >
                                    <ProfileCard member={member} />
                                  </FadeIn>
                                ))}
                              </div>
                            </div>
                          </section>
                        ),
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB: PROGRAM KERJA */}
              {activeTab === "proker" && (
                <motion.div
                  key="proker"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full bg-slate-50 flex flex-col"
                >
                  <section className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl pb-16 md:pb-24 relative z-10">
                    <div className="w-full lg:px-6 xl:px-10">
                      <SlideUp once amount={0.1} delay={0.3}>
                        <SectionHeader
                          title={
                            <>
                              Program Kerja{" "}
                              <span className="text-blue-600">Unggulan</span>
                            </>
                          }
                          description={`Inisiatif strategis dan program kerja inovatif yang dirancang untuk memberikan dampak nyata, memberdayakan masyarakat, serta mengembangkan potensi anggota GenBI Komisariat ${data.name} secara berkelanjutan`}
                          align="center"
                          variant="light"
                          className="mb-12"
                        />
                      </SlideUp>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {prokers.filter(
                          (p) =>
                            p.period === currentPeriod ||
                            (!currentPeriod &&
                              new Date(p.date || "").getFullYear() ===
                                new Date().getFullYear()),
                        ).length > 0 ? (
                          prokers
                            .filter(
                              (p) =>
                                p.period === currentPeriod ||
                                (!currentPeriod &&
                                  new Date(p.date || "").getFullYear() ===
                                    new Date().getFullYear()),
                            )
                            .map((proker, idx) => (
                              <SlideUp key={proker.id} delay={0.1 + (idx % 3) * 0.1}>
                                <ProkerCard
                                  image={proker.gallery?.[0]}
                                  title={proker.name || proker.title}
                                  date={proker.date || "-"}
                                  status={proker.executionFormat || "Selesai"}
                                  description={
                                    proker.description?.substring(0, 150) +
                                    (proker.description?.length > 150
                                      ? "..."
                                      : "")
                                  }
                                  href={`/program/${proker.id || proker.slug}`}
                                />
                              </SlideUp>
                            ))
                        ) : (
                          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 lg:col-span-3">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                              Belum ada program kerja untuk periode ini (
                              {currentPeriod}).
                            </p>
                          </div>
                        )}
                      </div>

                      {hasMoreProkers && prokers.length >= 9 && (
                        <div className="mt-16 flex flex-col items-center gap-6">
                          <Button
                            variant="secondary"
                            onClick={loadMoreProkers}
                            disabled={isLoadingMore}
                            className="group relative px-10 py-4 bg-white hover:bg-blue-600 text-slate-900 hover:text-white border-2 border-slate-200 hover:border-blue-600 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 shadow-xl shadow-slate-200/50 hover:shadow-blue-200 overflow-hidden"
                          >
                            <span className="relative z-10 flex items-center gap-3">
                              {isLoadingMore ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin group-hover:border-white/30 group-hover:border-t-white" />
                                  Memuat...
                                </>
                              ) : (
                                <>
                                  Lihat Lebih Banyak
                                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                              )}
                            </span>
                          </Button>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Menampilkan {prokers.length} program kerja
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </motion.div>
              )}

              {/* TAB: DATA AWARDEE */}
              {activeTab === "awardee" && (
                <motion.div
                  key="awardee"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full bg-slate-50 flex flex-col"
                >
                  <section className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl pb-16 md:pb-24 relative z-10">
                    <div className="w-full lg:px-6 xl:px-10">
                      <SlideUp once amount={0.1} delay={0.3}>
                        <SectionHeader
                          title={
                            <>
                              Database{" "}
                              <span className="text-blue-600">Awardee</span>
                            </>
                          }
                          description={`Daftar resmi mahasiswa penerima Beasiswa Bank Indonesia di lingkungan Komisariat ${data.name} yang memiliki potensi kepemimpinan dan integritas tinggi`}
                          align="center"
                          variant="light"
                          className="mb-12"
                        />
                      </SlideUp>

                      <FadeIn delay={0.2} once amount={0.2}>
                        <div className="relative z-20 mb-8 p-3 md:p-4 rounded-[2rem] md:rounded-full bg-white border border-slate-200/60 shadow-xl shadow-slate-200/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                          <div className="relative w-full md:w-[460px] group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                            <input
                              type="text"
                              placeholder="Cari nama awardee..."
                              className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/5 text-slate-900 placeholder:text-slate-400 font-semibold text-sm transition-all"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-auto px-6 py-3 bg-slate-50 rounded-2xl md:rounded-full border border-slate-200 shadow-sm text-[11px] font-bold text-slate-500 whitespace-nowrap uppercase tracking-[0.2em] group">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            <span>
                              Total:{" "}
                              <span className="text-blue-600 font-black">
                                {filteredAwardees.length}
                              </span>{" "}
                              Awardee
                            </span>
                          </div>
                        </div>

                        <Card
                          variant="default"
                          className="bg-white border border-slate-200 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] overflow-hidden rounded-[2.5rem]"
                        >
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-100 border-b border-slate-200">
                                  <th className="px-6 py-4 md:px-8 md:py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                                    <div className="flex items-center gap-3 md:gap-4">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 shrink-0">
                                        <User className="w-4 h-4 md:w-5 md:h-5 text-blue-500/70" />
                                      </div>
                                      <span>Nama Lengkap</span>
                                    </div>
                                  </th>
                                  <th className="px-6 py-4 md:px-8 md:py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] table-cell">
                                    <div className="flex items-center gap-3 md:gap-4">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 shrink-0">
                                        <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-blue-500/70" />
                                      </div>
                                      <span>Program Studi</span>
                                    </div>
                                  </th>
                                  <th className="px-6 py-4 md:px-8 md:py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] text-center">
                                    <div className="flex items-center justify-center gap-3 md:gap-4">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 shrink-0">
                                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-500/70" />
                                      </div>
                                      <span>Angkatan</span>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {currentItems.length > 0 ? (
                                  currentItems.map((awardee) => (
                                    <tr
                                      key={awardee.id}
                                      className="group relative transition-all duration-300 hover:bg-slate-50/70 border-b border-slate-100 last:border-0 cursor-default"
                                    >
                                      <td className="px-6 py-5 md:px-8 md:py-6 relative">
                                        {/* Simple Hover Accent Strip */}
                                        <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center opacity-0 group-hover:opacity-100" />

                                        <div className="flex flex-col">
                                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 text-sm md:text-base">
                                            {awardee.name}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-5 md:px-8 md:py-6 text-slate-500 font-medium table-cell text-sm md:text-base">
                                        <span>{awardee.major}</span>
                                      </td>
                                      <td className="px-6 py-5 md:px-8 md:py-6 text-center">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-white group-hover:bg-blue-600 group-hover:text-white text-blue-600 border border-blue-100 group-hover:border-blue-500 transition-all duration-300 uppercase tracking-widest shadow-sm">
                                          {awardee.batch}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={3}
                                      className="p-12 md:p-20 text-center"
                                    >
                                      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-12">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                          <SearchX className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-slate-900 font-bold uppercase tracking-widest text-[13px]">
                                            Data Tidak Ditemukan
                                          </p>
                                          <p className="text-slate-400 text-xs font-medium">
                                            Maaf, nama atau jurusan yang Anda
                                            cari belum terdaftar.
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {totalPages > 1 && (
                            <div className="px-6 py-4 md:px-8 md:py-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-100/50 backdrop-blur-sm">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-600 rounded-full" />
                                Memuat {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAwardees.length)} dari {filteredAwardees.length} Awardee
                              </span>
                              
                              <div className="flex items-center bg-white p-1 rounded-full border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="w-10 h-10 p-0 rounded-full bg-transparent border-0 hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition-colors"
                                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                  disabled={currentPage === 1}
                                  title="Halaman Sebelumnya"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </Button>

                                <div className="px-5 border-x border-slate-100 flex items-center gap-2 min-w-[120px] justify-center">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Halaman</span>
                                  <span className="text-xs font-black text-blue-600">{currentPage}</span>
                                  <span className="text-[10px] font-bold text-slate-300">/</span>
                                  <span className="text-xs font-bold text-slate-500">{totalPages}</span>
                                </div>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="w-10 h-10 p-0 rounded-full bg-transparent border-0 hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition-colors"
                                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                  disabled={currentPage === totalPages}
                                  title="Halaman Selanjutnya"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      </FadeIn>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* TAB: ARSIP PROGRAM */}
              {activeTab === "arsip" && (
                <motion.div
                  key="arsip"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full bg-slate-50 flex flex-col"
                >
                  <section className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl pb-16 md:pb-24 relative z-10">
                    <div className="w-full lg:px-6 xl:px-10">
                      <SlideUp once amount={0.1} delay={0.3}>
                        <SectionHeader
                          title={
                            <>
                              Arsip{" "}
                              <span className="text-blue-600">
                                Program Kerja
                              </span>
                            </>
                          }
                          description="Menjelajahi dedikasi kami dari masa ke masa. Dokumentasi rekam jejak dan pencapaian program kerja dari berbagai periode kepengurusan sebagai bentuk transparansi organisasi"
                          align="center"
                          variant="light"
                          className="mb-12"
                        />
                      </SlideUp>

                      <div className="space-y-12">
                        {periods.filter((p) => p !== currentPeriod).length >
                        0 ? (
                          periods
                            .filter((p) => p !== currentPeriod)
                            .map((period) => {
                              const periodProkers = (initialData.proker || []).filter(
                                (p) => p.period === period
                              );
                              
                              if (periodProkers.length === 0) return null;

                              return (
                                <div key={period} className="space-y-8">
                                  <FadeIn once delay={0.1}>
                                    <div className="flex items-center gap-4">
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                                        Arsip Periode
                                      </span>
                                      <span className="text-lg font-bold text-blue-600 bg-blue-50/50 px-4 py-1 rounded-full border border-blue-100/50">
                                        {period}
                                      </span>
                                      <div className="flex-1 h-px bg-slate-200" />
                                    </div>
                                  </FadeIn>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {periodProkers
                                      .slice(0, expandedPeriods.includes(period) ? undefined : 9) // LIMIT TO 9 ITEMS PER YEAR UNLESS EXPANDED
                                      .map((proker, idx) => (
                                        <SlideUp
                                          key={proker.id}
                                          delay={0.1 + (idx % 3) * 0.1}
                                        >
                                          <ProkerCard
                                            image={proker.gallery?.[0]}
                                            title={
                                              proker.name || "Untitled Proker"
                                            }
                                            date={formatDate(proker.date || "")}
                                            status={
                                              proker.executionFormat || "Selesai"
                                            }
                                            description={
                                              proker.description?.substring(
                                                0,
                                                150,
                                              ) +
                                              (proker.description?.length > 150
                                                ? "..."
                                                : "")
                                            }
                                            href={`/program/${proker.id}`}
                                          />
                                        </SlideUp>
                                      ))}
                                  </div>
                                  {periodProkers.length > 9 && (
                                    <div className="flex justify-center mt-8">
                                      <button
                                        onClick={() => {
                                          if (expandedPeriods.includes(period)) {
                                            setExpandedPeriods(expandedPeriods.filter(p => p !== period));
                                          } else {
                                            setExpandedPeriods([...expandedPeriods, period]);
                                          }
                                        }}
                                        className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                      >
                                        {expandedPeriods.includes(period) ? (
                                          <>
                                            Sembunyikan
                                            <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
                                          </>
                                        ) : (
                                          <>
                                            Tampilkan {periodProkers.length - 9} Program Lainnya
                                            <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                        ) : (
                          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                              Belum ada arsip program kerja tersedia.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <div className="relative border-t border-slate-100">
        <AnimatePresence>
          {selectedMember && (
            <MemberDetailModal
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
              contextTitle={`Pengurus GenBI Komisariat ${(data.name || "").toUpperCase()}`}
            />
          )}
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  );
}
