"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildPageList } from "../display";

const PILL_CLASS =
  "inline-flex h-9 items-center justify-center gap-1 rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 focus-visible:ring-offset-1";

const NUMBER_CLASS =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 focus-visible:ring-offset-1";

/**
 * Kontrol pagination bersama untuk panel Proker dan Awardee.
 *
 * Gaya tombol mengikuti pagination halaman /awardee (pill dengan label
 * "Sebelumnya"/"Berikutnya"), karena halaman itu jadi acuan desain tabel.
 */
export function ListPagination({
  currentPage,
  totalPages,
  onPageChange,
  label,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
}) {
  if (totalPages <= 1) return null;
  const items = buildPageList(currentPage, totalPages);

  return (
    <nav aria-label={label} className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
        className={cn(
          PILL_CLASS,
          "border-genbi-line bg-white text-slate-600 hover:border-genbi-bright hover:text-genbi-blue disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-genbi-line disabled:hover:text-slate-600",
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </button>

      {items.map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            className="px-1 text-slate-400"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            aria-current={entry === currentPage ? "page" : undefined}
            aria-label={`Halaman ${entry}`}
            className={cn(
              NUMBER_CLASS,
              entry === currentPage
                ? "border-genbi-blue bg-genbi-blue text-white shadow-sm"
                : "border-genbi-line bg-white text-slate-600 hover:border-genbi-bright hover:text-genbi-blue",
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Halaman berikutnya"
        className={cn(
          PILL_CLASS,
          "border-genbi-line bg-white text-slate-600 hover:border-genbi-bright hover:text-genbi-blue disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-genbi-line disabled:hover:text-slate-600",
        )}
      >
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
