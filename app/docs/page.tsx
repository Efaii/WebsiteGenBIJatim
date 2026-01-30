"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";

// Icons
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Mock Documents
const CATEGORIES = ["Semua", "Template", "Panduan", "SOP", "Materi", "Laporan"];

const DOCUMENTS = [
  {
    id: 1,
    title: "Template Surat Peminjaman Tempat",
    category: "Template",
    type: "DOCX",
    size: "245 KB",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Template Surat Undangan Pemateri",
    category: "Template",
    type: "DOCX",
    size: "180 KB",
    date: "2024-01-20",
  },
  {
    id: 3,
    title: "Panduan Laporan Pertanggungjawaban (LPJ)",
    category: "Panduan",
    type: "PDF",
    size: "1.2 MB",
    date: "2023-12-10",
  },
  {
    id: 4,
    title: "SOP Media Sosial GenBI Jatim",
    category: "SOP",
    type: "PDF",
    size: "3.5 MB",
    date: "2023-11-05",
  },
  {
    id: 5,
    title: "Template Proposal Kegiatan",
    category: "Template",
    type: "DOCX",
    size: "500 KB",
    date: "2024-02-01",
  },
  {
    id: 6,
    title: "Materi Leadership Camp Day 1",
    category: "Materi",
    type: "PDF",
    size: "5.2 MB",
    date: "2023-12-11",
  },
  {
    id: 7,
    title: "Materi Leadership Camp Day 2",
    category: "Materi",
    type: "PDF",
    size: "4.8 MB",
    date: "2023-12-12",
  },
  {
    id: 8,
    title: "Template Sertifikat Peserta",
    category: "Template",
    type: "PPTX",
    size: "2.1 MB",
    date: "2024-02-10",
  },
  {
    id: 9,
    title: "Panduan Pengajuan Beasiswa 2024",
    category: "Panduan",
    type: "PDF",
    size: "890 KB",
    date: "2024-01-01",
  },
  {
    id: 10,
    title: "Laporan Kegiatan Bersih Pantai",
    category: "Laporan",
    type: "PDF",
    size: "3.2 MB",
    date: "2023-10-20",
  },
  {
    id: 11,
    title: "SOP Administrasi Kesekretariatan",
    category: "SOP",
    type: "PDF",
    size: "1.5 MB",
    date: "2023-09-15",
  },
  {
    id: 12,
    title: "Template Press Release Kegiatan",
    category: "Template",
    type: "DOCX",
    size: "120 KB",
    date: "2024-02-15",
  },
  {
    id: 13,
    title: "Materi Workshop Public Speaking",
    category: "Materi",
    type: "PPTX",
    size: "8.5 MB",
    date: "2023-11-20",
  },
  {
    id: 14,
    title: "Laporan Tahunan GenBI 2023",
    category: "Laporan",
    type: "PDF",
    size: "12.5 MB",
    date: "2023-12-30",
  },
  {
    id: 15,
    title: "Template RAB Kegiatan",
    category: "Template",
    type: "XLSX",
    size: "45 KB",
    date: "2024-01-10",
  },
  {
    id: 16,
    title: "Panduan Desain Grafis GenBI",
    category: "Panduan",
    type: "PDF",
    size: "5.6 MB",
    date: "2023-10-05",
  },
  {
    id: 17,
    title: "SOP Keuangan dan Bendahara",
    category: "SOP",
    type: "PDF",
    size: "2.1 MB",
    date: "2023-09-01",
  },
  {
    id: 18,
    title: "Template Surat Tugas Anggota",
    category: "Template",
    type: "DOCX",
    size: "110 KB",
    date: "2024-02-05",
  },
  {
    id: 19,
    title: "Materi Kebanksentralan BI",
    category: "Materi",
    type: "PDF",
    size: "3.4 MB",
    date: "2023-11-15",
  },
  {
    id: 20,
    title: "Laporan Kegiatan Sosialisasi QRIS",
    category: "Laporan",
    type: "PDF",
    size: "2.8 MB",
    date: "2023-11-25",
  },
  {
    id: 21,
    title: "Template Absensi Peserta",
    category: "Template",
    type: "XLSX",
    size: "30 KB",
    date: "2024-01-25",
  },
  {
    id: 22,
    title: "Panduan Mengelola Website Komisariat",
    category: "Panduan",
    type: "PDF",
    size: "1.8 MB",
    date: "2023-10-15",
  },
  {
    id: 23,
    title: "SOP Publikasi Media",
    category: "SOP",
    type: "PDF",
    size: "1.3 MB",
    date: "2023-09-10",
  },
  {
    id: 24,
    title: "Materi Kewirausahaan Digital",
    category: "Materi",
    type: "PPTX",
    size: "6.7 MB",
    date: "2023-12-05",
  },
  {
    id: 25,
    title: "Template MoMT Rapat Bulanan",
    category: "Template",
    type: "DOCX",
    size: "150 KB",
    date: "2024-02-20",
  },
  {
    id: 26,
    title: "Laporan Keuangan Semester 1",
    category: "Laporan",
    type: "PDF",
    size: "4.2 MB",
    date: "2023-07-15",
  },
  {
    id: 27,
    title: "Panduan Penulisan Artikel Berita",
    category: "Panduan",
    type: "PDF",
    size: "950 KB",
    date: "2023-10-25",
  },
  {
    id: 28,
    title: "Template ID Card Panitia",
    category: "Template",
    type: "PSD",
    size: "15 MB",
    date: "2024-01-05",
  },
  {
    id: 29,
    title: "SOP Peminjaman Inventaris",
    category: "SOP",
    type: "PDF",
    size: "1.1 MB",
    date: "2023-09-20",
  },
  {
    id: 30,
    title: "Materi Personal Branding",
    category: "Materi",
    type: "PDF",
    size: "2.9 MB",
    date: "2023-12-15",
  },
  {
    id: 31,
    title: "Laporan Evaluasi Program Kerja",
    category: "Laporan",
    type: "PDF",
    size: "3.5 MB",
    date: "2023-12-20",
  },
  {
    id: 32,
    title: "Template Surat Balasan Kerjasama",
    category: "Template",
    type: "DOCX",
    size: "160 KB",
    date: "2024-02-25",
  },
];

