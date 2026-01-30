"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Calendar as CalendarIcon,
  History,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  X,
} from "lucide-react";

type EventType = (typeof ALL_EVENTS)[0]["items"][0];

// Mock Data for Calendar Events (Mix of Past & Future)
const ALL_EVENTS = [
  // --- UPCOMING (2026) ---
  {
    year: 2026,
    month: "Januari 2026",
    isFuture: true,
    items: [
      {
        date: "12",
        day: "Minggu",
        title: "Pelantikan Pengurus Baru GenBI Jatim",
        commissariat: "Wilayah (Jatim)",
        type: "Seremonial",
        time: "08:00 - 13:00",
        location: "Kpw BI Jawa Timur",
      },
      {
        date: "18",
        day: "Sabtu",
        title: "GenBI Mengajar: Edisi Pesisir",
        commissariat: "UTM",
        type: "Pendidikan",
        time: "09:00 - 15:00",
        location: "Bangkalan, Madura",
      },
      {
        date: "25",
        day: "Sabtu",
        title: "Webinar Literasi Keuangan Digital",
        commissariat: "UNAIR",
        type: "Webinar",
        time: "13:00 - 15:00",
        location: "Zoom Meeting",
      },
    ],
  },
  {
    year: 2026,
    month: "Februari 2026",
    isFuture: true,
    items: [
      {
        date: "02",
        day: "Minggu",
        title: "Bersih Pantai Kenjeran",
        commissariat: "ITS",
        type: "Lingkungan",
        time: "06:00 - 10:00",
        location: "Pantai Kenjeran",
      },
      {
        date: "14",
        day: "Jumat",
        title: "GenBI Goes to School",
        commissariat: "UNESA",
        type: "Pendidikan",
        time: "08:00 - 11:00",
        location: "SMA Negeri 1 Surabaya",
      },
    ],
  },
  // --- HISTORY (2025) ---
  {
    year: 2025,
    month: "Desember 2025",
    isFuture: false,
    items: [
      {
        date: "20",
        day: "Sabtu",
        title: "Evaluasi Akhir Tahun",
        commissariat: "Wilayah (Jatim)",
        type: "Rapat",
        time: "09:00 - 16:00",
        location: "Zoom Meeting",
      },
    ],
  },
  {
    year: 2025,
    month: "November 2025",
    isFuture: false,
    items: [
      {
        date: "10",
        day: "Senin",
        title: "Upacara Hari Pahlawan",
        commissariat: "UPNVJT",
        type: "Seremonial",
        time: "07:00 - 09:00",
        location: "Lapangan UPN",
      },
    ],
  },
  // --- HISTORY (2024) ---
  {
    year: 2024,
    month: "Agustus 2024",
    isFuture: false,
    items: [
      {
        date: "17",
        day: "Sabtu",
        title: "Gebyar Kemerdekaan RI",
        commissariat: "UNAIR",
        type: "Perayaan",
        time: "08:00 - 15:00",
        location: "Kampus C UNAIR",
      },
    ],
  },
];

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

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [filter, setFilter] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("2025"); // Default for history
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  // Filter Logic
  const filteredEvents = ALL_EVENTS.filter((group) => {
    // 1. Tab Logic
    if (activeTab === "upcoming" && !group.isFuture) return false;
    if (activeTab === "history") {
      if (group.isFuture) return false;
      // 2. Year Logic (Only for History)
      if (group.year.toString() !== selectedYear) return false;
    }

    return true;
  })
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => filter === "Semua" || item.commissariat === filter,
      ),
    }))
    .filter((group) => group.items.length > 0); // Remove empty groups after filtering

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Background Elements - Global Standard */}
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

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
                      {monthGroup.items.map((event, eventIdx) => (
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
                                <Button
                                  onClick={() => setSelectedEvent(event)}
                                  variant="secondary"
                                  className="rounded-full px-6 py-2.5 h-auto text-sm font-semibold tracking-wide group/btn"
                                >
                                  Detail
                                  <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
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

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-blue-950/80 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-blue-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden pointer-events-auto relative flex flex-col max-h-[90vh]"
              >
                {/* Header Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 relative flex items-end p-6 border-b border-white/10 shrink-0">
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors backdrop-blur-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex gap-2 relative z-10 w-full">
                    <span className="px-3 py-1 rounded-full bg-blue-950/50 backdrop-blur-md text-cyan-200 text-xs font-bold border border-white/10 shadow-lg">
                      {selectedEvent.commissariat}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-950/50 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-lg">
                      {selectedEvent.type}
                    </span>
                  </div>
                  {/* Decorative Blob */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
                    {selectedEvent.title}
                  </h2>

                  <div className="grid gap-4 mb-8">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <CalendarIcon className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">
                          Tanggal
                        </p>
                        <p className="text-base text-white font-medium">
                          {selectedEvent.day}, {selectedEvent.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <Clock className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">
                          Waktu
                        </p>
                        <p className="text-base text-white font-medium">
                          {selectedEvent.time} WIB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <MapPin className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">
                          Lokasi
                        </p>
                        <p className="text-base text-white font-medium">
                          {selectedEvent.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Detail Acara
                    </h3>
                    <div className="h-px w-full bg-gradient-to-r from-cyan-500/50 to-transparent mb-4"></div>
                    <p className="text-blue-100/80 leading-relaxed text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                    <p className="text-blue-100/80 leading-relaxed text-sm mt-4">
                      Excepteur sint occaecat cupidatat non proident, sunt in
                      culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-blue-950/50 border-t border-white/10 shrink-0 flex gap-3">
                  <Button
                    onClick={() => setSelectedEvent(null)}
                    variant="outline"
                    className="flex-1 rounded-xl border-white/10 hover:bg-white/5 text-blue-200"
                  >
                    Tutup
                  </Button>
                  <Button className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0">
                    Tambahkan ke Kalender
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
