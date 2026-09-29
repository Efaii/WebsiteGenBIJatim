import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/Container";
import { StateMessage } from "@/components/StateMessage";
import { getPublicAwardees } from "@/lib/services/awardee.service";
import { getAllCommissariats } from "@/lib/services/commissariat.service";
import { getPublicPeriods, periodFromSlug, periodSlug } from "@/lib/services/period.service";
import { AwardeeToolbar } from "./AwardeeToolbar";

/**
 * Halaman direktori awardee.
 *
 * Revisi terakhir (desain mengikuti halaman komisariat, lalu dirapikan lagi):
 * - Shell, judul, dan kartu ringkasan disamakan dengan Pusat Data Komisariat;
 *   jarak atas `pt-28` supaya judul tidak menempel ke navbar mengambang.
 * - Kartu ringkasan tampil tanpa animasi masuk (langsung dirender), sebaran
 *   komisariat memakai dua tingkat yang mengisi penuh kartu, dan hiasan
 *   lingkaran kanan atas dijaga agar tidak tertutup petak.
 * - Toolbar filter menjadi satu baris ringkas tanpa kartu: label "Periode:"
 *   dan "Komisariat:" menyatu di dalam kontrol, opsinya muncul saat ditekan,
 *   opsi komisariat memakai logo kecil, sudut kontrol mendekati kotak.
 * - Kolom Divisi dihapus dari tabel; lebar kolom diratakan 40/32/28 dan
 *   pencarian menjangkau nama, komisariat, prodi.
 * - Header tabel memakai pita biru `genbi-blue` dengan teks putih, dan sudut
 *   atas kartu tabel dibuat lebih kotak (6px) daripada skala radius halaman.
 * - Daftar dipaginasi 50 baris per halaman, dihitung di server lewat
 *   searchParams supaya nomor halaman bisa dibagikan lewat URL.
 */

export const metadata: Metadata = {
  title: "Database Awardee GenBI Jatim",
  description:
    "Daftar penerima beasiswa Bank Indonesia (awardee) dari sembilan komisariat GenBI Jawa Timur, lengkap dengan komisariat dan program studi.",
};

/** Dibatasi 50 baris supaya satu halaman tetap ringan dan mudah dipindai. */
const AWARDEES_PER_PAGE = 50;

/** Gaya judul halaman yang sama dengan halaman komisariat dan judul section beranda. */
const PAGE_TITLE_CLASS =
  "font-heading text-[2rem] font-bold tracking-tight text-slate-900 md:text-[2.5rem] lg:text-[2.75rem]";

/**
 * Jendela nomor halaman untuk pagination.
 *
 * Menampilkan halaman pertama, terakhir, dan tetangga halaman aktif; sisanya
 * dilipat menjadi elipsis supaya deret tombol tidak pernah lebih dari tujuh.
 */
function paginationItems(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const items: Array<number | "gap"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("gap");
  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    items.push(pageNumber);
  }
  if (end < total - 1) items.push("gap");
  items.push(total);
  return items;
}

