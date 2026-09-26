"use client";

import Image from "next/image";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import CountUp from "@/components/CountUp";
import { homeContent } from "@/content/home";
import { COMMISSARIAT_DATA } from "@/content/commissariatData";

/**
 * HeroSection Component
 * * Purpose: Establishes the primary visual identity and value proposition of the platform.
 * Architecture:
 * - Layout: Responsive grid system that adaptively centers narrative content on smaller viewports.
 * - Imagery: High-priority background assets with dynamic gradient masking for optimal text contrast.
 * - Data: Synchronized organizational metrics driven by dynamic counters.
 */
export function Hero() {
  const commissariatCount = Object.keys(COMMISSARIAT_DATA).length;

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] flex flex-col overflow-hidden bg-blue-950">
      
      {/* --- BACKGROUND INFRASTRUCTURE LAYER --- */}
      {/* Manages immersive visual assets with multi-stage gradient masks for legibility */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/raker.jpg"
          alt="GenBI Activities"
          fill
          priority
          className="object-cover object-center lg:object-center"
        />
        
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/images/raker.jpg"
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-label="Aktivitas GenBI Jawa Timur"
        >
          <source src="/assets/videos/hero.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-blue-900/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-blue-900/45 to-blue-800/30" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-950/60 to-transparent z-10" />
      </div>

      {/* --- CORE CONTENT ARCHITECTURE --- */}
      <div className="container relative z-20 px-6 lg:px-8 xl:px-12 mx-auto h-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full lg:px-6 xl:px-10">
          
          {/* --- PRIMARY BRANDING & CONVERSION COLUMN --- */}
          <div className="lg:col-span-12 xl:col-span-12 flex flex-col justify-center items-center text-center h-full pt-0 lg:pt-8 translate-y-8 lg:translate-y-30">
            
            {/* Main Narrative Header */}
            <SlideUp delay={0.2} className="w-full mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black md:font-bold lg:font-bold font-heading text-white leading-[1.15] tracking-tight">
                {homeContent.hero.heading.line1} <br />
                <span className="text-blue-600">
                  {homeContent.hero.heading.line2}
                </span>
              </h1>
            </SlideUp>

            {/* Supportive Contextual Description */}
            <FadeIn delay={0.4} className="w-full mb-6">
              <p className="text-[17px] md:text-lg text-white/95 leading-relaxed max-w-[340px] md:max-w-xl mx-auto font-medium">
                {homeContent.hero.description}{" "}
                <span className="text-white font-bold">
                  {homeContent.hero.highlights[0]}
                </span>{" "}
                {homeContent.hero.highlights[1] ? "dan " : ""}
                <span className="text-white font-bold">
                  {homeContent.hero.highlights[1]}
                </span>
              </p>
            </FadeIn>

            {/* --- ORGANIZATIONAL METRICS ENGINE --- */}
            {/* Orchestrates real-time data display with responsive alignment synchronization */}
            <FadeIn delay={0.8} className="w-full flex justify-center">
              <div className="grid w-full max-w-2xl grid-cols-2 divide-x divide-y divide-slate-200 rounded-[2rem] border border-white/70 bg-white px-3 py-3 shadow-xl shadow-blue-950/20 sm:grid-cols-4 sm:divide-y-0 sm:rounded-[6rem] sm:px-6 sm:py-5">
                {homeContent.stats.map((stat, i) => (
                  <div key={i} className="flex min-w-0 flex-col items-center gap-1 px-2 py-2 first:pl-0 last:pr-0 sm:px-4 sm:py-0 [&:nth-child(odd)]:border-r [&:nth-child(-n+2)]:border-b sm:border-0">
                      <div className="text-xl font-black text-blue-900 flex items-baseline lg:text-2xl">
                      {stat.isDynamic ? (
                        <CountUp to={commissariatCount} />
                      ) : "value" in stat && typeof stat.value === "string" ? (
                        stat.value
                      ) : (
                        <CountUp
                          to={stat.number || 0}
                          suffix={stat.suffix || ""}
                        />
                      )}
                    </div>
                    <div className="text-center text-[9px] font-bold uppercase tracking-[0.12em] text-blue-800 sm:tracking-widest lg:text-[10px]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* --- NARRATIVE SPACER COLUMN --- */}
          {/* Maintains visual balance and ensures focal point visibility on wide screens */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6" />
        </div>
      </div>
    </section>
  );
}