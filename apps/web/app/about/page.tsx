import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionHeader } from "@/components/SectionHeader";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import Image from "next/image";
import { BPHMember } from "@repo/types";
import { getKorkomData, getSharedEvents } from "@/lib/services/profile.service";
import {
  Crown,
  Shield,
  Heart,
  Users,
  Briefcase,
  Megaphone,
  Rocket,
  Calendar,
  Download,
  BookOpen,
  Presentation,
  ArrowRight,
  Target,
} from "lucide-react";

/* 
 * Server Component for About Page
 * Matches "Bright Premium" aesthetic
 */

function ProfileCard({ member }: { member: BPHMember }) {
  return (
    <div className="group bg-white rounded-[2rem] p-4 flex gap-5 items-center shadow-lg shadow-slate-200/40 border border-slate-100/80 hover:shadow-xl hover:-translate-y-2 transition-[transform,colors,shadow] duration-200 ease-[cubic-bezier(0,0.55,0.45,1)]">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 flex-shrink-0 relative">
        <Image
          src={member.image || "/assets/images/profile-placeholder.jpg"}
          alt={member.name}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-500"
        />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="font-bold text-slate-900 text-base md:text-lg leading-snug line-clamp-1 mb-1">
          {member.name}
        </h4>
        <p className="text-xs md:text-sm font-semibold text-blue-600 mb-0.5 line-clamp-1">
          {member.role}
        </p>
        <p className="text-[10px] md:text-xs text-slate-500 line-clamp-1">
          {member.university}
        </p>
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const [korkomData, sharedEvents] = await Promise.all([
    getKorkomData(),
    getSharedEvents(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-600 selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 lg:pt-40">
        
        {/* --- HERO SECTION --- */}
        <section className="container mx-auto px-6 relative z-10 mb-20 py-24 md:py-32 text-center">
          <SlideUp once delay={0.1}>
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100/50 text-blue-700 font-semibold text-sm mb-6 border border-blue-200/50">
              Mengenal Komunitas Kami
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Tentang <span className="text-blue-600">GenBI Jatim</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {korkomData.description || "GenBI Jawa Timur adalah inkubator kepemimpinan yang dirancang untuk mencetak generasi Energi Baru. Di sini, integritas intelektual bertemu dengan kepekaan sosial."}
            </p>
          </SlideUp>
        </section>

        {/* --- VISI & MISI --- */}
        <section className="container mx-auto px-6 mb-24 relative z-10">
          <div className="max-w-4xl mx-auto">
            <FadeIn once delay={0.2}>
              <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10 opacity-70"></div>
                
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/80 flex items-center justify-center text-blue-600 border border-blue-200/50">
                      <Target className="w-6 h-6 transform-gpu origin-center" strokeWidth={2} />
                    </div>
                    Visi Kami
                  </h2>
                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                    {korkomData.vision || "Mewujudkan GenBI Jawa Timur sebagai wadah kolaborasi sinergis antar komisariat yang berdampak nyata bagi masyarakat dan lingkungan."}
                  </p>
                </div>

                <div className="w-full h-px bg-slate-100 my-10 md:my-12"></div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 border border-emerald-200/50">
                      <Rocket className="w-6 h-6 transform-gpu origin-center" strokeWidth={2} />
                    </div>
                    Misi Kami
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      "Memperkuat solidaritas dan komunikasi lintas komisariat melalui kegiatan kolaboratif.",
                      "Menghadirkan program berdampak yang selaras dengan pilar utama Bank Indonesia.",
                      "Mempererat hubungan serta membangun jejaring strategis antara anggota aktif dan alumni.",
                      "Mewujudkan sistem pelaporan kinerja yang terukur, transparan, dan berkelanjutan."
                    ].map((misi, i) => (
                      <div key={i} className="flex gap-5 bg-slate-50/70 hover:bg-slate-50 p-6 rounded-[2rem] border border-slate-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white text-emerald-600 font-bold flex items-center justify-center shadow-sm border border-slate-200/60 mt-1">
                          {i + 1}
                        </div>
                        <p className="text-base text-slate-600 leading-relaxed pt-1 font-medium">
                          {misi}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* --- 3 PILAR PERAN UTAMA --- */}
        <section className="py-20 bg-slate-100/50 mb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
          <div className="container mx-auto px-6 relative z-10">
            <FadeIn once>
              <SectionHeader
                title="3 Pilar Peran Utama"
                align="center"
                description="Tiga fungsi strategis yang dijalankan setiap anggota GenBI sebagai mitra Bank Indonesia."
              />
            </FadeIn>
            <StaggerContainer once className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
              {[
                {
                  title: "Front-liners",
                  desc: "Garda terdepan dalam mengkomunikasikan kebijakan Bank Indonesia kepada masyarakat.",
                  icon: <Megaphone className="w-10 h-10" strokeWidth={1.5} />,
                  color: "text-blue-600",
                  bg: "bg-blue-50"
                },
                {
                  title: "Agent of Change",
                  desc: "Agen perubahan yang membawa inovasi dan solusi bagi permasalahan sosial ekonomi.",
                  icon: <Rocket className="w-10 h-10" strokeWidth={1.5} />,
                  color: "text-purple-600",
                  bg: "bg-purple-50"
                },
                {
                  title: "Future Leaders",
                  desc: "Calon pemimpin masa depan yang berintegritas dan berdedikasi untuk negeri.",
                  icon: <Crown className="w-10 h-10" strokeWidth={1.5} />,
                  color: "text-amber-600",
                  bg: "bg-amber-50"
                },
              ].map((value, i) => (
                <StaggerItem key={i}>
                  <div className="h-full bg-white rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center shadow-lg shadow-slate-200/40 border border-slate-100 group hover:-translate-y-2 transition-transform duration-200 ease-[cubic-bezier(0,0.55,0.45,1)]">
                    <div className={`w-20 h-20 rounded-2xl ${value.bg} ${value.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {value.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* --- NILAI & BUDAYA KERJA --- */}
        <section className="container mx-auto px-6 relative z-10 mb-24">
          <FadeIn once>
            <SectionHeader
              title="Nilai & Budaya"
              description="Prinsip dasar yang menjadi DNA setiap langkah dan keputusan kami."
              align="center"
            />
          </FadeIn>

          <StaggerContainer once className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mt-12">
            {[
              {
                title: "Dedikasi",
                icon: <Heart className="w-8 h-8" strokeWidth={1.5} />,
                desc: "Berkomitmen penuh memberikan kontribusi terbaik tanpa pamrih.",
                color: "text-rose-600",
                bg: "bg-rose-50 border-rose-100"
              },
              {
                title: "Integritas",
                icon: <Shield className="w-8 h-8" strokeWidth={1.5} />,
                desc: "Menjunjung tinggi kejujuran dan etika dalam setiap tindakan.",
                color: "text-emerald-600",
                bg: "bg-emerald-50 border-emerald-100"
              },
              {
                title: "Profesional",
                icon: <Briefcase className="w-8 h-8" strokeWidth={1.5} />,
                desc: "Bekerja dengan standar tinggi, kompeten, dan bertanggung jawab.",
                color: "text-indigo-600",
                bg: "bg-indigo-50 border-indigo-100"
              },
              {
                title: "Sinergi",
                icon: <Users className="w-8 h-8" strokeWidth={1.5} />,
                desc: "Kekuatan kolaborasi untuk mencapai dampak yang lebih besar.",
                color: "text-orange-600",
                bg: "bg-orange-50 border-orange-100"
              },
            ].map((val, i) => (
              <StaggerItem key={i}>
                <div className="h-full bg-white rounded-[2rem] p-8 flex flex-col items-center text-center shadow-md shadow-slate-200/50 border border-slate-100 group relative overflow-hidden">
                  <div className={`w-16 h-16 rounded-2xl ${val.bg} ${val.color} flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-200 ease-[cubic-bezier(0,0.55,0.45,1)] border`}>
                    {val.icon}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">
                    {val.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {val.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* --- SEJARAH PERJALANAN (TIMELINE) --- */}
        <section className="py-24 bg-white relative overflow-hidden border-y border-slate-100 mb-24">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 hidden md:block"></div>

          <div className="container mx-auto px-6 relative z-10">
            <FadeIn once>
              <SectionHeader
                title="Sejarah Perjalanan"
                description="Rekam jejak dedikasi GenBI Jawa Timur dari masa ke masa."
                align="center"
              />
            </FadeIn>

            <div className="space-y-12 md:space-y-0 relative max-w-5xl mx-auto mt-16">
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
                    once
                    key={i}
                    className={`flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-0 ${
                      !isEven ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Content Side */}
                    <div
                      className={`w-full md:w-1/2 flex flex-col items-center md:pt-4 ${
                        isEven
                          ? "md:items-end md:text-right md:pr-16"
                          : "md:items-start md:text-left md:pl-16"
                      } relative`}
                    >
                      <span className="text-blue-600 font-bold tracking-widest mb-2 block text-xl bg-blue-50 px-4 py-1 rounded-full border border-blue-100">
                        {item.year}
                      </span>
                      <h3
                        className={`text-2xl font-bold tracking-tight text-slate-900 ${
                          isLast ? "mb-0" : "mb-3"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed font-medium max-w-[20rem]">
                        {item.desc}
                      </p>
                    </div>

                    {/* Timeline Dot (Desktop Center) */}
                    <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border-4 border-slate-100 z-20 mt-4">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    </div>

                    {/* Empty Side for Balance */}
                    <div className="w-full md:w-1/2 hidden md:block"></div>
                  </SlideUp>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- PENGURUS HARIAN (BPH) --- */}
        <section className="container mx-auto px-6 mb-24 relative z-10">
          <FadeIn once>
            <SectionHeader
              title="Badan Pengurus Harian"
              description="Tim inti yang memandu roda organisasi dengan integritas dan profesionalitas."
              align="center"
            />
          </FadeIn>
          
          {korkomData.bph && korkomData.bph.length > 0 ? (
            <StaggerContainer once className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto md:mt-12 mt-8">
              {korkomData.bph.map((member, i) => (
                <StaggerItem key={`bph-${i}`}>
                  <ProfileCard member={member} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
             <div className="text-center py-16 px-6 bg-white rounded-[2rem] border border-slate-100 mt-12 max-w-3xl mx-auto flex flex-col items-center">
               <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] border border-slate-100 flex items-center justify-center mb-6">
                 <Users className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold tracking-tight text-slate-700 mb-2">Struktur BPH Sedang Disusun</h3>
               <p className="text-slate-500 max-w-md">Data kepengurusan saat ini belum dipublikasikan oleh administrator.</p>
             </div>
          )}
        </section>

        {/* --- DIVISI / DEPARTEMEN --- */}
        <section className="container mx-auto px-6 relative z-10 mb-24">
          <FadeIn once>
            <SectionHeader
              title="Divisi dan Peran"
              description="Pilar-pilar penggerak program kerja GenBI Jawa Timur yang berdedikasi."
              align="center"
            />
          </FadeIn>
          
          {korkomData.divisions && korkomData.divisions.length > 0 ? (
            <StaggerContainer once className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:mt-12 mt-8">
               {korkomData.divisions.map((member, i) => (
                <StaggerItem key={`div-${i}`}>
                   <ProfileCard member={member} />
                </StaggerItem>
               ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-[2rem] border border-slate-100 mt-12 max-w-3xl mx-auto flex flex-col items-center">
               <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] border border-slate-100 flex items-center justify-center mb-6">
                 <Briefcase className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold tracking-tight text-slate-700 mb-2">Struktur Divisi Sedang Disusun</h3>
               <p className="text-slate-500 max-w-md">Data departemen saat ini belum dipublikasikan oleh administrator.</p>
             </div>
          )}
        </section>

        {/* --- PROGRAM KERJA (EVENTS) --- */}
        <section className="py-24 bg-slate-100/50 mb-24 border-y border-slate-100">
          <div className="container mx-auto px-6 relative z-10">
            <FadeIn once>
              <SectionHeader
                title="Program Kerja Bersama"
                description="Agenda dan inisiatif berdampak yang kami laksanakan sebagai wujud dedikasi untuk masyarakat."
                align="center"
              />
            </FadeIn>

            {sharedEvents && sharedEvents.length > 0 ? (
              <StaggerContainer once className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
                {sharedEvents.map((event, i) => (
                  <StaggerItem key={event.id || i}>
                    <div className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-transform duration-200 ease-[cubic-bezier(0,0.55,0.45,1)] flex flex-col h-full">
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <Image
                          src={event.image || "/assets/images/placeholder.jpg"}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            GenBI Jatim
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{event.date || "TBA"}</span>
                        </div>
                        <h3 className="font-bold tracking-tight text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-6 flex-1">
                          {event.description || "Agenda program kerja GenBI Jatim."}
                        </p>
                        <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                          Lihat Detail <ArrowRight className="w-4 h-4 ml-1 transform-gpu origin-center" strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-[2rem] border border-slate-100 mt-12 max-w-3xl mx-auto flex flex-col items-center shadow-sm">
                 <div className="w-20 h-20 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6">
                   <Calendar className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold tracking-tight text-slate-700 mb-2">Belum Ada Program Kerja</h3>
                 <p className="text-slate-500 max-w-md">Agenda kegiatan saat ini belum dipublikasikan. Nantikan informasi selanjutnya.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- DOKUMEN & LPJ --- */}
        <section className="container mx-auto px-6 relative z-10 mb-24">
          <FadeIn once>
            <SectionHeader
              title="Arsip & Dokumen Publik"
              description="Transparansi laporan pertanggungjawaban dan ketetapan organisasi."
              align="center"
            />
          </FadeIn>

          <div className="max-w-4xl mx-auto mt-12">
            {korkomData.documents && korkomData.documents.length > 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                {korkomData.documents.map((doc, i) => (
                  <div key={doc.id || i} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors ${i !== korkomData.documents.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div className="flex gap-4 items-center mb-4 sm:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.type === 'SK' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {doc.type === 'SK' ? <Presentation className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold tracking-tight text-slate-900 text-base mb-1">{doc.title}</h4>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <span className="uppercase tracking-wider text-slate-400">{doc.fileType || "PDF"}</span>
                          <span>•</span>
                          <span>{doc.size || "Unknown Size"}</span>
                          <span>•</span>
                          <span>{doc.date || "Unknown Date"}</span>
                        </div>
                      </div>
                    </div>
                    <a href={doc.url || "#"} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:-translate-y-2 transition-transform duration-200 ease-[cubic-bezier(0,0.55,0.45,1)] font-semibold py-2.5 px-6 rounded-[2rem] shadow-sm">
                      <Download className="w-4 h-4" /> Unduh
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center">
                 <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-6">
                   <BookOpen className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold tracking-tight text-slate-700 mb-2">Dokumen Belum Tersedia</h3>
                 <p className="text-slate-500 max-w-md">Arsip LPJ, SK, atau Proposal saat ini sedang dipersiapkan oleh administrator.</p>
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
