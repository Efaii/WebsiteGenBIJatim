"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { getPublicPeriods, periodSlug } from "@/lib/services/period.service";

import { NavbarLogo } from "./navbarLogo";
import { NavbarLinks } from "./navbarLinks";
import { MobileMenu } from "./mobileMenu";

/**
 * Navbar Component
 *
 * Dua keadaan visual:
 * - MENGAMBANG: hanya di beranda, selama pengguna masih di dekat puncak
 *   halaman. Kapsul putih nyaris pekat, sudut membulat, dengan ruang kosong di
 *   kiri-kanan dan atas viewport. Tepi kapsul sejajar dengan tepi Container.
 * - FULL-WIDTH: begitu pengguna scroll melewati ambang kecil (56px), atau di
 *   halaman selain beranda. Bar penuh selebar viewport, tanpa radius.
 *
 * Perpindahan keadaan memakai ambang jarak scroll dari puncak, BUKAN posisi
 * section berikutnya. Alasannya: perilaku yang diinginkan adalah "baru scroll
 * sedikit, navbar langsung melebar", seperti referensi. Lihat ADR 0005.
 *
 * Ambang 56px dipilih di dalam rentang 40-80px: cukup kecil supaya terasa
 * langsung, cukup besar supaya tidak berkedip karena pantulan scroll.
 */
export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Listener hanya dipasang di beranda; halaman lain tidak perlu membaca scroll
  // karena navbar-nya selalu full-width.
  const scrolled = useScrollPosition(56, isHome);
  const [isOpen, setIsOpen] = useState(false);
  const [periods, setPeriods] = useState<string[]>([]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const floating = isHome && !scrolled;

  {/* --- DATA ARCHITECTURE: PUBLIC PERIODS --- */}
  useEffect(() => {
    let cancelled = false;
    getPublicPeriods()
      .then((data) => {
        if (!cancelled) setPeriods(data.periods);
      })
      .catch(() => {
        // Navigasi tetap terpakai walau label periode gagal dimuat: submenu
        // Profil cukup kehilangan daftar periode, bukan membuat halaman error.
        if (!cancelled) setPeriods([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
  const COMMISSARIAT_LINKS = siteConfig.commissariatLinks;

  const PERIOD_LINKS = periods.map((period) => ({
    name: period,
    href: `/profil/${periodSlug(period)}`,
  }));

  return (
    <>
      {/* --- PRIMARY NAVIGATION BAR ARCHITECTURE --- */}
      {/*
       * Dua keadaan hanya berbeda pada bentuk luar:
       *
       * - MENEMPEL: bar menempel di puncak viewport, jadi hanya sudut BAWAH
       *   yang membulat, atasnya rata mengikuti tepi layar.
       * - FULL-WIDTH: begitu celah kiri-kanan tertutup, radius bawah ikut
       *   hilang supaya bar benar-benar menutup penuh sampai tepi layar.
       *
       * Tinggi, latar, dan bayangan sama di kedua keadaan; yang beranimasi
       * hanya padding horizontal dan radius bawah.
       */}
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transform-gpu transition-[padding] duration-400 ease-out",
          floating ? "px-6 md:px-10" : "px-0",
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-20 items-center justify-between border border-white/60 bg-white/92 shadow-[0_10px_32px_-16px_rgba(16,42,92,0.35)] backdrop-blur-xl transition-all duration-400 ease-out md:h-[88px]",
            floating ? "max-w-[1440px] rounded-b-nav" : "max-w-none rounded-none",
          )}
        >
          {/*
           * Selarasan tepi: saat mengambang, inset kapsul (24px mobile, 40px
           * md ke atas) sudah memakan sebagian gutter Container (24/40/64),
           * jadi sisa gutter di dalam kapsul hanya selisihnya. Nilainya ada di
           * globals.css sebagai `.nav-inner-floating`.
           */}
          <div
            className={cn(
              "mx-auto flex h-full w-full max-w-[1440px] items-center justify-between",
              floating ? "nav-inner-floating" : "px-6 md:px-10 xl:px-16",
            )}
          >
            {/* --- BRANDING ASSET INTERFACE --- */}
            <NavbarLogo />

            {/* --- DESKTOP NAVIGATION ENGINE --- */}
            <NavbarLinks
              pathname={pathname}
              navItems={siteConfig.navItems}
              commissariatLinks={COMMISSARIAT_LINKS}
              periodLinks={PERIOD_LINKS}
            />

            {/* --- MOBILE INTERACTION TRIGGER --- */}
            <div className="lg:hidden relative z-[110]">
              <button
                ref={menuButtonRef}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu"
                aria-expanded={isOpen}
                className={cn(
                  // Satu langkah lebih kecil di layar sempit (40px, ikon 20px) lalu
                  // kembali 44px/22px mulai md, jadi tampilan tablet dan desktop
                  // tidak berubah. Tombol 44px di bar 80px terasa terlalu berat.
                  "flex h-10 w-10 items-center justify-center rounded-thumb border transition-all duration-300 active:scale-95 md:h-11 md:w-11",
                  isOpen
                    ? "bg-slate-900 border-slate-800 text-white"
                    : // Tombol menu harus tidak mungkin terlewat. Versi putih di
                      // atas kapsul putih sebelumnya tidak terlihat, versi chip
                      // biru muda pun masih terlalu halus, jadi sekarang solid.
                      "bg-genbi-blue border-genbi-blue text-white shadow-sm hover:bg-[#1a56e6]",
                )}
              >
                {isOpen ? (
                  <X size={22} className="h-5 w-5 md:h-[22px] md:w-[22px]" />
                ) : (
                  <Menu size={22} className="h-5 w-5 md:h-[22px] md:w-[22px]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE NAVIGATION OVERLAY SYSTEM --- */}
      <MobileMenu
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          // Kembalikan fokus ke tombol pemicu supaya pengguna keyboard tidak
          // terlempar ke awal halaman.
          menuButtonRef.current?.focus();
        }}
        pathname={pathname}
        commissariatLinks={COMMISSARIAT_LINKS}
        periodLinks={PERIOD_LINKS}
      />
    </>
  );
}
