"use client";

import Image from "next/image";
import { FadeIn, SlideInLeft, SlideUp } from "@/components/MotionWrapper";
import { Briefcase, Globe, TrendingUp, GraduationCap } from "lucide-react";
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
    <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      
      {/* --- CONTENT ARCHITECTURE CONTAINER --- */}
      <div className="container px-6 lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-14 items-start">
          
          {/* --- MEDIA & PARTNERSHIPS COLUMN --- */}
          <div className="relative flex flex-col gap-6 md:gap-8 lg:pl-6 xl:pl-10">
            
            {/* Featured Brand Imagery */}
            <SlideInLeft delay={0.4}>
              <div className="aspect-video rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/5 border-4 lg:border-8 border-white group relative cursor-pointer ring-1 ring-slate-900/5">
                <Image
                  src="/assets/images/background.jpg"
                  alt="GenBI Activity"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                />
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply group-hover:bg-transparent transition-colors duration-[1.5s]" />
              </div>
            </SlideInLeft>

            {/* Affiliated Universities/Commissariats Grid */}
            <FadeIn delay={0.5}>
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-200">
                <p className="text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 text-center">
                  Menaungi mahasiswa berprestasi dari 9 Kampus Mitra Strategis di Jawa Timur
                </p>
                
                {/* Responsive Grid for Partner Logos */}
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
                  {commissariats.map((comm) => (
                    <div
                      key={comm.id}
                      className="group/logo relative"
                      title={comm.name}
                    >
                      <Image
                        src={comm.logo}
                        alt={comm.name}
                        width={100}
                        height={50}
                        unoptimized
                        className="h-10 md:h-16 w-auto object-contain opacity-70 md:opacity-80 transition-all duration-300 group-hover/logo:opacity-100 group-hover/logo:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* --- PROGRAM NARRATIVE & VALUES COLUMN --- */}
          <div className="lg:pr-6 xl:pr-10">
            
            {/* Descriptive Headers */}
            <FadeIn delay={0.2}>
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

            {/* Value stack: Key program advantages with staggered entrance */}
            <div className="flex flex-col gap-5 md:gap-8">
              <FadeIn delay={0.6}>
                <ValueItem
                  icon={Briefcase}
                  title="Mentorship Eksklusif"
                  desc="Kesempatan belajar langsung dari para ahli dan praktisi ekonomi Bank Indonesia."
                />
              </FadeIn>
              <FadeIn delay={0.7}>
                <ValueItem
                  icon={Globe}
                  title="Jejaring Lintas Kampus"
                  desc="Ruang kolaborasi bagi mahasiswa dari berbagai universitas mitra untuk bertukar ide dan inspirasi."
                />
              </FadeIn>
              <FadeIn delay={0.8}>
                <ValueItem
                  icon={TrendingUp}
                  title="Pengembangan Diri"
                  desc="Program pengembangan soft-skill dan kepemimpinan untuk mencetak agen perubahan yang visioner."
                />
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * ValueItem Sub-component
 * * Logic:
 * - Alignment: Uses 'items-center' to ensure the icon stays vertically centered relative to text block height.
 * - Performance: Optimized with 'transform-gpu' and 'will-change' for smooth hover transitions.
 */
function ValueItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50/50 hover:border-blue-200 hover:shadow-lg transition-all duration-200 group cursor-default transform-gpu will-change-transform">
      {/* Icon visual identifier */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-blue-600 bg-white shadow-sm border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors duration-300 shrink-0">
        <Icon className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
      </div>

      {/* Narrative content block */}
      <div className="flex flex-col justify-center">
        <h3 className="text-base lg:text-lg font-bold text-slate-900 mb-0.5 lg:mb-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-900 text-sm leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}