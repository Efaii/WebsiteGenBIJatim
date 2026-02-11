"use client";

import { useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/Card";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { PageBackground } from "@/components/PageBackground";
import Image from "next/image";
import { BPHMember } from "@/components/MemberDetailModal";
import { KorkomData, EventItem } from "@/app/types"; // Should come from shared types
import CountUp from "@/components/CountUp";
import {
  Crown,
  Shield,
  Heart,
  Users,
  Briefcase,
  Megaphone,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MemberListItem = ({
  member,
  onClick,
  hideRole = false,
}: {
  member: BPHMember;
  onClick: () => void;
  hideRole?: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border border-transparent hover:bg-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group/item",
        hideRole ? "py-4" : "",
      )}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 flex-shrink-0 group-hover/item:border-cyan-400 transition-colors">
        <Image
          src={member.image}
          alt={member.name}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 text-left flex flex-col justify-center min-h-[3rem]">
        <p className="font-bold text-white text-sm group-hover/item:text-cyan-200 transition-colors line-clamp-1 leading-tight">
          {member.name}
        </p>
        {!hideRole && (
          <p className="text-xs text-blue-200/60 mt-0.5 leading-snug">
            {member.role}
          </p>
        )}
      </div>
    </div>
  );
};

interface AboutClientProps {
  korkomData: KorkomData;
  sharedEvents: EventItem[];
}

