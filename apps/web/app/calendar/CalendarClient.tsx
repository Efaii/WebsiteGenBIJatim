"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

import { PageBackground } from "@/components/PageBackground";
import { CalendarGroup } from "@/app/types";

const FILTER_OPTIONS = [
  "Semua",
  "Wilayah (Jatim)",
  "UNAIR",
  "ITS",
  "UNESA",
  "UTM",
  "UINSA",
  "UPNVJT",
  "PENS",
  "UIN Madura",
  "UNUGIRI",
];

const YEARS = ["2026", "2025", "2024"];

type TabType = "upcoming" | "history";

interface CalendarClientProps {
  initialEvents: any[];
}

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [filter, setFilter] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filteredEvents = initialEvents
    .map((group) => {
      const filteredItems = group.items.filter((item: any) => {
        const itemDate = new Date(item.dateIso.split("T")[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isItemPast = itemDate < today;

        if (activeTab === "upcoming" && isItemPast) return false;
        if (activeTab === "history" && !isItemPast) return false;

        if (activeTab === "history") {
          const itemYear = itemDate.getFullYear().toString();
          if (itemYear !== selectedYear) return false;
        }

        if (filter !== "Semua" && item.commissariat !== filter) return false;

        return true;
      });

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-200 selection:text-blue-900 relative overflow-clip">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-32 flex items-center justify-center overflow-hidden bg-slate-50 border-b border-slate-200">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-100/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none mix-blend-multiply"></div>

          <div className="container relative mx-auto px-6 text-center z-10 pt-10">
            <SlideUp once={false}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-slate-900">
                Kalender <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Kegiatan GenBI
                </span>
              </h1>
            </SlideUp>
            <FadeIn once={false} delay={0.2}>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Pusat informasi agenda GenBI se-Jawa Timur. Pantau kegiatan mendatang atau jelajahi arsip kegiatan yang telah terlaksana.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Unified Sticky Control Bar */}
        <div className="sticky top-20 z-40 px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* View Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
              {[
                { id: "upcoming", label: "Agenda Mendatang" },
                { id: "history", label: "Arsip Kegiatan" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 relative z-10 whitespace-nowrap flex-1 md:flex-none text-center",
                    activeTab === tab.id
                      ? "text-blue-700"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabCalendar"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
              
              {/* Year Filter (Only visible in History Tab) */}
              <AnimatePresence>
                {activeTab === "history" && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, scale: 0.9 }}
                    animate={{ opacity: 1, width: "auto", scale: 1 }}
                    exit={{ opacity: 0, width: 0, scale: 0.9 }}
                    className="relative shrink-0"
                  >
                    <button
                      onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                      className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 py-2.5 px-3 rounded-xl transition-colors min-w-[120px] justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-slate-700" />
                        <span className="text-sm font-medium text-slate-700">
                          {selectedYear}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${isYearDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isYearDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsYearDropdownOpen(false)}
                        />
                        <div className="absolute top-full right-0 mt-2 w-full min-w-[120px] bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50 p-2 flex flex-col gap-1">
                          {YEARS.map((year) => (
                            <button
                              key={year}
                              onClick={() => {
                                setSelectedYear(year);
                                setIsYearDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm font-medium transition-colors rounded-xl",
                                selectedYear === year
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-slate-700 hover:bg-slate-50",
                              )}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Commissariat Dropdown (Mobile-responsive styling) */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 py-2.5 px-3 rounded-xl transition-colors shadow-sm"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">
                    {filter === "Semua" ? "Filter Komisariat" : filter}
                  </span>
                  {filter !== "Semua" && (
                    <span className="lg:hidden w-2 h-2 rounded-full bg-blue-600 ml-1"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isFilterDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsFilterDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 scrollbar-thin scrollbar-thumb-slate-200"
                      >
                        <div className="grid gap-1">
                          {FILTER_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                setFilter(opt);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between",
                                filter === opt
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-slate-700 hover:bg-slate-50"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

        {/* Calendar Feed */}
        <section className="py-12 relative z-10 min-h-[50vh] bg-white">
          <div className="container mx-auto px-6 max-w-5xl">
            {filteredEvents.length > 0 ? (
              <div className="space-y-12">
                {filteredEvents.map((monthGroup, idx) => (
                  <FadeIn key={idx} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-bold text-slate-900 bg-white border border-slate-200 px-5 py-2 rounded-full shadow-sm sticky top-36 z-20 inline-block">
                        {monthGroup.month}
                      </h2>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div className="grid gap-4">
                      {monthGroup.items.map((event: any, eventIdx: number) => (
                        <Card
                          key={`${idx}-${eventIdx}`}
                          className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden rounded-2xl"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Date Column */}
                            <div className="md:w-32 bg-slate-50 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 group-hover:bg-blue-50/50 transition-colors">
                              <span className="text-3xl font-black text-slate-900 mb-1">
                                {event.date}
                              </span>
                              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                                {event.day}
                              </span>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-700">
                                    {event.commissariat}
                                  </span>
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 tracking-wider uppercase">
                                    {event.type}
                                  </span>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                                  {event.title}
                                </h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-slate-500 font-medium mt-3">
                                  <p className="flex items-center gap-1.5 min-w-0">
                                    <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                                    <span className="truncate">
                                      {event.location}
                                    </span>
                                  </p>
                                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
                                  <p className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 shrink-0 text-slate-400" />
                                    <span>{event.time} WIB</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 pl-0 md:pl-6">
                                <Link href={`/calendar/${event.id}`}>
                                  <Button
                                    variant="outline"
                                    className="rounded-full px-6 py-2 h-auto text-sm font-semibold tracking-wide border-slate-200 text-slate-700 hover:bg-slate-50 group/btn"
                                  >
                                    Detail
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </FadeIn>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <CalendarIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Tidak ada kegiatan
                </h3>
                <p className="text-slate-500 max-w-sm text-center">
                  {activeTab === "upcoming"
                    ? "Belum ada agenda mendatang yang dijadwalkan saat ini."
                    : `Tidak ada arsip kegiatan ditemukan untuk tahun ${selectedYear}.`}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

