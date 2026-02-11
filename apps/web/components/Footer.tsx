"use client";

import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "./MotionWrapper";

export function Footer() {
  return (
    <footer className="w-full text-white pt-20 pb-10 bg-gradient-to-t from-blue-950 to-transparent relative overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <FadeIn className="w-full relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Column 1: Identity & Address */}
            <div className="space-y-6">
              <Link href="/" className="inline-block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 relative">
                    <Image
                      src="/assets/logos/genbi.svg"
                      alt="GenBI Logo"
                      fill
                      className="object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-xl font-bold tracking-tight">
                    GenBI Jawa Timur
                  </span>
                </div>
              </Link>
              <p className="text-blue-200/70 text-sm leading-relaxed">
                Komunitas penerima Beasiswa Bank Indonesia yang berdedikasi
                sebagai "Energi Untuk Negeri", garda terdepan transformasi
                bangsa.
              </p>
              <address className="not-italic text-sm text-blue-200/60 space-y-2">
                <p className="font-semibold text-white">
                  Sekretariat GenBI Jatim
                </p>
                <p>Perpustakaan Bank Indonesia</p>
                <p>
                  Jl. Taman Mayangkara No.6, Darmo, Kec. Wonokromo, Surabaya,
                  Jawa Timur
                </p>
              </address>

              <div className="pt-6 mt-6 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-blue-300/40 font-bold mb-3">
                  Didukung Sepenuhnya Oleh
                </p>
                <div className="relative w-40 h-12 opacity-80 hover:opacity-100 transition-opacity">
                  <Image
                    src="/assets/logos/bankIndonesiaWhite.svg"
                    alt="Bank Indonesia Logo"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="font-bold text-white text-lg mb-6">Jelajahi</h4>
              <ul className="space-y-3 text-sm text-blue-200/70">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="/commissariat"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Komisariat & Kampus
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calendar"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Kalender Kegiatan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Panduan & Dokumen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/awardee"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Database Awardee
                  </Link>
                </li>
                <li>
                  <Link
                    href="/news"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Berita Terkini
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Commissariats */}
            <div>
              <h4 className="font-bold text-white text-lg mb-6">Komisariat</h4>
              <ul className="space-y-3 text-sm text-blue-200/70">
                <li>
                  <Link
                    href="/commissariat/unair"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Universitas Airlangga
                  </Link>
                </li>
                <li>
                  <Link
                    href="/commissariat/its"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Institut Teknologi Sepuluh Nopember
                  </Link>
                </li>
                <li>
                  <Link
                    href="/commissariat/unesa"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Universitas Negeri Surabaya
                  </Link>
                </li>
                <li>
                  <Link
                    href="/commissariat/upn-veteran-jatim"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    UPN "Veteran" Jawa Timur
                  </Link>
                </li>
                <li>
                  <Link
                    href="/commissariat"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-xs uppercase tracking-wider mt-2 inline-block"
                  >
                    Lihat Semua (9) →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Socials & Contact */}
            <div>
              <h4 className="font-bold text-white text-lg mb-6">Terhubung</h4>
              <div className="flex gap-4 mb-6">
                {[
                  {
                    name: "Instagram",
                    url: "https://instagram.com/genbi_jatim",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    ),
                  },
                  {
                    name: "YouTube",
                    url: "http://youtube.com/@genbijawatimur3986",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                    ),
                  },
                  {
                    name: "Email",
                    url: "https://mail.google.com/mail/?view=cm&fs=1&to=genbisuramadubjn@gmail.com",
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z" />
                      </svg>
                    ),
                  },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-500/20 hover:backdrop-blur-xl hover:border-cyan-500/40 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300 text-blue-200"
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <p className="text-sm text-blue-200/60 mb-2">
                Punya pertanyaan seputar beasiswa?
              </p>
              <Link href="/contact">
                <span className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer border-b border-cyan-400/30 pb-0.5 hover:border-cyan-300">
                  Hubungi Sekretariat Kami &rarr;
                </span>
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-blue-200/40">
            <p className="text-center md:text-left mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Generasi Baru Indonesia
              Koordinator Komisariat Jawa Timur. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="cursor-pointer hover:text-white transition-colors">
                Privacy Policy
              </span>
              <span className="cursor-pointer hover:text-white transition-colors">
                Terms of Service
              </span>
              <span className="cursor-pointer hover:text-white transition-colors">
                Cookie Policy
              </span>
            </div>
          </div>
        </div>
      </FadeIn>
    </footer>
  );
}
