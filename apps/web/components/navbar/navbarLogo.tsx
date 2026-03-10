"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * @component NavbarLogo
 * @description Renders the primary brand identity and wordmark within the global navigation bar.
 */

type NavbarLogoProps = {
  scrolled: boolean;
};

export function NavbarLogo({ scrolled }: NavbarLogoProps) {
  return (
    /* --- BRAND_IDENTITY_WRAPPER --- */
    <Link href="/" className="flex items-center gap-3 group relative z-[110]">
      {/* BRAND_MARK_CONTAINER */}
      <div className="relative w-9 h-9 transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/assets/logos/genbi.svg"
          alt="GenBI Jatim Logo"
          fill
          sizes="36px"
          className="object-contain"
          priority
        />
      </div>

      {/* WORDMARK_TYPOGRAPHY */}
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
