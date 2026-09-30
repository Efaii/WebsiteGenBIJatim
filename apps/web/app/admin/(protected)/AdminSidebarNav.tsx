"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { navGroupsForRole, type AdminRole } from "../nav";
import { NAV_LINK, NAV_LINK_ACTIVE } from "../ui";

const PENDING_NEWS_HREF = "/admin/persetujuan/berita";

/**
 * Daftar navigasi sidebar admin.
 *
 * Dipakai dua kali: sebagai kolom tetap di layar besar dan di dalam drawer
 * layar kecil. Halaman aktif ditandai `aria-current` sekaligus gaya visual
 * yang sama di kedua tempat.
 *
 * Admin global mendapat badge jumlah Berita yang menunggu persetujuan. Angka
 * dibaca dari API kanonik saat menu dirender, dimuat ulang ketika rute
 * berpindah, dan menyegar setelah aksi persetujuan mengirim sinyal
 * `admin:approvals-changed`.
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
  const isGlobal = role === "ADMIN_GLOBAL";
  const [pendingNews, setPendingNews] = useState(0);

  useEffect(() => {
    if (!isGlobal) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await api.get<{ data?: unknown[] }>("/v1/news/cms", {
          params: { status: "SUBMITTED" },
          withCredentials: true,
        });
        const count = Array.isArray(response.data.data)
          ? response.data.data.length
          : 0;
        if (!cancelled) setPendingNews(count);
      } catch {
        if (!cancelled) setPendingNews(0);
      }
    };
    void load();
    const onChanged = () => void load();
    window.addEventListener("admin:approvals-changed", onChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("admin:approvals-changed", onChanged);
    };
  }, [isGlobal, pathname]);

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
              const badge = item.href === PENDING_NEWS_HREF ? pendingNews : 0;
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
                    {badge > 0 ? (
                      <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-genbi-blue px-1.5 text-[11px] font-bold text-white">
                        {badge}
                      </span>
                    ) : null}
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
