"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavDropdown, NavItem } from "@/config/site";

/**
 * NavbarLinks Component
 * * Purpose: Renders the primary desktop navigation interface and megamenu systems.
 * Architecture:
 * - Dropdown System: hover-triggered megamenu that lists either the public
 *   periods (Profil) or the commissariats (Komisariat).
 * - State Management: synchronizes active styling from the current `pathname`.
 *
 * Skala tipografi dibuat bertingkat: 15px di md, 17px di lg ke atas. Pada 768px
 * enam label dengan huruf 17px tidak muat satu baris, jadi ukuran penuh baru
 * dipakai mulai lg. Jarak antar menu juga mengikuti: rapat di md, lega di lg.
 */

type CommissariatLink = { name: string; slug: string };
type PeriodLink = { name: string; href: string };

type NavbarLinksProps = {
  pathname: string;
  navItems: NavItem[];
  commissariatLinks: CommissariatLink[];
  periodLinks: PeriodLink[];
};

const EMPTY_LABEL: Record<NavDropdown, string> = {
  profil: "Belum ada periode",
  commissariat: "Belum ada komisariat",
};

/** Kelas bersama untuk setiap item navigasi: ukuran, padding, dan area klik. */
const ITEM_BASE =
  "px-1.5 py-2 lg:px-3 text-[15px] lg:text-[17px] transition-colors flex items-center gap-1.5";

export function NavbarLinks({
  pathname,
  navItems,
  commissariatLinks,
  periodLinks,
}: NavbarLinksProps) {
  return (
    <div className="hidden lg:flex items-center gap-3 lg:gap-7 xl:gap-9">
      <div className="flex items-center gap-3 lg:gap-7 xl:gap-9">
        {navItems.map((link) => {
          if (link.dropdown) {
            const items = link.dropdown === "profil"
              ? periodLinks.map((item) => ({ key: item.href, name: item.name, href: item.href }))
              : commissariatLinks.map((item) => ({ key: item.slug, name: item.name, href: `/commissariat/${item.slug}` }));
            const isDropdownActive = pathname.startsWith(link.href);
            return (
              <div
                key={link.href}
                className="relative group h-full flex items-center"
              >
                <Link
                  href={link.href}
                  className={cn(
                    ITEM_BASE,
                    "font-medium relative after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5",
                    isDropdownActive
                      ? cn("font-bold", "text-blue-600 after:bg-current")
                      : "text-slate-900 hover:text-blue-600",
                  )}
                >
                  {link.label}
                  <svg
                    className="h-3.5 w-3.5 opacity-90 transition-transform group-hover:rotate-180 lg:h-4 lg:w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>

                {/* --- MEGAMENU OVERLAY INTERFACE --- */}
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 w-72 z-50">
                  <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl overflow-hidden shadow-xl p-2 flex flex-col gap-1">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {items.length > 0 ? (
                        items.map((item) => (
                          <Link
                            key={item.key}
                            href={item.href}
                            className="block px-4 py-2.5 text-[15px] text-slate-900 hover:bg-blue-600 hover:text-white rounded-full transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))
                      ) : (
                        <span className="block px-4 py-2.5 text-[15px] text-slate-400">
                          {EMPTY_LABEL[link.dropdown]}
                        </span>
                      )}
                    </div>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <Link
                      href={link.href}
                      className="block px-4 py-2 text-xs text-center text-blue-600 hover:bg-blue-600 hover:text-white rounded-full font-bold uppercase tracking-wider transition-colors"
                    >
                      Lihat Semua
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          {
            /* --- STANDARD NAVIGATION INTERFACE --- */
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                ITEM_BASE,
                "font-medium relative after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:transition-opacity",
                pathname === link.href
                  ? cn("font-bold after:opacity-100", "text-blue-600 after:bg-blue-600")
                  : "text-slate-900 hover:text-blue-600 after:opacity-0",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
