"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navGroupsForRole, type AdminRole } from "../nav";
import { NAV_LINK, NAV_LINK_ACTIVE } from "../ui";

/**
 * Daftar navigasi sidebar admin.
 *
 * Dipakai dua kali: sebagai kolom tetap di layar besar dan di dalam drawer
 * layar kecil. Halaman aktif ditandai `aria-current` sekaligus gaya visual
 * yang sama di kedua tempat.
 */
export function AdminSidebarNav({
  role,
  className,
  onNavigate,
}: {
  role: AdminRole;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groups = navGroupsForRole(role);

  return (
    <nav aria-label="Navigasi admin" className={cn("space-y-5", className)}>
      {groups.map((group) => (
        <div key={group.label ?? group.items[0]?.href}>
          {group.label ? (
            <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
          ) : null}
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(NAV_LINK, active && NAV_LINK_ACTIVE)}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
