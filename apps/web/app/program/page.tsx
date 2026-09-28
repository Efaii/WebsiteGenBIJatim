import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageBackground } from "@/components/PageBackground";
import { ProkerCard } from "@/components/ProkerCard";
import { getAllPrograms } from "@/lib/services/program.service";
import { programDateLabel, publicProgramItems } from "@/lib/program-presentation.mjs";

export const metadata: Metadata = {
  title: "Program Kerja | GenBI Jatim",
  description: "Daftar program kerja GenBI Jawa Timur",
};

const PAGE_SIZE = 8;

export default async function ProgramListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const programs = publicProgramItems(await getAllPrograms());

  const query = (q ?? "").trim();
  const normalizedQuery = query.toLowerCase();
  const filtered = normalizedQuery
    ? programs.filter((item) =>
        [item.title, item.commissariat, item.status, item.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : programs;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (target > 1) params.set("page", String(target));
    const queryString = params.toString();
    return queryString ? `/program?${queryString}` : "/program";
  };

  /* Nomor halaman yang ditampilkan: pertama, terakhir, dan sekitar halaman aktif. */
  const pageLinks: Array<number | "gap"> = [];
  let previousPage = 0;
  for (let candidate = 1; candidate <= totalPages; candidate += 1) {
    const isEdge = candidate === 1 || candidate === totalPages;
    const isNearCurrent = Math.abs(candidate - currentPage) <= 1;
    if (!isEdge && !isNearCurrent) continue;
    if (previousPage && candidate - previousPage > 1) pageLinks.push("gap");
    pageLinks.push(candidate);
    previousPage = candidate;
  }

  const firstShown = filtered.length === 0 ? 0 : startIndex + 1;
  const lastShown = Math.min(startIndex + PAGE_SIZE, filtered.length);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 relative overflow-x-hidden">
      <PageBackground />
      <Navbar />

      <main className="flex-1 w-full relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Program Kerja{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600">
                  GenBI Jatim
                </span>
              </h1>
              <p className="text-slate-600 text-sm md:text-base">
                Kumpulan program kerja GenBI se-Jawa Timur. Gunakan pencarian untuk
                mempersempit daftar.
              </p>
            </div>

            {/* --- SEARCH --- */}
            <form method="get" className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                name="q"
                defaultValue={query}
                aria-label="Cari program kerja"
                placeholder="Cari judul, komisariat, atau status..."
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Cari
              </button>
              {query && (
                <Link
                  href="/program"
                  className="text-sm font-semibold text-slate-500 hover:text-blue-600"
                >
                  Reset
                </Link>
              )}
            </form>

            {filtered.length === 0 ? (
              <div
                role="status"
                className="py-16 text-center text-slate-500 italic border border-dashed border-slate-200 rounded-3xl bg-white/80 backdrop-blur-md"
              >
                {query
                  ? `Tidak ada program kerja yang cocok dengan "${query}".`
                  : "Belum ada program kerja."}
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {pageItems.map((item) => (
                    <ProkerCard
                      key={String(item.id)}
                      href={`/program/${item.id}`}
                      title={item.title}
                      status={item.status}
                      date={programDateLabel(item)}
                      description={item.description}
                      commissariat={item.commissariat}
                    />
                  ))}
                </div>

                {/* --- PAGINATION --- */}
                <nav
                  aria-label="Navigasi halaman program kerja"
                  className="flex flex-col items-center gap-4 pt-4"
                >
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {currentPage > 1 ? (
                      <Link
                        href={pageHref(currentPage - 1)}
                        rel="prev"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600"
                      >
                        Sebelumnya
                      </Link>
                    ) : (
                      <span className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-300">
                        Sebelumnya
                      </span>
                    )}

                    {pageLinks.map((entry, index) =>
                      entry === "gap" ? (
                        <span key={`gap-${index}`} className="px-1 text-slate-400" aria-hidden="true">
                          …
                        </span>
                      ) : (
                        <Link
                          key={entry}
                          href={pageHref(entry)}
                          aria-current={entry === currentPage ? "page" : undefined}
                          className={`min-w-10 rounded-lg border px-3 py-2 text-center text-sm font-semibold transition-colors ${
                            entry === currentPage
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                          }`}
                        >
                          {entry}
                        </Link>
                      ),
                    )}

                    {currentPage < totalPages ? (
                      <Link
                        href={pageHref(currentPage + 1)}
                        rel="next"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600"
                      >
                        Berikutnya
                      </Link>
                    ) : (
                      <span className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-300">
                        Berikutnya
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-500">
                    Menampilkan {firstShown}–{lastShown} dari {filtered.length} program kerja
                    {query ? ` (hasil pencarian "${query}")` : ""} · halaman {currentPage} dari{" "}
                    {totalPages}
                  </p>
                </nav>
              </>
            )}
          </div>
        </div>
      </main>

      <div className="relative border-t border-slate-200 bg-white">
        <Footer />
      </div>
    </div>
  );
}
