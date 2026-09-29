"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutCms } from "@/lib/services/cms-auth.service";

export function CmsLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      await logoutCms();
    } catch {
      // Sesi mungkin sudah tidak valid; tetap lanjutkan ke halaman masuk.
    }
    router.push("/cms/login?reason=logged-out");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
    >
      {busy ? "Keluar..." : "Keluar"}
    </button>
  );
}
