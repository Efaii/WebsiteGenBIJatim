"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { siteConfig } from "@/config/site";
import { COMMISSARIAT_DATA } from "@/content/commissariatData";

import { NavbarLogo } from "./navbarLogo";
import { NavbarLinks } from "./navbarLinks";
import { MobileMenu } from "./mobileMenu";
import { Button } from "@/components/Button";
import { useScrollLock } from "@/hooks/useScrollLock";

/**
 * @component Navbar
 * @description The primary navigation system featuring adaptive styling based on scroll position.
 */
export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrollPosition();
  const [isOpen, setIsOpen] = useState(false);

  /* --- SIDE_EFFECTS --- */
  useScrollLock(isOpen);

  /* --- DATA_TRANSFORMATION --- */
  const COMMISSARIAT_LINKS = Object.values(COMMISSARIAT_DATA).map((c) => ({
    name: c.name,
    slug: c.slug,
    logo_univ: c.logo_univ,
  }));

  return (
    <>
      {/* --- NAVIGATION_CONTAINER --- */}
      <nav
        className={cn(
          "fixed left-0 right-0 z-[100] transition-[top,width,height,background-color,border-color,border-radius,box-shadow] duration-400 ease-out transform-gpu mx-auto",
          scrolled
            ? "top-4 max-w-6xl w-[95%] rounded-full bg-white border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-16"
            : "top-0 w-full bg-transparent border-transparent h-24"
        )}
      >
        <div className={cn(
          "mx-auto h-full transition-[padding,width] duration-400 ease-out",
          scrolled ? "px-6 w-full" : "container px-6 lg:px-8 xl:px-12 max-w-7xl"
        )}>
          <div className={cn(
            "flex items-center justify-between h-full transition-opacity duration-300",
            !scrolled && "lg:px-6 xl:px-10"
          )}>
            
            {/* BRANDING_LOGO */}
            <NavbarLogo scrolled={scrolled} />

            {/* DESKTOP_NAVIGATION_LINKS */}
            <div className="hidden lg:block">
              <NavbarLinks
                pathname={pathname}
                navItems={siteConfig.navItems}
                commissariatLinks={COMMISSARIAT_LINKS}
                scrolled={scrolled}
              />
            </div>

            {/* ACTION_CONTROLS */}
            <div className="flex items-center gap-3">
              {/* INTERNAL_PORTAL_CTA */}
              <Link href="/docs" className="hidden sm:block">
                <Button 
                  variant="primary" 
                  className={cn(
                    "rounded-full transition-[background-color,transform,box-shadow,color,padding,font-size] duration-300 font-semibold",
                    scrolled ? "px-6 py-2 text-sm" : "px-8 py-3 text-base"
                  )}
                >
                  Portal
                </Button>
              </Link>

              {/* MOBILE_MENU_TRIGGER */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "lg:hidden w-11 h-11 flex items-center justify-center rounded-full transition-all duration-100",
                  scrolled ? "bg-slate-100 text-slate-900" : "bg-slate-100 text-slate-900 backdrop-blur-md"
                )}
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE_NAVIGATION_OVERLAY --- */}
      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pathname={pathname}
        commissariatLinks={COMMISSARIAT_LINKS}
        navItems={siteConfig.navItems}
      />
    </>
  );
}