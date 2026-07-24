"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
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
import { Calendar, ChevronDown, ArrowRight } from "lucide-react";
import { getAllCommissariats, getGlobalCommissariatStats } from "@/lib/services/commissariat.service";
import { CommissariatData } from "@repo/types";

// List Data Komisariat
const YEARS = ["Semua Tahun", "2025-2026"];

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
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProker: 0,
    totalCommissariats: 0,
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commData, statsData] = await Promise.all([
          getAllCommissariats(),
          getGlobalCommissariatStats(),
        ]);
        setData(commData);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate Stats from state or use pre-calculated from backend
  const totalMembers = stats.totalMembers;
  const totalCommissariats = stats.totalCommissariats;
  const totalPrograms = stats.totalProker;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Hero section background matching homepage */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-50 to-slate-50 pointer-events-none -z-10"></div>

      <main className="flex-1 container mx-auto px-4 py-20 relative z-10">
        {/* Header & Stats Dashboard */}
        <section className="mb-12">
          <div className="text-center items-center mx-auto flex flex-col mb-12 relative z-10 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 tracking-tight leading-tight">
              Pusat Data Komisariat
            </h2>
            <div className="mt-4">
              <p className="text-lg text-slate-600 leading-relaxed mx-auto max-w-2xl">
                Dashboard terintegrasi untuk memantau kinerja dan perkembangan 9
                Komisariat GenBI di Jawa Timur.
              </p>
            </div>
          </div>

          <FadeIn once={true} delay={0}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Stat 1 */}
              <Card
                className="p-6 relative overflow-hidden group hover:border-blue-400 transition-colors bg-white shadow-md border-slate-200 rounded-xl"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">
                    Total Anggota
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {totalMembers}+
                  </p>
                  <div className="mt-4 text-xs font-semibold text-blue-800 bg-blue-100 inline-block px-3 py-1 rounded-md border border-blue-300 shadow-sm">
                    Se-Jawa Timur
                  </div>
                </div>
              </Card>

              {/* Stat 2 */}
              <Card
                className="p-6 relative overflow-hidden group hover:border-blue-400 transition-colors bg-white shadow-md border-slate-200 rounded-xl"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">
                    Komisariat Aktif
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {totalCommissariats}
                  </p>
                  <div className="mt-4 text-xs font-semibold text-blue-800 bg-blue-100 inline-block px-3 py-1 rounded-md border border-blue-300 shadow-sm">
                    Perguruan Tinggi Negeri
                  </div>
                </div>
              </Card>

              {/* Stat 3 */}
              <Card
                className="p-6 relative overflow-hidden group hover:border-blue-400 transition-colors bg-white shadow-md border-slate-200 rounded-xl"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">
                    Total Program Kerja
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {totalPrograms}+
                  </p>
                  <div className="mt-4 text-xs font-semibold text-blue-800 bg-blue-100 inline-block px-3 py-1 rounded-md border border-blue-300 shadow-sm">
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
            <FadeIn once={true} delay={0.1}>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                  </span>
                  Baru Saja Terjadi
                </h3>
                <div className="space-y-6">
                  {RECENT_ACTIVITIES.map((activity) => (
                    <div
                      key={activity.id}
                      className="relative pl-6 border-l border-slate-200 pb-2 last:pb-0"
                    >
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border border-white"></div>
                      <p className="text-xs text-slate-500 mb-1">
                        {activity.date}
                      </p>
                      <p className="text-sm text-slate-700 font-medium leading-snug">
                        <span className="text-blue-600">
                          {activity.commissariat}
                        </span>{" "}
                        {activity.action}{" "}
                        <span className="text-slate-900">{activity.item}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <Link href="/news" className="w-full">
                  <div className="w-full mt-6 text-sm h-10 rounded-full flex items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-700 text-slate-900 font-bold border border-slate-200 transition-all cursor-pointer group bg-white shadow-sm">
                    Lihat Semua Aktivitas
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </div>
            </FadeIn>
          </aside>

          {/* Main Content: Grid List */}
          <div className="lg:col-span-3 space-y-8">


            {/* Grid List */}
            <StaggerContainer
              once={true}
              staggerDelay={0.05}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {data.map((comm) => (
                <StaggerItem key={comm.id}>
                    <Card
                      className="group h-full flex flex-col justify-between bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all rounded-xl"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-4">
                          {/* Logo */}
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-inner font-bold text-blue-600 text-xl">
                            {/* Assuming some logos are dark and some light, just display them normally instead of invert hack */}
                            <Image
                              src={comm.logo_univ || "/assets/logos/genbi.svg"}
                              alt={`${comm.name} Logo`}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = comm.name.charAt(11); // Fallback letter e.g 'U' from Komisariat U...
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-slate-900 mb-1 group-hover:text-blue-600 transition-colors tracking-tight">
                              {comm.name}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {comm.university}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <div className="px-6 py-2">
                        <div className="flex gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-base">
                              {comm.memberCount || 0}
                            </span>
                            <span>Anggota</span>
                          </div>
                          <div className="w-px bg-slate-200"></div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-base">
                              {comm.prokerCount || 0}
                            </span>
                            <span>Proker</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-2">
                        <Link
                          href={`/commissariat/${comm.slug}`}
                          className="w-full block"
                        >
                          <div className="w-full text-sm h-10 rounded-lg flex items-center justify-center gap-2 border border-slate-200 text-slate-900 bg-slate-50 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-bold group/btn shadow-sm">
                            Kunjungi Profil
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </div>
                        </Link>
                      </div>
                    </Card>
                  </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </main>

      <div className="relative border-t border-slate-200 bg-white">
        <Footer />
      </div>
    </div>
  );
}
