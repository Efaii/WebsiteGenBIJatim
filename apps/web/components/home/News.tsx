"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FadeIn, StaggerContainer } from "@/components/MotionWrapper";
import { ArrowRight, Calendar, ArrowUpRight } from "lucide-react";
import { homeContent } from "@/content/home";
import { AdminNewsItem } from "@/services/news.service";

/**
 * NewsGrid Component
 * * Purpose: Renders a preview of updates with a strict, dependency-based appearance sequence.
 * Architecture:
 * - Sync Engine: Secondary cards are gated by the 'isMainVisible' state.
 * - Sequential Integrity: Ensures secondary elements never trigger before the featured card, 
 * effectively neutralizing inconsistencies caused by varying scroll speeds.
 * - Interaction: Combines viewport observation with manual interaction fallbacks.
 */
export function News({ initialNews }: { initialNews: AdminNewsItem[] }) {
  const { description } = homeContent.newsPreview;

  /* --- STATE MANAGEMENT & VISUAL GATING --- */
  // Acts as the master trigger for the staggered animation sequence
  const [isMainVisible, setIsMainVisible] = useState(false);

  const finalItems = initialNews || [];
  const [featured, ...others] = finalItems;

  /* --- DATA TRANSFORMATION HELPERS --- */
  const getImageUrl = (url: string) =>
    url.startsWith("/uploads") ? `http://localhost:5000${url}` : url;

  const formatDate = (item: AdminNewsItem) =>
    new Date(item.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getExcerpt = (item: AdminNewsItem) =>
    item.content.length > 120 ? item.content.slice(0, 120) + "..." : item.content;

  const getTag = () => "LIPUTAN TERBARU";

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="container px-6 lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
        <div className="w-full lg:px-6 xl:px-10">
          
          {/* --- NARRATIVE HEADER SECTION --- */}
          <div className="flex flex-col justify-between items-start mb-6 w-full max-w-2xl mx-auto md:mx-0 md:text-left text-center">
            <div className="w-full">
              <FadeIn delay={0.2}>
                <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight leading-[1.15] mb-6">
                  Berita <span className="text-blue-600">& Kegiatan</span>
                </h2>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-slate-900 text-lg max-w-lg leading-relaxed mx-auto md:mx-0">
                  {description}
                </p>
              </FadeIn>
            </div>
          </div>

          {/* --- BENTO GRID ANIMATION ENGINE --- */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-[260px]">
            
            {/* FEATURED CONTENT: Primary Sequence Trigger */}
            {featured && (
              <div 
                className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 h-full"
                onPointerOver={() => !isMainVisible && setIsMainVisible(true)}
              >
                <FadeIn
                  delay={0.1}
                  // Callback initiates the gated sequence for all subordinate cards
                  onViewportEnter={() => setIsMainVisible(true)}
                  className="h-full"
                >
                  <Link
                    href={`/news/${featured.slug}`}
                    className="block w-full h-full relative group overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <Image
                      src={getImageUrl(featured.image)}
                      alt={featured.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90" />

                    <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full flex flex-col justify-end">
                      <div className="mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-full">
                          {getTag()}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-blue-300">
                        {featured.title}
                      </h3>
                      <p className="text-white text-sm line-clamp-2 w-full md:w-5/6 mb-3">
                        {getExcerpt(featured)}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(featured)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 group-hover:text-white">
                          <span>Baca Lengkap</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              </div>
            )}

            {/* SECONDARY FEED: Gated Sequential Cards */}
            {others.slice(0, 3).map((news, i) => (
              <div key={news.id || i} className="col-span-1 row-span-1 h-full">
                {isMainVisible && (
                  <FadeIn
                    delay={0.3}
                    className="h-full"
                  >
                    <Link
                      href={`/news/${news.slug}`}
                      className="flex flex-col w-full h-full group overflow-hidden rounded-2xl bg-slate-50/50 border border-slate-200/80 hover:bg-white hover:shadow-lg transition-all duration-200"
                    >
                      <div className="relative h-32 w-full overflow-hidden shrink-0">
                        <Image
                          src={getImageUrl(news.image)}
                          alt={news.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-white/95 rounded-full uppercase">
                            {getTag()}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between bg-white">
                        <div>
                          <div className="flex items-center gap-2 text-slate-900 text-[11px] font-medium mb-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(news)}
                          </div>
                          <h3 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600">
                            {news.title}
                          </h3>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                          <span className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600">Baca Lengkap</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-blue-600" />
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                )}
              </div>
            ))}

            {/* ARCHIVE CTA: Final Sequence Conversion Card */}
            <div className="col-span-1 row-span-1 h-full">
              {isMainVisible && (
                <FadeIn delay={0.6} className="h-full">
                  <Link
                    href="/news"
                    className="relative w-full h-full group overflow-hidden rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all duration-200 flex flex-col justify-center items-center text-center px-4 shadow-md"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-blue-600 z-10 group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5 z-10">Arsip Lengkap</h3>
                    <p className="text-[12px] text-white leading-relaxed max-w-[170px] z-10">
                      Jelajahi seluruh rilis berita & dokumentasi.
                    </p>
                  </Link>
                </FadeIn>
              )}
            </div>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}