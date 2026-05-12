import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  Target,
  Trophy,
  Image as ImageIcon,
  Newspaper,
  ArrowLeft,
  Share2,
  ClipboardList,
  ExternalLink,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";

import {
  getProgramById,
  getAllProgramIds,
} from "@/lib/services/program.service";
import { SlideUp, FadeIn } from "@/components/MotionWrapper";
import { PageBackground } from "@/components/PageBackground";

export async function generateStaticParams() {
  return getAllProgramIds();
}

// Custom parser component to automatically render bullet points and numbered lists
function renderFormattedText(text: string | null | undefined, fallbackObj?: string[], iconColorClass = "bg-blue-500") {
  if (!text) {
    if (fallbackObj && fallbackObj.length > 0) {
      return (
        <div className="space-y-3">
          {fallbackObj.map((obj, i) => (
            <div key={i} className="flex gap-3">
              <span className={`w-1.5 h-1.5 rounded-full ${iconColorClass} mt-2 flex-shrink-0`}></span>
              <span className="text-slate-600 leading-relaxed text-sm">{obj}</span>
            </div>
          ))}
        </div>
      );
    }
    return <span className="italic text-slate-400 text-sm">Belum ada keterangan.</span>;
  }

  // Split string based on list numbers (e.g. "1.", "2.", "10.") avoiding decimals
  const parts = text.split(/(?=\b\d+\.(?!\d))/).map(s => s.trim()).filter(Boolean);
  
  return (
    <div className="space-y-4">
      {parts.map((part, i) => {
        const isListItem = /^\d+\./.test(part);
        if (isListItem) {
           const numMatch = part.match(/^\d+\./)?.[0];
           const content = part.replace(/^\d+\.\s*/, "");
           const textColorClass = iconColorClass.replace('bg-', 'text-');
           return (
             <div key={i} className="flex gap-3 relative">
               <span className={`font-bold text-sm min-w-[1.2rem] mt-0.5 ${textColorClass}`}>{numMatch}</span>
               <span className="text-slate-600 leading-relaxed text-sm">{content}</span>
             </div>
           );
        }
        return <div key={i} className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{part}</div>;
      })}
    </div>
  );
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProgramById(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900 relative overflow-clip">
      <Navbar />

      <main className="flex-1 w-full relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Back Button */}
            <FadeIn delay={0.1}>
              <Link
                href={`/commissariat/${data.commissariatSlug || "unair"}?tab=proker`}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group mb-4"
              >
                <div className="p-2.5 rounded-full bg-white border border-slate-200 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                  <ArrowLeft
                    size={18}
                    className="group-hover:-translate-x-0.5 transition-transform"
                  />
                </div>
                <span className="font-medium text-sm tracking-wide">
                  Kembali ke Program
                </span>
              </Link>
            </FadeIn>

            {/* Header Content */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-slate-200 shadow-sm group">
              <FadeIn
                delay={0.2}
                className="relative h-[300px] md:h-[450px] w-full"
              >
                {/* Hero Image */}
                {data.gallery && data.gallery.length > 0 ? (
                  <Image
                    src={data.gallery[0]}
                    alt={data.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-slate-300" />
                  </div>
                )}

                {/* Overlay Gradient for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20">
                  <SlideUp delay={0.3} className="space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "backdrop-blur-md px-4 py-1.5 text-xs tracking-widest uppercase font-semibold text-white shadow-sm border-white/20",
                          data.status === "Completed"
                            ? "bg-green-500/80"
                            : data.status === "On-going"
                              ? "bg-blue-500/80"
                              : "bg-slate-500/80"
                        )}
                      >
                        {data.status === "Completed"
                          ? "✨ Terlaksana"
                          : data.status === "On-going"
                            ? "🔥 Sedang Berjalan"
                            : "📅 Akan Datang"}
                      </Badge>
                      <Badge
                        className="px-4 py-1.5 text-xs tracking-widest uppercase backdrop-blur-md bg-black/40 border-none text-white shadow-sm"
                        variant="outline"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-2 inline-block -mt-0.5" />
                        {data.date}
                      </Badge>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl tracking-tight drop-shadow-md">
                      {data.title}
                    </h1>
                  </SlideUp>
                </div>
              </FadeIn>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 pt-8">
              {/* Left Column: Description */}
              <div className="lg:col-span-2 space-y-12">
                <SlideUp delay={0.4}>
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                      <span className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)]"></span>
                      Deskripsi Kegiatan
                    </h2>
                    <div className="prose prose-lg text-slate-600 leading-relaxed whitespace-pre-line max-w-none">
                      {data.description_long || data.description || "Belum ada deskripsi."}
                    </div>
                  </div>
                </SlideUp>

                {/* Gallery Section - 6 Photos */}
                <SlideUp delay={0.5}>
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <ImageIcon className="text-blue-500 w-8 h-8" />
                      Galeri Kegiatan
                    </h2>
                    
                    {data.gallery && data.gallery.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {data.gallery.slice(0, 6).map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-blue-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
                          >
                            <Image
                              src={img}
                              alt={`Gallery ${idx + 1}`}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <div className="p-3 bg-white/90 rounded-full border border-slate-200 hover:scale-110 hover:text-blue-600 transition-all text-slate-700">
                                <Share2 className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-12 h-12 mb-4 text-slate-300" />
                        <p className="font-medium text-slate-500">Belum ada foto dokumentasi diunggah.</p>
                      </div>
                    )}
                  </div>
                </SlideUp>
              </div>

              {/* Right Column: Sidebar info */}
              <div className="space-y-8">
                <SlideUp delay={0.6} className="space-y-8">
                  {/* KPI/Target Card */}
                  {(data.kpiTukTarget || data.objectives) && (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all shadow-sm group">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-4">
                        <Target className="w-5 h-5 text-blue-500" />
                        KPI / Target
                      </h3>
                      {renderFormattedText(data.kpiTukTarget, data.objectives, "bg-blue-500")}
                    </div>
                  )}

                  {/* Impact/Dampak Card */}
                  {(data.dampak || data.benefits) && (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-emerald-300 transition-all shadow-sm group">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-4">
                        <Trophy className="w-5 h-5 text-emerald-500" />
                        Dampak / Input
                      </h3>
                      {renderFormattedText(data.dampak, data.benefits, "bg-emerald-500")}
                    </div>
                  )}

                  {/* Evaluasi Card */}
                  {(data.evaluasi || data.evaluation) && (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-amber-300 transition-all shadow-sm group">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-4">
                        <ClipboardList className="w-5 h-5 text-amber-500" />
                        Evaluasi
                      </h3>
                      {renderFormattedText(data.evaluasi, data.evaluation ? [data.evaluation] : [], "bg-amber-500")}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 pt-2">
                    {/* Proposal or LPJ PDF links if available */}
                    {data.linkProposalPdf && (
                      <a
                        href={data.linkProposalPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full group"
                      >
                        <Button
                          variant="outline"
                          className="w-full gap-2 py-6 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 transition-all bg-white text-slate-700"
                        >
                          <Newspaper className="w-5 h-5 group-hover:scale-110 transition-transform text-blue-500" />
                          Lihat Proposal (PDF)
                        </Button>
                      </a>
                    )}
                    {(data.dokumentasiDrive || data.documentation) && (
                      <a
                        // @ts-ignore
                        href={data.dokumentasiDrive || data.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full group"
                      >
                        <Button
                          variant="primary"
                          className="w-full gap-2 py-6 rounded-xl shadow-md hover:shadow-lg transition-all bg-blue-600 hover:bg-blue-700 border-none text-white"
                        >
                          Dokumentasi GDrive
                          <ExternalLink className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </a>
                    )}
                  </div>
                </SlideUp>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
