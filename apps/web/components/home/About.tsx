"use client";

import Image from "next/image";
import { FadeIn, SlideInLeft, BlurIn } from "@/components/MotionWrapper";

/**
 * @component About
 * @description Provides an overview of the organization's core narrative and mission.
 */
export function About() {
  return (
    <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden transform-gpu">
      {/* --- SECTION_CONTAINER --- */}
      <div className="container px-6 lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
        <div className="w-full lg:px-6 xl:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* --- MEDIA_COLUMN --- */}
            <div className="relative flex flex-col gap-6 lg:pr-6 xl:pr-10 will-change-transform">
              {/* FEATURED_IMAGERY_BLOCK */}
              <SlideInLeft delay={0.2}>
                <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 lg:border-8 border-white group cursor-pointer ring-1 ring-slate-900/5 transform-gpu transition-[transform,shadow,border-color] duration-700 ease-out">
                  <Image
                    src="/assets/images/background.jpg"
                    alt="GenBI Activity"
                    fill
                    priority={true}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-[1.5s]" />
                </div>
              </SlideInLeft>
            </div>

            {/* --- NARRATIVE_COLUMN --- */}
            <div className="lg:pl-6 xl:pl-10 will-change-transform">
              {/* HEADER_CONTENT_BLOCK */}
              <BlurIn delay={0.3}>
                <h2 className="h2 mb-6 transform-gpu">
                  Bukan Sekadar Beasiswa, <br />
                  <span className="text-blue-600">Tapi Transformasi Diri</span>
                </h2>
              </BlurIn>

              <FadeIn delay={0.4}>
                <p className="text-slate-600 text-lg leading-relaxed transform-gpu">
                  GenBI Jawa Timur hadir sebagai wadah bagi para penerima beasiswa Bank Indonesia untuk berkembang. Kami adalah komunitas yang menjembatani mahasiswa dari berbagai latar belakang kampus untuk bergerak bersama mengusung semangat Energi Untuk Negeri. Di sini, kami tidak hanya belajar, tetapi juga berkontribusi nyata sebagai garda terdepan dalam mengomunikasikan kebijakan Bank Indonesia kepada masyarakat luas.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
