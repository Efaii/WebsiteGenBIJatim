"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Home,
  Users2,
  MapPin,
  CalendarDays,
  Medal,
  Newspaper,
  FileText,
  PhoneCall,
  LayoutGrid
} from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * MobileMenu Component
 * * Purpose: Renders a high-performance, full-screen navigation overlay for mobile viewports.
 * Architecture:
 * - Animation Engine: Orchestrated via Framer Motion with spring-physics and stagger effects.
 * - State Management: Implements local accordion logic for collapsible sub-menu systems.
 * - Logic: Features a route-to-icon resolution system for enhanced visual navigation.
 */

type CommissariatLink = {
  name: string;
  slug: string;
};

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  commissariatLinks: CommissariatLink[];
};

export function MobileMenu({
  isOpen,
  onClose,
  pathname,
  commissariatLinks,
}: MobileMenuProps) {
  const [isCommissariatOpen, setIsCommissariatOpen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* --- INTERACTION BACKDROP LAYER --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm md:hidden"
          />

          {/* --- NAVIGATION PANEL ARCHITECTURE --- */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[130] w-[85vw] max-w-sm bg-slate-50 md:hidden flex flex-col shadow-2xl"
          >
            {/* --- BRANDING & HEADER SECTION --- */}
            <div className="relative p-6 px-6 overflow-hidden shrink-0 bg-white border-b border-slate-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 relative">
                    <Image src="/assets/logos/genbi.svg" alt="GenBI Logo" fill className="object-contain" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 tracking-tight">Menu Utama</span>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-900 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-[11px] font-semibold text-slate-900 uppercase tracking-widest leading-none">GenBI Jawa Timur</p>
            </div>

            {/* --- PRIMARY NAVIGATION ENGINE --- */}
            <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
              <div className="flex flex-col gap-3">
                {siteConfig.navItems.map((link, i) => {
                  const isActive = pathname === link.href;
                  const isCommissariatMenu = link.href === "/commissariat";

                  {/* --- DYNAMIC ICON RESOLVER --- */}
                  let IconComponent = <LayoutGrid size={18} />;
                  if (link.href === "/") IconComponent = <Home size={18} />;
                  else if (link.href === "/about") IconComponent = <Users2 size={18} />;
                  else if (link.href === "/commissariat") IconComponent = <MapPin size={18} />;
                  else if (link.href === "/calendar") IconComponent = <CalendarDays size={18} />;
                  else if (link.href === "/awardee") IconComponent = <Medal size={18} />;
                  else if (link.href === "/news") IconComponent = <Newspaper size={18} />;
                  else if (link.href === "/docs") IconComponent = <FileText size={18} />;
                  else if (link.href === "/contact") IconComponent = <PhoneCall size={18} />;

                  return (
                    <div key={link.href} className="flex flex-col">
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.05 }}
                      >
                        {isCommissariatMenu ? (
                          <button
                            onClick={() => setIsCommissariatOpen(!isCommissariatOpen)}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border",
                              isCommissariatOpen || isActive ? "bg-white border-blue-200 text-blue-700 shadow-md ring-1 ring-blue-50" : "bg-white border-slate-200/60 text-slate-900 shadow-sm"
                            )}
                          >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", isCommissariatOpen || isActive ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-blue-600")}>
                              {IconComponent}
                            </div>
                            <span className="font-semibold text-base flex-1 text-left">{link.label}</span>
                            <ChevronDown size={18} className={cn("transition-transform duration-300", isCommissariatOpen ? "rotate-180 text-blue-500" : "text-slate-900")} />
                          </button>
                        ) : (
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border",
                              isActive ? "bg-white border-blue-200 text-blue-700 shadow-md ring-1 ring-blue-50" : "bg-white border-slate-200/60 text-slate-900 shadow-sm"
                            )}
                          >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-50 text-blue-600")}>
                              {IconComponent}
                            </div>
                            <span className="font-semibold text-base flex-1">{link.label}</span>
                            <ArrowUpRight size={16} className={cn("transition-all duration-300", isActive ? "opacity-100 translate-x-0.5 -translate-y-0.5 text-blue-400" : "opacity-70 text-slate-900")} />
                          </Link>
                        )}
                      </motion.div>

                      {/* --- COLLAPSIBLE SUB-MENU ARCHITECTURE --- */}
                      {isCommissariatMenu && (
                        <AnimatePresence>
                          {isCommissariatOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-2 mt-3 px-2">
                                {commissariatLinks.map((item, index) => (
                                  <Link
                                    key={item.slug}
                                    href={`/commissariat/${item.slug}`}
                                    onClick={onClose}
                                    className={cn(
                                      "px-3 py-3 text-[11px] font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 shadow-sm active:bg-blue-50 active:border-blue-200 transition-all text-center flex items-center justify-center leading-tight",
                                      index === commissariatLinks.length - 1 && commissariatLinks.length % 2 !== 0 ? "col-span-2" : ""
                                    )}
                                  >
                                    {item.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- FOOTer CONVERSION SECTION --- */}
            <div className="p-6 bg-white border-t border-slate-100 mt-auto">
              <Link
                href="/contact"
                onClick={onClose}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl group transition-all active:scale-[0.98]"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Butuh Bantuan?</span>
                  <span className="text-[10px] text-slate-900 font-semibold">Layanan Aspirasi Pengurus</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}