export default async function AwardeePage({
  searchParams,
}: {
  searchParams: Promise<{
    periode?: string;
    komisariat?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const { periode, komisariat, q, page: pageParam } = await searchParams;

  const { periods, defaultPeriod } = await getPublicPeriods();
  const period = (periode && periodFromSlug(periode, periods)) || periods[0] || defaultPeriod;

  const { awardees, summary } = period
    ? await getPublicAwardees(period)
    : { awardees: [], summary: { total: 0, byCommissariat: [] } };

  const query = (q ?? "").trim();
  // Slug komisariat hanya dipakai kalau memang ada di periode ini, supaya URL
  // yang diubah manual tidak menghasilkan daftar kosong tanpa penjelasan.
  const komisariatSlug =
    komisariat && summary.byCommissariat.some((entry) => entry.slug === komisariat)
      ? komisariat
      : "";

  const normalizedQuery = query.toLowerCase();
  const filtered = awardees.filter((awardee) => {
    if (komisariatSlug && awardee.commissariat.slug !== komisariatSlug) return false;
    if (!normalizedQuery) return true;
    return [awardee.name, awardee.commissariat.name, awardee.studyProgram]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / AWARDEES_PER_PAGE));
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Math.min(
    Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1),
    totalPages,
  );
  const pageStart = (page - 1) * AWARDEES_PER_PAGE;
  const rows = filtered.slice(pageStart, pageStart + AWARDEES_PER_PAGE);
  const rangeStart = pageStart + 1;
  const rangeEnd = Math.min(pageStart + AWARDEES_PER_PAGE, total);

  // Urut dari yang terbanyak supaya sebaran langsung terbaca; seri diurutkan nama.
  const distribution = [...summary.byCommissariat].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
  const activeKomisariatName =
    distribution.find((entry) => entry.slug === komisariatSlug)?.name ?? "";

  /*
   * Logo komisariat untuk opsi dropdown filter. Opsional: kalau API daftar
   * komisariat gagal, toolbar tetap jalan tanpa logo (di sisi klien ada
   * cadangan lambang GenBI untuk sumber yang tidak valid).
   */
  const logoBySlug = new Map<string, string>();
  try {
    const allCommissariats = await getAllCommissariats();
    for (const item of allCommissariats) {
      logoBySlug.set(item.slug, item.logo_univ);
    }
  } catch (error) {
    console.error("Gagal memuat logo komisariat untuk filter:", error);
  }
  const komisariatOptions = summary.byCommissariat.map((entry) => ({
    ...entry,
    logo: logoBySlug.get(entry.slug) ?? null,
  }));

  /** URL filter komisariat dari petak sebaran; petak aktif diklik lagi untuk mematikan filter. */
  const komisariatHref = (nextSlug: string) => {
    const params = new URLSearchParams();
    params.set("periode", periodSlug(period));
    if (nextSlug) params.set("komisariat", nextSlug);
    if (query) params.set("q", query);
    return `/awardee?${params.toString()}`;
  };

  /** URL halaman lain; filter yang aktif selalu ikut dibawa. */
  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set("periode", periodSlug(period));
    if (komisariatSlug) params.set("komisariat", komisariatSlug);
    if (query) params.set("q", query);
    if (targetPage > 1) params.set("page", String(targetPage));
    return `/awardee?${params.toString()}#daftar`;
  };

  const paginationPill =
    "inline-flex h-9 items-center justify-center gap-1 rounded-full border px-3 text-sm font-semibold transition-colors";
  const paginationNumber =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-colors";

  return (
    <div className="relative flex min-h-screen flex-col overflow-clip bg-genbi-soft text-slate-900 selection:bg-genbi-blue selection:text-white">
      <Navbar />

      {/* Latar hero yang mencair ke warna halaman, sama seperti halaman komisariat. */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-genbi-light to-genbi-soft" />

      <main className="relative z-10 flex-1 pt-28 pb-20">
        <Container>
          {/* Judul halaman */}
          <header className="mx-auto mb-10 max-w-3xl text-center">
            <h1 className={PAGE_TITLE_CLASS}>Penerima Beasiswa GenBI Jatim</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              Data penerima beasiswa Bank Indonesia periode {period} dari sembilan
              komisariat GenBI Jawa Timur.
            </p>
          </header>

          {/* Kartu ringkasan: total periode + sebaran per komisariat yang bisa diklik. */}
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-card border border-genbi-line bg-white p-6 shadow-md md:p-8">
              {/*
               * Hiasan lingkaran di kanan atas. Karena petak sebaran kini
               * memenuhi lebar kartu, ukurannya dikecilkan (96px) dan
               * digeser lebih dalam ke sudut supaya tepi bawahnya (56px dari
               * tepi atas kartu) tidak tertutup baris pertama petak yang
               * mulai sekitar 68px dari tepi atas.
               */}
              <div
                className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-genbi-haze to-genbi-bright"
                aria-hidden="true"
              />
              <div className="relative z-10 grid gap-6 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:items-start md:gap-10">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                    Jumlah Awardee
                  </p>
                  <p className="mt-2 font-heading text-4xl font-bold leading-none tabular-nums text-slate-900 md:text-5xl">
                    {summary.total}
                  </p>
                  <div className="mt-4 inline-block rounded-full bg-genbi-haze px-3 py-1 text-xs font-semibold text-genbi-ink shadow-sm">
                    Periode {period}
                  </div>
                </div>

                {distribution.length > 0 && (
                  <div className="md:border-l md:border-genbi-line/70 md:pl-10">
                    <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                      Sebaran per Komisariat
                    </p>
                    {/*
                     * Dua tingkat di layar lebar. Memakai flex-wrap dengan
                     * flex-grow, bukan grid kolom tetap: baris terakhir ikut
                     * melebar memenuhi lebar kartu (tanpa slot kosong) dan
                     * jumlah komisariat boleh berubah tanpa merusak tata
                     * letak. Isi petak hanya nama + jumlah (tanpa bilah),
                     * sesuai tampilan sebelumnya; petaknya berfungsi sebagai
                     * filter komisariat.
                     */}
                    <ul className="mt-4 flex flex-wrap gap-2.5">
                      {distribution.map((entry) => {
                        const isActive = entry.slug === komisariatSlug;
                        return (
                          <li key={entry.slug} className="min-w-0 flex-1 basis-[150px]">
                            <Link
                              href={komisariatHref(isActive ? "" : entry.slug)}
                              aria-current={isActive ? "true" : undefined}
                              className={`flex h-full items-center justify-between gap-2 rounded-thumb border px-3.5 py-2.5 transition-colors ${
                                isActive
                                  ? "border-genbi-blue bg-genbi-blue text-white shadow-sm"
                                  : "border-genbi-line bg-genbi-light text-genbi-ink hover:border-genbi-bright hover:bg-white"
                              }`}
                            >
                              <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                                {entry.name}
                              </span>
                              <span
                                className={`shrink-0 text-lg font-bold leading-none tabular-nums ${
                                  isActive ? "text-white" : "text-genbi-blue"
                                }`}
                              >
                                {entry.count}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Toolbar: dropdown periode + komisariat, pencarian di sisi kanan. */}
          <AwardeeToolbar
            periods={periods.map((item) => ({ label: item, slug: periodSlug(item) }))}
            currentPeriodSlug={periodSlug(period)}
            komisariats={komisariatOptions}
            currentKomisariat={komisariatSlug}
            query={query}
          />

          {/* Daftar awardee */}
          <section id="daftar" className="mt-6 scroll-mt-28">
            {rows.length > 0 ? (
              /*
               * Sudut atas sengaja lebih kotak (6px) daripada skala radius
               * halaman: pita header biru menyatu dengan tepi kartu, dan
               * sudut 28px membuat pita itu terlihat menggantung. Sudut
               * bawah tetap mengikuti `rounded-card` halaman.
               */
              <div className="overflow-hidden rounded-t-[6px] rounded-b-card border border-genbi-line bg-white shadow-sm">
                {/* Versi desktop: tiga kolom tanpa Divisi, lebar diratakan 40/32/28. */}
                <table className="hidden w-full border-collapse text-left md:table">
                  <thead>
                    <tr className="bg-genbi-blue">
                      <th
                        scope="col"
                        className="w-[40%] px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white"
                      >
                        Nama
                      </th>
                      <th
                        scope="col"
                        className="w-[32%] px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white"
                      >
                        Komisariat
                      </th>
                      <th
                        scope="col"
                        className="w-[28%] px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white"
                      >
                        Program Studi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-genbi-line/60">
                    {rows.map((awardee) => (
                      <tr
                        key={awardee.id}
                        className="transition-colors hover:bg-genbi-light/50"
                      >
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">
                          {awardee.name}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          {awardee.commissariat.name}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          {awardee.studyProgram}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Versi mobile: baris runtuh menjadi daftar bertumpuk. */}
                <ul className="divide-y divide-genbi-line/60 md:hidden">
                  {rows.map((awardee) => (
                    <li key={awardee.id} className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {awardee.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {awardee.commissariat.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {awardee.studyProgram}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Footer kartu: jumlah yang tampil + pagination. */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-genbi-line/70 px-4 py-3 md:px-5">
                  <p className="text-sm text-slate-500">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-700">
                      {rangeStart}-{rangeEnd}
                    </span>{" "}
                    dari <span className="font-semibold text-slate-700">{total}</span> awardee
                    {komisariatSlug && activeKomisariatName ? (
                      <>
                        {" "}
                        di{" "}
                        <span className="font-semibold text-slate-700">
                          {activeKomisariatName}
                        </span>
                      </>
                    ) : null}
                    .
                  </p>

                  {totalPages > 1 && (
                    <nav aria-label="Navigasi halaman" className="flex items-center gap-1.5">
                      {page === 1 ? (
                        <span
                          aria-label="Halaman sebelumnya"
                          aria-disabled="true"
                          className={`${paginationPill} pointer-events-none border-genbi-line bg-white text-slate-400 opacity-50`}
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          <span className="hidden sm:inline">Sebelumnya</span>
                        </span>
                      ) : (
                        <Link
                          href={pageHref(page - 1)}
                          aria-label="Halaman sebelumnya"
                          className={`${paginationPill} border-genbi-line bg-white text-slate-600 hover:border-genbi-bright hover:text-genbi-blue`}
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          <span className="hidden sm:inline">Sebelumnya</span>
                        </Link>
                      )}

                      {/* Di layar kecil nomor halaman diganti indikator ringkas. */}
                      <span className="px-1.5 text-sm font-semibold text-slate-600 sm:hidden">
                        {page} / {totalPages}
                      </span>

                      <span className="hidden items-center gap-1.5 sm:flex">
                        {paginationItems(page, totalPages).map((item, index) =>
                          item === "gap" ? (
                            <span
                              key={`gap-${index}`}
                              className="px-1 text-slate-400"
                              aria-hidden="true"
                            >
                              …
                            </span>
                          ) : item === page ? (
                            <span
                              key={item}
                              aria-current="page"
                              className={`${paginationNumber} border-genbi-blue bg-genbi-blue text-white shadow-sm`}
                            >
                              {item}
                            </span>
                          ) : (
                            <Link
                              key={item}
                              href={pageHref(item)}
                              className={`${paginationNumber} border-genbi-line bg-white text-slate-600 hover:border-genbi-bright hover:text-genbi-blue`}
                            >
                              {item}
                            </Link>
                          ),
                        )}
                      </span>

                      {page === totalPages ? (
                        <span
                          aria-label="Halaman berikutnya"
                          aria-disabled="true"
                          className={`${paginationPill} pointer-events-none border-genbi-line bg-white text-slate-400 opacity-50`}
                        >
                          <span className="hidden sm:inline">Berikutnya</span>
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : (
                        <Link
                          href={pageHref(page + 1)}
                          aria-label="Halaman berikutnya"
                          className={`${paginationPill} border-genbi-line bg-white text-slate-600 hover:border-genbi-bright hover:text-genbi-blue`}
                        >
                          <span className="hidden sm:inline">Berikutnya</span>
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      )}
                    </nav>
                  )}
                </div>
              </div>
            ) : (
              <StateMessage
                title={
                  query || komisariatSlug
                    ? "Tidak ada awardee yang cocok"
                    : `Data awardee periode ${period} belum tersedia`
                }
                description={
                  query || komisariatSlug
                    ? "Coba ubah kata kunci atau reset filter untuk melihat seluruh daftar."
                    : "Data untuk periode ini belum dipublikasikan. Silakan pilih periode lain lewat filter di atas."
                }
              />
            )}
          </section>
        </Container>
      </main>

      <div className="relative border-t border-genbi-line bg-white">
        <Footer />
      </div>
    </div>
  );
}
