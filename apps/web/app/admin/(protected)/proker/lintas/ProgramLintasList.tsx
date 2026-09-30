"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { CmsProgramItem } from "@/lib/services/cms-program.service";
import { BTN_SECONDARY, FIELD, FIELD_BASE, LABEL, PANEL } from "../../../ui";
import {
  PROGRAM_STATUS_BADGE,
  PROGRAM_STATUS_LABEL,
  programStatusClass,
} from "../status";

const PER_PAGE_OPTIONS = [5, 10, 15, 20];
const DEFAULT_PER_PAGE = 10;

const PAGE_BUTTON =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-genbi-haze hover:bg-genbi-light hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 disabled:pointer-events-none disabled:opacity-40";

const PAGE_BUTTON_ACTIVE =
  "border-genbi-blue bg-genbi-blue text-white hover:border-genbi-blue hover:bg-genbi-blue hover:text-white";

const formatDate = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const hasKind = (item: CmsProgramItem, kind: string): boolean =>
  item.artifacts.some((artifact) => artifact.kind === kind);

/**
 * Daftar Program Kerja lintas komisariat dengan filter komisariat dan divisi,
 * pencarian, serta pagination. Jumlah per halaman default 10 dan dapat dipilih
 * kelipatan 5; filter berjalan di sisi klien atas data yang sudah dimuat
 * (jumlah baris per periode kecil).
 */
export function ProgramLintasList({
  programs,
}: {
  programs: CmsProgramItem[];
}) {
  const [query, setQuery] = useState("");
  const [komisariat, setKomisariat] = useState("");
  const [divisi, setDivisi] = useState("");
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [page, setPage] = useState(1);

  const komisariatOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const program of programs) {
      if (program.commissariat) {
        map.set(program.commissariat.slug, program.commissariat.name);
      }
    }
    return [...map.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((left, right) => left.name.localeCompare(right.name, "id"));
  }, [programs]);

  const divisiOptions = useMemo(() => {
    const names = new Set<string>();
    for (const program of programs) {
      if (komisariat && program.commissariat?.slug !== komisariat) continue;
      if (program.divisi) names.add(program.divisi);
    }
    return [...names].sort((left, right) => left.localeCompare(right, "id"));
  }, [programs, komisariat]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return programs.filter((program) => {
      if (komisariat && program.commissariat?.slug !== komisariat) return false;
      if (divisi && program.divisi !== divisi) return false;
      if (needle) {
        const haystack =
          `${program.namaProker} ${program.divisi} ${program.commissariat?.name ?? ""} ${program.formatPelaksanaan}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [programs, query, komisariat, divisi]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(startIndex, startIndex + perPage);

  const pageNumbers: Array<number | "gap"> = [];
  let previous = 0;
  for (let candidate = 1; candidate <= totalPages; candidate += 1) {
    const isEdge = candidate === 1 || candidate === totalPages;
    const isNear = Math.abs(candidate - currentPage) <= 1;
    if (isEdge || isNear) {
      if (previous && candidate - previous > 1) pageNumbers.push("gap");
      pageNumbers.push(candidate);
      previous = candidate;
    }
  }

  const clearFilters = () => {
    setQuery("");
    setKomisariat("");
    setDivisi("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <section className={`${PANEL} p-4 md:p-6`}>
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <label className={LABEL} htmlFor="lintas-cari">
              Cari
            </label>
            <input
              id="lintas-cari"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Judul, komisariat, atau divisi"
              className={`${FIELD} mt-1`}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="lintas-komisariat">
              Komisariat
            </label>
            <select
              id="lintas-komisariat"
              value={komisariat}
              onChange={(event) => {
                setKomisariat(event.target.value);
                setDivisi("");
                setPage(1);
              }}
              className={`${FIELD} mt-1`}
            >
              <option value="">Semua komisariat</option>
              {komisariatOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="lintas-divisi">
              Divisi
            </label>
            <select
              id="lintas-divisi"
              value={divisi}
              onChange={(event) => {
                setDivisi(event.target.value);
                setPage(1);
              }}
              className={`${FIELD} mt-1`}
            >
              <option value="">Semua divisi</option>
              {divisiOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div
          className={`${PANEL} flex flex-col items-center px-6 py-14 text-center`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
            <Search className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Tidak ada Program Kerja yang cocok
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Ubah kata kunci atau bersihkan filter yang aktif.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className={`${BTN_SECONDARY} mt-5`}
          >
            Bersihkan filter
          </button>
        </div>
      ) : (
        <div className={`${PANEL} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="bg-genbi-soft text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Judul</th>
                  <th className="px-5 py-3 font-semibold">Komisariat</th>
                  <th className="px-5 py-3 font-semibold">Divisi</th>
                  <th className="px-5 py-3 font-semibold">Tanggal</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Berkas</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-genbi-line">
                {pageItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-200 hover:bg-genbi-soft/70"
                  >
                    <td className="max-w-[280px] px-5 py-4 font-medium text-slate-900">
                      {item.namaProker}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.commissariat?.name ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.divisi}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(item.startDate)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`${PROGRAM_STATUS_BADGE} ${programStatusClass(
                          item.publicationStatus,
                        )}`}
                      >
                        {PROGRAM_STATUS_LABEL[item.publicationStatus] ??
                          item.publicationStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex flex-wrap gap-1.5">
                        {hasKind(item, "proposal") && (
                          <span className="inline-flex items-center rounded-full border border-genbi-haze bg-genbi-light px-2.5 py-0.5 text-xs font-semibold text-genbi-blue">
                            Proposal
                          </span>
                        )}
                        {hasKind(item, "lpj") && (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            LPJ
                          </span>
                        )}
                        {!hasKind(item, "proposal") &&
                          !hasKind(item, "lpj") && (
                            <span className="text-slate-300">-</span>
                          )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/proker/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-genbi-blue transition-colors duration-200 hover:bg-genbi-light"
                      >
                        Detail
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-genbi-line px-5 py-4">
            <p className="text-xs text-slate-500">
              Menampilkan {startIndex + 1}-
              {Math.min(startIndex + perPage, filtered.length)} dari{" "}
              {filtered.length} Program Kerja
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Per halaman</span>
              <select
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value));
                  setPage(1);
                }}
                aria-label="Jumlah per halaman"
                className={`${FIELD_BASE} px-2 py-1 text-xs`}
              >
                {PER_PAGE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <nav
              className="flex items-center gap-1"
              aria-label="Navigasi halaman"
            >
              <button
                type="button"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={PAGE_BUTTON}
              >
                Sebelumnya
              </button>
              {pageNumbers.map((entry, index) =>
                entry === "gap" ? (
                  <span
                    key={`gap-${index}`}
                    className="px-1 text-xs text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setPage(entry)}
                    aria-current={entry === currentPage ? "page" : undefined}
                    className={`${PAGE_BUTTON} ${
                      entry === currentPage ? PAGE_BUTTON_ACTIVE : ""
                    }`}
                  >
                    {entry}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={PAGE_BUTTON}
              >
                Berikutnya
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
