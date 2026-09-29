"use client";

import { useCallback, useEffect, useRef } from "react";
import type { FormEvent, SyntheticEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Search } from "lucide-react";

type PeriodeOption = { label: string; slug: string };
type KomisariatOption = {
  slug: string;
  name: string;
  count: number;
  logo: string | null;
};

/**
 * next/image melempar "Invalid URL" kalau src bukan path situs atau URL absolut;
 * pakai lambang GenBI sebagai cadangan (sama seperti halaman komisariat).
 */
const toLogoSrc = (src: string | null): string =>
  src && (src.startsWith("/") || /^https?:\/\//.test(src))
    ? src
    : "/assets/logos/genbi.svg";

/**
 * Toolbar filter halaman awardee: satu baris ringkas, tanpa kartu.
 *
 * Label tidak lagi berada di atas kontrol. "Periode:" dan "Komisariat:"
 * menyatu di dalam kontrolnya, dan daftar opsi baru muncul saat kontrol
 * ditekan. Opsi komisariat membawa logo kecil di sebelah kiri.
 *
 * Dropdown memakai elemen <details>/<summary> native supaya tetap berfungsi
 * tanpa JavaScript; setiap opsi adalah <Link> biasa, jadi memilih filter
 * langsung mengganti URL. Skrip di sini hanya menambah perilaku yang tidak
 * dimiliki native: satu menu terbuka dalam satu waktu, tutup saat klik di
 * luar, tutup saat tombol Escape, dan tutup sebelum navigasi opsi.
 */
export function AwardeeToolbar({
  periods,
  currentPeriodSlug,
  komisariats,
  currentKomisariat,
  query,
}: {
  periods: PeriodeOption[];
  currentPeriodSlug: string;
  komisariats: KomisariatOption[];
  currentKomisariat: string;
  query: string;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  /** Tutup semua dropdown yang sedang terbuka di toolbar ini. */
  const closeMenus = useCallback(() => {
    rootRef.current
      ?.querySelectorAll<HTMLDetailsElement>("details[open]")
      .forEach((element) => element.removeAttribute("open"));
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        closeMenus();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenus]);

  /** <details> tanpa atribut `name` tidak eksklusif sendiri. */
  const handleToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const current = event.currentTarget;
    if (!current.open) return;
    rootRef.current
      ?.querySelectorAll<HTMLDetailsElement>("details[open]")
      .forEach((element) => {
        if (element !== current) element.removeAttribute("open");
      });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const periode = String(data.get("periode") ?? "");
    const komisariat = String(data.get("komisariat") ?? "");
    const q = String(data.get("q") ?? "").trim();
    if (periode) params.set("periode", periode);
    if (komisariat) params.set("komisariat", komisariat);
    if (q) params.set("q", q);
    // `page` sengaja tidak ikut dikirim: filter baru selalu mulai dari halaman 1.
    router.push(`/awardee?${params.toString()}`, { scroll: false });
  };

  const periodeLabel =
    periods.find((item) => item.slug === currentPeriodSlug)?.label ??
    currentPeriodSlug;
  const komisariatLabel =
    komisariats.find((item) => item.slug === currentKomisariat)?.name ?? "Semua";
  const hasActiveFilter = currentKomisariat !== "" || query !== "";
  const resetHref = `/awardee?periode=${encodeURIComponent(currentPeriodSlug)}`;

  const periodeHref = (slug: string) => {
    const params = new URLSearchParams();
    params.set("periode", slug);
    if (currentKomisariat) params.set("komisariat", currentKomisariat);
    if (query) params.set("q", query);
    return `/awardee?${params.toString()}`;
  };

  const komisariatHref = (slug: string) => {
    const params = new URLSearchParams();
    params.set("periode", currentPeriodSlug);
    if (slug) params.set("komisariat", slug);
    if (query) params.set("q", query);
    return `/awardee?${params.toString()}`;
  };

  const triggerClass =
    "flex h-10 cursor-pointer select-none list-none items-center gap-2 rounded-md border border-genbi-line bg-white px-3.5 text-sm shadow-sm transition-colors hover:border-genbi-bright focus-visible:border-genbi-blue focus-visible:outline-none [&::-webkit-details-marker]:hidden";
  const panelClass =
    "absolute left-0 top-[calc(100%+6px)] z-30 max-h-[340px] overflow-y-auto rounded-md border border-genbi-line bg-white p-1.5 shadow-lg";
  const optionClass =
    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-700 transition-colors hover:bg-genbi-light";

  return (
    <div ref={rootRef} className="flex flex-wrap items-center gap-2.5">
      <details className="group relative" onToggle={handleToggle}>
        <summary className={triggerClass}>
          <span className="text-slate-500">Periode:</span>
          <span className="font-semibold text-slate-900">{periodeLabel}</span>
          <ChevronDown
            className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className={`${panelClass} w-56`}>
          <ul>
            {periods.map((periode) => {
              const isActive = periode.slug === currentPeriodSlug;
              return (
                <li key={periode.slug}>
                  <Link
                    href={periodeHref(periode.slug)}
                    aria-current={isActive ? "true" : undefined}
                    onClick={closeMenus}
                    className={optionClass}
                  >
                    <span className="flex-1 font-medium">{periode.label}</span>
                    {isActive && (
                      <Check className="h-4 w-4 text-genbi-blue" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </details>

      <details className="group relative" onToggle={handleToggle}>
        <summary className={triggerClass}>
          <span className="text-slate-500">Komisariat:</span>
          <span className="font-semibold text-slate-900">{komisariatLabel}</span>
          <ChevronDown
            className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className={`${panelClass} w-72`}>
          <ul>
            <li>
              <Link
                href={komisariatHref("")}
                aria-current={currentKomisariat === "" ? "true" : undefined}
                onClick={closeMenus}
                className={optionClass}
              >
                <span className="flex-1 font-medium">Semua Komisariat</span>
                {currentKomisariat === "" && (
                  <Check className="h-4 w-4 text-genbi-blue" aria-hidden="true" />
                )}
              </Link>
            </li>
            {komisariats.map((komisariat) => {
              const isActive = komisariat.slug === currentKomisariat;
              return (
                <li key={komisariat.slug}>
                  <Link
                    href={komisariatHref(komisariat.slug)}
                    aria-current={isActive ? "true" : undefined}
                    onClick={closeMenus}
                    className={optionClass}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-genbi-line bg-white">
                      <Image
                        src={toLogoSrc(komisariat.logo)}
                        alt=""
                        width={24}
                        height={24}
                        className="h-full w-full object-contain p-0.5"
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {komisariat.name}
                    </span>
                    <span className="text-xs tabular-nums text-slate-400">
                      {komisariat.count}
                    </span>
                    {isActive && (
                      <Check className="h-4 w-4 text-genbi-blue" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </details>

      <form
        action="/awardee"
        method="get"
        onSubmit={handleSubmit}
        className="relative h-10 min-w-[220px] flex-1 basis-[260px]"
      >
        <input type="hidden" name="periode" value={currentPeriodSlug} />
        {currentKomisariat ? (
          <input type="hidden" name="komisariat" value={currentKomisariat} />
        ) : null}
        <input
          type="search"
          name="q"
          defaultValue={query}
          aria-label="Cari awardee"
          placeholder="Cari nama atau program studi..."
          className="h-10 w-full rounded-md border border-genbi-line bg-white pl-3.5 pr-11 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-500 hover:border-genbi-bright focus:border-genbi-blue focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Terapkan pencarian"
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-genbi-blue text-white shadow-sm transition-colors hover:bg-genbi-blue-hover active:scale-[0.97]"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>

      {hasActiveFilter ? (
        <Link
          href={resetHref}
          className="text-sm font-semibold text-slate-500 transition-colors hover:text-genbi-blue"
        >
          Reset filter
        </Link>
      ) : null}
    </div>
  );
}
