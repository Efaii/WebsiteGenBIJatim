"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

// Constants
const UNIVERSITIES = [
  "Semua",
  "UNESA",
  "UNAIR",
  "ITS",
  "UINSA",
  "UPN Veteran Jatim",
  "UTM",
  "UNUGIRI",
  "PENS",
  "UIN Madura",
];

// Generate dummy data
const generateMockData = () => {
  const majors = [
    "Teknik Informatika",
    "Sistem Informasi",
    "Kedokteran",
    "Hukum",
    "Ekonomi",
    "Psikologi",
    "Teknik Sipil",
    "Sastra Inggris",
    "Manajemen",
    "Ilmu Komunikasi",
  ];
  const data = [];
  for (let i = 1; i <= 60; i++) {
    const uni =
      UNIVERSITIES[Math.floor(Math.random() * (UNIVERSITIES.length - 1)) + 1];
    data.push({
      id: i,
      name: `Awardee GenBI ${i}`,
      university: uni,
      major: majors[Math.floor(Math.random() * majors.length)],
      generation: Math.random() > 0.5 ? "2024" : "2023",
      year: Math.random() > 0.5 ? "2023" : "2022",
    });
  }
  return data;
};

const MOCK_AWARDEES = generateMockData();

export default function AwardeePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const itemsPerPage = 10;

  const filteredAwardees = MOCK_AWARDEES.filter((awardee) => {
    const matchesSearch =
      awardee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awardee.major.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUni =
      selectedUniversity === "Semua" ||
      awardee.university === selectedUniversity;
    return matchesSearch && matchesUni;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAwardees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAwardees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col font-sans bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <main className="flex-1 w-full relative z-10">
        {/* Header */}
        <section className="relative py-20 overflow-hidden">
          <div className="container relative px-6 mx-auto text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                Penerima Beasiswa{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200">
                  GenBI Jatim
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-blue-100/70 leading-relaxed">
                Data lengkap penerima beasiswa Bank Indonesia dari berbagai
                komisariat di Jawa Timur. Bukti nyata dedikasi dan prestasi
                generasi muda.
              </p>
            </SlideUp>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 container px-6 mx-auto">
          <FadeIn delay={0.2} className="w-full">
            {/* Visual Filters */}
            <div className="relative z-20 mb-10 bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200/50">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Cari nama atau jurusan..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-400/50 text-white placeholder:text-blue-200/40 font-medium transition-all"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="relative w-full md:w-auto">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full md:w-64 px-6 py-3 pr-10 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-400/50 text-white font-bold text-left hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{selectedUniversity}</span>
                  <span
                    className={`transition-transform duration-200 text-blue-200/60 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto no-scrollbar">
                    <div className="p-1 space-y-1">
                      {UNIVERSITIES.map((uni) => (
                        <button
                          key={uni}
                          onClick={() => {
                            setSelectedUniversity(uni);
                            setCurrentPage(1);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            selectedUniversity === uni
                              ? "bg-cyan-500/20 text-cyan-200"
                              : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {uni}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overlay to close dropdown when clicking outside */}
                {isDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}
              </div>
            </div>

            {/* Table Data Card */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/10 border-b border-white/10">
                      <th className="p-6 text-xs font-bold text-blue-200 uppercase tracking-widest">
                        Nama Lengkap
                      </th>
                      <th className="p-6 text-xs font-bold text-blue-200 uppercase tracking-widest hidden md:table-cell">
                        Universitas
                      </th>
                      <th className="p-6 text-xs font-bold text-blue-200 uppercase tracking-widest hidden sm:table-cell">
                        Jurusan
                      </th>
                      <th className="p-6 text-xs font-bold text-blue-200 uppercase tracking-widest text-center">
                        Angkatan GenBI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentItems.length > 0 ? (
                      currentItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="p-6 font-semibold text-white group-hover:text-cyan-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-cyan-200 border border-white/10">
                                {item.name.substring(0, 2).toUpperCase()}
                              </div>
                              {item.name}
                            </div>
                          </td>
                          <td className="p-6 text-blue-100/70 font-medium hidden md:table-cell">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-white/10 text-cyan-200 border border-white/10">
                              {item.university}
                            </span>
                          </td>
                          <td className="p-6 text-blue-100/70 hidden sm:table-cell">
                            {item.major}
                          </td>
                          <td className="p-6 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-white/10 text-blue-200 border border-white/10">
                              {item.generation}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-12 text-center text-slate-400"
                        >
                          Data tidak ditemukan untuk pencarian ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-sm text-blue-200/60">
                    Menampilkan {indexOfFirstItem + 1} -{" "}
                    {Math.min(indexOfLastItem, filteredAwardees.length)} dari{" "}
                    {filteredAwardees.length} data
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 md:h-9"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-cyan-200 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 md:h-9"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <div className="mt-6 text-center text-sm text-slate-400">
              Menampilkan {filteredAwardees.length} dari {MOCK_AWARDEES.length}{" "}
              data
            </div>
          </FadeIn>
        </section>
      </main>

      <div className="relative border-t border-white/10">
        <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-3xl -z-10"></div>
        <Footer />
      </div>
    </div>
  );
}
