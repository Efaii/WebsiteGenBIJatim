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
import { cn } from "@/lib/utils";

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
      university: "UNESA",
      major: "S1 Manajemen Pendidikan",
      instagram: "@ahmadfulan",
      linkedin: "ahmad-fulan",
    },
    {
      role: "Wakil Ketua Umum",
      name: "Rikza Haikal Siraji",
      image: "/assets/images/individu.jpg",
      university: "UPN Veteran Jatim",
      major: "S1 Agroteknologi",
    },
    {
      role: "Sekretaris 1",
      name: "Saltsa Ari Purbo A. F.",
      image: "/assets/images/individu.jpg",
      university: "UNAIR",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Sekretaris 2",
      name: "Eni Setiyowati",
      image: "/assets/images/individu.jpg",
      university: "UNUGIRI",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Bendahara 1",
      name: "Caroline Febriyanti",
      image: "/assets/images/individu.jpg",
      university: "UPNVJT",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Bendahara 2",
      name: "M. Ivan Ferdiansyah P.",
      image: "/assets/images/individu.jpg",
      university: "UINSA",
      major: "S1 Manajemen Pendidikan",
    },
  ],
  divisions: [
    {
      role: "Ketua Divisi",
      name: "Rangga Prashagi",
      image: "/assets/images/individu.jpg",
      university: "UTM",
      division: "Pengembangan & Pendidikan",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Sekretaris & Bendahara",
      name: "Afrillia Dwi Arifianti",
      image: "/assets/images/individu.jpg",
      university: "UPNVJT",
      division: "Pengembangan & Pendidikan",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Anggota",
      name: "M. Farhan Al-Ansori",
      image: "/assets/images/individu.jpg",
      university: "PENS",
      division: "Pengembangan & Pendidikan",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Anggota",
      name: "Novita Nilla Fauzia",
      image: "/assets/images/individu.jpg",
      university: "UTM",
      division: "Pengembangan & Pendidikan",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Anggota",
      name: "Ifan Zamroni",
      image: "/assets/images/individu.jpg",
      university: "UPNVJT",
      division: "Pengembangan & Pendidikan",
      major: "S1 Manajemen Pendidikan",
    },
    // Sinergi
    {
      role: "Ketua Divisi",
      name: "Reno Alfa Reza",
      image: "/assets/images/individu.jpg",
      university: "UPNVJT",
      division: "Sinergi",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Sekretaris & Bendahara",
      name: "Theressa Marry Christiyani",
      image: "/assets/images/individu.jpg",
      university: "UPNVJT",
      division: "Sinergi",
    },
    {
      role: "Anggota",
      name: "Jevon Savero",
      image: "/assets/images/individu.jpg",
      university: "ITS",
      division: "Sinergi",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Anggota",
      name: "Karin Devia Melawati",
      image: "/assets/images/individu.jpg",
      university: "UINSA",
      division: "Sinergi",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Anggota",
      name: "Windy Satria Darmawan",
      image: "/assets/images/individu.jpg",
      university: "UNAIR",
      division: "Sinergi",
      major: "S1 Manajemen Pendidikan",
    },
    // PR & Medkom
    {
      role: "Ketua Divisi",
      name: "Fathir Ainur Rochim",
      image: "/assets/images/individu.jpg",
      university: "UNUGIRI",
      division: "PR",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Sekretaris & Bendahara",
      name: "Meidy Dwi Cahyani",
      image: "/assets/images/individu.jpg",
      university: "UTM",
      division: "PR",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Anggota",
      name: "Dhiaulhaqi An Nazmi",
      image: "/assets/images/individu.jpg",
      university: "UINSA",
      division: "PR",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Anggota",
      name: "Bagas Aji Dariansyah",
      image: "/assets/images/individu.jpg",
      university: "UPNVJT",
      division: "PR",
      major: "S1 Manajemen Pendidikan",
    },
    {
      role: "Anggota",
      name: "M. Rakha Syailendra",
      image: "/assets/images/individu.jpg",
      university: "UPNVJT",
      division: "PR",
      major: "S1 Manajemen Pendidikan",
    },
  ],
};

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
        "flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group/item",
        hideRole ? "py-4" : ""
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

