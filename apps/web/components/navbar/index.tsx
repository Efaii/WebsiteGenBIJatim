"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";
import { COMMISSARIAT_DATA } from "@/content/commissariatData";

import { NavbarLogo } from "./navbarLogo";
import { NavbarLinks } from "./navbarLinks";
import { MobileMenu } from "./mobileMenu";

/**
 * Navbar Component
 * * Purpose: Acts as the root orchestrator for the global navigation system.
 * Architecture:
 * - State Management: Synchronizes the mobile menu visibility and global scroll positions.
 * - Logic: Implements body-scroll locking and dynamic data formatting for organizational sub-menus.
 * - Composition: Integrates logo assets, desktop link systems, and mobile navigation overlays.
 */
export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrollPosition();
  const [isOpen, setIsOpen] = useState(false);

  {/* --- INTERACTION LOGIC: SCROLL LOCK --- */}
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  {/* --- DATA ARCHITECTURE: COMMISSARIAT RESOLVER --- */}
  const COMMISSARIAT_LINKS = Object.values(COMMISSARIAT_DATA)
    .map((c) => ({
      name: c.name.replace("GenBI Komisariat ", ""),
      slug: c.slug,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {/* --- PRIMARY NAVIGATION BAR ARCHITECTURE --- */}
      <nav
        className={cn(
          "fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b transform-gpu",
          scrolled
            ? "bg-white/80 backdrop-blur-md border-slate-100 h-16 shadow-sm"
            : "bg-transparent border-transparent h-20",
        )}
      >
        <div className="container px-6 lg:px-8 xl:px-12 mx-auto h-full max-w-7xl">
          <div className="w-full h-full flex items-center justify-between lg:px-6 xl:px-10">
            
            {/* --- BRANDING ASSET INTERFACE --- */}
            <NavbarLogo scrolled={scrolled} />

            {/* --- DESKTOP NAVIGATION ENGINE --- */}
            <NavbarLinks
              scrolled={scrolled}
              pathname={pathname}
              navItems={siteConfig.navItems}
              commissariatLinks={COMMISSARIAT_LINKS}
            />

            {/* --- MOBILE INTERACTION TRIGGER --- */}
            <div className="md:hidden relative z-[110]">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-xl border active:scale-95",
                  isOpen
                    ? "bg-slate-900 border-slate-800 text-white"
                    : scrolled
                      ? "bg-white border-slate-200 text-slate-900 shadow-sm"
                      : "bg-white/50 border-white/40 text-slate-900 backdrop-blur-md",
                )}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE NAVIGATION OVERLAY SYSTEM --- */}
      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pathname={pathname}
        commissariatLinks={COMMISSARIAT_LINKS}
      />
    </>
  );
}