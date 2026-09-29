import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { readCmsSession } from "@/lib/cms-session";
import { CmsLogoutButton } from "./CmsLogoutButton";

/**
 * Penjaga area CMS.
 *
 * Sesi diverifikasi ke API; tanpa sesi valid pengguna diarahkan ke halaman
 * masuk. Peran selain `ADMIN_GLOBAL` ditolak dengan pesan yang jelas, bukan
 * diarahkan diam-diam.
 */
export default async function CmsProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await readCmsSession();
  if (!session) redirect("/cms/login?reason=required");

  if (session.role !== "ADMIN_GLOBAL") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="font-heading text-xl font-bold text-slate-900">
            Akses ditolak
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Area CMS hanya dapat dibuka oleh admin global. Akun{" "}
            <strong className="font-semibold text-slate-900">
              {session.username ?? session.accountId}
            </strong>{" "}
            masuk sebagai{" "}
            <strong className="font-semibold text-slate-900">
              {session.role}
            </strong>
            .
          </p>
          <div className="mt-6">
            <CmsLogoutButton />
          </div>
        </div>
      </main>
    );
  }

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
          <CmsLogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