export default function AboutPage() {
  const [selectedMember, setSelectedMember] = useState<BPHMember | null>(null);

  // Helper to filter divisions
  const getDivisionMembers = (divName: string) => {
    return KORKOM_STRUCTURE.divisions.filter((m) => m.division === divName);
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
                Siapa Kami? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  Profil GenBI Jatim
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
        <section className="py-20 relative z-10 bg-white/5 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <FadeIn>
              <SectionHeader
                title="Tentang GenBI Jatim"
                align="center"
                description="Lebih dari sekadar penerima beasiswa, GenBI Jawa Timur adalah inkubator kepemimpinan yang dirancang untuk mencetak generasi 'Energi Baru'. Di sini, integritas intelektual bertemu dengan kepekaan sosial. Kami bergerak melampaui batas kampus, bersinergi sebagai mitra strategis Bank Indonesia dalam mengawal stabilitas ekonomi, mengakselerasi literasi keuangan, dan memberdayakan masyarakat melalui aksi nyata yang berdampak dan berkelanjutan."
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
                  <FadeIn>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                      Visi Kami
                    </h2>
                  </FadeIn>
                  <FadeIn delay={0.2}>
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
                  <FadeIn>
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
                      <SlideUp key={index} className="flex items-start gap-4">
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
            <SectionHeader
              title="3 Pilar Peran Utama"
              align="center"
              description="Tiga fungsi strategis yang dijalankan setiap anggota GenBI sebagai mitra Bank Indonesia."
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
            <SectionHeader
              title="Nilai & Budaya Kerja"
              description="Prinsip dasar yang menjadi DNA setiap langkah dan keputusan kami."
            />

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <SectionHeader
              title="Sejarah Perjalanan"
              description="Rekam jejak dedikasi GenBI Jawa Timur dari masa ke masa."
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
              ].map((item, i, arr) => {
                const isEven = i % 2 === 0;
                const isLast = i === arr.length - 1;
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
            <SectionHeader
              title="Kepengurusan Wilayah"
              description="Tim solid yang berdedikasi penuh menggerakkan visi menjadi aksi nyata, Periode 2025/2026."
            />

            <div className="max-w-6xl mx-auto">
              {/* Leaders Section */}
              <div className="flex flex-col items-center mb-12">
                <FadeIn delay={0.1}>
                  <div className="mb-6 filter drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <Crown
                      className="w-16 h-16 text-cyan-300"
                      strokeWidth={1}
                    />
                  </div>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <div className="flex items-center gap-4 mb-8 w-full justify-center">
                    <div className="h-px bg-gradient-to-r from-transparent to-white/20 w-32"></div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-widest">
                      Leaders
                    </h3>
                    <div className="h-px bg-gradient-to-l from-transparent to-white/20 w-32"></div>
                  </div>
                </FadeIn>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8 justify-center max-w-2xl">
                  {KORKOM_STRUCTURE.bph
                    .filter(
                      (m) =>
                        m.role.toLowerCase().includes("ketua") &&
                        !m.role.toLowerCase().includes("divisi")
                    )
                    .map((member, idx) => (
                      <StaggerItem key={idx}>
                        <Card
                          onClick={() => setSelectedMember(member)}
                          variant="glass"
                          className="p-8 flex flex-col items-center text-center cursor-pointer group"
                        >
                          <div className="w-24 h-24 bg-blue-950/50 rounded-full border-4 border-white/10 flex items-center justify-center shadow-lg overflow-hidden mb-6 group-hover:border-cyan-400 transition-colors relative">
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
                        </Card>
                      </StaggerItem>
                    ))}
                </StaggerContainer>
              </div>

              <SlideUp delay={0.2}>
                {/* Secretaries & Treasurers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
                  {/* Secretaries */}
                  {/* Secretaries */}
                  <Card variant="glass" className="p-6 group">
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
                          <MemberListItem
                            key={idx}
                            member={member}
                            onClick={() => setSelectedMember(member)}
                          />
                        ))}
                    </div>
                  </Card>

                  {/* Treasurers */}
                  {/* Treasurers */}
                  <Card variant="glass" className="p-6 group">
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
                          <MemberListItem
                            key={idx}
                            member={member}
                            onClick={() => setSelectedMember(member)}
                          />
                        ))}
                    </div>
                  </Card>
                </div>
              </SlideUp>

              {/* Divisions */}
              <div className="w-full">
                <SlideUp delay={0.3}>
                  <div className="flex items-center gap-4 mb-8 w-full justify-center">
                    <div className="h-px bg-gradient-to-r from-transparent to-white/20 w-24"></div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">
                      Divisi & Bidang
                    </h3>
                    <div className="h-px bg-gradient-to-l from-transparent to-white/20 w-24"></div>
                  </div>
                </SlideUp>

                <SlideUp delay={0.5}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 align-start">
                    {/* Development */}
                    <Card variant="glass" className="h-full group">
                      <CardContent className="p-8 pt-8">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-lg text-cyan-300 group-hover:scale-110 transition-transform duration-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-200">
                            <BookOpen className="w-6 h-6" strokeWidth={1.5} />
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
                              <MemberListItem
                                key={idx}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                              />
                            ))}

                          {getDivisionMembers("Pengembangan & Pendidikan")
                            .filter((m) =>
                              m.role.toLowerCase().includes("sekretaris")
                            )
                            .map((member, idx) => (
                              <MemberListItem
                                key={idx}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                              />
                            ))}

                          <div>
                            <p className="text-xs text-blue-200/60 font-semibold uppercase tracking-wider mb-3">
                              Anggota
                            </p>
                            <ul className="space-y-2 text-sm">
                              {getDivisionMembers("Pengembangan & Pendidikan")
                                .filter((m) =>
                                  m.role.toLowerCase().includes("anggota")
                                )
                                .map((member, idx) => (
                                  <MemberListItem
                                    key={idx}
                                    member={member}
                                    hideRole={true}
                                    onClick={() => setSelectedMember(member)}
                                  />
                                ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sinergi */}
                    <Card variant="glass" className="h-full group">
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
                              <MemberListItem
                                key={idx}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                              />
                            ))}

                          {getDivisionMembers("Sinergi")
                            .filter((m) =>
                              m.role.toLowerCase().includes("sekretaris")
                            )
                            .map((member, idx) => (
                              <MemberListItem
                                key={idx}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                              />
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
                                  <MemberListItem
                                    key={idx}
                                    member={member}
                                    hideRole={true}
                                    onClick={() => setSelectedMember(member)}
                                  />
                                ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* PR Medkom */}
                    <Card variant="glass" className="h-full group">
                      <CardContent className="p-8 pt-8">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-lg text-cyan-300 group-hover:scale-110 transition-transform duration-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-200">
                            <Megaphone className="w-6 h-6" strokeWidth={1.5} />
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
                              <MemberListItem
                                key={idx}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                              />
                            ))}

                          {getDivisionMembers("PR")
                            .filter((m) =>
                              m.role.toLowerCase().includes("sekretaris")
                            )
                            .map((member, idx) => (
                              <MemberListItem
                                key={idx}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                              />
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
                                  <MemberListItem
                                    key={idx}
                                    member={member}
                                    hideRole={true}
                                    onClick={() => setSelectedMember(member)}
                                  />
                                ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </SlideUp>
              </div>
              {/* Removed StaggerItem derived closing tag if it matched opening */}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-white/5 border-y border-white/5">
          <div className="container mx-auto px-6 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Tertarik Berkolaborasi?
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-blue-200/80 mb-8 max-w-xl mx-auto">
                Kami selalu terbuka untuk membangun sinergi positif dengan
                berbagai pihak demi dampak yang lebih luas.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <Link href="/contact" className="inline-block">
                <Button size="lg" variant="secondary">
                  Hubungi Kami
                </Button>
              </Link>
            </FadeIn>
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
            contextTitle="Fungsionaris GenBI Korkom Jatim"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
