"use client";

import Image from "next/image";
import { Users, School, Globe } from "lucide-react";
import { FadeIn, SlideUp, BlurIn } from "@/components/MotionWrapper";
import { aboutContent } from "@/content/about";


interface AboutHeroProps {
  name?: string | null;
  description?: string | null;
}

export function AboutHero({ name, description }: AboutHeroProps) {
  // Prioritize the database description if available, then local content
  const activeDescription = description || aboutContent.hero.description;
  const activeName = name || "GenBI Jawa Timur";

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-white pt-24 pb-12 lg:pt-32">
      {/* Background architectural elements - Synchronized with Homepage */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full bg-blue-50/40 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full bg-blue-50/40 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A08_1px,transparent_1px),linear-gradient(to_bottom,#0F172A08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_40%,#000_30%,transparent_100%)]" />
      </div>

      <div className="container relative z-20 px-6 lg:px-8 xl:px-12 mx-auto max-w-7xl flex-1 flex flex-col justify-center py-20">
        <div className="w-full lg:px-6 xl:px-10">
          <div className="text-center flex flex-col items-center gap-6">
            
            {/* --- TOP: BRAND NARRATIVE (Centered) --- */}
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex flex-col gap-6">
                <BlurIn delay={0.3} initial={{ opacity: 0, y: 60 }}>
                  <h1 className="h1">
                    Mengenal <br />
                    <span className="text-blue-600">{activeName}</span>
                  </h1>
                </BlurIn>

                <FadeIn delay={0.5} initial={{ opacity: 0, y: 80 }}>
                  <div className="max-w-3xl mx-auto">
                    <p className="text-[17px] md:text-lg text-slate-600 leading-relaxed max-w-[340px] md:max-w-xl mx-auto lg:mx-0 font-medium">
                      {activeDescription}
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>

            {/* --- BOTTOM: HERO IMAGE (Landscape) - Synchronized Borders --- */}
            <div className="relative group w-full max-w-6xl mx-auto mt-6">
              <SlideUp delay={0.3} amount={0.1} initial={{ opacity: 0, y: 100 }}>
                <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 lg:border-8 border-white ring-1 ring-slate-900/5 group transform-gpu transition-all duration-[800ms] ease-[cubic-bezier(0.33,1,0.68,1)]">
                  <Image
                    src="/assets/images/raker.jpg"
                    alt="GenBI Jatim 2025/2026"
                    fill
                    priority
                    className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-105"
                  />
                  {/* Overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-white/20 to-transparent opacity-60 hover:opacity-0 transition-opacity duration-500" />
                </div>
              </SlideUp>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