export default function DocumentPage() {
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const itemsPerPage = 8;

  const filteredDocs = DOCUMENTS.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const docToPreview = DOCUMENTS.find((d) => d.id === selectedDoc);

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-cyan-500 selection:text-white relative overflow-clip">
      <Navbar />

      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <SlideUp className="flex flex-col items-center space-y-4 mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Pusat Dokumen & Panduan
          </h1>
          <p className="text-lg text-blue-100/70 max-w-2xl">
            Akses template surat, panduan beasiswa, dan SOP resmi yang berlaku
            untuk seluruh komisariat di Jawa Timur.
          </p>
        </SlideUp>

        {/* Filters */}
        <div className="relative z-20 mb-10 bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200/50">
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari dokumen..."
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
              <span className="truncate">{selectedCategory}</span>
              <span
                className={`transition-transform duration-200 text-blue-200/60 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-full md:w-64 bg-blue-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto no-scrollbar p-2 flex flex-col gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-full text-base font-medium transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-cyan-500/20 text-cyan-200 font-bold"
                        : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Overlay to close dropdown */}
            {isDropdownOpen && (
              <div
                className="fixed inset-0 z-40 bg-transparent cursor-default"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/10 text-blue-200 border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Nama Dokumen</th>
                  <th className="px-6 py-5 font-bold hidden md:table-cell">
                    Kategori
                  </th>
                  <th className="px-6 py-5 font-bold hidden sm:table-cell">
                    Tipe
                  </th>
                  <th className="px-6 py-5 font-bold hidden lg:table-cell">
                    Tanggal Update
                  </th>
                  <th className="px-6 py-5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.map((doc) => (
                  <tr
                    key={doc.id}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-5 font-medium text-white">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm ${
                            doc.type === "PDF"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {doc.type}
                        </div>
                        <span className="text-base font-semibold text-white group-hover:text-cyan-200 transition-colors">
                          {doc.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-blue-600 hidden md:table-cell">
                      <span className="inline-flex items-center rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-xs font-medium text-cyan-200">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-blue-100/60 hidden sm:table-cell font-mono text-xs">
                      {doc.size}
                    </td>
                    <td className="px-6 py-5 text-blue-100/60 hidden lg:table-cell">
                      {doc.date}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-3 transition-opacity">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-2 px-4"
                          onClick={() => setSelectedDoc(doc.id)}
                          title="Lihat Pratinjau Dokumen"
                        >
                          <EyeIcon />
                          <span className="hidden lg:inline">Lihat</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-blue-200/60">
                Menampilkan {indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, filteredDocs.length)} dari{" "}
                {filteredDocs.length} dokumen
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
        </div>

        {/* Improved Preview Modal */}
        {selectedDoc && docToPreview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all animate-in fade-in duration-200">
            <div className="bg-[#0f172a]/90 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-white/10 ring-1 ring-white/10">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                      docToPreview.type === "PDF"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {docToPreview.type}
                  </div>
                  <h3 className="font-bold text-lg text-white">
                    {docToPreview.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors focus:outline-none cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="p-12 overflow-auto flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
                <div className="text-center space-y-6 max-w-sm">
                  <div className="w-32 h-32 mx-auto bg-white/5 rounded-full shadow-lg flex items-center justify-center text-blue-200 relative border border-white/10">
                    <span className="text-6xl grayscale-0">📄</span>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-500 rounded-full border-4 border-[#0f172a]"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-xl text-white">
                      Preview Belum Tersedia
                    </h4>
                    <p className="text-blue-100/60">
                      File ini ({docToPreview.size}) tersimpan di server aman.
                      Silakan unduh untuk melihat isinya.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full"
                    onClick={() => alert("Downloading " + docToPreview.title)}
                  >
                    Unduh Sekarang
                  </Button>
                </div>
              </div>
            </div>
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
