"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardHeader } from "@/components/Card";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  getAllCommissariats,
  getGlobalCommissariatStats,
  type CommissariatSummary,
} from "@/lib/services/commissariat.service";

export default function CommissariatPage() {
  const [data, setData] = useState<CommissariatSummary[]>([]);
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
                Ringkasan 9 Komisariat GenBI di Jawa Timur beserta jumlah anggota
                dan program kerjanya.
              </p>
            </div>
          </div>

          <FadeIn once={true} delay={0}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="p-6 relative overflow-hidden group hover:border-blue-400 transition-colors bg-white shadow-md border-slate-200 rounded-xl">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">
                    Total Anggota
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.totalMembers}
                  </p>
                  <div className="mt-4 text-xs font-semibold text-blue-800 bg-blue-100 inline-block px-3 py-1 rounded-md border border-blue-300 shadow-sm">
                    Se-Jawa Timur
                  </div>
                </div>
              </Card>

              <Card className="p-6 relative overflow-hidden group hover:border-blue-400 transition-colors bg-white shadow-md border-slate-200 rounded-xl">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">
                    Komisariat Aktif
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.totalCommissariats}
                  </p>
                  <div className="mt-4 text-xs font-semibold text-blue-800 bg-blue-100 inline-block px-3 py-1 rounded-md border border-blue-300 shadow-sm">
                    Perguruan Tinggi Negeri
                  </div>
                </div>
              </Card>

              <Card className="p-6 relative overflow-hidden group hover:border-blue-400 transition-colors bg-white shadow-md border-slate-200 rounded-xl">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">
                    Total Program Kerja
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.totalProker}
                  </p>
                  <div className="mt-4 text-xs font-semibold text-blue-800 bg-blue-100 inline-block px-3 py-1 rounded-md border border-blue-300 shadow-sm">
                    Dipublikasikan
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>
        </section>

        {/* Grid List */}
        {data.length === 0 ? (
          <div
            role="status"
            className="py-16 text-center text-slate-500 italic border border-dashed border-slate-200 rounded-3xl bg-white/80"
          >
            Data komisariat belum tersedia.
          </div>
        ) : (
          <StaggerContainer
            once={true}
            staggerDelay={0.05}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {data.map((comm) => (
              <StaggerItem key={comm.id}>
                <Card className="group h-full flex flex-col justify-between bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all rounded-xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-inner font-bold text-blue-600 text-xl">
                        <Image
                          src={comm.logo_univ || "/assets/logos/genbi.svg"}
                          alt={`${comm.name} Logo`}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement!.innerHTML = comm.name.charAt(0);
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
                          {comm.memberCount}
                        </span>
                        <span>Anggota</span>
                      </div>
                      <div className="w-px bg-slate-200"></div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-base">
                          {comm.prokerCount}
                        </span>
                        <span>Proker</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-2">
                    <Link href={`/commissariat/${comm.slug}`} className="w-full block">
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
        )}
      </main>

      <div className="relative border-t border-slate-200 bg-white">
        <Footer />
      </div>
    </div>
  );
}
