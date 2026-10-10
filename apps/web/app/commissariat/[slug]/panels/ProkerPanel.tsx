"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  PlayCircle,
  Repeat,
} from "lucide-react";
import type { ProkerData } from "@repo/types";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { programDateLabel } from "@/lib/program-presentation.mjs";
import {
  curateProker,
  divisionLabel,
  isMeaningfulText,
  prokerImage,
  prokerPageSize,
  programDateChip,
  tidyText,
  type DateChip,
} from "../display";
import { FilterChip, FilterChipCount } from "./FilterChip";
import { ListPagination } from "./ListPagination";

const ALL_DIVISIONS = "semua";

/**
 * Gaya lencana status. Ikon yang membedakan keadaan, warna tetap di dalam
 * palet GenBI (satu aksen) supaya halaman tidak pecah jadi banyak warna.
 */
const statusBadge = (status: string) => {
  const value = status.toLowerCase();
  if (value.includes("complet")) {
    return {
      icon: CheckCircle2,
      className: "border-genbi-line bg-genbi-light text-genbi-ink",
    };
  }
  if (value.includes("ongoing") || value.includes("on-going")) {
    return {
      icon: PlayCircle,
      className: "border-genbi-blue bg-genbi-blue text-white",
    };
  }
  if (value.includes("recurring")) {
    return {
      icon: Repeat,
      className: "border-genbi-line bg-genbi-haze text-genbi-ink",
    };
  }
  return {
    icon: Clock,
    className: "border-slate-200 bg-white text-slate-600",
  };
};

/**
 * Kartu tanggal untuk proker tanpa dokumentasi: kotak kecil "NOV / 27".
 * Label non-tanggal (rentang, berkala) tampil sebagai pil teks.
 */
function ProgramDateTile({ chip }: { chip: DateChip }) {
  if (chip.kind === "label") {
    return (
      <span className="inline-flex max-w-[11rem] items-center rounded-thumb border border-genbi-line bg-genbi-light px-3 py-2 text-xs font-bold leading-snug text-genbi-ink">
        {chip.text}
      </span>
    );
  }
  const bottom = chip.kind === "day" ? chip.day : chip.year;
  return (
    <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-thumb border border-genbi-line bg-genbi-light">
      <span className="text-[10px] font-bold uppercase text-genbi-blue">
        {chip.month}
      </span>
      <span className="text-lg font-bold leading-none tabular-nums text-genbi-ink">
        {bottom}
      </span>
    </span>
  );
}

/**
 * Panel "Program Kerja", maksimal 12 kartu per halaman (13 untuk set berisi
 * tepat 13 supaya tidak ada kartu sendirian, mis. ITS).
 *
 * Proker dipisah dua kelompok: yang punya foto dokumentasi tampil paling atas
 * sebagai kartu bergambar, sisanya menyusul di bawah pembatas "Program Kerja
 * tanpa dokumentasi" memakai kartu teks. Pemisahan ini otomatis (bukan
 * pilihan pengguna) supaya kartu bergambar dan kartu teks tidak tercampur
 * dalam satu deret.
 *
 * Sebelum dipaginasi, daftar dikurasi lewat `curateProker`: proker dengan
 * dokumentasi kembar (satu kegiatan diklaim beberapa divisi) memakai foto
 * yang berbeda-beda, dan kalau fotonya tetap kembar kartunya dipisah ke
 * halaman lain.
 */
