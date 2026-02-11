"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { COMMISSARIAT_DATA } from "@/content/commissariatData";

export function NavLinks() {
  const pathname = usePathname();

  // Prepare Commissariat Links
  const COMMISSARIAT_LINKS = Object.values(COMMISSARIAT_DATA)
    .map((c) => ({
      name: c.name.replace("GenBI Komisariat ", ""),
      slug: c.slug,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-blue-100/90">
      {siteConfig.navItems.map((item, index) => {
        const isActive = pathname === item.href;

        // Special Dropdown Logic for Commissariat
        if (item.hasDropdown) {
          const isDropdownActive = pathname.startsWith("/commissariat");
          return (
            <div
              key={index}
              className="relative group py-2 h-full flex items-center"
            >
              <Link
                href={item.href}
                className={`flex items-center gap-1 cursor-pointer transition-colors ${
                  isDropdownActive
                    ? "text-white"
                    : "text-blue-100/90 group-hover:text-white"
                }`}
              >
                <span>{item.label}</span>
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
                  isDropdownActive ? "w-full scale-x-100" : "w-full scale-x-0"
                }`}
              ></span>
            </div>
          );
        }

        return (
          <Link
            key={index}
            href={item.href}
            className="relative group py-2 overflow-hidden"
          >
            <div className="relative overflow-hidden">
              <span
                className="block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
                data-text={item.label}
              >
                {item.label}
              </span>
              <span className="absolute top-0 left-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0 text-blue-100/90">
                {item.label}
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
  );
}
