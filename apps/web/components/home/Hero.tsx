"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
    <section className="relative w-full h-[100svh] min-h-[600px] flex flex-col overflow-hidden bg-slate-50">
      
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
        
        {/* Environmental Overlays: Contextual lighting and depth masks */}
        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-transparent hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/60 to-transparent lg:hidden" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent z-10" />
      </div>

      {/* --- CORE CONTENT ARCHITECTURE --- */}
      <div className="container relative z-20 px-6 lg:px-8 xl:px-12 mx-auto h-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full lg:px-6 xl:px-10">
          
          {/* --- PRIMARY BRANDING & CONVERSION COLUMN --- */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left h-full pt-20 lg:pt-8">
            
            {/* Main Narrative Header */}
            <SlideUp delay={0.2} className="w-full mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black md:font-bold lg:font-bold font-heading text-slate-900 leading-[1.15] tracking-tight">
                {homeContent.hero.heading.line1} <br />
                <span className="text-blue-600">
                  {homeContent.hero.heading.line2}
                </span>
              </h1>
            </SlideUp>

            {/* Supportive Contextual Description */}
            <FadeIn delay={0.4} className="w-full mb-6">
              <p className="text-[17px] md:text-lg text-slate-900 leading-relaxed max-w-[340px] md:max-w-xl mx-auto lg:mx-0 font-medium">
                {homeContent.hero.description}{" "}
                <span className="text-slate-900 font-bold">
                  {homeContent.hero.highlights[0]}
                </span>{" "}
                {homeContent.hero.highlights[1] ? "dan " : ""}
                <span className="text-slate-900 font-bold">
                  {homeContent.hero.highlights[1]}
                </span>
              </p>
            </FadeIn>

            {/* Navigation Action Controls */}
            <FadeIn delay={0.6} className="w-full mb-6">
              <div className="flex flex-row items-center justify-center lg:justify-start gap-3 w-full max-w-sm md:max-w-md mx-auto lg:mx-0">
                <Link
                  href={homeContent.hero.cta.primary.href}
                  className="flex-1 lg:flex-none"
                >
                  <Button className="w-full lg:w-auto rounded-full px-4 lg:px-8 py-6 text-[13px] lg:text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/20 hover:shadow-lg transition-all duration-200 cursor-pointer">
                    {homeContent.hero.cta.primary.label}
                  </Button>
                </Link>

                <Link
                  href={homeContent.hero.cta.secondary.href}
                  className="flex-1 lg:flex-none"
                >
                  <Button
                    variant="outline"
                    className="w-full lg:w-auto rounded-full px-4 lg:px-8 py-6 text-[13px] lg:text-base font-bold bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 hover:text-blue-700 transition-all duration-200 cursor-pointer"
                  >
                    {homeContent.hero.cta.secondary.label}
                  </Button>
                </Link>
              </div>
            </FadeIn>

            {/* --- ORGANIZATIONAL METRICS ENGINE --- */}
            {/* Orchestrates real-time data display with responsive alignment synchronization */}
            <FadeIn delay={0.8} className="w-full flex justify-center lg:justify-start">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 lg:gap-10 border-t border-slate-900/50 lg:border-slate-300 pt-6 w-fit lg:w-full max-w-lg">
                {homeContent.stats.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center lg:items-start gap-0.5 relative">
                    <div className="text-xl lg:text-2xl font-black text-slate-900 flex items-baseline">
                      {stat.isDynamic ? (
                        <CountUp to={commissariatCount} />
                      ) : stat.value ? (
                        stat.value
                      ) : (
                        <CountUp
                          to={stat.number || 0}
                          suffix={stat.suffix || ""}
                        />
                      )}
                    </div>
                    <div className="text-[9px] lg:text-[10px] font-bold text-slate-900 uppercase tracking-widest">
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