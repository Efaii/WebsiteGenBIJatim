"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import Image from "next/image";
import { Search, Calendar, ChevronDown, ArrowRight } from "lucide-react";

// List Data Komisariat
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

export default function CommissariatPage() {
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

  // Calculate Stats
  const totalMembers = COMMISSARIATS.reduce(
    (acc, curr) => acc + curr.members,
    0
  );
  const totalCommissariats = COMMISSARIATS.length;
  // Mock total programs
  const totalPrograms = 45;

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <main className="flex-1 container mx-auto px-4 py-20 relative z-10">
        {/* Header & Stats Dashboard */}
        <section className="mb-20">
          <SectionHeader
            title="Pusat Data Komisariat"
            description="Dashboard terintegrasi untuk memantau kinerja dan perkembangan 9 Komisariat GenBI di Jawa Timur."
          />

          <FadeIn delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Stat 1 */}
              <Card
                variant="glass"
                className="p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-blue-200/60 font-medium text-sm uppercase tracking-wider mb-1">
                    Total Anggota
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {totalMembers}+
                  </p>
                  <div className="mt-4 text-xs font-medium text-cyan-200 bg-cyan-500/10 inline-block px-3 py-1 rounded-full border border-cyan-500/20">
                    Se-Jawa Timur
                  </div>
                </div>
              </Card>

              {/* Stat 2 */}
              <Card
                variant="glass"
                className="p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-blue-200/60 font-medium text-sm uppercase tracking-wider mb-1">
                    Komisariat Aktif
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {totalCommissariats}
                  </p>
                  <div className="mt-4 text-xs font-medium text-blue-200 bg-blue-500/10 inline-block px-3 py-1 rounded-full border border-blue-500/20">
                    Perguruan Tinggi Negeri
                  </div>
                </div>
              </Card>

              {/* Stat 3 */}
              <Card
                variant="glass"
                className="p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-blue-200/60 font-medium text-sm uppercase tracking-wider mb-1">
                    Total Program Kerja
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {totalPrograms}+
                  </p>
                  <div className="mt-4 text-xs font-medium text-indigo-200 bg-indigo-500/10 inline-block px-3 py-1 rounded-full border border-indigo-500/20">
                    Terealisasi Tahun Ini
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>
        </section>

        {/* content grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Feed (Activity) - Desktop Order 2 (Right Side) but visually maybe better on left or bottom? 
                Let's put it on the Right as a "Sidebar".
            */}
          <aside className="lg:col-span-1 lg:order-last space-y-8">
            <FadeIn delay={0.4}>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                  Baru Saja Terjadi
                </h3>
                <div className="space-y-6">
                  {RECENT_ACTIVITIES.map((activity) => (
                    <div
                      key={activity.id}
                      className="relative pl-6 border-l border-white/10 pb-2 last:pb-0"
                    >
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-950 border border-white/20"></div>
                      <p className="text-xs text-blue-200/50 mb-1">
                        {activity.date}
                      </p>
                      <p className="text-sm text-white font-medium leading-snug">
                        <span className="text-cyan-300">
                          {activity.commissariat}
                        </span>{" "}
                        {activity.action}{" "}
                        <span className="text-white/90">{activity.item}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <Link href="/news" className="w-full">
                  <Button
                    variant="secondary"
                    className="w-full mt-6 text-sm h-10 rounded-full flex items-center justify-center gap-2 group hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all font-medium"
                  >
                    Lihat Semua Aktivitas
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </aside>

          {/* Main Content: Search & List */}
          <div className="lg:col-span-3 space-y-8">
            {/* Modern Filters */}
            <FadeIn
              delay={0.3}
              className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between relative z-30"
            >
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari komisariat..."
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-400/50 text-white placeholder:text-blue-200/40 font-medium transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative w-full md:w-auto">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200/50 w-5 h-5" />
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full md:w-64 pl-12 py-3 pr-6 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-400/50 text-white font-bold text-left hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{filterYear}</span>
                  <span
                    className={`transition-transform duration-200 text-blue-200/60 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full md:w-64 bg-blue-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto no-scrollbar">
                    <div className="p-1 space-y-1">
                      {YEARS.map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            setFilterYear(year);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            filterYear === year
                              ? "bg-cyan-500/20 text-cyan-200"
                              : "text-blue-100/80 hover:bg-white/10 hover:text-white hover:pl-6"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overlay to close dropdown */}
                {isDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}
              </div>
            </FadeIn>

            {/* Grid List */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCommissariats.length > 0 ? (
                filteredCommissariats.map((comm) => (
                  <StaggerItem key={comm.id}>
                    <Card
                      variant="glass"
                      className="group h-full flex flex-col justify-between"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-4">
                          {/* Logo Placeholder */}
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                            <Image
                              src={comm.logo}
                              alt={`${comm.name} Logo`}
                              width={64}
                              height={64}
                              className="w-full h-full object-contain p-3 brightness-0 invert opacity-80 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-white mb-1 group-hover:text-cyan-300 transition-colors tracking-tight">
                              {comm.name}
                            </h3>
                            <p className="text-xs text-blue-200/60 line-clamp-1">
                              {comm.university}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <div className="px-6 py-2">
                        <div className="flex gap-4 text-xs text-blue-100/70 border-t border-white/5 pt-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-base">
                              {comm.members}
                            </span>
                            <span>Anggota</span>
                          </div>
                          <div className="w-px bg-white/10"></div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-base">
                              24
                            </span>
                            <span>Proker</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-2">
                        <Link
                          href={`/commissariat/${comm.name
                            .toLowerCase()
                            .replace("komisariat ", "")
                            .replace(/\s+/g, "-")}`}
                        >
                          <Button
                            variant="secondary"
                            className="w-full text-sm h-10 rounded-full group-hover:bg-cyan-500/10 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2"
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
                  <div className="w-16 h-16 bg-blue-100/10 rounded-full flex items-center justify-center text-blue-400 mb-4 text-2xl">
                    ?
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Tidak ada data ditemukan
                  </h3>
                  <p className="text-blue-200/60">
                    Coba ubah kata kunci pencarian atau filter tahun.
                  </p>
                </div>
              )}
            </StaggerContainer>
          </div>
        </div>
      </main>

      <div className="relative border-t border-white/10">
        <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-3xl -z-10"></div>
        <Footer />
      </div>
    </div>
  );
}
