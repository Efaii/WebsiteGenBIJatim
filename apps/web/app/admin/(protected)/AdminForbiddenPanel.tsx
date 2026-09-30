import type { CmsSessionInfo } from "@/lib/cms-session";
import { ShieldAlert } from "lucide-react";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { PANEL } from "../ui";

/**
 * Pesan tolakan untuk peran selain admin global.
 *
 * Dirender di level halaman (bukan layout) supaya boundary Suspense tetap
 * selesai pada hard load; lihat catatan di `lib/cms-guard.ts`.
 */
export function AdminForbiddenPanel({ session }: { session: CmsSessionInfo }) {
  return (
    <section className={`${PANEL} mx-auto max-w-xl p-8 text-center`}>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <ShieldAlert className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-5 font-heading text-xl font-bold text-slate-900">
        Area khusus admin global
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Halaman pengelolaan konten hanya bisa dibuka oleh admin global. Akun{" "}
        <strong className="font-semibold text-slate-900">
          {session.username ?? session.accountId}
        </strong>{" "}
        masuk sebagai{" "}
        <strong className="font-semibold text-slate-900">{session.role}</strong>
        , jadi konten admin tidak ditampilkan.
      </p>
      <div className="mt-6 flex justify-center">
        <AdminLogoutButton />
      </div>
    </section>
  );
}