export default function AboutClient({
  korkomData,
  sharedEvents,
}: AboutClientProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const [selectedMember, setSelectedMember] = useState<BPHMember | null>(null);
  const [activeTab, setActiveTab] = useState<"struktur" | "proker" | "arsip">(
    "struktur",
  );

  // Pagination State for Proker
  const [prokerPage, setProkerPage] = useState(1);
  const prokerItemsPerPage = 6;
  const indexOfLastProker = prokerPage * prokerItemsPerPage;
  const indexOfFirstProker = indexOfLastProker - prokerItemsPerPage;
  const currentProkers = sharedEvents.slice(
    indexOfFirstProker,
    indexOfLastProker,
  );
  const totalProkerPages = Math.ceil(sharedEvents.length / prokerItemsPerPage);

  // Helper to filter divisions
  const getDivisionMembers = (divName: string) => {
    return korkomData.divisions.filter((m: any) => m.division === divName);
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[calc(100vh-5rem)] max-h-[1080px] min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          {/* Background Blobs (Standardized) */}
          <PageBackground variant="default" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] -z-10"></div>

          <div className="container relative mx-auto px-6 text-center z-10">
            <SlideUp once={false} delay={0.2}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                Siapa Kami? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  Profil GenBI Jatim
                </span>
              </h1>
            </SlideUp>
            <FadeIn once={false} delay={0.4}>
              <p className="text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed font-light mb-12">
                Wadah kolaborasi penerima beasiswa Bank Indonesia di Jawa Timur,
                bergerak serentak menjadi energi baru untuk kemajuan negeri.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* About GenBI Definition Section */}
        <section className="py-20 relative z-10 bg-white/5 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <FadeIn once={false}>
              <SectionHeader
                title="Tentang GenBI Jatim"
                align="center"
                description="Lebih dari sekadar penerima beasiswa, GenBI Jawa Timur adalah inkubator kepemimpinan yang dirancang untuk mencetak generasi Energi Baru. Di sini, integritas intelektual bertemu dengan kepekaan sosial. Kami bergerak melampaui batas kampus, bersinergi sebagai mitra strategis Bank Indonesia dalam mengawal stabilitas ekonomi, mengakselerasi literasi keuangan, dan memberdayakan masyarakat melalui aksi nyata yang berdampak dan berkelanjutan."
                className="mb-0"
              />
            </FadeIn>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Stats Card (Left) */}
              <div className="relative order-2 md:order-1">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-[2rem] transform -rotate-3 blur-sm"></div>
                <div className="relative bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/5 hover:bg-white/10 transition-colors duration-300">
                      <div className="text-4xl font-bold text-white mb-2 flex justify-center items-center gap-1">
                        <CountUp to={9} />
                      </div>
                      <div className="text-sm text-blue-200/60 font-medium">
                        Mitra Kampus
                      </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/5 hover:bg-white/10 transition-colors duration-300">
                      <div className="text-4xl font-bold text-white mb-2 flex justify-center items-center gap-1">
                        <CountUp to={500} />+
                      </div>
                      <div className="text-sm text-blue-200/60 font-medium">
                        Anggota Aktif
                      </div>
                    </div>
                    <div className="col-span-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-white/10 p-8 rounded-2xl text-center text-white relative overflow-hidden group">
                      <div className="absolute inset-0 bg-cyan-500/10 blur-xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
                      <div className="relative z-10">
                        <div className="text-5xl font-bold mb-2 flex justify-center items-center gap-1">
                          <CountUp to={12} />+
                        </div>
                        <div className="text-sm text-cyan-200 font-medium uppercase tracking-widest">
                          Tahun Berkarya
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content (Right) */}
              <div className="space-y-8 order-1 md:order-2">
                <div>
                  <FadeIn once={false}>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                      Visi Kami
                    </h2>
                  </FadeIn>
                  <FadeIn once={false} delay={0.2}>
                    <p className="text-lg text-blue-100/80 leading-relaxed">
                      Mewujudkan{" "}
                      <span className="text-cyan-400 font-semibold">
                        GenBI Jawa Timur
                      </span>{" "}
                      sebagai{" "}
                      <span className="text-cyan-400 font-semibold">
                        wadah kolaborasi sinergis antar komisariat
                      </span>{" "}
                      yang{" "}
                      <span className="text-cyan-400 font-semibold">
                        berdampak nyata
                      </span>{" "}
                      bagi{" "}
                      <span className="text-cyan-400 font-semibold">
                        masyarakat
                      </span>{" "}
                      dan{" "}
                      <span className="text-cyan-400 font-semibold">
                        lingkungan
                      </span>
                    </p>
                  </FadeIn>
                </div>
                <div>
                  <FadeIn once={false}>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                      Misi Kami
                    </h2>
                  </FadeIn>
                  <div className="space-y-4">
                    {[
                      "Memperkuat solidaritas dan komunikasi lintas komisariat melalui kegiatan kolaboratif",
                      "Menghadirkan program berdampak yang selaras dengan pilar utama Bank Indonesia (Pendidikan, Sosial, Lingkungan, dan Ekonomi)",
                      "Mempererat hubungan serta membangun jejaring strategis antara anggota aktif dan alumni",
                      "Mewujudkan sistem dokumentasi dan pelaporan kinerja yang terukur, transparan, dan berkelanjutan",
                    ].map((item, index) => (
                      <SlideUp
                        once={false}
                        key={index}
                        className="flex items-start gap-4"
                      >
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-blue-100/80">{item}</p>
                      </SlideUp>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Roles / 3 Pillars */}
        <section className="py-20 relative bg-white/5 border-y border-white/5">
          <div className="container mx-auto px-6 text-center">
            <FadeIn once={false}>
              <SectionHeader
                title="3 Pilar Peran Utama"
                align="center"
                description="Tiga fungsi strategis yang dijalankan setiap anggota GenBI sebagai mitra Bank Indonesia."
              />
            </FadeIn>
            <StaggerContainer
              once={false}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  title: "Front-liners",
                  desc: "Garda terdepan dalam mengkomunikasikan kebijakan Bank Indonesia kepada masyarakat.",
                  icon: <Megaphone className="w-10 h-10" strokeWidth={1.5} />,
                  color: "from-cyan-500 to-blue-500",
                },
                {
                  title: "Agent of Change",
                  desc: "Agen perubahan yang membawa inovasi dan solusi bagi permasalahan sosial ekonomi.",
                  icon: <Rocket className="w-10 h-10" strokeWidth={1.5} />,
                  color: "from-purple-500 to-fuchsia-500",
                },
                {
                  title: "Future Leaders",
                  desc: "Calon pemimpin masa depan yang berintegritas dan berdedikasi untuk negeri.",
                  icon: <Crown className="w-10 h-10" strokeWidth={1.5} />,
                  color: "from-amber-500 to-yellow-600",
                },
              ].map((value, i) => (
                <StaggerItem key={i}>
                  <Card
                    variant="glass"
                    className="h-full flex flex-col items-center text-center p-8 pt-12 group cursor-default relative overflow-hidden"
                  >
                    <CardContent className="p-0 relative z-10 flex flex-col items-center">
                      <div className="text-blue-200/50 mb-6 group-hover:text-cyan-400 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">
                        {value.title}
                      </h3>
                      <p className="text-blue-100/70 leading-relaxed">
                        {value.desc}
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6 relative z-10">
            <FadeIn once={false}>
              <SectionHeader
                title="Nilai & Budaya Kerja"
                description="Prinsip dasar yang menjadi DNA setiap langkah dan keputusan kami."
              />
            </FadeIn>

            <StaggerContainer
              once={false}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                {
                  title: "Dedikasi",
                  icon: <Heart className="w-8 h-8" strokeWidth={1.5} />,
                  desc: "Berkomitmen penuh memberikan kontribusi terbaik tanpa pamrih.",
                  color: "from-pink-500 to-rose-600",
                },
                {
                  title: "Integritas",
                  icon: <Shield className="w-8 h-8" strokeWidth={1.5} />,
                  desc: "Menunjung tinggi kejujuran dan etika dalam setiap tindakan.",
                  color: "from-emerald-500 to-teal-600",
                },
                {
                  title: "Profesional",
                  icon: <Briefcase className="w-8 h-8" strokeWidth={1.5} />,
                  desc: "Bekerja dengan standar tinggi, kompeten, dan bertanggung jawab.",
                  color: "from-blue-500 to-indigo-600",
                },
                {
                  title: "Sinergi",
                  icon: <Users className="w-8 h-8" strokeWidth={1.5} />,
                  desc: "Kekuatan kolaborasi untuk mencapai dampak yang lebih besar.",
                  color: "from-orange-500 to-amber-600",
                },
              ].map((val, i) => (
                <StaggerItem key={i}>
                  <Card
                    variant="glass"
                    className="h-full group text-center flex flex-col items-center justify-center p-6 relative overflow-hidden"
                  >
                    <CardContent className="p-0 relative z-10 flex flex-col items-center">
                      <div className="text-blue-200/50 mb-4 group-hover:text-cyan-400 transition-all duration-300 transform group-hover:scale-110">
                        {val.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {val.title}
                      </h3>
                      <p className="text-sm text-blue-200/70 leading-relaxed">
                        {val.desc}
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* History / Milestones */}
        <section className="py-20 relative overflow-hidden bg-white/5 border-y border-white/5">
          {/* Decorative Line (Desktop) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent -translate-x-1/2 hidden md:block"></div>

          <div className="container mx-auto px-6 relative z-10">
            <FadeIn once={false}>
              <SectionHeader
                title="Sejarah Perjalanan"
                description="Rekam jejak dedikasi GenBI Jawa Timur dari masa ke masa."
              />
            </FadeIn>

            <div className="space-y-12 md:space-y-0 relative">
              {[
                {
                  year: "2011",
                  title: "Inisiasi Nasional",
                  desc: "Program Beasiswa Bank Indonesia resmi diluncurkan secara nasional sebagai wujud dedikasi untuk negeri.",
                },
                {
                  year: "2022",
                  title: "GenBI Surabaya",
                  desc: "GenBI Surabaya mulai terorganisir, menyatukan visi dari berbagai kampus mitra.",
                },
                {
                  year: "2023",
                  title: "GenBI Koordinator Komisariat Suramadu-Bojonegoro",
                  desc: "GenBI Surabaya berubah nama menjadi GenBI Korkom Suramadu-Bojonegoro.",
                },
                {
                  year: "2024",
                  title: "GenBI Koordinator Komisariat Jawa Timur",
                  desc: "GenBI Korkom Suramadu-Bojonegoro berubah nama menjadi GenBI Korkom Jawa Timur.",
                },
              ].map((item, i, arr) => {
                const isEven = i % 2 === 0;
                const isLast = i === arr.length - 1;
                return (
                  <SlideUp
                    once={false}
                    key={i}
                    className={`flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-0 ${
                      !isEven ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Content Side */}
                    <div
                      className={`w-full md:w-1/2 flex flex-col items-center ${
                        isEven
                          ? "md:items-end md:text-right md:pr-12"
                          : "md:items-start md:text-left md:pl-12"
                      } p-4 relative`}
                    >
                      <span className="text-cyan-400 font-bold tracking-widest mb-1 block text-lg">
                        {item.year}
                      </span>
                      <h3
                        className={`text-2xl font-bold text-white ${
                          isLast ? "mb-0" : "mb-3"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-blue-200/70 leading-relaxed max-w-sm">
                        {item.desc}
                      </p>
                    </div>

                    {/* Timeline Dot (Desktop Center) */}
                    <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-blue-950 border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-20 mt-1">
                      <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full"></div>
                    </div>

                    {/* Empty Side for Balance */}
                    <div className="w-full md:w-1/2 hidden md:block"></div>
                  </SlideUp>
                );
              })}
            </div>
          </div>
        </section>

        {/* Organizational Structure */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6 relative z-10">
            <FadeIn once={false}>
              <SectionHeader
                title="Kepengurusan Wilayah"
                description="Tim solid yang berdedikasi penuh menggerakkan visi menjadi aksi nyata, Periode 2025/2026."
              />
            </FadeIn>

            {/* Note: In a real implementation this section would iterate over korkomData.bph and divisions */}
            <div className="text-center text-blue-200/60 p-8 border border-white/5 rounded-2xl bg-white/5">
              <p>Structure content available in props.korkomData</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
