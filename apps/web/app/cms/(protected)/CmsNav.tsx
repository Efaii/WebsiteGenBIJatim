"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/cms", label: "Ringkasan" },
  { href: "/cms/beranda", label: "Beranda" },
  { href: "/cms/berita", label: "Berita" },
  { href: "/cms/faq", label: "FAQ" },
];

/** Navigasi area CMS (seadanya; ditumbuhkan bersama tiket berikutnya). */
export function CmsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active =
          link.href === "/cms"
            ? pathname === "/cms"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              active
                ? "bg-genbi-blue text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
