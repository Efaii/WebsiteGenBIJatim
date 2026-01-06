"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { MemberDetailModal, BPHMember } from "@/components/MemberDetailModal";
import CountUp from "@/components/CountUp";
import {
  Megaphone,
  Rocket,
  Crown,
  Heart,
  Shield,
  Briefcase,
  Users,
  BookOpen,
  FileText,
  Banknote,
} from "lucide-react";

// --- Data ---
const KORKOM_STRUCTURE: {
  name: string;
  university: string;
  bph: BPHMember[];
  divisions: BPHMember[];
} = {
  name: "GenBI Koordinator Komisariat Jawa Timur",
  university: "Jawa Timur",
  bph: [
    {
      role: "Ketua Umum",
      name: "Anggia Citra Okta Ferina",
      image: "/assets/images/individu.jpg",
      major: "UNESA",
    },
    {
      role: "Wakil Ketua Umum",
      name: "Rikza Haikal Siraji",
      image: "/assets/images/individu.jpg",
      major: "UPN Veteran Jatim",
    },
    {
      role: "Sekretaris 1",
      name: "Saltsa Ari Purbo A. F.",
      image: "/assets/images/individu.jpg",
      major: "UNAIR",
    },
    {
      role: "Sekretaris 2",
      name: "Eni Setiyowati",
      image: "/assets/images/individu.jpg",
      major: "UNUGIRI",
    },
    {
      role: "Bendahara 1",
      name: "Caroline Febriyanti",
      image: "/assets/images/individu.jpg",
      major: "UPNVJT",
    },
    {
      role: "Bendahara 2",
      name: "M. Ivan Ferdiansyah P.",
      image: "/assets/images/individu.jpg",
      major: "UINSA",
    },
  ],
  divisions: [
    {
      role: "Ketua Divisi Pengembangan & Pendidikan",
      name: "Rangga Prashagi",
      image: "/assets/images/individu.jpg",
      major: "UTM",
    },
    {
      role: "Sekben Divisi Pengembangan & Pendidikan",
      name: "Afrillia Dwi Arifianti",
      image: "/assets/images/individu.jpg",
      major: "UPNVJT",
    },
    {
      role: "Anggota Divisi Pengembangan & Pendidikan",
      name: "M. Farhan Al-Ansori",
      image: "/assets/images/individu.jpg",
      major: "PENS",
    },
    {
      role: "Anggota Divisi Pengembangan & Pendidikan",
      name: "Novita Nilla Fauzia",
      image: "/assets/images/individu.jpg",
      major: "UTM",
    },
    {
      role: "Anggota Divisi Pengembangan & Pendidikan",
      name: "Ifan Zamroni",
      image: "/assets/images/individu.jpg",
      major: "UPNVJT",
    },
    // Sinergi
    {
      role: "Ketua Divisi Sinergi Komisariat",
      name: "Reno Alfa Reza",
      image: "/assets/images/individu.jpg",
      major: "UPNVJT",
    },
    {
      role: "Sekben Divisi Sinergi Komisariat",
      name: "Theressa Marry Christiyani",
      image: "/assets/images/individu.jpg",
      major: "UPNVJT",
    },
    {
      role: "Anggota Divisi Sinergi Komisariat",
      name: "Jevon Savero",
      image: "/assets/images/individu.jpg",
      major: "ITS",
    },
    {
      role: "Anggota Divisi Sinergi Komisariat",
      name: "Karin Devia Melawati",
      image: "/assets/images/individu.jpg",
      major: "UINSA",
    },
    {
      role: "Anggota Divisi Sinergi Komisariat",
      name: "Windy Satria Darmawan",
      image: "/assets/images/individu.jpg",
      major: "UNAIR",
    },
    // PR & Medkom
    {
      role: "Ketua Divisi PR & Medkom",
      name: "Fathir Ainur Rochim",
      image: "/assets/images/individu.jpg",
      major: "UNUGIRI",
    },
    {
      role: "Sekben Divisi PR & Medkom",
      name: "Meidy Dwi Cahyani",
      image: "/assets/images/individu.jpg",
      major: "UTM",
    },
    {
      role: "Anggota Divisi PR & Medkom",
      name: "Dhiaulhaqi An Nazmi",
      image: "/assets/images/individu.jpg",
      major: "UINSA",
    },
    {
      role: "Anggota Divisi PR & Medkom",
      name: "Bagas Aji Dariansyah",
      image: "/assets/images/individu.jpg",
      major: "UPNVJT",
    },
    {
      role: "Anggota Divisi PR & Medkom",
      name: "M. Rakha Syailendra",
      image: "/assets/images/individu.jpg",
      major: "UPNVJT",
    },
  ],
};

