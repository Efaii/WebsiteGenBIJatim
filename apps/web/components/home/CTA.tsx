"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { ArrowRight, Megaphone } from "lucide-react";
import { homeContent } from "@/content/home";

export function CTA() {
  return (
    <section className="relative w-full py-16 lg:py-24 bg-white">
      <div className="container px-6 lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
        <div className="w-full lg:px-6 xl:px-10">
          <FadeIn delay={0.1}>
            <div className="relative rounded-3xl lg:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl shadow-blue-900/20 flex flex-col lg:flex-row">
              
              {/* --- VISUAL ASSET COLUMN --- */}
              <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-full overflow-hidden bg-slate-100">
                <div className="w-full h-full absolute inset-0">
                  <Image
                    src="/assets/images/bnsp.JPG"
                    alt="Keluarga GenBI Jatim"
                    fill
                    className="object-cover object-center transition-transform duration-1000 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-blue-600 via-blue-600/40 to-transparent hidden lg:block" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-600 via-blue-600/40 to-transparent lg:hidden" />
                </div>
              </div>

              {/* --- CONTENT & CALL-TO-ACTION COLUMN --- */}
              <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:px-10 xl:px-16 flex flex-col justify-center relative z-10 bg-transparent">
                
                {/* Strategic Status Badge */}
                <FadeIn delay={0.2}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-6 shadow-sm backdrop-blur-sm w-fit">
                    <Megaphone className="w-4 h-4 text-white" />
                    <span>Nantikan Informasi Resmi Pendaftaran 2026</span>
                  </div>
                </FadeIn>

                {/* Primary Branding Narrative */}
                <FadeIn delay={0.3}>
                  {/* Tambahkan whitespace-pre-line untuk mendukung \n dari homeContent */}
                  <h2 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight mb-6 leading-[1.15] max-w-lg whitespace-pre-line">
                    {homeContent.cta.title}
                  </h2>
                </FadeIn>

                {/* Supportive Description Body */}
                <FadeIn delay={0.4}>
                  <p className="text-white text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                    {homeContent.cta.description}
                  </p>
                </FadeIn>

                {/* --- INTERACTIVE ACTION NAVIGATION --- */}
                <FadeIn
                  delay={0.5}
                  className="flex flex-row items-stretch gap-3 w-full max-w-lg"
                >
                  <Link href={homeContent.cta.primary.href} className="flex-1 min-w-0">
                    <Button className="w-full px-4 sm:px-6 lg:px-5 xl:px-8 py-6 bg-white text-slate-900 rounded-full font-bold text-[13px] sm:text-base hover:-translate-y-1 hover:bg-white transition-all duration-200 shadow-lg active:scale-95 cursor-pointer">
                      {homeContent.cta.primary.label}
                    </Button>
                  </Link>

                  <Link
                    href={homeContent.cta.secondary.href}
                    target="_blank"
                    className="flex-1 min-w-0"
                  >
                    <Button
                      variant="outline"
                      className="group w-full px-4 sm:px-6 lg:px-5 xl:px-8 py-6 bg-transparent text-white border-white/40 rounded-full font-medium text-[13px] sm:text-base hover:bg-white/10 hover:border-white transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <span className="truncate">{homeContent.cta.secondary.label}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
                    </Button>
                  </Link>
                </FadeIn>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}