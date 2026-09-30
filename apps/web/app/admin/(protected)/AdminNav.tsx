"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  House,
  LayoutDashboard,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/beranda", label: "Beranda", icon: House },
  { href: "/admin/berita", label: "Berita", icon: Newspaper },
  { href: "/admin/faq", label: "FAQ", icon: CircleHelp },
];

/**
 * Navigasi area admin: pill untuk halaman aktif, gaya mengikuti navbar
 * halaman publik. Dirender dua kali oleh layout (baris desktop dan baris
 * gulir untuk layar kecil) dengan kelas wadah yang berbeda.
 */
export function AdminNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50",
              active
                ? "bg-genbi-blue text-white shadow-sm"
                : "text-slate-600 hover:bg-genbi-light hover:text-genbi-ink",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
