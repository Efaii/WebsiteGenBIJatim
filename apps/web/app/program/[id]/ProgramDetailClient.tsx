"use client";

import Image from "next/image";
import {
  Calendar,
  Target,
  Trophy,
  Image as ImageIcon,
  Newspaper,
  ArrowLeft,
  FileText,
} from "lucide-react";

import { Footer } from "@/components/footer";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { cn, getAssetUrl } from "@/lib/utils";
import { SlideUp, FadeIn, BlurIn, ScaleIn, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import { PageBackground } from "@/components/PageBackground";
import { Proker } from "@repo/types";
import { Navbar } from "@/components/navbar";

interface ProgramDetailClientProps {
  initialData: Proker;
}

export default function ProgramDetailClient({ initialData: data }: ProgramDetailClientProps) {
  const title = data.name || data.title || "Untitled Program";
  const status = data.executionFormat || data.format || data.status || "Completed";
  
  // Format consistent with User Request: 29 maret 2026 / setiap senin / etc.
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "TBA";
    if (dateStr.toLowerCase().includes("setiap") || dateStr.toLowerCase().includes("akhir")) return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "On-going": return "text-cyan-600 bg-cyan-50 border-cyan-100";
      default: return "text-blue-600 bg-blue-50 border-blue-100";
    }
  };

  const descriptionParts = (data.description_long || data.description || "").split("\n");
  const introLead = descriptionParts[0];
  const remainingContent = descriptionParts.slice(1).join("\n");

  const SectionLabel = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
    <div className="flex items-center gap-4 mb-8">
       <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          {Icon ? <Icon size={18} /> : <div className="w-4 h-4 rounded-sm bg-blue-600/20" />}
       </div>
       <h2 className="text-sm md:text-base font-bold text-slate-900 uppercase tracking-[0.3em]">{children}</h2>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      <Navbar />
      
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <main className="flex-1 w-full relative z-10 pt-40 md:pt-48 pb-24">
        <div className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl">
          <div className="w-full lg:px-6 xl:px-10">
            
            {/* HEADER & METADATA */}
            <div className="max-w-4xl mx-auto text-center mb-16 md:pt-12">
              <BlurIn delay={0.1}>
                <h1 className="h1 text-slate-900 leading-[1.15] mb-8 capitalize">
                   {/* Two-tone Heading: Slate First, Blue Last */}
                   {title.split(" ").length > 1 ? (
                     <>
                        {title.split(" ").slice(0, -1).join(" ")}{" "}
                        <span className="text-blue-600">{title.split(" ").slice(-1)}</span>
                     </>
                   ) : (
                     <span className="text-blue-600">{title}</span>
                   )}
                </h1>
              </BlurIn>

              <FadeIn delay={0.2} className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 shadow-sm transition-all hover:bg-white hover:border-blue-200">
                  <Calendar size={13} className="text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{formatDate(data.date)}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 shadow-sm transition-all hover:bg-white hover:border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{status}</span>
                </div>
              </FadeIn>
            </div>

            {/* BANNER */}
            <ScaleIn delay={0.3} className="max-w-5xl mx-auto mb-24">
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/60 group bg-slate-50">
                {data.gallery && data.gallery.length > 0 ? (
                  <Image
                    src={getAssetUrl(data.gallery[0])}
                    alt={title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-slate-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-60" />
              </div>
            </ScaleIn>

            {/* CONTENT FLOW: INDIVIDUAL TRIGGERS FOR BETTER DISCOVERY */}
            <div className="max-w-3xl mx-auto space-y-24">
              
              {/* DESKRIPSI */}
              <div className="space-y-12">
                <SlideUp delay={0.1}>
                  <SectionLabel icon={FileText}>Deskripsi Program</SectionLabel>
                </SlideUp>
                <div className="prose prose-slate prose-base md:prose-lg max-w-none text-slate-600 leading-relaxed selection:bg-blue-100 space-y-6">
                  {introLead && (
                    <SlideUp delay={0.2}>
                      <p className="text-lg md:text-xl text-slate-800 font-semibold leading-relaxed mb-4">
                        {introLead}
                      </p>
                    </SlideUp>
                  )}
                  {remainingContent ? (
                    remainingContent.split("\n").map((para, i) => para.trim() && (
                      <SlideUp key={i} delay={0.1 + (i * 0.05)}>
                        <p className="text-slate-600">{para}</p>
                      </SlideUp>
                    ))
                  ) : null}
                </div>
              </div>

              {/* TARGET & IMPACT */}
              <div className="space-y-12">
                <SlideUp delay={0.1}>
                  <SectionLabel icon={Target}>Performa & Sasaran</SectionLabel>
                </SlideUp>
                <div className="space-y-12">
                   {[
                    { title: "Strategic Target", content: data.target, icon: Target },
                    { title: "Impact & Result", content: data.impact, icon: Trophy }
                  ].map((item, i) => item.content && (
                    <div key={i} className="space-y-6">
                      <SlideUp delay={0.2}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-400/50" />
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em]">{item.title}</h4>
                        </div>
                      </SlideUp>
                      <div className="pl-6 space-y-4">
                        {(() => {
                          const content = item.content;
                          const lines = Array.isArray(content) 
                            ? content 
                            : (content || "").split("\n").filter(line => line.trim());
                          
                          return lines.map((line, idx) => (
                            <SlideUp key={idx} delay={0.1 + (idx * 0.05)}>
                              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                                {line}
                              </p>
                            </SlideUp>
                          ));
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION AREA: CENTERED & COMPACT */}
              <SlideUp delay={0.2}>
                <div className="flex flex-col items-center gap-12">
                  <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl mx-auto">
                    {/* Back Button - Clear distinction */}
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => window.history.back()}
                      className="px-8 flex-1 sm:flex-none min-w-[140px]"
                    >
                      <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                      <span className="font-bold uppercase tracking-widest text-[10px]">Kembali</span>
                    </Button>

                    {/* News Coverage - If exists */}
                    {data.newsUrl && (
                      <a href={data.newsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                        <Button
                          variant="white"
                          size="lg"
                          className="w-full sm:w-auto transition-all group px-6 flex justify-center items-center shadow-md border border-slate-100 hover:border-blue-200"
                        >
                          <Newspaper size={18} className="text-blue-600" />
                        </Button>
                      </a>
                    )}

                    {/* Main Documentation - Primary Action or Fallback */}
                    {data.documentation || data.lpjLink ? (
                      <a href={data.documentation || data.lpjLink || ""} target="_blank" rel="noopener noreferrer" className="flex-[2] sm:flex-none">
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full sm:w-auto transition-all group px-8 flex items-center gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <FileText size={16} />
                            <span className="font-bold uppercase tracking-widest text-[10px]">Dokumentasi Lengkap</span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-blue-600 transition-colors">
                             <ArrowLeft className="rotate-180" size={12} />
                          </div>
                        </Button>
                      </a>
                    ) : (
                      <div className="flex-[2] sm:flex-none">
                        <Button
                          disabled
                          variant="ghost"
                          size="lg"
                          className="w-full sm:w-auto cursor-not-allowed bg-blue-50/50 border border-blue-100 text-blue-400"
                        >
                          <FileText size={16} className="mr-3" />
                          <span className="font-bold uppercase tracking-widest text-[10px]">Dokumentasi Belum Tersedia</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SlideUp>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
