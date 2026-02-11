"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageBackground } from "@/components/PageBackground";
import { Button } from "@/components/Button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Info,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { EventItem } from "@/app/types";

export default function EventDetailClient({
  eventData,
}: {
  eventData: EventItem;
}) {
  const isOnline = eventData.format === "Online";

  // Helper to render lists
  const renderList = (items?: string[]) => {
    if (!items || items.length === 0)
      return <p className="text-blue-200/60">-</p>;
    return (
      <ul className="list-disc list-inside text-blue-200/80 space-y-1">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />
      <PageBackground variant="subtle" />

      <main className="flex-1 pt-28 pb-20 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <SlideUp>
            <Link
              href="/calendar"
              className="inline-flex items-center text-blue-300 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Kalender
            </Link>
          </SlideUp>

          <FadeIn delay={0.1}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              {/* Header / Banner */}
              <div className="h-64 md:h-80 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 relative p-8 md:p-12 flex flex-col justify-end overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full bg-blue-950/50 backdrop-blur-md text-cyan-200 text-sm font-bold border border-white/10 shadow-lg">
                      {eventData.commissariat}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold border border-white/10 shadow-lg">
                      {eventData.type}
                    </span>
                    {/* Audience Badge */}
                    <span
                      className={`px-4 py-1.5 rounded-full backdrop-blur-md text-sm font-bold border border-white/10 shadow-lg ${
                        eventData.audience === "Internal"
                          ? "bg-purple-500/20 text-purple-200 border-purple-500/30"
                          : "bg-emerald-500/20 text-emerald-200 border-emerald-500/30"
                      }`}
                    >
                      {eventData.audience === "Internal"
                        ? "🔒 Internal Only"
                        : "🌍 Terbuka untuk Umum"}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                    {eventData.title}
                  </h1>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-8 md:p-12 grid md:grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                  {/* Deskripsi */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      Deskripsi Program
                    </h2>
                    <div className="h-1 w-20 bg-cyan-500 rounded-full mb-6"></div>
                    <p className="text-blue-100/80 leading-relaxed text-lg font-light whitespace-pre-line">
                      {eventData.description_long || eventData.description}
                    </p>
                  </div>

                  {/* Detail Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 text-cyan-400">
                        Tujuan (Objectives)
                      </h3>
                      {renderList(eventData.objectives)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 text-cyan-400">
                        KPI / Target
                      </h3>
                      {renderList(eventData.kpi)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 text-cyan-400">
                        Dampak (Impact)
                      </h3>
                      {renderList(eventData.impact || eventData.benefits)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 text-cyan-400">
                        Evaluasi
                      </h3>
                      <p className="text-blue-200/80 italic">
                        {eventData.evaluation || "Belum ada evaluasi."}
                      </p>
                    </div>
                  </div>

                  {/* Documents & Links Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-3 border-b border-white/10 pb-2">
                      Dokumen & Tautan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {eventData.proposalLink && (
                        <a
                          href={eventData.proposalLink}
                          target="_blank"
                          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Share2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">
                              Proposal Kegiatan
                            </p>
                            <p className="text-xs text-blue-200/60">
                              Klik untuk melihat
                            </p>
                          </div>
                        </a>
                      )}
                      {eventData.lpjLink && (
                        <a
                          href={eventData.lpjLink}
                          target="_blank"
                          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Share2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">
                              Laporan Pertanggungjawaban
                            </p>
                            <p className="text-xs text-blue-200/60">
                              Klik untuk melihat
                            </p>
                          </div>
                        </a>
                      )}
                      {eventData.documentation && (
                        <a
                          href={eventData.documentation}
                          target="_blank"
                          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                        >
                          <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">
                              Dokumentasi
                            </p>
                            <p className="text-xs text-blue-200/60">
                              Galeri Foto/Video
                            </p>
                          </div>
                        </a>
                      )}
                      {/* If no links */}
                      {!eventData.proposalLink &&
                        !eventData.lpjLink &&
                        !eventData.documentation && (
                          <p className="text-blue-200/60 text-sm">
                            Tidak ada dokumen publik yang tersedia.
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-6 sticky top-32">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">
                          Tanggal
                        </p>
                        <p className="text-white font-medium">
                          {eventData.day}, {eventData.date}
                        </p>
                        <p className="text-sm text-blue-200/60">
                          {eventData.month}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">
                          Waktu
                        </p>
                        <p className="text-white font-medium">
                          {eventData.time} WIB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">
                          Lokasi (Format: {eventData.format || "Offline"})
                        </p>
                        <p className="text-white font-medium">
                          {eventData.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">
                          Status
                        </p>
                        <p
                          className={`font-medium ${
                            eventData.status === "Completed"
                              ? "text-emerald-400"
                              : eventData.status === "On-going"
                                ? "text-amber-400"
                                : "text-white"
                          }`}
                        >
                          {eventData.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </main>

      <Footer />
    </div>
  );
}
