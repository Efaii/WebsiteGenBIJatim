"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./Button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Navigation Items
  const NAV_ITEMS = [
    "Beranda",
    "Tentang Kami",
    "Komisariat",
    "Kalender",
    "Awardee",
    "Berita",
    "Dokumen",
    "Hubungi Kami",
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 w-full bg-blue-950/70 backdrop-blur-xl border-b border-blue-800/20 shadow-sm supports-[backdrop-filter]:bg-blue-950/60"
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-8 w-8 md:h-9 md:w-9">
              <Image
                src="/assets/logos/genbi.svg"
                alt="GenBI Logo"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              GenBI Jatim
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-blue-100/90">
            {NAV_ITEMS.map((item, index) => {
              if (item === "Komisariat") {
                const COMMISSARIAT_LINKS = [
                  { name: "UNAIR", slug: "unair" },
                  { name: "ITS", slug: "its" },
                  { name: "UNESA", slug: "unesa" },
                  { name: "UPNVJT", slug: "upn-veteran-jatim" },
                  { name: "UINSA", slug: "uinsa" },
                  { name: "PENS", slug: "pens" },
                  { name: "UIN Madura", slug: "uin-madura" },
                  { name: "UNUGIRI", slug: "unugiri" },
                  { name: "UTM", slug: "utm" },
                ];
                const isActive = pathname.startsWith("/commissariat");

                return (
                  <div
                    key={index}
                    className="relative group py-2 h-full flex items-center"
                  >
                    <Link
                      href="/commissariat"
                      className={`flex items-center gap-1 cursor-pointer transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-blue-100/90 group-hover:text-white"
                      }`}
                    >
                      <span>Komisariat</span>
                      <svg
                        className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 opacity-70"
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

                    {/* Dropdown Container */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 w-56">
                      <div className="bg-blue-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col gap-1">
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar scroll-smooth">
                          {COMMISSARIAT_LINKS.map((link) => (
                            <Link
                              key={link.slug}
                              href={`/commissariat/${link.slug}`}
                              className="block px-4 py-3 text-base text-blue-100/80 hover:bg-white/10 hover:text-white rounded-full transition-colors"
                            >
                              {link.name}
                            </Link>
                          ))}
                        </div>
                        <div className="h-px bg-white/10 my-1"></div>
                        <Link
                          href="/commissariat"
                          className="block px-4 py-3 text-xs text-center text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 rounded-xl font-bold uppercase tracking-wider transition-colors"
                        >
                          Lihat Semua
                        </Link>
                      </div>
                    </div>

                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-blue-200/50 transition-transform duration-500 ease-out origin-left ${
                        isActive ? "w-full scale-x-100" : "w-full scale-x-0"
                      }`}
                    ></span>
                  </div>
                );
              }

              const href =
                item === "Beranda"
                  ? "/"
                  : item === "Tentang Kami"
                    ? "/about"
                    : item === "Awardee"
                      ? "/awardee"
                      : item === "Kalender"
                        ? "/calendar"
                        : item === "Berita"
                          ? "/news"
                          : item === "Dokumen"
                            ? "/docs"
                            : item === "Hubungi Kami"
                              ? "/contact"
                              : "#";
              const isActive = pathname === href;

              return (
                <Link
                  key={index}
                  href={href}
                  className="relative group py-2 overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <span
                      className="block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
                      data-text={item}
                    >
                      {item}
                    </span>
                    <span className="absolute top-0 left-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0 text-blue-100/90">
                      {item}
                    </span>
                  </div>
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-blue-200/50 transition-transform duration-500 ease-out origin-left ${
                      isActive ? "w-full scale-x-100" : "w-full scale-x-0"
                    }`}
                  ></span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="secondary" size="md" className="rounded-full">
                Login Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2 focus:outline-none"
            onClick={toggleMenu}
          >
            <div className="w-6 h-6 flex flex-col justify-around relative">
              <span
                className={`w-full h-0.5 bg-white transition-all transform ${
                  isMobileMenuOpen ? "rotate-45 translate-y-2.5" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white transition-all opacity-100 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white transition-all transform ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 z-40 bg-blue-950/95 backdrop-blur-xl pt-24 px-6 md:hidden overflow-hidden"
          >
            <div className="flex flex-col space-y-6 text-center">
              {NAV_ITEMS.map((item, index) => {
                const href =
                  item === "Beranda"
                    ? "/"
                    : item === "Tentang Kami"
                      ? "/about"
                      : item === "Komisariat"
                        ? "/commissariat"
                        : item === "Awardee"
                          ? "/awardee"
                          : item === "Kalender"
                            ? "/calendar"
                            : item === "Berita"
                              ? "/news"
                              : item === "Hubungi Kami"
                                ? "/contact"
                                : "/docs";

                return (
                  <Link
                    key={index}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-bold text-white py-2 border-b border-white/10"
                  >
                    {item}
                  </Link>
                );
              })}
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="lg" className="w-full mt-4">
                  Login Admin
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
