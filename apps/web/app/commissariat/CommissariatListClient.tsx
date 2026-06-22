"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import Image from "next/image";
import { Search, ChevronDown, ArrowRight, SlidersHorizontal, Users, ShieldCheck, Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const YEARS = ["Semua Tahun", "2025-2026"];

const COMMISSARIATS = [
  {
    id: 1,
    name: "Komisariat UNESA",
    university: "Universitas Negeri Surabaya",
    year: "2025-2026",
    members: 64,
    logo: "/assets/logos/unesa.svg",
    color: "from-blue-600 to-cyan-500",
  },
  {
    id: 2,
    name: "Komisariat UPNVJT",
    university: "UPN Veteran Jawa Timur",
    year: "2025-2026",
    members: 50,
    logo: "/assets/logos/upnvjt.svg",
    color: "from-green-600 to-emerald-500",
  },
  {
    id: 3,
    name: "Komisariat UNAIR",
    university: "Universitas Airlangga",
    year: "2025-2026",
    members: 112,
    logo: "/assets/logos/unair.svg",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 4,
    name: "Komisariat ITS",
    university: "Institut Teknologi Sepuluh Nopember",
    year: "2025-2026",
    members: 87,
    logo: "/assets/logos/its.svg",
    color: "from-blue-800 to-indigo-600",
  },
  {
    id: 5,
    name: "Komisariat UINSA",
    university: "UIN Sunan Ampel",
    year: "2025-2026",
    members: 83,
    logo: "/assets/logos/uinsa.svg",
    color: "from-teal-600 to-green-500",
  },
  {
    id: 6,
    name: "Komisariat UNUGIRI",
    university: "UNU Sunan Giri",
    year: "2025-2026",
    members: 50,
    logo: "/assets/logos/unugiri.svg",
    color: "from-green-700 to-emerald-600",
  },
  {
    id: 7,
    name: "Komisariat UTM",
    university: "Universitas Trunojoyo Madura",
    year: "2025-2026",
    members: 75,
    logo: "/assets/logos/utm.svg",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: 8,
    name: "Komisariat PENS",
    university: "Politeknik Elektronika Negeri Surabaya",
    year: "2025-2026",
    members: 48,
    logo: "/assets/logos/pens.svg",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 9,
    name: "Komisariat UIN Madura",
    university: "UIN Madura",
    year: "2025-2026",
    members: 50,
    logo: "/assets/logos/uinMadura.svg",
    color: "from-green-500 to-lime-500",
  },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    commissariat: "Komisariat UNAIR",
    action: "Melaksanakan",
    item: "GenBI Mengajar di SDN 1 Surabaya",
    date: "2 Jam yang lalu",
    icon: "📚",
  },
  {
    id: 2,
    commissariat: "Komisariat ITS",
    action: "Mengunggah",
    item: "LPJ Kegiatan Bersih Pantai",
    date: "5 Jam yang lalu",
    icon: "📄",
  },
  {
    id: 3,
    commissariat: "Komisariat UPNVJT",
    action: "Menambahkan",
    item: "Daftar Awardee Baru 2026",
    date: "1 Hari yang lalu",
    icon: "👥",
  },
];

