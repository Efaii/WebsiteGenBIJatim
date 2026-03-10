"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Info,
  Users,
  BookOpen,
  CalendarDays,
  ArrowRight,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { NavbarProps, NavItemType, NavChildItem, CommissariatLinkType } from "@/types/nav.types";

/**
 * @component NavbarLinks
 * @description Desktop navigation component with integrated Mega Menu and Dropdown systems.
 */

/* --- ASSET_MAPPING_CONFIGURATION --- */
const iconMap: { [key: string]: React.ReactNode } = {
  "Tentang Kami": <Info className="w-5 h-5 text-blue-600" />,
  Awardee: <Users className="w-5 h-5 text-blue-600" />,
  Berita: <BookOpen className="w-5 h-5 text-blue-600" />,
  Kalender: <CalendarDays className="w-5 h-5 text-blue-600" />,
};

export function NavbarLinks({
  scrolled,
  pathname,
  navItems,
  commissariatLinks,
}: NavbarProps) {
  /* --- INTERACTION_STATE_MANAGEMENT --- */
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* --- EVENT_HANDLER_LOGIC --- */
  const handleMouseEnter = (label: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setHoveredMenu(label);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 120);
  };

  return (
    <div className="flex items-center gap-1.5 relative z-10">
      {navItems.map((link: NavItemType) => {
        const hasChildren = (link.children?.length ?? 0) > 0;
        const isMega = link.isMega;
        const isActive =
          pathname === link.href ||
          link.children?.some((child: NavChildItem) => pathname === child.href);

        const isHovered = hoveredMenu === link.label;

        return (
          <div
            key={link.label}
            className="relative"
            onMouseEnter={() => handleMouseEnter(link.label)}
            onMouseLeave={handleMouseLeave}
          >
            {/* --- NAVIGATION_TRIGGER_ELEMENT --- */}
            <div
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors duration-200 font-bold relative cursor-pointer",
                isActive
                  ? "text-blue-600"
                  : "text-slate-800 hover:text-blue-600",
                scrolled ? "text-sm" : "text-[15px]",
              )}
            >
              {isMega || hasChildren ? (
                <span className="flex items-center gap-2">
                  {link.label}
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-200 opacity-60",
                      isHovered && "rotate-180 opacity-100",
                    )}
                  />
                </span>
              ) : (
                <Link href={link.href}>{link.label}</Link>
              )}

              {/* --- SHARED_HOVER_PILL_INDICATOR --- */}
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 bg-slate-100 rounded-full -z-10 pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* --- MEGA_MENU_ARCHITECTURE --- */}
            <AnimatePresence>
              {isMega && isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] z-50 mt-3 will-change-transform transform-gpu"
                >
                  <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl p-7 overflow-hidden">
                    <div className="relative grid grid-cols-12 gap-7">
                      {/* --- LEFT_HIGHLIGHT_PANEL --- */}
                      <div className="col-span-4">
                        <div className="relative bg-blue-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between h-full overflow-hidden">
                          <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center mb-4">
                              <Globe size={20} />
                            </div>

                            <h4 className="text-lg font-bold leading-snug mb-2">
                              Jaringan GenBI Jawa Timur
                            </h4>

                            <p className="text-[11px] leading-relaxed mb-6">
                              Kolaborasi 9 komisariat aktif membangun generasi
                              unggul dan berdampak.
                            </p>
                          </div>

                          <Link
                            href="/commissariat"
                            className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-white text-blue-600 text-[11px] font-bold rounded-xl hover:bg-slate-100 transition-colors group"
                          >
                            Lihat Semua
                            <ArrowRight
                              size={14}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </Link>
                        </div>
                      </div>

                      {/* --- CAMPUS_GRID_NAVIGATION --- */}
                      <div className="col-span-8">
                        <div className="grid grid-cols-3 gap-4">
                          {commissariatLinks.map((c: CommissariatLinkType) => (
                            <Link
                              key={c.slug}
                              href={`/commissariat/${c.slug}`}
                              className="group relative flex flex-col items-center gap-3 p-3 rounded-3xl hover:bg-slate-100 border border-transparent transition-colors duration-300"
                            >
                              {/* CAMPUS_LOGO_WRAPPER */}
                               <div className="relative w-12 h-12 aspect-square bg-slate-100 rounded-full border border-slate-100 flex items-center justify-center p-2 transform-gpu transition-[transform,background-color] duration-300 group-hover:bg-white group-hover:scale-[1.1]">
                                <Image
                                  src={c.logo_univ}
                                  alt={c.name}
                                  width={30}
                                  height={30}
                                  sizes="48px"
                                  priority
                                  decoding="async"
                                  className="object-contain pointer-events-none"
                                />
                              </div>

                              {/* CAMPUS_TEXT_LABEL */}
                               <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors duration-300 uppercase tracking-tight text-center line-clamp-1">
                                {c.name
                                  .replace("GenBI ", "")
                                  .replace("Komisariat ", "")}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- REGULAR_DROPDOWN_ARCHITECTURE --- */}
            <AnimatePresence>
              {hasChildren && !isMega && isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute top-full left-0 w-[280px] z-50 mt-3 will-change-transform"
                >
                  <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl p-2.5 flex flex-col gap-1">
                    {link.children?.map((child: NavChildItem) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="group flex items-center gap-4 p-3.5 border border-transparent rounded-full hover:bg-slate-100 hover:border-blue-200 transition-colors"
                      >
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-100 transition-[background-color,box-shadow,border-color]">
                          {iconMap[child.label] || (
                            <Info size={18} className="text-blue-600" />
                          )}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600">
                            {child.label}
                          </span>
                          <span className="text-[10px] text-slate-500 line-clamp-1 font-medium italic">
                            Informasi {child.label}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
