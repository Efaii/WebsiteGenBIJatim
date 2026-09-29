import type { CmsSessionInfo } from "@/lib/cms-session";
import { CmsLogoutButton } from "./CmsLogoutButton";

/**
 * Pesan tolakan untuk peran selain admin global.
 *
 * Dirender di level halaman (bukan layout) supaya boundary Suspense tetap
 * selesai pada hard load; lihat catatan di `lib/cms-guard.ts`.
 */
export function CmsForbiddenPanel({ session }: { session: CmsSessionInfo }) {
  return (
    <section className="mx-auto mt-8 w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
      <h1 className="font-heading text-xl font-bold text-slate-900">
        Akses ditolak
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Area CMS hanya dapat dibuka oleh admin global. Akun{" "}
        <strong className="font-semibold text-slate-900">
          {session.username ?? session.accountId}
        </strong>{" "}
        masuk sebagai{" "}
        <strong className="font-semibold text-slate-900">{session.role}</strong>
        .
      </p>
      <div className="mt-6">
        <CmsLogoutButton />
      </div>
    </section>
  );
}
