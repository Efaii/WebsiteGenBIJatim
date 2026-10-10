"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  GraduationCap,
  Search,
  X,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CommissariatAwardee } from "@/lib/services/commissariat.service";
import { isMeaningfulText, positionRank, sortAwardees } from "../display";
import { ListPagination } from "./ListPagination";

const ALL_DIVISIONS = "semua";
const ALL_POSITIONS = "semua";
const AWARDEES_PER_PAGE = 12;

type SortMode = "default" | "asc" | "desc";
type OpenMenu = "division" | "position" | null;

/** Tombol di pita header tabel: menyatu dengan gaya header biru. */
const HEADER_BUTTON =
  "-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

/**
 * Panel "Data Awardee": registri penerima beasiswa periode terpilih.
 *
 * Tabel mengikuti gaya halaman /awardee (pita header biru, sudut atas kartu
 * lebih kotak, baris hover biru muda). Urutan bawaan baris memakai jabatan
 * tertinggi lebih dulu (BPH di atas), lalu divisi, lalu nama; kolom "Nama"
 * bisa diurutkan A-Z / Z-A, sedangkan "Divisi" dan "Jabatan" difilter lewat
 * dropdown di header kolomnya. Di atas tabel hanya ada pencarian; di mobile
 * (tanpa header tabel) kontrol yang sama tampil sebagai baris ringkas di
 * atas daftar.
 */
