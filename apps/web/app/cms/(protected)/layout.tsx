import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { readCmsSession } from "@/lib/cms-session";
import { CmsLogoutButton } from "./CmsLogoutButton";
import { CmsNav } from "./CmsNav";

/**
 * Kerangka area CMS.
 *
 * Layout hanya menangani pengunjung tanpa sesi (redirect ke halaman masuk).
 * Pemeriksaan peran dilakukan di level halaman (`getCmsPageSession`) karena
 * layout yang mengembalikan pohon tanpa `children` membuat boundary Suspense
 * tidak pernah selesai pada hard load (terjebak di fallback "Memuat halaman").
 */
export default async function CmsProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await readCmsSession();
  if (!session) redirect("/cms/login?reason=required");

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              CMS GenBI Jatim
            </p>
            <p className="text-xs text-slate-500">
              Masuk sebagai {session.username ?? "admin"} ({session.role})
            </p>
          </div>
          <CmsNav />
          <CmsLogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
