"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * NavbarLogo Component
 * * Purpose: Renders the primary brand identity and wordmark within the global navigation bar.
 * Architecture:
 * - Layout: Horizontal flex container pairing a dynamic SVG asset with a high-contrast text label.
 * - Visuals: Implements conditional color states based on scroll position and interactive hover scaling.
 * - Z-Index: Strategically elevated to maintain brand visibility above mobile navigation overlays.
 */

export function NavbarLogo() {
  /*
   * Nama merek dipecah supaya dua katanya bisa berwarna berbeda: "GenBI" tetap
   * biru dan "Jatim" memakai merah dari logo (token, bukan angka warna liar).
   * Dipecah dari `siteConfig.name`, jadi kalau namanya berubah, keduanya ikut.
   */
  const [brandLead, ...brandRest] = siteConfig.name.split(" ");
  const brandTrail = brandRest.join(" ");

  return (
    <Link href="/" className="flex items-center gap-3 group relative z-[110]">
      {/* --- BRAND MARK CONTAINER --- */}
      {/*
       * Ukuran lambang mengecil satu langkah di layar sempit (36px) lalu kembali
       * ke 40px mulai md dan 44px mulai lg, supaya tinggi bar yang lebih pendek
       * di mobile tidak terasa penuh. Tampilan md ke atas tidak berubah.
       */}
      <div className="relative h-9 w-9 transition-transform duration-300 group-hover:scale-105 md:h-10 md:w-10 lg:h-11 lg:w-11">
        <Image
          src="/assets/logos/genbi.svg"
          alt="GenBI Jatim Logo"
          fill sizes="48px"
          className="object-contain"
          priority
        />
      </div>

      {/* --- WORDMARK TYPOGRAPHY --- */}
      <span
        className={cn(
          "text-lg font-bold tracking-tight transition-colors duration-300 lg:text-xl",
        )}
      >
        <span className="text-genbi-ink">{brandLead}</span>
        {brandTrail ? <span className="text-genbi-brand-red"> {brandTrail}</span> : null}
      </span>
    </Link>
  );
}