export function AwardeePanel({
  awardees,
  period,
}: {
  awardees: CommissariatAwardee[];
  period: string;
}) {
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState(ALL_DIVISIONS);
  const [position, setPosition] = useState(ALL_POSITIONS);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [page, setPage] = useState(1);
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);

  const baseSorted = useMemo(() => sortAwardees(awardees), [awardees]);

  /*
   * Urutan tampil: bawaan (jabatan lalu nama), A-Z, atau Z-A.
   * Urutan alfabet hanya menimpa nama; kolom lain tidak diubah.
   */
  const sorted = useMemo(() => {
    if (sortMode === "default") return baseSorted;
    const direction = sortMode === "asc" ? 1 : -1;
    return [...baseSorted].sort(
      (a, b) => direction * a.name.localeCompare(b.name, "id"),
    );
  }, [baseSorted, sortMode]);

  const divisions = useMemo(() => {
    const seen = new Set<string>();
    const options: string[] = [];
    for (const awardee of baseSorted) {
      const value = awardee.division?.trim();
      if (!value || !isMeaningfulText(value) || seen.has(value)) continue;
      seen.add(value);
      options.push(value);
    }
    return options.sort((a, b) => {
      if (a === "BPH") return -1;
      if (b === "BPH") return 1;
      return a.localeCompare(b, "id");
    });
  }, [baseSorted]);

  const positions = useMemo(() => {
    const seen = new Set<string>();
    const options: string[] = [];
    for (const awardee of baseSorted) {
      const value = awardee.position?.trim();
      if (!value || !isMeaningfulText(value) || seen.has(value)) continue;
      seen.add(value);
      options.push(value);
    }
    // Sama seperti urutan bawaan tabel: jabatan tertinggi lebih dulu.
    return options.sort(
      (a, b) => positionRank(a) - positionRank(b) || a.localeCompare(b, "id"),
    );
  }, [baseSorted]);

  const divisionCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const awardee of baseSorted) {
      const value = awardee.division?.trim() ?? "";
      map.set(value, (map.get(value) ?? 0) + 1);
    }
    return map;
  }, [baseSorted]);

  const positionCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const awardee of baseSorted) {
      const value = awardee.position?.trim() ?? "";
      map.set(value, (map.get(value) ?? 0) + 1);
    }
    return map;
  }, [baseSorted]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      sorted.filter((awardee) => {
        if (division !== ALL_DIVISIONS && awardee.division?.trim() !== division) {
          return false;
        }
        if (position !== ALL_POSITIONS && awardee.position?.trim() !== position) {
          return false;
        }
        if (!normalizedQuery) return true;
        return [
          awardee.name,
          awardee.position,
          awardee.studyProgram,
          awardee.division,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [sorted, division, position, normalizedQuery],
  );

  // Menutup dropdown saat klik di luar atau tombol Escape.
  useEffect(() => {
    if (!openMenu) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-awardee-filter-menu]")) return;
      setOpenMenu(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  // Setiap perubahan pencarian atau filter mengembalikan pembaca ke halaman 1.
  // Dilakukan di penangan event (bukan effect) supaya tidak ada render berantai.
  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const updateDivision = (value: string) => {
    setDivision(value);
    setPage(1);
    setOpenMenu(null);
  };

  const updatePosition = (value: string) => {
    setPosition(value);
    setPage(1);
    setOpenMenu(null);
  };

  const cycleSort = () => {
    setSortMode((current) =>
      current === "default" ? "asc" : current === "asc" ? "desc" : "default",
    );
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / AWARDEES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * AWARDEES_PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + AWARDEES_PER_PAGE);
  const firstShown = filtered.length === 0 ? 0 : startIndex + 1;
  const lastShown = Math.min(startIndex + AWARDEES_PER_PAGE, filtered.length);

  const goToPage = (target: number) => {
    setPage(target);
    sectionRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  const resetFilters = () => {
    setQuery("");
    setDivision(ALL_DIVISIONS);
    setPosition(ALL_POSITIONS);
    setSortMode("default");
    setPage(1);
  };

  if (awardees.length === 0) {
    return (
      <section className="rounded-card border border-dashed border-genbi-line bg-white/80 px-6 py-14 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">
          Data awardee periode {period} belum dipublikasikan
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500">
          Daftar penerima beasiswa periode ini belum diunggah ke situs. Coba
          pilih periode lain lewat tombol periode di atas.
        </p>
      </section>
    );
  }

  const hasActiveFilter =
    normalizedQuery.length > 0 ||
    division !== ALL_DIVISIONS ||
    position !== ALL_POSITIONS;

  const sortLabel =
    sortMode === "asc" ? "A-Z" : sortMode === "desc" ? "Z-A" : "Bawaan";
  const sortIcon =
    sortMode === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
    ) : sortMode === "desc" ? (
      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
    ) : (
      <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
    );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="awardee-heading"
      className="scroll-mt-40 md:scroll-mt-36"
    >
      <h2
        id="awardee-heading"
        className="mb-5 font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
      >
        Data Awardee
      </h2>

      {/* Di atas tabel hanya pencarian; filter tinggal di header kolom. */}
      <div className="mb-5">
        <div className="relative h-10 w-full min-w-[220px] sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <label htmlFor="awardee-search" className="sr-only">
            Cari awardee
          </label>
          <input
            id="awardee-search"
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Cari nama, jabatan, atau program studi..."
            className="h-10 w-full rounded-md border border-genbi-line bg-white pl-10 pr-9 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-500 hover:border-genbi-bright focus:border-genbi-blue focus:outline-none"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => updateQuery("")}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-genbi-light hover:text-genbi-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-genbi-line bg-white/80 px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            {normalizedQuery
              ? `Tidak ada awardee yang cocok dengan pencarian "${query.trim()}".`
              : "Tidak ada awardee pada filter ini."}
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 rounded-full border border-genbi-line bg-white px-4 py-2 text-sm font-bold text-genbi-ink transition-colors hover:border-genbi-bright hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 focus-visible:ring-offset-1"
            >
              Tampilkan semua awardee
            </button>
          )}
        </div>
      ) : (
        /*
         * Sudut atas sengaja lebih kotak (6px) daripada skala radius halaman,
         * sama seperti tabel halaman /awardee: pita header biru menyatu dengan
         * tepi kartu dan tidak menggantung. Wrapper tidak memakai
         * `overflow-hidden` supaya dropdown filter di header tidak terpotong;
         * karena itu sudut pita header dibulatkan per sel.
         */
        <div className="rounded-t-[6px] rounded-b-card border border-genbi-line bg-white shadow-sm">
          <div className="hidden md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Daftar awardee periode {period}
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="w-[28%] bg-genbi-blue px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white first:rounded-tl-[6px]"
                  >
                    <button
                      type="button"
                      onClick={cycleSort}
                      aria-label={
                        sortMode === "default"
                          ? "Urutkan nama dari A ke Z"
                          : sortMode === "asc"
                            ? "Urutkan nama dari Z ke A"
                            : "Kembalikan urutan bawaan (jabatan lebih dulu)"
                      }
                      className={HEADER_BUTTON}
                    >
                      Nama
                      <span className="flex items-center gap-0.5">
                        {sortIcon}
                      </span>
                      {sortMode !== "default" && (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold normal-case tracking-normal">
                          {sortLabel}
                        </span>
                      )}
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="w-[24%] bg-genbi-blue px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white"
                  >
                    <div
                      className="relative inline-block"
                      data-awardee-filter-menu
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu((current) =>
                            current === "division" ? null : "division",
                          )
                        }
                        aria-haspopup="listbox"
                        aria-expanded={openMenu === "division"}
                        className={HEADER_BUTTON}
                      >
                        Divisi
                        {division !== ALL_DIVISIONS && (
                          <span className="max-w-[9rem] truncate rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold normal-case tracking-normal">
                            {division}
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            openMenu === "division" && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      {openMenu === "division" && (
                        <ul
                          role="listbox"
                          aria-label="Pilih divisi"
                          className="absolute left-0 top-full z-20 mt-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-genbi-line bg-white p-1.5 shadow-lg"
                        >
                          <MenuOption
                            label="Semua divisi"
                            count={awardees.length}
                            active={division === ALL_DIVISIONS}
                            onSelect={() => updateDivision(ALL_DIVISIONS)}
                          />
                          {divisions.map((name) => (
                            <MenuOption
                              key={name}
                              label={name}
                              count={divisionCounts.get(name) ?? 0}
                              active={division === name}
                              onSelect={() => updateDivision(name)}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[20%] bg-genbi-blue px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white"
                  >
                    <div
                      className="relative inline-block"
                      data-awardee-filter-menu
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu((current) =>
                            current === "position" ? null : "position",
                          )
                        }
                        aria-haspopup="listbox"
                        aria-expanded={openMenu === "position"}
                        className={HEADER_BUTTON}
                      >
                        Jabatan
                        {position !== ALL_POSITIONS && (
                          <span className="max-w-[9rem] truncate rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold normal-case tracking-normal">
                            {position}
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            openMenu === "position" && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      {openMenu === "position" && (
                        <ul
                          role="listbox"
                          aria-label="Pilih jabatan"
                          className="absolute left-0 top-full z-20 mt-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-genbi-line bg-white p-1.5 shadow-lg"
                        >
                          <MenuOption
                            label="Semua jabatan"
                            count={awardees.length}
                            active={position === ALL_POSITIONS}
                            onSelect={() => updatePosition(ALL_POSITIONS)}
                          />
                          {positions.map((name) => (
                            <MenuOption
                              key={name}
                              label={name}
                              count={positionCounts.get(name) ?? 0}
                              active={position === name}
                              onSelect={() => updatePosition(name)}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[28%] bg-genbi-blue px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white last:rounded-tr-[6px]"
                  >
                    Program Studi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-genbi-line/60">
                {pageItems.map((awardee) => (
                  <tr
                    key={awardee.id}
                    className="transition-colors hover:bg-genbi-light/50"
                  >
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">
                      {awardee.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {isMeaningfulText(awardee.division) ? (
                        awardee.division
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {awardee.position}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {awardee.studyProgram}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versi mobile: baris runtuh menjadi daftar bertumpuk dengan kontrol ringkas. */}
          <div className="flex flex-wrap items-center gap-2 border-b border-genbi-line/70 bg-genbi-soft/60 px-4 py-3 md:hidden">
            <select
              aria-label="Filter divisi"
              value={division}
              onChange={(event) => updateDivision(event.target.value)}
              className="h-9 min-w-[8.5rem] flex-1 rounded-md border border-genbi-line bg-white px-2 text-xs font-semibold text-slate-700 focus:border-genbi-blue focus:outline-none"
            >
              <option value={ALL_DIVISIONS}>Semua divisi</option>
              {divisions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter jabatan"
              value={position}
              onChange={(event) => updatePosition(event.target.value)}
              className="h-9 min-w-[8.5rem] flex-1 rounded-md border border-genbi-line bg-white px-2 text-xs font-semibold text-slate-700 focus:border-genbi-blue focus:outline-none"
            >
              <option value={ALL_POSITIONS}>Semua jabatan</option>
              {positions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={cycleSort}
              aria-label={
                sortMode === "default"
                  ? "Urutkan nama dari A ke Z"
                  : sortMode === "asc"
                    ? "Urutkan nama dari Z ke A"
                    : "Kembalikan urutan bawaan"
              }
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-genbi-line bg-white px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-genbi-bright hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50"
            >
              {sortIcon}
              Nama {sortLabel}
            </button>
          </div>

          <ul className="divide-y divide-genbi-line/60 md:hidden">
            {pageItems.map((awardee) => (
              <li key={awardee.id} className="px-4 py-3.5">
                <p className="text-sm font-semibold text-slate-900">
                  {awardee.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {[
                    awardee.position,
                    isMeaningfulText(awardee.division)
                      ? awardee.division
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {awardee.studyProgram}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-genbi-line/70 px-4 py-3 md:px-5">
            <p className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700">
                {firstShown}-{lastShown}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length}
              </span>{" "}
              awardee
            </p>
            <ListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              label="Navigasi halaman awardee"
            />
          </div>
        </div>
      )}
    </section>
  );
}

/** Satu pilihan di dropdown filter header (sudah termasuk centang + jumlah). */
function MenuOption({
  label,
  count,
  active,
  onSelect,
}: {
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/40",
          active
            ? "bg-genbi-light font-bold text-genbi-ink"
            : "font-medium text-slate-700 hover:bg-genbi-soft hover:text-genbi-ink",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Check
            className={cn(
              "h-4 w-4 shrink-0",
              active ? "text-genbi-blue" : "opacity-0",
            )}
            aria-hidden="true"
          />
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-400">
          {count}
        </span>
      </button>
    </li>
  );
}
