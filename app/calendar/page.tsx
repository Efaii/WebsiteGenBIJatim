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

// Mock Data for Calendar Events
const EVENTS = [
  {
    month: "Januari 2026",
    items: [
      {
        date: "12",
        day: "Minggu",
        title: "Pelantikan Pengurus Baru GenBI Jatim",
        commissariat: "Wilayah (Jatim)",
        type: "Seremonial",
        time: "08:00 - 13:00",
        location: "Kpw BI Jawa Timur",
        color: "bg-cyan-500",
      },
      {
        date: "18",
        day: "Sabtu",
        title: "GenBI Mengajar: Edisi Pesisir",
        commissariat: "UTM",
        type: "Pendidikan",
        time: "09:00 - 15:00",
        location: "Bangkalan, Madura",
        color: "bg-red-500",
      },
      {
        date: "25",
        day: "Sabtu",
        title: "Webinar Literasi Keuangan Digital",
        commissariat: "UNAIR",
        type: "Webinar",
        time: "13:00 - 15:00",
        location: "Zoom Meeting",
        color: "bg-yellow-500",
      },
    ],
  },
  {
    month: "Februari 2026",
    items: [
      {
        date: "02",
        day: "Minggu",
        title: "Bersih Pantai Kenjeran",
        commissariat: "ITS",
        type: "Lingkungan",
        time: "06:00 - 10:00",
        location: "Pantai Kenjeran",
        color: "bg-blue-500",
      },
      {
        date: "14",
        day: "Jumat",
        title: "GenBI Goes to School",
        commissariat: "UNESA",
        type: "Pendidikan",
        time: "08:00 - 11:00",
        location: "SMA Negeri 1 Surabaya",
        color: "bg-green-500",
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

export default function CalendarPage() {
  const [filter, setFilter] = useState("Semua");

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-12 relative">
          <div className="container mx-auto px-6 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Kalender{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-300">
                  Kegiatan
                </span>
              </h1>
              <p className="text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed font-light mb-8">
                Pantau agenda kegiatan GenBI se-Jawa Timur. Jangan lewatkan
                kesempatan untuk berpartisipasi dan berkontribusi.
              </p>

              {/* Filter Tabs */}
              <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFilter(opt)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      filter === opt
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                        : "bg-white/5 text-blue-200 hover:bg-white/10"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </SlideUp>
          </div>
        </section>

        {/* Calendar Feed */}
        <section className="py-12 relative z-10 min-h-[50vh]">
          <div className="container mx-auto px-6 max-w-5xl">
            <StaggerContainer className="space-y-12">
              {EVENTS.map((monthGroup, idx) => (
                <StaggerItem key={idx} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white bg-blue-950/50 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm sticky top-24 z-20 inline-block">
                      {monthGroup.month}
                    </h2>
                    <div className="h-px bg-white/10 flex-1"></div>
                  </div>

                  <div className="grid gap-4">
                    {monthGroup.items
                      .filter(
                        (item) =>
                          filter === "Semua" || item.commissariat === filter
                      )
                      .map((event, eventIdx) => (
                        <Card
                          key={eventIdx}
                          className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300 overflow-hidden"
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
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${event.color} text-white shadow-sm`}
                                  >
                                    {event.commissariat}
                                  </span>
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/10 text-blue-200 border border-white/5">
                                    {event.type}
                                  </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                  {event.title}
                                </h3>
                                <p className="text-sm text-blue-200/60 flex items-center gap-2">
                                  <span>📍 {event.location}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                <div className="text-right hidden md:block">
                                  <p className="text-sm font-bold text-white">
                                    {event.time}
                                  </p>
                                  <p className="text-xs text-blue-300">WIB</p>
                                </div>
                                <div className="text-left md:hidden flex-1">
                                  <p className="text-sm font-bold text-white">
                                    {event.time} WIB
                                  </p>
                                </div>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded-full"
                                >
                                  Detail
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
