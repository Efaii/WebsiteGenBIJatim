"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { FadeIn, BlurIn } from "@/components/MotionWrapper";
import Image from "next/image";
import { ArrowRight, Megaphone } from "lucide-react";
import { homeContent } from "@/content/home";

/**
 * CTA Component - Horizontal Mobile Optimized
 * Logic:
 * - Force horizontal alignment on all screens using 'flex-row'.
 * - Drastically reduce padding and font size on mobile to prevent height expansion.
 * - Ensures buttons maintain equal width with 'flex-1'.
 */
export function CTA() {
  return (
    <section className="relative w-full py-12 lg:py-24 bg-white">
      <div className="container px-4 md:px-6 lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
        <div className="w-full lg:px-6 xl:px-10">
          <FadeIn delay={0.1}>
            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl shadow-blue-900/20 flex flex-col lg:flex-row transform-gpu will-change-transform">
              {/* --- VISUAL ASSET COLUMN --- */}
              <div className="w-full lg:w-1/2 relative min-h-[220px] md:min-h-[300px] lg:min-h-full overflow-hidden bg-slate-100">
                {/* Image logic remains identical to previous version */}
                <div className="absolute inset-0">
                  <Image
                    src="/assets/images/bnsp.JPG"
                    alt="Keluarga GenBI Jatim"
                    fill
                    priority
                    className="object-cover object-center transform-gpu transition-transform duration-700"
                  />
                  <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-blue-600 via-blue-600/40 to-transparent hidden lg:block" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-600 via-blue-600/40 to-transparent lg:hidden" />
                </div>
              </div>

              {/* --- CONTENT & CALL-TO-ACTION COLUMN --- */}
              <div className="w-full lg:w-1/2 p-5 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center relative z-10">
                <FadeIn delay={0.2}>
                  <Badge
                    variant="glass-light"
                    className="gap-1.5 px-3 py-1 md:px-4 md:py-2 text-[10px] md:text-sm mb-4 md:mb-6 w-fit whitespace-nowrap shadow-sm"
                  >
                    <Megaphone className="w-3 h-3 md:w-4 md:h-4 text-white shrink-0" />
                    <span>Info Pendaftaran 2026 Segera Hadir</span>
                  </Badge>
                </FadeIn>

                <BlurIn delay={0.3}>
                  <h2 className="h2 text-white mb-3 lg:mb-6 whitespace-pre-line">
                    {homeContent.cta.title}
                  </h2>
                </BlurIn>

                <FadeIn delay={0.4}>
                  <p className="text-blue-50/80 text-[13px] md:text-base lg:text-lg mb-6 md:mb-8 leading-relaxed max-w-lg">
                    {homeContent.cta.description}
                  </p>
                </FadeIn>

                {/* --- FORCED HORIZONTAL NAVIGATION --- */}
                <FadeIn
                  delay={0.5}
                  className="flex flex-row items-center gap-2 md:gap-4 w-full"
                >
                  <Link
                    href={homeContent.cta.primary.href}
                    className="flex-1 min-w-0"
                  >
                    <Button
                      variant="white"
                      className="w-full text-[11px] sm:text-sm md:text-base font-bold h-11 md:h-14 px-2 sm:px-4 shadow-lg transition-[background-color,border-color,color,transform] duration-300"
                    >
                      <span className="truncate">
                        {homeContent.cta.primary.label}
                      </span>
                    </Button>
                  </Link>

                  <Link
                    href={homeContent.cta.secondary.href}
                    target="_blank"
                    className="flex-1 min-w-0"
                  >
                    <Button
                      variant="outline"
                      className="group w-full text-[11px] sm:text-sm md:text-base font-semibold h-11 md:h-14 px-2 sm:px-4 gap-1 sm:gap-2 border-white/40 text-white bg-transparent transition-[background-color,border-color,color,transform] duration-300"
                    >
                      <span className="truncate">
                        {homeContent.cta.secondary.label}
                      </span>
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4 shrink-0 transition-transform group-hover:translate-x-1" />
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
