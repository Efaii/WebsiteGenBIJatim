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

type NavbarLogoProps = {
  scrolled: boolean;
};

export function NavbarLogo({ scrolled }: NavbarLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3 group relative z-[110]">
      {/* --- BRAND MARK CONTAINER --- */}
      <div className="relative w-9 h-9 transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/assets/logos/genbi.svg"
          alt="GenBI Jatim Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* --- WORDMARK TYPOGRAPHY --- */}
      <span
        className={cn(
          "text-lg font-bold tracking-tight transition-colors duration-300",
          scrolled ? "text-slate-900" : "text-slate-800",
        )}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}