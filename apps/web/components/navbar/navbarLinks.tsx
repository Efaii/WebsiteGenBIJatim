"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * NavbarLinks Component
 * * Purpose: Renders the primary desktop navigation interface and complex megamenu systems.
 * Architecture:
 * - Visibility: Optimized for large viewports (`hidden md:flex`) using a horizontal flexbox alignment.
 * - Dropdown System: Implements a hover-triggered megamenu with an internal scrollable architecture for high-density links.
 * - State Management: Synchronizes visual active states by comparing current `pathname` against route definitions.
 */

type CommissariatLink = {
  name: string;
  slug: string;
};

type NavItem = {
  href: string;
  label: string;
  hasDropdown?: boolean;
};

type NavbarLinksProps = {
  scrolled: boolean;
  pathname: string;
  navItems: NavItem[];
  commissariatLinks: CommissariatLink[];
};

export function NavbarLinks({
  scrolled,
  pathname,
  navItems,
  commissariatLinks,
}: NavbarLinksProps) {
  return (
    <div className="hidden md:flex items-center gap-8">
      <div className="flex items-center gap-8">
        {navItems.map((link) => {
          {
            /* --- COMPLEX DROPDOWN ARCHITECTURE --- */
          }
          {
            /* Handles multi-link megamenus with integrated hover-state logic */
          }
          if (link.hasDropdown) {
            const isDropdownActive = pathname.startsWith("/commissariat");
            return (
              <div
                key={link.href}
                className="relative group h-full flex items-center py-2"
              >
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors flex items-center gap-1",
                    isDropdownActive
                      ? "text-blue-600 font-bold"
                      : "text-slate-900 hover:text-blue-700",
                  )}
                >
                  {link.label}
                  <svg
                    className="w-3 h-3 opacity-90 group-hover:rotate-180 transition-transform"
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
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 w-64 z-50">
                  <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl overflow-hidden shadow-xl p-2 flex flex-col gap-1">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {commissariatLinks.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/commissariat/${item.slug}`}
                          className="block px-4 py-2 text-sm text-slate-900 hover:bg-blue-600 hover:text-white rounded-full transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <Link
                      href="/commissariat"
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
          {
            /* Manages individual route synchronization and scroll-aware styling */
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                pathname === link.href
                  ? "text-blue-600 font-bold"
                  : scrolled
                    ? "text-slate-900"
                    : "text-slate-900",
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
