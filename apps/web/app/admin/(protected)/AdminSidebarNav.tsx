"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { navGroupsForRole, type AdminRole } from "../nav";
import { NAV_LINK, NAV_LINK_ACTIVE } from "../ui";

const PENDING_NEWS_HREF = "/admin/persetujuan/berita";
const PENDING_PROGRAMS_HREF = "/admin/persetujuan/program-kerja";
const PENDING_AWARDEE_HREF = "/admin/persetujuan/awardee";

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
  const [pending, setPending] = useState<Record<string, number>>({});

  const allItems = groups.flatMap((group) => group.items);
  /*
   * Satu item paling cocok yang menyala: kecocokan persis menang atas
   * kecocokan awalan, dan awalan terpanjang menang (mis. /admin/proker/baru
   * menyalakan Tambah, bukan Riwayat).
   */
  const bestHref = allItems.reduce<string | null>((best, item) => {
    const exact = pathname === item.href;
    const prefix = !exact && pathname.startsWith(`${item.href}/`);
    if (!exact && !prefix) return best;
    const score = exact ? 100000 + item.href.length : item.href.length;
    const bestScore =
      best === null
        ? -1
        : pathname === best
          ? 100000 + best.length
          : best.length;
    return score > bestScore ? item.href : best;
  }, null);

  useEffect(() => {
    if (!isGlobal) return;
    let cancelled = false;
    const load = async () => {
      const counts: Record<string, number> = {
        [PENDING_NEWS_HREF]: 0,
        [PENDING_PROGRAMS_HREF]: 0,
        [PENDING_AWARDEE_HREF]: 0,
      };
      try {
        const [news, programs, membershipQueue, importBatches] =
          await Promise.all([
            api.get<{ data?: unknown[] }>("/v1/news/cms", {
              params: { status: "SUBMITTED" },
              withCredentials: true,
            }),
            api.get<{ data?: unknown[] }>("/v1/programs", {
              params: { status: "SUBMITTED", scope: "all" },
              withCredentials: true,
            }),
            api.get<{ data?: unknown[] }>("/v1/memberships/cms/review", {
              withCredentials: true,
            }),
            api.get<{ data?: unknown[] }>("/v1/membership-imports", {
              params: { status: "SUBMITTED" },
              withCredentials: true,
            }),
          ]);
        counts[PENDING_NEWS_HREF] = Array.isArray(news.data.data)
          ? news.data.data.length
          : 0;
        counts[PENDING_PROGRAMS_HREF] = Array.isArray(programs.data.data)
          ? programs.data.data.length
          : 0;
        counts[PENDING_AWARDEE_HREF] =
          (Array.isArray(membershipQueue.data.data)
            ? membershipQueue.data.data.length
            : 0) +
          (Array.isArray(importBatches.data.data)
            ? importBatches.data.data.length
            : 0);
      } catch {
        // Badge hanya informatif; kegagalan dibiarkan tanpa angka.
      }
      if (!cancelled) setPending(counts);
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
              const active = item.href === bestHref;
              const Icon = item.icon;
              const badge = pending[item.href] ?? 0;
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