export default function AboutPage() {
  const [selectedMember, setSelectedMember] = useState<BPHMember | null>(null);

  // Helper to filter divisions
  const getDivisionMembers = (divName: string) => {
    return KORKOM_STRUCTURE.divisions.filter((m) =>
      m.role.toLowerCase().includes(divName.toLowerCase())
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[calc(100vh-5rem)] max-h-[1080px] min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] -z-10"></div>

          <div className="container relative mx-auto px-6 text-center z-10">
            <SlideUp delay={0.2}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                Mengenal Lebih Dekat <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  GenBI Jawa Timur
                </span>
              </h1>
            </SlideUp>
            <FadeIn delay={0.4}>
              <p className="text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed font-light mb-12">
                Wadah kolaborasi penerima beasiswa Bank Indonesia di Jawa Timur,
                bergerak serentak menjadi energi baru untuk kemajuan negeri.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* About GenBI Definition Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <FadeIn>
              <SectionHeader
                title="Tentang GenBI"
                align="center"
                description="GenBI (Generasi Baru Indonesia) adalah komunitas penerima beasiswa Bank Indonesia yang terdiri dari mahasiswa terpilih dari berbagai Perguruan Tinggi Negeri (PTN) dan Swasta (PTS) di seluruh Indonesia. Di Jawa Timur, GenBI hadir sebagai wadah inkubator kepemimpinan yang dibina langsung oleh Kantor Perwakilan Bank Indonesia Provinsi Jawa Timur, bertujuan untuk mencetak 'Future Leaders' yang cerdas, berintegritas, dan berkontribusi nyata bagi kemajuan bangsa."
              />
            </FadeIn>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 relative bg-white/5 border-y border-white/5">
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
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Visi Kami
                  </h2>
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
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Misi Kami
                  </h2>
                  <StaggerContainer className="space-y-4">
                    {[
                      "Memperkuat solidaritas dan komunikasi lintas komisariat melalui kegiatan kolaboratif",
                      "Menghadirkan program berdampak yang selaras dengan pilar utama Bank Indonesia (Pendidikan, Sosial, Lingkungan, dan Ekonomi)",
                      "Mempererat hubungan serta membangun jejaring strategis antara anggota aktif dan alumni",
                      "Mewujudkan sistem dokumentasi dan pelaporan kinerja yang terukur, transparan, dan berkelanjutan",
                    ].map((item, index) => (
                      <StaggerItem
                        key={index}
                        className="flex items-start gap-4"
                      >
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-blue-100/80">{item}</p>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Roles / 3 Pillars */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6 text-center">
            <SectionHeader
              title="Peran Strategis"
              align="center"
              description=""
            />
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <Card className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/10 h-full relative overflow-hidden">
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${value.color} opacity-10 blur-3xl rounded-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20`}
                    ></div>
                    <CardContent className="p-8 pt-12 relative z-10 flex flex-col items-center">
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
        <section className="py-20 relative bg-white/5 border-y border-white/5">
          <div className="container mx-auto px-6 relative z-10">
            <SectionHeader
              title="DNA GenBI Jatim"
              description="Karakter dan prinsip dasar yang membentuk identitas serta etos kerja setiap anggota."
            />

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Card className="h-full bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all text-center group hover:-translate-y-2 relative overflow-hidden">
                    <div
                      className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${val.color} opacity-10 blur-2xl rounded-full -mr-8 -mt-8 transition-opacity group-hover:opacity-20`}
                    ></div>
                    <CardContent className="p-6 relative z-10 flex flex-col items-center">
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
        <section className="py-20 relative overflow-hidden">
          {/* Decorative Line (Desktop) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent -translate-x-1/2 hidden md:block"></div>

          <div className="container mx-auto px-6 relative z-10">
            <SectionHeader
              title="Jejak Langkah & Milestone"
              className="mb-20" // History timeline needs slightly more space or sticking to standard? Standard is mb-16. Original was mb-20. Let's keep strict mb-16 as requested, or mb-20 if design demands. User said "sekarang sudah rapi, tapi..." implying he wants strict rules. SectionHeader uses mb-16. I will stick to standard SectionHeader which has mb-16.
            />

            <div className="space-y-12 md:space-y-0 relative">
              {[
                {
                  year: "2011",
                  title: "Inisiasi Nasional",
                  desc: "Program Beasiswa Bank Indonesia resmi diluncurkan secara nasional sebagai wujud dedikasi untuk negeri.",
                },
                {
                  year: "2013",
                  title: "GenBI Jatim Terbentuk",
                  desc: "Komunitas penerima beasiswa di Jawa Timur mulai terorganisir, menyatukan visi dari berbagai kampus mitra.",
                },
                {
                  year: "2018",
                  title: "Tuan Rumah Leadership Camp",
                  desc: "Dipercaya menjadi tuan rumah perhelatan akbar Leadership Camp Nasional yang dihadiri ribuan delegasi.",
                },
                {
                  year: "2024",
                  title: "Komunitas Terbaik",
                  desc: "Meraih penghargaan sebagai Koordinator Komisariat paling produktif dan berdampak di ajang GenBI Award.",
                },
              ].map((item, i) => {
                const isEven = i % 2 === 0;
                return (
                  <SlideUp
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
                      <h3 className="text-2xl font-bold text-white mb-3">
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
        <section className="py-20 relative bg-white/5 border-t border-white/5">
          <div className="container mx-auto px-6 relative z-10">
            <SectionHeader
              title="Struktur Organisasi"
              description="Tim solid yang berdedikasi penuh menggerakkan visi menjadi aksi nyata, Periode 2025/2026."
            />

            <div className="max-w-6xl mx-auto">
              <StaggerItem>
                {/* Leaders Section */}
                <div className="flex flex-col items-center mb-12">
                  <div className="mb-6 filter drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <Crown
                      className="w-16 h-16 text-cyan-300"
                      strokeWidth={1}
                    />
                  </div>
                  <div className="flex items-center gap-4 mb-8 w-full justify-center">
                    <div className="h-px bg-gradient-to-r from-transparent to-white/20 w-32"></div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-widest">
                      Leaders
                    </h3>
                    <div className="h-px bg-gradient-to-l from-transparent to-white/20 w-32"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16 justify-center max-w-2xl">
                    {KORKOM_STRUCTURE.bph
                      .filter(
                        (m) =>
                          m.role.toLowerCase().includes("ketua") &&
                          !m.role.toLowerCase().includes("divisi")
                      )
                      .map((member, idx) => (
                        <Card
                          key={idx}
                          onClick={() => setSelectedMember(member)}
                          className="bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col items-center text-center hover:bg-white/10 transition-all hover:-translate-y-2 cursor-pointer group hover:border-cyan-500/30"
                        >
                          <div className="w-24 h-24 bg-blue-950/50 rounded-full border-4 border-white/10 flex items-center justify-center shadow-lg overflow-hidden mb-6 group-hover:border-cyan-400 transition-colors relative">
                            <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors z-10"></div>
                            <Image
                              src={member.image}
                              alt={member.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                            />
                          </div>
                          <h3 className="font-bold text-xl text-white mb-1 group-hover:text-cyan-300 transition-colors">
                            {member.name}
                          </h3>
                          <p className="text-sm font-semibold text-blue-200/60 mb-2">
                            {member.role}
                          </p>
                          {member.major && (
                            <span className="text-xs text-cyan-200 font-bold bg-white/10 border border-white/10 py-1 px-3 rounded">
                              {member.major}
                            </span>
                          )}
                        </Card>
                      ))}
                  </div>

                  {/* Secretaries & Treasurers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-20">
                    {/* Secretaries */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors group">
                      <div className="flex items-center gap-3 mb-6 justify-center border-b border-white/5 pb-4">
                        <FileText
                          className="w-8 h-8 text-cyan-300 group-hover:scale-110 transition-transform duration-300"
                          strokeWidth={1.5}
                        />
                        <h3 className="font-bold text-lg text-white uppercase tracking-wider">
                          Sekretaris
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {KORKOM_STRUCTURE.bph
                          .filter((m) =>
                            m.role.toLowerCase().includes("sekretaris")
                          )
                          .map((member, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedMember(member)}
                              className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
                            >
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 flex-shrink-0 group-hover:border-cyan-400 transition-colors">
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover transition-all"
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-bold text-white text-sm group-hover:text-cyan-200 transition-colors">
                                  {member.name}
                                </p>
                                <p className="text-xs text-blue-200/60">
                                  {member.role}
                                </p>
                              </div>
                              {member.major && (
                                <span className="text-[10px] font-bold text-cyan-200 bg-white/10 border border-white/10 px-2 py-0.5 rounded">
                                  {member.major}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Treasurers */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors group">
                      <div className="flex items-center gap-3 mb-6 justify-center border-b border-white/5 pb-4">
                        <Banknote
                          className="w-8 h-8 text-cyan-300 group-hover:scale-110 transition-transform duration-300"
                          strokeWidth={1.5}
                        />
                        <h3 className="font-bold text-lg text-white uppercase tracking-wider">
                          Bendahara
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {KORKOM_STRUCTURE.bph
                          .filter((m) =>
                            m.role.toLowerCase().includes("bendahara")
                          )
                          .map((member, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedMember(member)}
                              className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
                            >
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 flex-shrink-0 group-hover:border-cyan-400 transition-colors">
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover transition-all"
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-bold text-white text-sm group-hover:text-cyan-200 transition-colors">
                                  {member.name}
                                </p>
                                <p className="text-xs text-blue-200/60">
                                  {member.role}
                                </p>
                              </div>
                              {member.major && (
                                <span className="text-[10px] font-bold text-cyan-200 bg-white/10 border border-white/10 px-2 py-0.5 rounded">
                                  {member.major}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Divisions */}
                  <div className="w-full">
                    <div className="flex items-center gap-4 mb-8 w-full justify-center">
                      <div className="h-px bg-gradient-to-r from-transparent to-white/20 w-24"></div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-widest">
                        Divisi & Bidang
                      </h3>
                      <div className="h-px bg-gradient-to-l from-transparent to-white/20 w-24"></div>
                    </div>

                    <SlideUp delay={0.5}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 align-start">
                        {/* Development */}
                        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/5 backdrop-blur-md border border-white/10 h-full group">
                          <CardContent className="p-8 pt-8">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-lg text-cyan-300 group-hover:scale-110 transition-transform duration-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-200">
                                <BookOpen
                                  className="w-6 h-6"
                                  strokeWidth={1.5}
                                />
                              </div>
                              <h4 className="font-bold text-white text-lg leading-tight group-hover:text-cyan-300 transition-colors">
                                Pengembangan <br /> & Pendidikan
                              </h4>
                            </div>

                            <div className="space-y-4">
                              {getDivisionMembers("Pengembangan & Pendidikan")
                                .filter((m) =>
                                  m.role.toLowerCase().includes("ketua")
                                )
                                .map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 border-b border-white/10 pb-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
                                    onClick={() => setSelectedMember(member)}
                                  >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-sm flex-shrink-0">
                                      <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-0.5">
                                        Ketua Divisi
                                      </p>
                                      <div className="flex justify-between items-center">
                                        <p className="font-bold text-white leading-tight">
                                          {member.name}
                                        </p>
                                        <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-cyan-200">
                                          {member.major}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                              {getDivisionMembers("Pengembangan & Pendidikan")
                                .filter((m) =>
                                  m.role.toLowerCase().includes("sekben")
                                )
                                .map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 border-b border-white/10 pb-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
                                    onClick={() => setSelectedMember(member)}
                                  >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-sm flex-shrink-0">
                                      <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-0.5">
                                        Sekben Divisi
                                      </p>
                                      <div className="flex justify-between items-center">
                                        <p className="font-bold text-white leading-tight">
                                          {member.name}
                                        </p>
                                        <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-cyan-200">
                                          {member.major}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                              <div>
                                <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-3">
                                  Anggota
                                </p>
                                <ul className="space-y-2 text-sm">
                                  {getDivisionMembers(
                                    "Pengembangan & Pendidikan"
                                  )
                                    .filter((m) =>
                                      m.role.toLowerCase().includes("anggota")
                                    )
                                    .map((member, idx) => (
                                      <li
                                        key={idx}
                                        onClick={() =>
                                          setSelectedMember(member)
                                        }
                                        className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                                      >
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                                          <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 flex justify-between items-center">
                                          <span className="font-medium text-blue-50">
                                            {member.name}
                                          </span>
                                          <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-cyan-200">
                                            {member.major}
                                          </span>
                                        </div>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Sinergi */}
                        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/5 backdrop-blur-md border border-white/10 h-full group">
                          <CardContent className="p-8 pt-8">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-lg text-cyan-300 group-hover:scale-110 transition-transform duration-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-200">
                                <Users className="w-6 h-6" strokeWidth={1.5} />
                              </div>
                              <h4 className="font-bold text-white text-lg leading-tight group-hover:text-cyan-300 transition-colors">
                                Sinergi <br /> Komisariat
                              </h4>
                            </div>

                            <div className="space-y-4">
                              {getDivisionMembers("Sinergi")
                                .filter((m) =>
                                  m.role.toLowerCase().includes("ketua")
                                )
                                .map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 border-b border-white/10 pb-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
                                    onClick={() => setSelectedMember(member)}
                                  >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-sm flex-shrink-0">
                                      <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-0.5">
                                        Ketua Divisi
                                      </p>
                                      <div className="flex justify-between items-center">
                                        <p className="font-bold text-white leading-tight">
                                          {member.name}
                                        </p>
                                        <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-cyan-200">
                                          {member.major}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                              {getDivisionMembers("Sinergi")
                                .filter((m) =>
                                  m.role.toLowerCase().includes("sekben")
                                )
                                .map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 border-b border-white/10 pb-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
                                    onClick={() => setSelectedMember(member)}
                                  >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-sm flex-shrink-0">
                                      <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-0.5">
                                        Sekben Divisi
                                      </p>
                                      <div className="flex justify-between items-center">
                                        <p className="font-bold text-white leading-tight">
                                          {member.name}
                                        </p>
                                        <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-cyan-200">
                                          {member.major}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                              <div>
                                <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-3">
                                  Anggota
                                </p>
                                <ul className="space-y-2 text-sm">
                                  {getDivisionMembers("Sinergi")
                                    .filter((m) =>
                                      m.role.toLowerCase().includes("anggota")
                                    )
                                    .map((member, idx) => (
                                      <li
                                        key={idx}
                                        onClick={() =>
                                          setSelectedMember(member)
                                        }
                                        className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                                      >
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                                          <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 flex justify-between items-center">
                                          <span className="font-medium text-blue-50">
                                            {member.name}
                                          </span>
                                          <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-cyan-200">
                                            {member.major}
                                          </span>
                                        </div>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* PR Medkom */}
                        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/5 backdrop-blur-md border border-white/10 h-full group">
                          <CardContent className="p-8 pt-8">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-lg text-cyan-300 group-hover:scale-110 transition-transform duration-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-200">
                                <Megaphone
                                  className="w-6 h-6"
                                  strokeWidth={1.5}
                                />
                              </div>
                              <h4 className="font-bold text-white text-lg leading-tight group-hover:text-cyan-300 transition-colors">
                                Public Relation <br /> & Medkom
                              </h4>
                            </div>

                            <div className="space-y-4">
                              {getDivisionMembers("PR")
                                .filter((m) =>
                                  m.role.toLowerCase().includes("ketua")
                                )
                                .map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 border-b border-white/10 pb-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
                                    onClick={() => setSelectedMember(member)}
                                  >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-sm flex-shrink-0">
                                      <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-0.5">
                                        Ketua Divisi
                                      </p>
                                      <div className="flex justify-between items-center">
                                        <p className="font-bold text-white leading-tight">
                                          {member.name}
                                        </p>
                                        <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-cyan-200">
                                          {member.major}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                              {getDivisionMembers("PR")
                                .filter((m) =>
                                  m.role.toLowerCase().includes("sekben")
                                )
                                .map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 border-b border-white/10 pb-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
                                    onClick={() => setSelectedMember(member)}
                                  >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-sm flex-shrink-0">
                                      <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-0.5">
                                        Sekben Divisi
                                      </p>
                                      <div className="flex justify-between items-center">
                                        <p className="font-bold text-white leading-tight">
                                          {member.name}
                                        </p>
                                        <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-cyan-200">
                                          {member.major}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                              <div>
                                <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-3">
                                  Anggota
                                </p>
                                <ul className="space-y-2 text-sm">
                                  {getDivisionMembers("PR")
                                    .filter((m) =>
                                      m.role.toLowerCase().includes("anggota")
                                    )
                                    .map((member, idx) => (
                                      <li
                                        key={idx}
                                        onClick={() =>
                                          setSelectedMember(member)
                                        }
                                        className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                                      >
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                                          <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 flex justify-between items-center">
                                          <span className="font-medium text-blue-50">
                                            {member.name}
                                          </span>
                                          <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-cyan-200">
                                            {member.major}
                                          </span>
                                        </div>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </SlideUp>
                  </div>
                </div>
              </StaggerItem>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-white/5 bg-transparent">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Tertarik Berkolaborasi?
            </h2>
            <p className="text-blue-200/80 mb-8 max-w-xl mx-auto">
              Kami selalu terbuka untuk membangun sinergi positif dengan
              berbagai pihak demi dampak yang lebih luas.
            </p>
            <Link href="/contact" className="inline-block">
              <Button size="lg" variant="secondary">
                Hubungi Kami
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <div className="relative border-t border-white/10">
        <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-3xl -z-10"></div>
        <Footer />
      </div>

      <AnimatePresence>
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
