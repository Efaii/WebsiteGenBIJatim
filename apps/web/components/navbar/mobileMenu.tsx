"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ChevronDown,
  ArrowUpRight,
  LayoutGrid,
  Home,
  Newspaper,
  ChevronRight,
  LayoutDashboard,
  UserCircle2,
  GraduationCap,
  MessageSquare,
  Info,
  Users,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavbarProps, NavItemType, NavChildItem, CommissariatLinkType } from "@/types/nav.types";

/* --- CONFIGURATION_AND_ASSETS --- */
const subIconMap: { [key: string]: React.ReactNode } = {
  "Tentang Kami": <Info size={16} />,
  Awardee: <Users size={16} />,
  Berita: <BookOpen size={16} />,
  Kalender: <CalendarDays size={16} />,
};

export function MobileMenu({
  isOpen,
  onClose,
  pathname,
  commissariatLinks,
  navItems,
}: NavbarProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleAccordion = (label: string) => {
    setActiveAccordion(activeAccordion === label ? null : label);
  };

  return (
    <>
      {/* --- INTERACTION_BACKDROP --- */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[120] bg-slate-900/40 lg:hidden transform-gpu transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* --- NAVIGATION_PANEL_ARCHITECTURE --- */}
      <div
        style={{ willChange: "transform" }}
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[130] w-[85vw] max-w-sm bg-white lg:hidden flex flex-col shadow-2xl rounded-l-[2rem] transform-gpu transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
            {/* --- BRANDING_HEADER_SECTION --- */}
            <div className="relative p-6 flex items-center justify-between border-b border-slate-100 overflow-hidden shrink-0 bg-white">

              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 relative p-2">
                  <Image
                    src="/assets/logos/genbi.svg"
                    alt="GenBI Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-md font-bold text-slate-900 leading-none uppercase tracking-tight">
                    Navigasi Platform
                  </span>
                  <p className="text-xs font-semibold text-slate-900 uppercase tracking-widest mt-1">
                    GenBI Jatim
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-900 active:scale-90 transition-transform"
              >
                <X size={18} />
              </button>
            </div>

            {/* --- PRIMARY_NAVIGATION_ENGINE --- */}
            <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar bg-slate-100">
              <div className="flex flex-col gap-3">
                {navItems.map((item: NavItemType, i: number) => {
                  if (item.label === "Hubungi Kami") return null;

                  const hasChildren =
                    (item.children && item.children.length > 0) || item.isMega;
                  const isExpanded = activeAccordion === item.label;
                  const isActive =
                    pathname === item.href ||
                    item.children?.some((c: NavChildItem) => pathname === c.href);

                  let Icon = <LayoutGrid size={18} />;
                  if (item.label === "Beranda") Icon = <Home size={18} />;
                  else if (item.label === "Profil")
                    Icon = <UserCircle2 size={18} />;
                  else if (item.label === "Komisariat")
                    Icon = <GraduationCap size={18} />;
                  else if (item.label === "Media")
                    Icon = <Newspaper size={18} />;

                  return (
                    <div key={item.label} className="flex flex-col transform-gpu">
                      {/* ITEM_TRIGGER_LOGIC */}
                      {hasChildren ? (
                        <button
                          onClick={() => toggleAccordion(item.label)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-200 border",
                            isExpanded || isActive
                              ? "bg-white border-blue-200 text-blue-700 shadow-md ring-1 ring-blue-50"
                              : "bg-white border-slate-200/60 text-slate-900 shadow-sm",
                          )}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                              isExpanded || isActive
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-slate-100 text-blue-600",
                            )}
                          >
                            {Icon}
                          </div>
                          <span className="font-semibold text-base flex-1 text-left">
                            {item.label}
                          </span>
                          <ChevronDown
                            size={18}
                            className={cn(
                              "transition-transform duration-300",
                              isExpanded
                                ? "rotate-180 text-blue-500"
                                : "text-slate-900",
                            )}
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-200 border",
                            isActive
                              ? "bg-white border-blue-200 text-blue-700 shadow-md ring-1 ring-blue-50"
                              : "bg-white border-slate-200/60 text-slate-900 shadow-sm",
                          )}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                              isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-100 text-blue-600",
                            )}
                          >
                            {Icon}
                          </div>
                          <span className="font-semibold text-base flex-1 text-left">
                            {item.label}
                          </span>
                          <ArrowUpRight
                            size={16}
                            className={cn(
                              "transition-all duration-300",
                              isActive
                                ? "opacity-100 text-blue-400"
                                : "opacity-40",
                            )}
                          />
                        </Link>
                      )}

                      {/* COLLAPSIBLE_SUBMENU_SYSTEM */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden transform-gpu"
                          >
                            <div className="flex flex-col gap-2 mt-2 px-2 pb-2">
                              {item.isMega ? (
                                <>
                                  <Link
                                    href="/commissariat"
                                    onClick={onClose}
                                    className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-full text-blue-600"
                                  >
                                    <LayoutDashboard size={18} />
                                    <span className="text-sm font-bold">
                                      Buka Dashboard Komisariat
                                    </span>
                                  </Link>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    {commissariatLinks.map((c: CommissariatLinkType) => (
                                      <Link
                                        key={c.slug}
                                        href={`/commissariat/${c.slug}`}
                                        onClick={onClose}
                                        className="px-3 py-3 text-[11px] font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 shadow-sm active:bg-blue-50 active:border-blue-200 transition-all text-center flex items-center justify-center leading-tight"
                                      >
                                        {c.name
                                          .replace("GenBI ", "")
                                          .replace("Komisariat ", "")}
                                      </Link>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                item.children?.map((child: NavChildItem) => (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 active:bg-blue-50 transition-all"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-blue-600 shrink-0">
                                      {subIconMap[child.label] || (
                                        <ChevronRight size={14} />
                                      )}
                                    </div>
                                    <span className="flex-1 text-left">
                                      {child.label}
                                    </span>
                                    <ChevronRight
                                      size={14}
                                      className="text-slate-900"
                                    />
                                  </Link>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- FOOTER_ACTION_SECTION --- */}
            <div className="p-6 bg-white border-t border-slate-100 mt-auto flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              {/* EXTERNAL_HELP_LINK */}
              <Link
                href="/contact"
                onClick={onClose}
                className="w-full flex items-center justify-between p-4 bg-slate-100 border border-slate-200 rounded-[2rem] group transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-blue-600 flex items-center justify-center shadow-sm">
                    <MessageSquare size={18} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900">
                      Hubungi Kami
                    </span>
                    <span className="text-[10px] text-slate-900 font-medium">
                      Layanan Aspirasi & Bantuan
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-900 group-hover:text-blue-600 transition-colors"
                />
              </Link>

              {/* INTERNAL_PORTAL_ACCESS */}
              <Link
                href="/docs"
                onClick={onClose}
                className="w-full flex items-center justify-between p-4 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1.5">
                    Portal Internal
                  </span>
                  <span className="text-sm font-bold tracking-tight">
                    Portal Awardee Jatim
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center">
                  <ArrowUpRight size={18} />
                </div>
              </Link>
            </div>
          </div>
    </>
  );
}