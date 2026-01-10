import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/Card";
import Link from "next/link";
import Image from "next/image";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { LogoTicker } from "@/components/LogoTicker";
import { FAQ } from "@/components/FAQ";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Newspaper,
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import CountUp from "@/components/CountUp";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob optimize-gpu"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000 optimize-gpu"></div>
      <Navbar />

      <main className="flex-1">
        {/* Modern Hero Section - Clean & Minimalist (Dark Blue Theme) */}
        <section className="relative w-full h-[calc(100vh-5rem)] max-h-[1080px] min-h-[500px] flex items-center overflow-hidden">
          {/* Subtle Background Elements (Mesh Gradient) */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none mix-blend-screen optimize-gpu"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none mix-blend-screen optimize-gpu"></div>
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen optimize-gpu"></div>

          <div className="container relative px-6 md:px-12 lg:px-12 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column: Text Content */}
              <div className="flex flex-col items-start space-y-5 z-10 text-left lg:pl-20">
                <FadeIn
                  delay={0.1}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm shadow-sm text-sm font-medium text-blue-100 transition-colors hover:bg-white/20 hover:border-white/30 cursor-default"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  GenBI Jatim 2025/2026
                </FadeIn>

                <SlideUp delay={0.2} className="space-y-3">
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white leading-[1.1]">
                    Energi Baru <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200 drop-shadow-sm whitespace-nowrap">
                      Untuk Indonesia
                    </span>
                  </h1>
                  <p className="max-w-xl text-base md:text-lg text-blue-100/80 leading-relaxed font-light">
                    Komunitas penerima Beasiswa Bank Indonesia di Jawa Timur.
                    Menjadi garda terdepan transformasi bangsa sebagai{" "}
                    <span className="font-semibold text-white">
                      Front-liner, Agent of Change,
                    </span>{" "}
                    dan{" "}
                    <span className="font-semibold text-white">
                      Future Leaders.
                    </span>
                  </p>
                </SlideUp>

                <FadeIn
                  delay={0.4}
                  className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2"
                >
                  <Link href="/about" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto rounded-full transition-all duration-300"
                    >
                      Profil Lengkap
                    </Button>
                  </Link>
                  <Link href="/commissariat" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto rounded-full transition-all duration-300"
                    >
                      Data Komisariat
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </Button>
                  </Link>
                </FadeIn>

                {/* Stats in Hero */}
                <FadeIn delay={0.6} className="pt-6 w-full max-w-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6">
                    {[
                      {
                        label: "Komisariat",
                        value: "9",
                        number: 9,
                        suffix: "",
                      },
                      {
                        label: "Anggota",
                        value: "500+",
                        number: 500,
                        suffix: "+",
                      },
                      {
                        label: "Proker",
                        value: "50+",
                        number: 50,
                        suffix: "+",
                      },
                      { label: "Dampak", value: "∞", number: null, suffix: "" },
                    ].map((stat, i) => (
                      <div key={i} className="flex flex-col items-start">
                        <div className="text-xl md:text-2xl font-extrabold text-white mb-0.5 flex items-center">
                          {stat.number ? (
                            <>
                              <CountUp to={stat.number} />
                              {stat.suffix}
                            </>
                          ) : (
                            stat.value
                          )}
                        </div>
                        <div className="text-[10px] md:text-xs font-medium text-blue-200 uppercase tracking-wider">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </div>

              {/* Right Column: Elegant Composition */}
              <div className="relative z-10 hidden lg:flex h-full min-h-[500px] w-full flex-col justify-center items-center">
                <div className="relative w-full max-w-[450px] mx-auto h-[450px]">
                  {/* Decorative Glows */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

                  {/* Main Image (Back) - Positioned higher and right for less overlap */}
                  <FadeIn
                    delay={0.4}
                    className="absolute top-0 right-4 w-[280px] h-[380px] rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl shadow-blue-900/40 rotate-2 transition-transform duration-700 hover:rotate-0 z-10 group"
                  >
                    <Image
                      src="/assets/images/bnsp.jpg"
                      alt="Ketua Divisi Berdiskusi"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 to-transparent"></div>
                  </FadeIn>

                  {/* Secondary Image (Front) - Positioned lower left, preserving visibility */}
                  <FadeIn
                    delay={0.6}
                    className="absolute bottom-8 left-8 w-[200px] h-[150px] rounded-[1.5rem] overflow-hidden border-4 border-white/10 shadow-2xl shadow-black/40 -rotate-3 transition-transform duration-700 hover:-rotate-0 z-20 group"
                  >
                    <Image
                      src="/assets/images/raker.jpg"
                      alt="Kegiatan GenBI"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </FadeIn>

                  {/* Floating Glass Badge */}
                  <SlideUp
                    delay={0.8}
                    className="absolute bottom-16 -right-0 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl z-30 flex items-center gap-3 animate-float"
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center p-2">
                      <Image
                        src="/assets/logos/genbi.svg"
                        alt="GenBI Logo"
                        width={24}
                        height={24}
                        className="w-full h-full object-contain brightness-0 invert"
                      />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">GenBI</p>
                      <p className="text-blue-200 text-xs">Jawa Timur</p>
                    </div>
                  </SlideUp>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Organization Scope Context */}
        <section className="py-20 relative z-10 bg-white/5 border-y border-white/5">
          <div className="container mx-auto px-6 text-center">
            <SectionHeader
              title={
                <>
                  Sinergi di Bawah Naungan <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200 drop-shadow-sm whitespace-nowrap">
                    KPw BI Provinsi Jawa Timur
                  </span>
                </>
              }
              description="GenBI Koordinator Komisariat Jawa Timur menaungi mahasiswa penerima beasiswa Bank Indonesia dari 9 Perguruan Tinggi Negeri dan Swasta di wilayah Surabaya, Madura, dan Bojonegoro. Kami bersinergi untuk mengembangkan potensi kepemimpinan dan berkontribusi bagi masyarakat."
              className="mb-0"
            />
          </div>
        </section>

        {/* Infinite Logo Ticker */}
        <LogoTicker />

        {/* Quick Access / Portal Grid */}
        <section className="py-20 relative z-10 bg-white/5 border-y border-white/5">
          <div className="container px-6 mx-auto">
            <SectionHeader
              title="Jelajahi Platform GenBI Jatim"
              description="Semua fitur dan informasi yang Anda butuhkan, ada di sini."
            />

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Profil Kampus Mitra",
                  desc: "Pantau profil dan kinerja 9 Komisariat.",
                  icon: (
                    <LayoutDashboard className="w-10 h-10" strokeWidth={1.5} />
                  ),
                  link: "/commissariat",
                  color: "from-blue-500 to-indigo-600",
                },
                {
                  title: "Pusat Dokumen",
                  desc: "Unduh SOP, Panduan, dan Template surat.",
                  icon: <FileText className="w-10 h-10" strokeWidth={1.5} />,
                  link: "/docs",
                  color: "from-emerald-500 to-teal-600",
                },
                {
                  title: "Database Awardee",
                  desc: "Cari data penerima beasiswa se-Jatim.",
                  icon: (
                    <GraduationCap className="w-10 h-10" strokeWidth={1.5} />
                  ),
                  link: "/awardee",
                  color: "from-orange-500 to-red-600",
                },
                {
                  title: "Kabar & Berita",
                  desc: "Informasi kegiatan terbaru GenBI Jatim.",
                  icon: <Newspaper className="w-10 h-10" strokeWidth={1.5} />,
                  link: "/news",
                  color: "from-purple-500 to-pink-600",
                },
              ].map((item, idx) => (
                <StaggerItem key={idx}>
                  <Link href={item.link}>
                    <Card
                      variant="glass"
                      className="h-full flex flex-col items-center text-center justify-center p-6 group cursor-pointer"
                    >
                      <div className="mb-4 text-blue-200/50 group-hover:text-cyan-400 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-blue-200/70 leading-relaxed">
                        {item.desc}
                      </p>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Testimonials / Impact Stories */}
        <TestimonialsSection />

        {/* Latest News Preview */}
        <section className="w-full py-20 relative bg-white/5 border-y border-white/5">
          <div className="container px-6 mx-auto">
            <SectionHeader
              title="Berita & Kegiatan"
              description="Ikuti jejak langkah dan kegiatan inspiratif dari GenBI Jawa Timur dalam membangun negeri."
            />

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title:
                    "Partisipasi GenBI Jatim dalam Sosialisasi QRIS Nasional",
                  excerpt:
                    "GenBI Jatim turut serta dalam upaya Bank Indonesia memperluas akseptasi digital di kalangan UMKM melalui program sosialisasi masif di 5 kota besar.",
                  tag: "KEGIATAN",
                  date: "20 Okt 2025",
                  image: "/assets/images/raker.jpg",
                  slug: "partisipasi-genbi-jatim-sosialisasi-qris-nasional",
                },
                {
                  title: "Beasiswa Bank Indonesia 2026 Segera Dibuka",
                  excerpt:
                    "Siapkan dirimu! Pendaftaran beasiswa paling bergengsi akan segera dibuka. Simak syarat dan ketentuan lengkapnya di sini.",
                  tag: "PENGUMUMAN",
                  date: "15 Okt 2025",
                  image: "/assets/images/background.jpg",
                  slug: "beasiswa-bank-indonesia-2026-segera-dibuka",
                },
                {
                  title: "GenBI Jatim Raih Penghargaan Komunitas Terbaik",
                  excerpt:
                    "Sebuah pencapaian membanggakan, GenBI Jatim dinobatkan sebagai komunitas paling aktif dan berdampak dalam ajang GenBI Award Nasional tahun ini.",
                  tag: "PRESTASI",
                  date: "01 Okt 2025",
                  image: "/assets/images/bnsp.JPG",
                  slug: "genbi-jatim-raih-penghargaan-komunitas-terbaik",
                },
              ].map((news, i) => (
                <StaggerItem key={i}>
                  <Link href={`/news/${news.slug}`} className="block h-full">
                    <Card
                      variant="glass"
                      className="h-full flex flex-col overflow-hidden group"
                    >
                      <div className="h-48 w-full bg-blue-950/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent opacity-60 z-10"></div>

                        <Image
                          src={news.image}
                          alt={news.title}
                          fill
                          className="object-cover transition-transform duration-700"
                        />

                        <div className="absolute top-4 left-4 z-20">
                          <span className="px-3 py-1 bg-blue-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[10px] font-bold rounded-full shadow-lg uppercase tracking-wider">
                            {news.tag}
                          </span>
                        </div>
                      </div>

                      <CardHeader className="p-6 pb-2">
                        <div className="flex items-center gap-2 text-blue-300/60 text-xs mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                          {news.date}
                        </div>
                        <CardTitle className="text-lg md:text-xl font-bold leading-snug text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {news.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-6 pt-2 flex-1">
                        <p className="text-blue-200/70 leading-relaxed text-sm line-clamp-3">
                          {news.excerpt}
                        </p>
                      </CardContent>

                      <CardFooter className="p-6 pt-0 mt-auto">
                        <span className="text-sm font-semibold text-cyan-400 transition-transform inline-flex items-center gap-1">
                          Baca Selengkapnya
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <div className="mt-12 text-center">
              <FadeIn delay={0.2}>
                <Link href="/news">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Lihat Semua Berita
                  </Button>
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <section className="w-full py-20 relative overflow-hidden bg-white/5 border-y border-white/5">
          {/* Background removed to show global mesh, added subtle glass layer */}

          <div className="container relative px-6 mx-auto text-center z-10 text-white">
            <div className="max-w-4xl mx-auto">
              <SectionHeader
                title="Jadilah Energi Baru untuk InDy onesia Maju"
                description="Bergabunglah dengan ekosistem kepemimpinan terbesar di Jawa Timur. Persiapkan dirimu untuk seleksi penerima beasiswa tahun 2026."
                className="mb-6"
              />
              <FadeIn
                delay={0.4}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/docs">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Panduan & Syarat Beasiswa
                  </Button>
                </Link>
                <a
                  href="https://instagram.com/genbi_jatim"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.149-4.771-1.664-4.919-4.919-.058-1.265-.069-1.644-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      Ikuti Instagram
                    </span>
                  </Button>
                </a>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <div className="relative border-t border-white/10">
        <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-3xl -z-10"></div>
        <Footer />
      </div>
    </div>
  );
}
