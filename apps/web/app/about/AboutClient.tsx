"use client";

import { useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/Card";
import {
  FadeIn,
  SlideInLeft,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { PageBackground } from "@/components/PageBackground";
import Image from "next/image";
import { BPHMember } from "@/components/MemberDetailModal";
import { KorkomData, EventItem } from "@/app/types"; // Should come from shared types
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

const commissariats = [
  { id: "unair", name: "Universitas Airlangga", logo: "/assets/logos/unair.svg" },
  { id: "its", name: "Institut Teknologi Sepuluh Nopember", logo: "/assets/logos/its.svg" },
  { id: "unesa", name: "Universitas Negeri Surabaya", logo: "/assets/logos/unesa.svg" },
  { id: "pens", name: "Politeknik Elektronika Negeri Surabaya", logo: "/assets/logos/pens.svg" },
  { id: "utm", name: "Universitas Trunojoyo Madura", logo: "/assets/logos/utm.svg" },
  { id: "uin-madura", name: "UIN Madura", logo: "/assets/logos/uinMadura.svg" },
  { id: "uinsa", name: "UIN Sunan Ampel Surabaya", logo: "/assets/logos/uinsa.svg" },
  { id: "unugiri", name: "Universitas Nahdlatul Ulama Sunan Giri", logo: "/assets/logos/unugiri.svg" },
  { id: "upnvjt", name: "UPN Veteran Jawa Timur", logo: "/assets/logos/upnvjt.svg" },
];

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
        <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          {/* Background Blobs (Standardized) */}
          <PageBackground variant="default" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] -z-10"></div>

          <div className="container relative z-10 mx-auto flex min-h-screen translate-y-12 flex-col items-center justify-center px-6 text-center">
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
        <section className="py-16 md:py-24 bg-white relative overflow-hidden">
          <div className="container px-6 lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-20 items-center">
              <div className="relative flex flex-col gap-8">
                <SlideInLeft delay={0.4}>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["/assets/images/raker.jpg", "Kegiatan Raker GenBI"],
                      ["/assets/images/individu.jpg", "Aktivitas anggota GenBI"],
                      ["/assets/images/bnsp.JPG", "Pengembangan kapasitas anggota"],
                      ["/assets/images/background.jpg", "Kolaborasi GenBI Jawa Timur"],
                    ].map(([src, alt]) => (
                      <div
                        key={src}
                        className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-lg shadow-blue-900/10 group"
                      >
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </SlideInLeft>
              </div>

              <div className="lg:pr-6 xl:pr-10">
                <FadeIn delay={0.2}>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
                    Kenali Kami Lebih Dekat
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight leading-[1.15] mb-6">
                    Bukan Sekadar Beasiswa, <br />
                    <span className="text-blue-600">Tapi Transformasi Diri</span>
                  </h2>
                </FadeIn>

                <FadeIn delay={0.3}>
                  <p className="text-slate-900 text-lg leading-relaxed max-w-xl mb-6">
                    Lebih dari sekadar penerima beasiswa, GenBI Jawa Timur adalah inkubator kepemimpinan yang dirancang untuk mencetak generasi Energi Baru. Di sini, integritas intelektual bertemu dengan kepekaan sosial. Kami bergerak melampaui batas kampus, bersinergi sebagai mitra strategis Bank Indonesia dalam mengawal stabilitas ekonomi, mengakselerasi literasi keuangan, dan memberdayakan masyarakat melalui aksi nyata yang berdampak dan berkelanjutan.
                  </p>
                </FadeIn>
              </div>
            </div>

            <FadeIn delay={0.5}>
              <div className="mt-14 overflow-hidden rounded-[2rem] bg-slate-50 p-8 border border-slate-200/80 shadow-md md:p-10">
                <p className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-[0.16em] mb-8 text-center">
                  Menaungi mahasiswa berprestasi dari 9 Kampus Mitra Strategis di Jawa Timur
                </p>
                <div className="overflow-hidden">
                  <div className="flex w-max animate-marquee-loop hover:[animation-play-state:paused]">
                    {[...commissariats, ...commissariats].map((comm, index) => (
                      <div
                        key={`${comm.id}-${index}`}
                        className="group/logo relative flex w-32 shrink-0 items-center justify-center px-4 md:w-44 md:px-6"
                        title={comm.name}
                      >
                        <Image
                          src={comm.logo}
                          alt={comm.name}
                          width={140}
                          height={80}
                          unoptimized
                          className="h-16 md:h-20 w-auto object-contain opacity-75 transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:opacity-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Committee Photo (Left) */}
              <div className="relative order-2 md:order-1">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 blur-sm"></div>
                <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900 shadow-2xl">
                  <Image
                    src="/assets/images/raker.jpg"
                    alt="Pengurus GenBI Jawa Timur"
                    fill
                    className="object-cover object-center transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
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
        <section className="relative border-y border-slate-200 bg-white py-20">
          <div className="container mx-auto px-6 text-center">
            <FadeIn once={false}>
              <SectionHeader
                eyebrow="Kenali Peran GenBI"
                title="3 Pilar Peran Utama"
                align="center"
                description="Tiga fungsi strategis yang dijalankan setiap anggota GenBI sebagai mitra Bank Indonesia."
                className="[&_h2]:text-blue-700 [&_p]:text-slate-700 [&_span]:text-blue-700"
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
                    variant="default"
                    className="h-full flex flex-col items-center text-center p-8 pt-12 group cursor-default relative overflow-hidden border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-lg"
                  >
                    <CardContent className="p-0 relative z-10 flex flex-col items-center">
                      <div className="mb-6 rounded-2xl bg-blue-100 p-5 text-blue-700 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">
                        {value.title}
                      </h3>
                      <p className="text-slate-700 leading-relaxed">
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

        {/* GenBI Story & Documentation */}
        <section className="bg-white py-20 text-slate-900 md:py-28">
          <div className="container mx-auto max-w-7xl px-6 lg:px-8 xl:px-12">
            <FadeIn>
              <div className="max-w-2xl">
                <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  Cerita GenBI &amp; Dokumentasi
                </p>
                <p className="text-lg leading-[1.9] text-slate-800 md:text-xl">
                  GenBI Jawa Timur bukan hanya tentang program dan kegiatan, tetapi
                  tentang orang-orang yang tumbuh bersama. Setiap pertemuan,
                  kolaborasi, dan aksi nyata menjadi bagian dari cerita yang kami
                  bangun untuk menghadirkan energi baru bagi negeri.
                </p>
              </div>
            </FadeIn>

            <StaggerContainer
              once={false}
              className="mt-12 grid auto-rows-[88px] grid-cols-12 gap-3 md:auto-rows-[112px] md:gap-4"
            >
              {[
                ["/assets/images/individu.jpg", "Anggota GenBI dalam kegiatan bersama", "col-span-4 row-span-2 md:col-span-2 md:row-span-2"],
                ["/assets/images/raker.jpg", "Kolaborasi pengurus GenBI", "col-span-8 row-span-3 md:col-span-3 md:row-span-3"],
                ["/assets/images/bnsp.JPG", "Pengembangan kapasitas anggota", "col-span-6 row-span-3 md:col-span-3 md:row-span-2"],
                ["/assets/images/background.jpg", "Momen kebersamaan GenBI", "col-span-6 row-span-2 md:col-span-2 md:row-span-3"],
                ["/assets/images/raker.jpg", "Rapat kerja GenBI Jawa Timur", "col-span-6 row-span-3 md:col-span-2 md:row-span-2"],
                ["/assets/images/individu.jpg", "Aktivitas penerima beasiswa", "col-span-6 row-span-2 md:col-span-2 md:row-span-2"],
                ["/assets/images/background.jpg", "Gerak bersama untuk negeri", "col-span-8 row-span-3 md:col-span-3 md:row-span-2"],
                ["/assets/images/bnsp.JPG", "Belajar dan bertumbuh bersama", "col-span-4 row-span-3 md:col-span-2 md:row-span-3"],
                ["/assets/images/individu.jpg", "Jejak perjalanan GenBI", "col-span-6 row-span-2 md:col-span-2 md:row-span-2"],
                ["/assets/images/raker.jpg", "Dokumentasi kegiatan GenBI", "col-span-6 row-span-2 md:col-span-3 md:row-span-2"],
              ].map(([src, alt, placement], index) => (
                <StaggerItem key={`${src}-${index}`} className={placement}>
                  <div className="group relative h-full overflow-hidden rounded-xl bg-slate-100 md:rounded-2xl">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
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
