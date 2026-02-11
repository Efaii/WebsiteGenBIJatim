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
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Background Blobs (Standardized) */}
      <PageBackground variant="default" />

      <main className="flex-1 w-full relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Back Button */}
            <FadeIn delay={0.1}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-blue-200/70 hover:text-white transition-colors group mb-4"
              >
                <div className="p-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all shadow-lg">
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
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm group">
              {/* Decorative Shine Effect */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/15 transition-all duration-700 pointer-events-none z-20"></div>

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
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black">
                    <div className="absolute inset-0 opacity-30 bg-[url('/assets/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                  </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 to-transparent mix-blend-multiply"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20">
                  <SlideUp delay={0.3} className="space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant="outline"
                        className="backdrop-blur-md bg-white/10 border-white/20 px-4 py-1.5 text-xs tracking-widest uppercase font-semibold text-white shadow-lg"
                      >
                        {data.status === "Completed"
                          ? "✨ Terlaksana"
                          : data.status === "On-going"
                            ? "🔥 Sedang Berjalan"
                            : "📅 Akan Datang"}
                      </Badge>
                      <Badge
                        className={cn(
                          "px-4 py-1.5 text-xs tracking-widest uppercase backdrop-blur-md bg-black/40 border-white/10 shadow-lg",
                          data.status === "Completed"
                            ? "text-emerald-400"
                            : data.status === "On-going"
                              ? "text-cyan-400"
                              : "text-blue-300",
                        )}
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
                  <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                      Deskripsi Kegiatan
                    </h2>
                    <div className="prose prose-invert prose-lg text-blue-100/80 leading-relaxed whitespace-pre-line max-w-none">
                      {data.description_long || data.description}
                    </div>
                  </div>
                </SlideUp>

                {/* Gallery Section */}
                {data.gallery && data.gallery.length > 0 && (
                  <SlideUp delay={0.5}>
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ImageIcon className="text-cyan-400 w-8 h-8" />
                        Galeri Kegiatan
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.gallery.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-cyan-500/50 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10"
                          >
                            <Image
                              src={img}
                              alt={`Gallery ${idx + 1}`}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:scale-110 transition-transform">
                                <Share2 className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SlideUp>
                )}
              </div>

              {/* Right Column: Sidebar info */}
              <div className="space-y-8">
                <SlideUp delay={0.6} className="space-y-8">
                  {/* Objectives Card */}
                  {data.objectives && (
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm hover:border-cyan-500/20 transition-all shadow-xl">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wider border-b border-white/10 pb-4">
                        <Target className="w-5 h-5 text-cyan-400" />
                        Tujuan
                      </h3>
                      <ul className="space-y-4">
                        {data.objectives.map((obj, i) => (
                          <li
                            key={i}
                            className="flex gap-4 text-blue-100/80 text-sm leading-relaxed group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0 group-hover:shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all"></span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits Card */}
                  {data.benefits && (
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm hover:border-cyan-500/20 transition-all shadow-xl">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wider border-b border-white/10 pb-4">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        Output / Manfaat
                      </h3>
                      <ul className="space-y-4">
                        {data.benefits.map((ben, i) => (
                          <li
                            key={i}
                            className="flex gap-4 text-blue-100/80 text-sm leading-relaxed"
                          >
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            {ben}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 pt-2">
                    {data.newsUrl && (
                      <a
                        href={data.newsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full group"
                      >
                        <Button
                          variant="outline"
                          className="w-full gap-2 py-6 rounded-xl border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-100 transition-all"
                        >
                          <Newspaper className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Baca Liputan Berita
                        </Button>
                      </a>
                    )}
                    {data.documentation && (
                      <a
                        href={data.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full group"
                      >
                        <Button
                          variant="primary"
                          className="w-full gap-2 py-6 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-none"
                        >
                          Lihat Dokumentasi
                          <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
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