export function ProkerPanel({ proker }: { proker: ProkerData[] }) {
  const [division, setDivision] = useState(ALL_DIVISIONS);
  const [page, setPage] = useState(1);
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);

  /** Kelompok bergambar dan kelompok teks, masing-masing urut asli API. */
  const illustrated = useMemo(
    () => proker.filter((item) => prokerImage(item) !== null),
    [proker],
  );
  const plain = useMemo(
    () => proker.filter((item) => prokerImage(item) === null),
    [proker],
  );
  const ordered = useMemo(
    () => [...illustrated, ...plain],
    [illustrated, plain],
  );

  /*
   * Kurasi tampilan memakai ukuran set penuh (bukan hasil filter), karena
   * pengaturan thumbnail kembar dan pemisahan halaman ditujukan untuk
   * tampilan default daftar.
   */
  const curation = useMemo(
    () => curateProker(ordered, prokerPageSize(ordered.length)),
    [ordered],
  );
  const curatedOrder = curation.order;

  /*
   * Opsi filter diturunkan dari seluruh proker (kedua kelompok). Nilai
   * `divisi` di database campur antara kode ("sosling") dan nama panjang,
   * jadi tidak ada pemetaan yang dikarang di sini.
   */
  const divisions = useMemo(() => {
    const seen = new Set<string>();
    const options: string[] = [];
    for (const item of proker) {
      const key = (item.divisi ?? "").trim();
      if (!key || key === "-" || seen.has(key)) continue;
      seen.add(key);
      options.push(key);
    }
    return options;
  }, [proker]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of proker) {
      const key = (item.divisi ?? "").trim();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [proker]);

  const visible = useMemo(
    () =>
      division === ALL_DIVISIONS
        ? curatedOrder
        : curatedOrder.filter((item) => item.divisi === division),
    [curatedOrder, division],
  );

  const pageSize = prokerPageSize(visible.length);
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = visible.slice(startIndex, startIndex + pageSize);
  const pageImages = pageItems.filter((item) => prokerImage(item) !== null);
  const pagePlain = pageItems.filter((item) => prokerImage(item) === null);
  const firstShown = visible.length === 0 ? 0 : startIndex + 1;
  const lastShown = Math.min(startIndex + pageSize, visible.length);

  const goToPage = (target: number) => {
    setPage(target);
    sectionRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  const updateDivision = (value: string) => {
    setDivision(value);
    setPage(1);
  };

  if (proker.length === 0) {
    return (
      <section className="rounded-card border border-dashed border-genbi-line bg-white/80 px-6 py-14 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
          <CalendarDays className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">
          Belum ada program kerja
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500">
          Program kerja komisariat ini belum dipublikasikan di situs.
        </p>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="proker-heading"
      className="scroll-mt-40 md:scroll-mt-36"
    >
      <h2
        id="proker-heading"
        className="mb-5 font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
      >
        Program Kerja
      </h2>

      {divisions.length > 0 && (
        <div
          role="group"
          aria-label="Filter divisi program kerja"
          className="mb-6 flex flex-wrap items-center gap-2"
        >
          <FilterChip
            active={division === ALL_DIVISIONS}
            onClick={() => updateDivision(ALL_DIVISIONS)}
          >
            Semua
            <FilterChipCount
              active={division === ALL_DIVISIONS}
              value={proker.length}
            />
          </FilterChip>
          {divisions.map((key) => (
            <FilterChip
              key={key}
              active={division === key}
              onClick={() => updateDivision(key)}
            >
              {divisionLabel(key)}
              <FilterChipCount
                active={division === key}
                value={counts.get(key) ?? 0}
              />
            </FilterChip>
          ))}
        </div>
      )}

      {pageImages.length > 0 && (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pageImages.map((item) => {
            const image =
              curation.imageById.get(String(item.id)) ?? prokerImage(item);
            const badge = statusBadge(item.status);
            const BadgeIcon = badge.icon;
            const description = tidyText(item.description ?? "");
            const dateLabel = programDateLabel(item);
            return (
              <li key={String(item.id)}>
                <Link
                  href={`/program/${item.id}`}
                  className="group flex h-full flex-col rounded-card border border-genbi-line bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-genbi-bright hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-media bg-genbi-light">
                    {image && (
                      <Image
                        src={image}
                        alt={`Dokumentasi ${item.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="pt-0.5 text-xs font-bold text-genbi-blue">
                        {divisionLabel(item.divisi) || "Program"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
                          badge.className,
                        )}
                      >
                        <BadgeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.status}
                      </span>
                    </div>

                    <h3 className="mt-2 line-clamp-2 font-bold leading-snug text-slate-900 transition-colors group-hover:text-genbi-blue">
                      {item.title}
                    </h3>

                    {isMeaningfulText(description) && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {description}
                      </p>
                    )}

                    <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <CalendarDays
                        className="h-3.5 w-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      {dateLabel}
                    </p>

                    <div className="mt-auto pt-4">
                      <span className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-genbi-line bg-genbi-light text-sm font-bold text-genbi-ink transition-colors group-hover:border-genbi-blue group-hover:bg-genbi-blue group-hover:text-white">
                        Lihat Detail
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {pagePlain.length > 0 && (
        <div
          className={cn(
            pageImages.length > 0 && "mt-10 border-t border-genbi-line pt-8",
          )}
        >
          <h3 className="mb-5 font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Program Kerja tanpa dokumentasi
          </h3>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pagePlain.map((item) => {
              const chip = programDateChip(item);
              const badge = statusBadge(item.status);
              const BadgeIcon = badge.icon;
              const description = tidyText(item.description ?? "");
              return (
                <li key={String(item.id)}>
                  <Link
                    href={`/program/${item.id}`}
                    className="group flex h-full flex-col rounded-card border border-genbi-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-genbi-bright hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <ProgramDateTile chip={chip} />
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
                          badge.className,
                        )}
                      >
                        <BadgeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.status}
                      </span>
                    </div>

                    <h3 className="mt-4 line-clamp-2 font-bold leading-snug text-slate-900 transition-colors group-hover:text-genbi-blue">
                      {item.title}
                    </h3>

                    {isMeaningfulText(description) && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <span className="text-xs font-bold text-slate-500">
                        {divisionLabel(item.divisi) || "Program"}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-sm font-bold text-genbi-blue"
                        aria-hidden="true"
                      >
                        Lihat Detail
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Menampilkan{" "}
          <span className="font-semibold text-slate-700">
            {firstShown}-{lastShown}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-slate-700">{visible.length}</span>{" "}
          program kerja
        </p>
        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          label="Navigasi halaman program kerja"
        />
      </div>
    </section>
  );
}
