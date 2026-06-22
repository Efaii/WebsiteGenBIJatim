"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { AboutHero } from "@/components/about/Hero";
import { OrganizationStructure } from "@/components/about/OrganizationStructure";
import { VisionMission } from "@/components/about/VisionMission";
import { Documents } from "@/components/about/Documents";
import { ProkerCard } from "@/components/ProkerCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getPublicProkers } from "@/lib/services/proker.service";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/Button";
import { KorkomData } from "@repo/types";

type TabType = "profil" | "proker" | "arsip";

interface AboutClientProps {
  korkomData: KorkomData;
}

export function AboutClient({ korkomData }: AboutClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profil");
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const [prokers, setProkers] = useState<any[]>(korkomData.proker?.slice(0, 9) || []);
  const [prokerPage, setProkerPage] = useState(1);
  const [hasMoreProkers, setHasMoreProkers] = useState((korkomData.proker?.length || 0) > 9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedPeriods, setExpandedPeriods] = useState<string[]>([]);

  // Determine Periods and Sort them
  const periods = Array.from(new Set((korkomData.proker || []).map(p => p.period || ""))).filter(Boolean).sort().reverse();
  const currentPeriod = korkomData.activePeriod || periods[0] || "";

  const loadMoreProkers = async () => {
    if (isLoadingMore || !hasMoreProkers) return;
    setIsLoadingMore(true);
    try {
      const nextPage = prokerPage + 1;
      const result = await getPublicProkers({ 
        orgId: korkomData.id!, 
        page: nextPage, 
        limit: 9 
      });
      
      setProkers(prev => [...prev, ...result.prokers]);
      setProkerPage(nextPage);
      setHasMoreProkers(result.prokers.length === 9);
    } catch (error) {
      console.error("Failed to load more prokers:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    if (dateStr.toLowerCase().includes("setiap")) return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "profil", label: "Profil & Struktur" },
    { id: "proker", label: "Program Kerja" },
    { id: "arsip", label: "Arsip Program" },
  ];

  return (
    <main className="flex-1">
      <AboutHero name={korkomData.name} description={korkomData.description} />

      {/* Tabs Navigation */}
      <div ref={scrollAnchorRef} className="pt-8" />
      <section className="sticky top-20 z-40 py-4 mb-6">
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200 opacity-0 data-[sticky=true]:opacity-100 transition-opacity"></div>
        
        <FadeIn delay={0.4} className="container mx-auto px-4 md:px-6 flex justify-center relative z-10 w-full overflow-hidden">
          <div className="flex items-center justify-start md:justify-center gap-1 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm overflow-x-auto no-scrollbar w-full md:w-auto min-w-0 flex-nowrap scroll-smooth">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={(e) => {
                  setActiveTab(tab.id);
                  (e.currentTarget as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                  if (scrollAnchorRef.current) {
                    const y = scrollAnchorRef.current.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }}
                className={cn(
                  "px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[13px] md:text-sm font-semibold transition-all duration-300 relative z-10 shrink-0 whitespace-nowrap cursor-pointer",
                  activeTab === tab.id ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabAbout"
                    className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Content Sections */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "profil" && (
            <motion.div
              key="profil"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <VisionMission 
                vision={korkomData.vision || ""} 
                missions={korkomData.missions || []} 
              />
              <OrganizationStructure 
                bph={korkomData.bph || []} 
                divisions={korkomData.divisions || []} 
                isKomisariat={korkomData.type === 'KOMISARIAT'}
              />
            </motion.div>
          )}

          {activeTab === "proker" && (
            <motion.div
              key="proker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <section className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl pb-16 md:pb-24 relative z-10">
                <div className="w-full lg:px-6 xl:px-10">
                  <SlideUp once amount={0.1}>
                    <SectionHeader
                      title={<>Program Kerja <span className="text-blue-600">Unggulan</span></>}
                      description="Inisiatif strategis dan program kerja inovatif yang dirancang untuk memberikan dampak nyata, memberdayakan masyarakat, serta mengembangkan potensi anggota GenBI Jawa Timur secara berkelanjutan"
                      align="center"
                      variant="light"
                      className="mb-12"
                    />
                  </SlideUp>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {prokers.filter(p => p.period === currentPeriod || (!currentPeriod && new Date(p.date).getFullYear() === new Date().getFullYear())).length > 0 ? (
                      prokers
                        .filter(p => p.period === currentPeriod || (!currentPeriod && new Date(p.date).getFullYear() === new Date().getFullYear()))
                        .map((proker, idx) => (
                          <SlideUp key={proker.id} delay={0.1 + (idx % 3) * 0.1}>
                            <ProkerCard 
                              image={proker.gallery?.[0]}
                              title={proker.name || proker.title || "Untitled Proker"}
                              date={formatDate(proker.date)}
                              status={proker.executionFormat || "Completed"}
                              category={proker.category}
                              description={proker.description.substring(0, 150) + (proker.description.length > 150 ? "..." : "")}
                              href={`/program/${proker.id}`}
                            />
                          </SlideUp>
                        ))
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 lg:col-span-3">
                        <p className="text-slate-400 font-bold">Belum ada program kerja untuk periode ini ({currentPeriod}).</p>
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

          {activeTab === "arsip" && (
            <motion.div
              key="arsip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <section className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl pb-16 md:pb-24 relative z-10">
                <div className="w-full lg:px-6 xl:px-10">
                  <SlideUp once amount={0.1}>
                    <SectionHeader
                      title={<>Arsip <span className="text-blue-600">Program Kerja</span></>}
                      description="Menjelajahi dedikasi kami dari masa ke masa. Dokumentasi rekam jejak dan pencapaian program kerja dari berbagai periode kepengurusan sebagai bentuk transparansi organisasi"
                      align="center"
                      variant="light"
                      className="mb-12"
                    />
                  </SlideUp>

                  <div className="space-y-12">
                    {periods.filter(p => p !== currentPeriod).map((period) => {
                      const periodProkers = (korkomData.proker || []).filter(p => p.period === period);
                      if (periodProkers.length === 0) return null;

                      return (
                        <div key={period} className="space-y-8">
                          <FadeIn once delay={0.1}>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Arsip Periode</span>
                              <span className="text-lg font-bold text-blue-600 bg-blue-50/50 px-4 py-1 rounded-full border border-blue-100/50">{period}</span>
                              <div className="flex-1 h-px bg-slate-200" />
                            </div>
                          </FadeIn>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {periodProkers
                              .slice(0, expandedPeriods.includes(period) ? undefined : 9) // LIMIT TO 9 ITEMS PER YEAR UNLESS EXPANDED
                              .map((proker, idx) => (
                                <SlideUp key={proker.id} delay={0.1 + (idx % 3) * 0.1}>
                                  <ProkerCard 
                                    image={proker.gallery?.[0]}
                                    title={proker.name || proker.title || "Untitled Proker"}
                                    date={formatDate(proker.date)}
                                    status={proker.executionFormat || "Completed"}
                                    category={proker.category}
                                    description={proker.description.substring(0, 150) + (proker.description.length > 150 ? "..." : "")}
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
                    })}

                    {periods.filter(p => p !== currentPeriod).length === 0 && (
                      <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold">Belum ada arsip program kerja tersedia.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
