"use client";

import { motion } from "framer-motion";
import { LucideIcon, Network, Users, BarChart3, Target, Zap } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { aboutContent } from "@/content/about";
import { SectionHeader } from "@/components/SectionHeader";
import { Mission } from "@repo/types";

const ICON_MAP: Record<string, LucideIcon> = { Network, Users, BarChart3, Target, Zap };

export function VisionMission({ vision, missions }: { vision?: string | null; missions?: Mission[] }) {
  // Prioritize props (database) over local content
  const activeVision = vision || aboutContent.visionMission.vision;
  const activeMissions = missions && missions.length > 0 ? missions : aboutContent.visionMission.missions;
  
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-slate-50 transform-gpu">
      <div className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10">
        <div className="w-full">
        
        {/* --- CENTER: VISION FOCUS (Synchronized Hierarchy) --- */}
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-6 lg:mb-12">
          <SlideUp once amount={0.1} delay={0.3}>
            <SectionHeader
              title={
                <>
                  Visi & Misi <span className="text-blue-600">Organisasi</span>
                </>
              }
              description="Landasan filosofis dan langkah strategis GenBI Jawa Timur dalam membangun sinergi komunitas serta mewujudkan bakti nyata yang berkelanjutan bagi masyarakat"
              align="center"
              variant="light"
              className="mb-6"
            />
          </SlideUp>
          
          <FadeIn once delay={0.3}>
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative p-6 md:p-10 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-blue-200 transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] transform-gpu overflow-hidden cursor-default"
            >
              {/* Vision Statement: Using system-aligned hierarchy */}
              <h3 className="h3 font-semibold text-slate-900 leading-relaxed italic relative z-10 transition-colors duration-500 group-hover:text-blue-900">
                "{activeVision}"
              </h3>
              
              <div className="mt-8 flex items-center justify-center gap-4 relative z-10">
                <div className="h-px w-8 bg-blue-200" />
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-blue-600">
                  Our Vision
                </span>
                <div className="h-px w-8 bg-blue-200" />
              </div>

              {/* Background Accent on Hover */}
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-50/30 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />
            </motion.div>
          </FadeIn>
        </div>

        {/* --- BOTTOM: MISSION TRAY (Strategic Roadmap Layout) --- */}
        <div className="w-full lg:px-6 xl:px-10">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              {activeMissions.map((m, idx) => (
                <FadeIn 
                  key={idx} 
                  once 
                  delay={0.4 + idx * 0.1}
                  className="w-full flex"
                >
                  <StrategicMissionCard 
                    title={m.title} 
                    desc={(m as any).desc} 
                    index={idx + 1}
                    icon={ICON_MAP[m.icon as keyof typeof ICON_MAP] || Zap}
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

function StrategicMissionCard({ title, desc, index, icon: Icon }: { title: string; desc: string; index: number; icon: LucideIcon }) {
  return (
    <motion.div 
      whileHover={{ x: 8 }}
      className="group relative w-full p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 shadow-lg shadow-slate-200/40 hover:shadow-blue-900/5 transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] transform-gpu overflow-hidden"
    >
      <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
        {/* Left: Icon & Index Wrapper (Compact) */}
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-blue-600 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 transform-gpu shadow-inner">
            <Icon className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {index}
          </div>
        </div>
        
        {/* Right: Text Content (Compact) */}
        <div className="flex-1">
          <span className="text-[9px] font-semibold text-blue-600/60 uppercase tracking-[0.2em] block mb-2">Our Mission</span>
          <h4 className="mb-2 text-lg md:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-400 leading-tight">
            {title}
          </h4>
          <p className="text-slate-600 text-sm lg:text-base leading-relaxed">
            {desc}
          </p>
        </div>
      </div>

      {/* Decorative Path Line Indicator */}
      <div className="absolute top-1/2 right-0 w-1 h-8 bg-blue-100 group-hover:bg-blue-600 transition-colors duration-700 rounded-l-full translate-y-[-50%]" />
      
      {/* Background Subtle Gradient */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl group-hover:bg-blue-100/50 transition-colors duration-700" />
    </motion.div>
  );
}