"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/Card";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { PageBackground } from "@/components/PageBackground";
import { NewsItem } from "@/app/types"; // Ensure types are imported

interface NewsClientProps {
  initialNews: NewsItem[];
}

export default function NewsClient({ initialNews }: NewsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "All">(
    "All",
  );

  const categories = [
    "All",
    "Kegiatan",
    "Webinar",
    "Sosial",
    "Edukasi",
    "Pelatihan",
  ];

  const filteredNews = initialNews.filter((news) => {
    const matchesSearch = news.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Background Blobs (Standardized) */}
      <PageBackground variant="default" />

      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <SlideUp className="flex flex-col items-center space-y-4 mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Berita & Kegiatan Jatim
          </h1>
          <p className="text-lg text-blue-100/70 max-w-2xl">
            Informasi terkini, artikel, dan highlight kegiatan GenBI tingkat
            provinsi Jawa Timur.
          </p>
        </SlideUp>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                    : "bg-white/5 text-blue-100/80 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berita..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400/50 focus:ring-0 placeholder:text-blue-200/40 transition-all font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/50"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <StaggerContainer
            key={selectedCategory + searchTerm} // Force re-render on filter change
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredNews.map((news) => (
              <StaggerItem key={news.id}>
                <Link
                  href={`/news/${news.title.toLowerCase().replace(/ /g, "-")}`}
                  className="block h-full"
                >
                  <Card className="group bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer">
                    <div
                      className={`h-48 w-full ${news.image_color} relative overflow-hidden flex items-center justify-center`}
                    >
                      {/* Image or Placeholder */}
                      {news.image ? (
                        <img
                          src={news.image}
                          alt={news.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-primary/20 transform group-hover:scale-110 transition-transform duration-500">
                          <svg
                            className="w-20 h-20"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-bold rounded-full shadow-sm">
                          {news.category}
                        </span>
                      </div>
                    </div>
                    <CardHeader className="p-6 pb-2">
                      <div className="text-xs font-medium text-blue-200/60 mb-2 flex items-center gap-2">
                        <span>📅 {news.date}</span>
                      </div>
                      <CardTitle className="text-xl font-bold leading-snug text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {news.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 flex-1">
                      <p className="text-blue-100/70 text-sm leading-relaxed line-clamp-3">
                        {news.snippet}
                      </p>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 mt-auto">
                      <span className="text-sm font-semibold text-cyan-200 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Baca Selengkapnya <span>→</span>
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-blue-200/50 mb-4 text-3xl">
              🔍
            </div>
            <h3 className="text-lg font-semibold text-white">
              Tidak ada berita ditemukan
            </h3>
            <p className="text-blue-100/60">
              Coba ubah kata kunci pencarian atau kategori.
            </p>
          </div>
        )}
      </main>

      <div className="relative border-t border-white/10">
        <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-3xl -z-10"></div>
        <Footer />
      </div>
    </div>
  );
}
