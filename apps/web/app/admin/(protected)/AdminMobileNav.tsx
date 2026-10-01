"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { AdminRole } from "../nav";
import { BTN_ICON } from "../ui";
import { AdminSidebarNav } from "./AdminSidebarNav";

/**
 * Navigasi layar kecil: tombol menu di header membuka drawer dari kiri.
 *
 * Drawer di-portal ke `document.body` karena header memakai `backdrop-blur`;
 * properti itu menjadikan header containing block untuk elemen `fixed`,
 * sehingga tanpa portal drawer hanya akan setinggi header.
 *
 * Drawer mengunci gulir latar, menutup lewat tombol tutup, klik latar, atau
 * Escape, dan mengembalikan fokus ke tombol menu saat ditutup.
 */
export function AdminMobileNav({ role }: { role: AdminRole }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="nav-admin-layar-kecil"
        className={BTN_ICON}
      >
        <Menu className="h-5 w-5" aria-hidden />
        <span className="sr-only">Buka navigasi</span>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60]">
            <button
              type="button"
              aria-label="Tutup navigasi"
              onClick={() => close(true)}
              className="absolute inset-0 bg-slate-900/35"
            />
            <div
              id="nav-admin-layar-kecil"
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Navigasi admin"
              className="absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto border-r border-genbi-line bg-white p-5 shadow-[0_24px_60px_-30px_rgba(16,42,92,0.45)] outline-none"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <Link
                  href="/admin"
                  onClick={() => close(false)}
                  className="flex min-w-0 items-center gap-2.5"
                >
                  <span className="relative h-8 w-8 shrink-0">
                    <Image
                      src="/assets/logos/genbi.svg"
                      alt=""
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </span>
                  <span className="truncate text-base font-bold tracking-tight">
                    <span className="text-genbi-ink">GenBI</span>{" "}
                    <span className="text-genbi-brand-red">Jatim</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => close(true)}
                  className={BTN_ICON}
                >
                  <X className="h-5 w-5" aria-hidden />
                  <span className="sr-only">Tutup navigasi</span>
                </button>
              </div>
              <AdminSidebarNav role={role} onNavigate={() => close(false)} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
