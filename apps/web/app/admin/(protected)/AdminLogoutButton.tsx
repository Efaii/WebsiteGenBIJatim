"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { logoutCms } from "@/lib/services/cms-auth.service";

export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      await logoutCms();
    } catch {
      // Sesi mungkin sudah tidak valid; tetap lanjutkan ke halaman masuk.
    }
    router.push("/admin/login?reason=logged-out");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-genbi-haze hover:bg-genbi-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 disabled:pointer-events-none disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <LogOut className="h-4 w-4" aria-hidden />
      )}
      <span className="hidden sm:inline">{busy ? "Keluar..." : "Keluar"}</span>
      <span className="sr-only sm:hidden">Keluar</span>
    </button>
  );
}
