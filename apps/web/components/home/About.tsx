"use client";

import Image from "next/image";
import { FadeIn, SlideInLeft } from "@/components/MotionWrapper";
import { CommissariatItem } from "@/types/home.types";

/**
 * AboutSection Component
 * * Provides an overview of the organization's core values and institutional partnerships.
 * Features a dual-column layout:
 * - Media & Partners: Displays brand imagery and a grid of affiliated commissariats.
 * - Value Propositions: Explains program benefits through an icon-based vertical stack.
 */
export function About({
  commissariats,
}: {
  commissariats: CommissariatItem[];
}) {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      
      {/* --- CONTENT ARCHITECTURE CONTAINER --- */}
      <div className="container px-6 lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-20 items-center">
          
          {/* --- MEDIA & PARTNERSHIPS COLUMN --- */}
          <div className="relative flex flex-col gap-8">
            
            {/* 2x2 activity gallery */}
            <SlideInLeft delay={0.4}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["/assets/images/raker.jpg", "Kegiatan Raker GenBI"],
                  ["/assets/images/individu.jpg", "Aktivitas anggota GenBI"],
                  ["/assets/images/bnsp.JPG", "Pengembangan kapasitas anggota"],
                  ["/assets/images/background.jpg", "Kolaborasi GenBI Jawa Timur"],
                ].map(([src, alt]) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-lg shadow-blue-900/10 group"
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </SlideInLeft>

          </div>

          {/* --- PROGRAM NARRATIVE & VALUES COLUMN --- */}
          <div className="lg:pr-6 xl:pr-10">
            
            {/* Descriptive Headers */}
            <FadeIn delay={0.2}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
                Kenali Kami Lebih Dekat
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight leading-[1.15] mb-6">
                Bukan Sekadar Beasiswa, <br />
                <span className="text-blue-600">Tapi Transformasi Diri</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-slate-900 text-lg leading-relaxed max-w-xl mb-6">
                GenBI Jawa Timur hadir sebagai wadah bagi para penerima beasiswa Bank Indonesia untuk berkembang. Kami adalah komunitas yang menjembatani mahasiswa dari berbagai latar belakang kampus untuk bergerak bersama mengusung semangat Energi Untuk Negeri. Di sini, kami tidak hanya belajar, tetapi juga berkontribusi nyata sebagai garda terdepan dalam mengomunikasikan kebijakan Bank Indonesia kepada masyarakat luas.
              </p>
            </FadeIn>

          </div>
        </div>

        {/* Partner logos occupy their own full-width row below the main content. */}
        <FadeIn delay={0.5}>
          <div className="mt-14 overflow-hidden rounded-[2rem] bg-slate-50 p-8 border border-slate-200/80 shadow-md md:p-10">
            <p className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-[0.16em] mb-8 text-center">
              Menaungi mahasiswa berprestasi dari 9 Kampus Mitra Strategis di Jawa Timur
            </p>

            <div className="overflow-hidden">
              <div className="flex w-max animate-marquee-loop hover:[animation-play-state:paused]">
                {[...commissariats, ...commissariats].map((comm, index) => (
                  <div
                    key={`${comm.id}-${index}`}
                    className="group/logo relative flex w-32 shrink-0 items-center justify-center px-4 md:w-44 md:px-6"
                    title={comm.name}
                  >
                    <Image
                      src={comm.logo}
                      alt={comm.name}
                      width={140}
                      height={80}
                      unoptimized
                      className="h-16 md:h-20 w-auto object-contain opacity-75 transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:opacity-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
