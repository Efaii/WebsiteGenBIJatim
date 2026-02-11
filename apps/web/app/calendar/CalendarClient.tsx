"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
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
} from "lucide-react";

import { PageBackground } from "@/components/PageBackground";
import { CalendarGroup } from "@/app/types"; // Check type

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
  initialEvents: any[]; // refined type if possible
}

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [filter, setFilter] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("2025"); // Default for history
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Filter Logic
  const filteredEvents = initialEvents
    .map((group) => {
      // Filter items based on Active Tab & other filters
      const filteredItems = group.items.filter((item: any) => {
        // 1. Tab Logic (Item Level)
        const itemDate = new Date(item.dateIso.split("T")[0]); // Ensure date part only
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

        const isItemPast = itemDate < today;

        if (activeTab === "upcoming" && isItemPast) return false;
        if (activeTab === "history" && !isItemPast) return false;

        // 2. Year Logic (Only for History)
        if (activeTab === "history") {
          const itemYear = itemDate.getFullYear().toString();
          if (itemYear !== selectedYear) return false;
        }

        // 3. Commissariat Filter
        if (filter !== "Semua" && item.commissariat !== filter) return false;

        return true;
      });

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0); // Remove empty groups after filtering

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Background Blobs (Standardized) */}
          <PageBackground variant="default" />

          <div className="container relative mx-auto px-6 text-center z-10 pt-20">
            <SlideUp once={false}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                Kalender <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  Kegiatan GenBI
                </span>
              </h1>
            </SlideUp>
            <FadeIn once={false} delay={0.2}>
              <p className="text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed font-light mb-10">
                Pusat informasi agenda GenBI se-Jawa Timur. Pantau kegiatan
                mendatang atau jelajahi arsip kegiatan yang telah terlaksana.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Unified Sticky Control Bar (Floating Style) */}
        <div className="sticky top-24 z-40 px-6 mb-8">
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-2 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* LEFT: View Tabs */}
            <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10 relative shadow-2xl gap-1">
              {[
                {
                  id: "upcoming",
                  label: "Agenda Mendatang",
                },
                { id: "history", label: "Arsip Kegiatan" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "px-6 py-3 rounded-full text-base font-semibold transition-colors duration-300 relative z-10 whitespace-nowrap",
                    activeTab === tab.id
                      ? "text-cyan-200"
                      : "text-blue-200/60 hover:text-white",
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabCalendar"
                      className="absolute inset-0 bg-cyan-500/20 border border-cyan-500/30 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.1)] -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* RIGHT: Filters */}
            <div className="flex items-center gap-3">
              {/* Commissariat Dropdown */}
              <div className="relative z-50">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full text-white transition-all shadow-sm min-w-[260px] justify-between group",
                    isFilterDropdownOpen
                      ? "bg-blue-950/80 border border-cyan-400/50 shadow-cyan-400/20"
                      : "bg-blue-950/50 border border-white/20 hover:bg-white/10",
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-semibold text-base truncate">
                      {filter === "Semua" ? "Semua Komisariat" : filter}
                    </span>
                  </div>
                  <ChevronDown
                    className={`shrink-0 w-4 h-4 text-blue-200/60 transition-transform duration-300 ${
                      isFilterDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
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
                        className="absolute top-full right-0 md:left-auto md:right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-blue-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 scrollbar-thin scrollbar-thumb-white/10"
                      >
                        <div className="grid gap-1">
                          {FILTER_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                setFilter(opt);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-full text-base font-medium transition-all flex items-center justify-between ${
                                filter === opt
                                  ? "bg-cyan-500/20 text-cyan-200 font-bold"
                                  : "text-blue-200 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Year Filter (Only visible in History Tab) */}
              <AnimatePresence>
                {activeTab === "history" && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, scale: 0.9 }}
                    animate={{ opacity: 1, width: "auto", scale: 1 }}
                    exit={{ opacity: 0, width: 0, scale: 0.9 }}
                    className="relative"
                  >
                    <button
                      onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full text-white transition-colors whitespace-nowrap min-w-[160px] justify-between group",
                        isYearDropdownOpen
                          ? "bg-blue-950/80 border border-cyan-400/50 shadow-cyan-400/20"
                          : "bg-blue-950/50 border border-white/20 hover:bg-white/10",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-blue-200/60" />
                        <span className="font-semibold text-base">
                          {selectedYear}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-blue-200/60 transition-transform ${isYearDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isYearDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[60]"
                          onClick={() => setIsYearDropdownOpen(false)}
                        />
                        <div className="absolute top-full right-0 mt-2 w-full min-w-[160px] bg-blue-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[70] p-2 flex flex-col gap-1">
                          {YEARS.map((year) => (
                            <button
                              key={year}
                              onClick={() => {
                                setSelectedYear(year);
                                setIsYearDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-4 py-3 text-base font-medium transition-colors rounded-full",
                                selectedYear === year
                                  ? "bg-cyan-500/20 text-cyan-200 font-bold"
                                  : "text-blue-200 hover:bg-white/10 hover:text-white",
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
            </div>
          </div>
        </div>

        {/* Calendar Feed */}
        <section className="py-8 relative z-10 min-h-[50vh]">
          <div className="container mx-auto px-6 max-w-5xl">
            {filteredEvents.length > 0 ? (
              <div className="space-y-12">
                {filteredEvents.map((monthGroup, idx) => (
                  <FadeIn key={idx} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold text-white bg-blue-950/50 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm sticky top-24 z-20 inline-block shadow-sm">
                        {monthGroup.month}
                      </h2>
                      <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <div className="grid gap-4">
                      {monthGroup.items.map((event: any, eventIdx: number) => (
                        <Card
                          key={`${idx}-${eventIdx}`}
                          className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300 overflow-hidden rounded-3xl"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Date Column */}
                            <div className="md:w-32 bg-white/5 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-white/5 group-hover:bg-white/10 transition-colors">
                              <span className="text-3xl font-bold text-white mb-1">
                                {event.date}
                              </span>
                              <span className="text-xs uppercase tracking-widest text-blue-300 font-semibold">
                                {event.day}
                              </span>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-200 border border-cyan-500/20 shadow-sm">
                                    {event.commissariat}
                                  </span>
                                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 text-blue-200 border border-white/5 tracking-wider uppercase">
                                    {event.type}
                                  </span>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors leading-snug">
                                  {event.title}
                                </h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-blue-200/80 font-medium mt-auto">
                                  <p className="flex items-center gap-1.5 min-w-0">
                                    <MapPin className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                                    <span className="truncate">
                                      {event.location}
                                    </span>
                                  </p>
                                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-blue-500/50"></span>
                                  <p className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                                    <span>{event.time} WIB</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5 pl-0 md:pl-6">
                                <Link href={`/calendar/${event.id}`}>
                                  <Button
                                    variant="secondary"
                                    className="rounded-full px-6 py-2.5 h-auto text-sm font-semibold tracking-wide group/btn"
                                  >
                                    Detail
                                    <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
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
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <CalendarIcon className="w-8 h-8 text-blue-200/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Tidak ada kegiatan
                </h3>
                <p className="text-blue-200/60 max-w-sm text-center">
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