export default function CommissariatListClient() {
  const [filterYear, setFilterYear] = useState<string>("Semua Tahun");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredCommissariats = COMMISSARIATS.filter((c) => {
    const matchYear = filterYear === "Semua Tahun" || c.year === filterYear;
    const matchName =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.university.toLowerCase().includes(searchTerm.toLowerCase());
    return matchYear && matchName;
  });

  const totalMembers = COMMISSARIATS.reduce((acc, curr) => acc + curr.members, 0);
  const totalCommissariats = COMMISSARIATS.length;
  const totalPrograms = 45;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900 relative overflow-clip">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-32 relative z-10">
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <FadeIn once={false}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
              Pusat Data{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Komisariat
              </span>
            </h1>
            <p className="text-lg text-slate-600">
              Dashboard terintegrasi untuk memantau kinerja dan perkembangan 9 Komisariat GenBI di Jawa Timur.
            </p>
          </FadeIn>
        </section>

        <section className="mb-16">
          <FadeIn once={false} delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group rounded-2xl">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold text-sm tracking-wide">
                      Total Anggota
                    </p>
                    <p className="text-3xl font-black text-slate-900">
                      {totalMembers}+
                    </p>
                  </div>
                </div>
                <div className="text-xs font-medium text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
                  Se-Jawa Timur
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group rounded-2xl">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold text-sm tracking-wide">
                      Komisariat Aktif
                    </p>
                    <p className="text-3xl font-black text-slate-900">
                      {totalCommissariats}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-medium text-cyan-700 bg-cyan-50 inline-block px-3 py-1 rounded-full border border-cyan-100">
                  Perguruan Tinggi Negeri
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group rounded-2xl">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold text-sm tracking-wide">
                      Program Kerja
                    </p>
                    <p className="text-3xl font-black text-slate-900">
                      {totalPrograms}+
                    </p>
                  </div>
                </div>
                <div className="text-xs font-medium text-indigo-700 bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100">
                  Terealisasi Tahun Ini
                </div>
              </Card>
            </div>
          </FadeIn>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          <aside className="xl:col-span-1 xl:order-last space-y-6">
            <FadeIn once={false} delay={0.4}>
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  Baru Saja Terjadi
                </h3>
                <div className="space-y-6">
                  {RECENT_ACTIVITIES.map((activity) => (
                    <div
                      key={activity.id}
                      className="relative pl-6 border-l-2 border-slate-100 pb-2 last:pb-0"
                    >
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                      <p className="text-xs text-slate-400 font-medium mb-1">
                        {activity.date}
                      </p>
                      <p className="text-sm text-slate-700 font-medium leading-snug">
                        <span className="text-blue-600 font-bold">
                          {activity.commissariat}
                        </span>{" "}
                        {activity.action}{" "}
                        <span className="text-slate-900">{activity.item}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <Link href="/news" className="block w-full mt-6">
                  <Button
                    variant="outline"
                    className="w-full text-sm rounded-xl font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    Lihat Semua Aktivitas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </aside>

          <div className="xl:col-span-3 space-y-6">
            <FadeIn
              once={false}
              delay={0.3}
              className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-row gap-2 items-center justify-between w-full relative z-30"
            >
              <div className="relative w-full flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari komisariat..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 font-medium transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 py-3 px-4 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-blue-500/20"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {filterYear === "Semua Tahun" ? "Filter" : filterYear}
                  </span>
                  {filterYear !== "Semua Tahun" && (
                    <span className="sm:hidden w-2 h-2 rounded-full bg-blue-600 ml-1"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1"
                      >
                        {YEARS.map((year) => (
                          <button
                            key={year}
                            onClick={() => {
                              setFilterYear(year);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                              filterYear === year
                                ? "bg-blue-50 text-blue-700 font-bold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>

            <StaggerContainer
              once={false}
              staggerDelay={0.1}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredCommissariats.length > 0 ? (
                filteredCommissariats.map((comm) => (
                  <StaggerItem key={comm.id}>
                    <Card className="group h-full flex flex-col justify-between bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 rounded-2xl overflow-hidden">
                      <div className="p-6 pb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-sm">
                            <Image
                              src={comm.logo}
                              alt={`${comm.name} Logo`}
                              width={48}
                              height={48}
                              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                              {comm.name}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 line-clamp-1">
                              {comm.university}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-3 bg-slate-50/50 border-t border-b border-slate-100">
                        <div className="flex gap-4 text-xs font-medium text-slate-600">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-lg">
                              {comm.members}
                            </span>
                            <span>Anggota</span>
                          </div>
                          <div className="w-px bg-slate-200"></div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-lg">
                              24
                            </span>
                            <span>Proker</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white">
                        <Link
                          href={`/commissariat/${comm.name.toLowerCase().replace("komisariat ", "").replace(/\s+/g, "-")}`}
                        >
                          <Button
                            variant="outline"
                            className="w-full text-sm h-10 rounded-xl border-slate-200 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors flex items-center justify-center gap-2 font-bold shadow-sm"
                          >
                            Kunjungi Profil
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </StaggerItem>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 text-2xl">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Tidak ada data ditemukan
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Coba ubah kata kunci pencarian atau filter tahun.
                  </p>
                </div>
              )}
            </StaggerContainer>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
