"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Newspaper,
  ArrowRight,
  LucideIcon,
  Building2,
  FileStack,
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, BlurIn } from "@/components/MotionWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { homeContent } from "@/content/home";

/**
 * ICON_MAP
 * * Purpose: Centralized registry for dynamic icon rendering.
 * Maps string identifiers from the content layer to specific Lucide components
 * to maintain clean JSX and decouple data from visual components.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Newspaper,
};

/**
 * PortalGrid Component
 * * Purpose: Provides a responsive navigation entry point for various digital platforms.
 * Architecture:
 * - Layout: Utilizes a 2x2 grid for mobile and a 4-column row for desktop viewports.
 * - Interaction: Features card-based hover effects with dynamic background decorations.
 * - Animation: Implements staggered entry animations for optimized perceived performance.
 */
export function Portal() {
  const { title, description, items } = homeContent.portalGrid;

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* --- SECTION CONTENT WRAPPER --- */}
      <div className="container px-6 lg:px-8 xl:px-12 relative z-10 max-w-7xl">
        <div className="w-full lg:px-6 xl:px-10">
          {/* --- HEADER SECTION --- */}
          <SectionHeader
            title={
              <>
                Akses <span className="text-blue-600">Platform Digital</span>
              </>
            }
            description={description}
            align="left"
            variant="light"
            className="mb-8"
          />

          {/* --- INTERACTIVE GRID CONTAINER --- */}
          {/* Implements responsive column logic and standardized row heights */}
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {items.map((item, idx) => {
              const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
              const iconName = item.iconName as string;

              return (
                <FadeIn
                  key={idx}
                  delay={0.3 + idx * 0.15}
                  className="min-h-[220px] md:min-h-[280px] lg:h-full"
                >
                  <motion.div
                    whileHover={{ y: -2, transition: { ease: "circOut" } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="h-full"
                  >
                    <Link
                      href={item.link}
                      className="group relative flex flex-col justify-between h-full bg-slate-50 rounded-[2rem] p-6 md:p-8 border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-[background-color,border-color,box-shadow] duration-200 overflow-hidden"
                    >
                      {/* --- CARD HEADER: NAVIGATION & ICONOGRAPHY --- */}
                      <div className="relative z-10 flex justify-between items-start mb-4 md:mb-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-white border border-slate-200 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 relative overflow-hidden">
                          <Icon
                            className="w-6 h-6 md:w-7 md:h-7 relative z-10"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-slate-500 transition-[transform,color] duration-300 transform-gpu translate-x-[1px] -rotate-45 group-hover:rotate-0 group-hover:text-blue-600" />
                        </div>
                      </div>

                      {/* --- VISUAL DECORATIONS LAYER --- */}
                      {/* Absolute-positioned elements that react to parent hover states */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {iconName === "LayoutDashboard" && (
                          <div className="absolute -right-6 -bottom-6 opacity-[0.1] group-hover:opacity-20 group-hover:-translate-y-0.5 transition-[opacity,transform] duration-500">
                            <Building2
                              className="w-24 h-24 md:w-32 md:h-32 text-blue-600"
                              strokeWidth={0.5}
                            />
                          </div>
                        )}

                        {iconName === "FileText" && (
                          <div className="absolute -right-6 -bottom-6 opacity-[0.1] group-hover:opacity-20 group-hover:-translate-y-0.5 transition-[opacity,transform] duration-500">
                            <FileStack
                              className="w-24 h-24 md:w-32 md:h-32 text-blue-600"
                              strokeWidth={0.5}
                            />
                          </div>
                        )}

                        {iconName === "GraduationCap" && (
                          <div className="absolute -right-6 -bottom-6 opacity-[0.1] group-hover:opacity-20 group-hover:-translate-y-0.5 transition-[opacity,transform] duration-500">
                            <GraduationCap
                              className="w-24 h-24 md:w-32 md:h-32 text-blue-600"
                              strokeWidth={0.5}
                            />
                          </div>
                        )}

                        {iconName === "Newspaper" && (
                          <div className="absolute -right-6 -bottom-6 opacity-[0.1] group-hover:opacity-20 group-hover:-translate-y-0.5 transition-[opacity,transform] duration-500">
                            <Newspaper
                              className="w-24 h-24 md:w-32 md:h-32 text-blue-600"
                              strokeWidth={0.5}
                            />
                          </div>
                        )}
                      </div>

                      {/* --- CARD NARRATIVE LAYER --- */}
                      <div className="relative z-10">
                        <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-1 md:mb-2 group-hover:text-blue-700 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                </FadeIn>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
