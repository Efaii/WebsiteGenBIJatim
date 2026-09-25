"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { getAwardees } from "@/lib/services/awardee.service";
import type { Awardee } from "@repo/types";

export default function AwardeePage() {
  const [awardees, setAwardees] = useState<Awardee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    let cancelled = false;
    getAwardees()
      .then((data) => {
        if (!cancelled) setAwardees(data);
      })
      .catch(() => {
        if (!cancelled) setError("Data awardee belum dapat dimuat.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const universities = useMemo(
    () => [
      "Semua",
      ...Array.from(new Set(awardees.map((awardee) => awardee.commissariat.name))).sort(),
    ],
    [awardees],
  );

  const filteredAwardees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return awardees.filter((awardee) => {
      const haystack = [
        awardee.name,
        awardee.major,
        awardee.position,
        awardee.division,
        awardee.commissariat.name,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesUniversity =
        selectedUniversity === "Semua" ||
        awardee.commissariat.name === selectedUniversity;
      return matchesSearch && matchesUniversity;
    });
  }, [awardees, searchTerm, selectedUniversity]);

  const totalPages = Math.max(1, Math.ceil(filteredAwardees.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfFirstItem = (safePage - 1) * itemsPerPage;
  const currentItems = filteredAwardees.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(Math.min(Math.max(pageNumber, 1), totalPages));
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-clip bg-transparent font-sans text-white selection:bg-cyan-500 selection:text-white">
      <Navbar />
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] animate-blob rounded-full bg-blue-500/20 opacity-30 mix-blend-screen blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] animate-blob rounded-full bg-cyan-500/10 opacity-30 mix-blend-screen blur-3xl animation-delay-2000" />

      <main className="relative z-10 w-full flex-1">
        <section className="relative overflow-hidden py-20">
          <div className="container relative mx-auto px-6 text-center">
            <SlideUp>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                Penerima Beasiswa{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-200 bg-clip-text text-transparent">
                  GenBI Jatim
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-blue-100/70">
                Data penerima beasiswa Bank Indonesia periode 2025/2026 dari sembilan komisariat GenBI Jawa Timur.
              </p>
            </SlideUp>
          </div>
        </section>

        <section className="container mx-auto px-6 py-12">
          <FadeIn delay={0.2} className="w-full">
            <div className="relative z-20 mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md md:flex-row">
              <div className="relative w-full md:w-96">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200/50">🔍</span>
                <input
                  type="text"
                  placeholder="Cari nama, prodi, jabatan..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 font-medium text-white placeholder:text-blue-200/40 focus:border-cyan-400/50 focus:outline-none"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="relative w-full md:w-auto">
                <button
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-6 py-3 pr-10 text-left font-bold text-white hover:bg-white/10 md:w-64"
                >
                  <span className="truncate">{selectedUniversity}</span>
                  <span className={isDropdownOpen ? "rotate-180 text-blue-200/60" : "text-blue-200/60"}>▼</span>
                </button>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute left-0 top-full z-50 mt-2 flex max-h-60 w-full flex-col gap-1 overflow-y-auto rounded-2xl border border-white/10 bg-blue-950/90 p-2 shadow-2xl backdrop-blur-2xl md:w-64">
                      {universities.map((university) => (
                        <button
                          key={university}
                          onClick={() => {
                            setSelectedUniversity(university);
                            setCurrentPage(1);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full rounded-full px-4 py-3 text-left text-base font-medium ${selectedUniversity === university ? "bg-cyan-500/20 font-bold text-cyan-200" : "text-blue-100/80 hover:bg-white/10 hover:text-white"}`}
                        >
                          {university}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-md">
              {isLoading ? (
                <div className="p-12 text-center text-blue-100/70">Memuat data awardee...</div>
              ) : error ? (
                <div className="p-12 text-center text-red-200">{error}</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/10">
                          <th className="p-6 text-xs font-bold uppercase tracking-widest text-blue-200">Nama Lengkap</th>
                          <th className="hidden p-6 text-xs font-bold uppercase tracking-widest text-blue-200 md:table-cell">Komisariat</th>
                          <th className="hidden p-6 text-xs font-bold uppercase tracking-widest text-blue-200 sm:table-cell">Prodi</th>
                          <th className="p-6 text-center text-xs font-bold uppercase tracking-widest text-blue-200">Periode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {currentItems.length > 0 ? currentItems.map((item) => (
                          <tr key={item.id} className="group transition-colors hover:bg-white/5">
                            <td className="p-6 font-semibold text-white transition-colors group-hover:text-cyan-200">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[10px] font-bold text-cyan-200">
                                  {item.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div>{item.name}</div>
                                  <div className="mt-1 text-xs font-normal text-blue-100/50">{item.position} · {item.division}</div>
                                </div>
                              </div>
                            </td>
                            <td className="hidden p-6 font-medium text-blue-100/70 md:table-cell">{item.commissariat.name}</td>
                            <td className="hidden p-6 text-blue-100/70 sm:table-cell">{item.major}</td>
                            <td className="p-6 text-center">
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-blue-200">{item.period}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="p-12 text-center text-slate-400">Data tidak ditemukan untuk pencarian ini.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {filteredAwardees.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 p-6 sm:flex-row">
                      <span className="text-sm text-blue-200/60">Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfFirstItem + itemsPerPage, filteredAwardees.length)} dari {filteredAwardees.length} data</span>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" className="h-8 md:h-9" onClick={() => handlePageChange(safePage - 1)} disabled={safePage === 1}>Previous</Button>
                        <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-bold text-cyan-200">Page {safePage} of {totalPages}</span>
                        <Button variant="secondary" size="sm" className="h-8 md:h-9" onClick={() => handlePageChange(safePage + 1)} disabled={safePage === totalPages}>Next</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>

            {!isLoading && !error && <div className="mt-6 text-center text-sm text-slate-400">Menampilkan {filteredAwardees.length} dari {awardees.length} data aktif dan terpublikasi.</div>}
          </FadeIn>
        </section>
      </main>

      <div className="relative border-t border-white/10">
        <div className="absolute inset-0 -z-10 bg-blue-950/50 backdrop-blur-3xl" />
        <Footer />
      </div>
    </div>
  );
}
