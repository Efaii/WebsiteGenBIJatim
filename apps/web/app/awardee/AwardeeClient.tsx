"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Search, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * @component AwardeeClient
 * @description Interactive client component for the Awardee database page with
 * search, filter, and pagination capabilities.
 */

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

export default function AwardeeClient() {
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

  const totalPages = Math.ceil(filteredAwardees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAwardees.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="flex min-h-screen flex-col font-sans bg-white text-slate-900 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl">
          {/* --- HEADER --- */}
          <FadeIn>
            <h1 className="h2 mb-4">
              Database <span className="text-blue-600">Awardee</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mb-8">
              Daftar lengkap penerima beasiswa Bank Indonesia di seluruh
              komisariat Jawa Timur.
            </p>
          </FadeIn>

          {/* --- FILTERS --- */}
          <FadeIn delay={0.1}>
            <div className="flex flex-row gap-2 mb-8 items-center justify-between w-full">
              <div className="relative w-full flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama atau jurusan..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 font-medium transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 py-3 px-4 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-blue-500/20"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {selectedUniversity === "Semua" ? "Filter" : selectedUniversity}
                  </span>
                  {selectedUniversity !== "Semua" && (
                    <span className="sm:hidden w-2 h-2 rounded-full bg-blue-600 ml-1"></span>
                  )}
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1"
                      >
                        {UNIVERSITIES.map((uni) => (
                          <button
                            key={uni}
                            onClick={() => {
                              setSelectedUniversity(uni);
                              setIsDropdownOpen(false);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                              selectedUniversity === uni
                                ? "bg-blue-50 text-blue-700 font-bold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {uni}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </FadeIn>

          {/* --- TABLE --- */}
          <SlideUp delay={0.2}>
            <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-[2rem]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-bold text-slate-900 text-xs uppercase tracking-wider">
                        No.
                      </th>
                      <th className="text-left py-4 px-6 font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="text-left py-4 px-6 font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Universitas
                      </th>
                      <th className="text-left py-4 px-6 font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Jurusan
                      </th>
                      <th className="text-left py-4 px-6 font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Angkatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((awardee, idx) => (
                      <tr
                        key={awardee.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-slate-500">
                          {indexOfFirstItem + idx + 1}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {awardee.name}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {awardee.university}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {awardee.major}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                            {awardee.generation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- PAGINATION --- */}
              <div className="p-4 flex items-center justify-between bg-slate-50 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  {filteredAwardees.length} data ditemukan
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    ← Prev
                  </Button>
                  <span className="text-sm font-bold text-slate-700 px-3">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </Card>
          </SlideUp>
        </div>
      </main>
      <Footer />
    </div>
  );
}
