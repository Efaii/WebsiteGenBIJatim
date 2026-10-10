"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/Container";
import { StateMessage } from "@/components/StateMessage";
import {
  newsAssetUrl,
  type PublicNewsSummary,
} from "@/lib/services/news.service";
import { ArrowRight, Newspaper, Search } from "lucide-react";

/** Berita + label tanggal yang sudah diformat server (lihat page.tsx). */
export type NewsListItem = PublicNewsSummary & { dateLabel: string | null };

/**
 * Halaman arsip berita.
 *
 * Rombakan ini menyelaraskan halaman dengan sistem visual halaman lain:
 * latar `genbi-soft` dengan gradien atas, judul terpusat, kontrol filter
 * `rounded-md` satu baris (kategori + pencarian), dan kartu putih
 * `rounded-feature` yang sama dengan kartu berita di beranda. Tanpa animasi
 * masuk; hanya transisi hover, mengikuti halaman detail berita.
 *
 * Tanggal TIDAK diformat di sini: label datang dari server supaya hasil
 * render server dan klien tidak pernah berbeda (pola yang sama dengan
 * section berita di beranda).
 */

/** Gaya judul halaman yang sama dengan halaman komisariat dan awardee. */
const PAGE_TITLE_CLASS =
  "font-heading text-[2rem] font-bold tracking-tight text-slate-900 md:text-[2.5rem] lg:text-[2.75rem]";

const ALL = "All";

/**
 * Urutan tampil chip kategori mengikuti enum API; kategori yang belum
 * terdaftar tetap ikut tampil di belakang supaya tidak ada berita yang
 * hanya bisa ditemukan lewat "Semua".
 */
const CATEGORY_ORDER = ["KEGIATAN", "WEBINAR", "SOSIAL", "EDUKASI", "PELATIHAN"];

const categoryLabel = (value: string) =>
  value === ALL ? "Semua" : value.charAt(0) + value.slice(1).toLowerCase();

export default function NewsClient({
  initialNews,
}: {
  initialNews: NewsListItem[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);

  // Chip dibangun dari data yang benar-benar ada, bukan daftar tetap: filter
  // yang pasti kosong tidak perlu ditampilkan.
  const presentCategories = Array.from(
    new Set(
      initialNews
        .map((news) => news.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort((a, b) => {
    const orderA = CATEGORY_ORDER.indexOf(a);
    const orderB = CATEGORY_ORDER.indexOf(b);
    return (
      (orderA === -1 ? CATEGORY_ORDER.length : orderA) -
        (orderB === -1 ? CATEGORY_ORDER.length : orderB) ||
      a.localeCompare(b)
    );
  });
  const categories = [ALL, ...presentCategories];

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredNews = initialNews.filter((news) => {
    const matchesCategory =
      selectedCategory === ALL || news.category === selectedCategory;
    const matchesQuery =
      normalizedQuery === "" ||
      `${news.title} ${news.excerpt} ${news.category ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  const isFiltering = selectedCategory !== ALL || normalizedQuery !== "";

  return (
    <div className="relative flex min-h-screen flex-col overflow-clip bg-genbi-soft text-slate-900 selection:bg-genbi-blue selection:text-white">
      <Navbar />

      {/* Latar hero yang mencair ke warna halaman, sama seperti halaman daftar lain. */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-genbi-light to-genbi-soft" />

      <main className="relative z-10 flex-1 pt-28 pb-20">
        <Container>
          {/* Judul halaman */}
          <header className="mx-auto mb-10 max-w-3xl text-center">
            <h1 className={PAGE_TITLE_CLASS}>Berita & Kegiatan Jatim</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              Informasi terkini, artikel, dan highlight kegiatan GenBI tingkat
              provinsi Jawa Timur.
            </p>
          </header>

          {/* Filter kategori + pencarian, satu baris seperti toolbar awardee. */}
          <div className="flex flex-wrap items-center gap-2.5">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={isActive}
                  className={`h-10 cursor-pointer rounded-md border px-3.5 text-sm font-semibold shadow-sm transition-colors focus-visible:border-genbi-blue focus-visible:outline-none ${
                    isActive
                      ? "border-genbi-blue bg-genbi-blue text-white hover:bg-genbi-blue-hover"
                      : "border-genbi-line bg-white text-slate-600 hover:border-genbi-bright hover:text-genbi-blue"
                  }`}
                >
                  {categoryLabel(category)}
                </button>
              );
            })}

            <div className="relative min-w-[220px] flex-1 basis-[240px] md:ml-auto md:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Cari berita"
                placeholder="Cari berita..."
                className="h-10 w-full rounded-md border border-genbi-line bg-white pl-10 pr-3.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-500 hover:border-genbi-bright focus:border-genbi-blue focus:outline-none"
              />
            </div>
          </div>

          {/* Jumlah hasil */}
          <p className="mt-4 text-sm text-slate-500">
            {isFiltering ? (
              <>
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {filteredNews.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {initialNews.length}
                </span>{" "}
                berita.
              </>
            ) : (
              <>
                <span className="font-semibold text-slate-700">
                  {initialNews.length}
                </span>{" "}
                berita.
              </>
            )}
          </p>

          {/* Daftar berita */}
          {filteredNews.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredNews.map((news) => {
                const cover =
                  newsAssetUrl(news.images?.[0] ?? news.coverImage) ?? null;
                const secondary = news.category
                  ? categoryLabel(news.category)
                  : null;
                return (
                  <Link
                    key={news.id}
                    href={`/news/${news.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-feature border border-genbi-line bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-genbi-bright hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60"
                  >
                    <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-genbi-light">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={news.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Newspaper
                            className="h-10 w-10 text-slate-300"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5 md:p-6">
                      {(news.dateLabel || secondary) && (
                        <p className="text-[13px] font-medium text-slate-500">
                          {news.dateLabel}
                          {news.dateLabel && secondary ? (
                            <span aria-hidden="true"> · </span>
                          ) : null}
                          {secondary}
                        </p>
                      )}
                      <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-genbi-blue">
                        {news.title}
                      </h2>
                      <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-slate-600">
                        {news.excerpt}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-genbi-blue">
                        Baca Selengkapnya
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <StateMessage
              className="mt-6"
              title="Tidak ada berita yang cocok"
              description="Coba ubah kata kunci pencarian atau pilih kategori lain."
            />
          )}
        </Container>
      </main>

      <div className="relative border-t border-genbi-line bg-white">
        <Footer />
      </div>
    </div>
  );
}
